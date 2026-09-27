// ============================================================================
//  /forgot-password — „Ai uitat parola?"
// ============================================================================
//  Înainte: link mort (`href="#"`), nu se întâmpla nimic. Acum: clientul scrie
//  emailul, iar noi pregătim un link de resetare valabil 1 oră.
//
//  Dacă e configurat RESEND_API_KEY, emailul pleacă automat.
//  Dacă nu, spunem ADEVĂRUL și îndrumăm clientul spre support@petassists.com
//  (proprietarul poate genera linkul din /admin/resets și i-l trimite).
// ============================================================================

import { Form, Link, useActionData, useNavigation } from "react-router";
import { PawPrint, Mail, ArrowLeft, Send, CheckCircle2, Info } from "lucide-react";
import sql from "../api/utils/sql";
import { ensureSchema } from "../../lib/usage.js";
import {
  createResetToken,
  resetUrl,
  sendResetEmail,
  emailConfigured,
  recentRequestCount,
  ensureResetTable,
} from "../../lib/reset.js";

export const meta = () => [{ title: "Forgot password — PetAssistant" }];

export async function action({ request }) {
  const form = await request.formData();
  const email = String(form.get("email") || "").trim().toLowerCase();

  if (!email || !email.includes("@")) {
    return { error: "Please enter a valid email address." };
  }

  try {
    await ensureSchema();
    await ensureResetTable();

    const users = await sql`SELECT id FROM users WHERE email = ${email}`;
    const user = users[0];

    if (user) {
      // Anti-abuz: max 3 cereri pe oră pentru același cont.
      const recent = await recentRequestCount(user.id);
      if (recent < 3) {
        const raw = await createResetToken(user.id);
        const link = resetUrl(raw);
        await sendResetEmail(email, link); // trimite doar dacă e configurat
      }
    }

    // Nu dezvăluim niciodată dacă un email are cont sau nu (protecție anti-enumerare).
    return { done: emailConfigured() ? "sent" : "manual" };
  } catch (err) {
    console.error("[forgot-password]", err);
    return { error: "Server error. Please try again in a moment." };
  }
}

export default function ForgotPasswordPage() {
  const actionData = useActionData();
  const nav = useNavigation();
  const sending = nav.state === "submitting";

  return (
    <div className="min-h-screen bg-green-50 flex flex-col justify-center items-center p-6 font-sans text-gray-800">
      <div className="mb-6 text-center">
        <Link to="/" className="bg-white p-3 rounded-full inline-block mb-3 shadow-md hover:shadow-lg transition border border-green-100">
          <PawPrint className="text-green-600" size={32} />
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Forgot your password?</h1>
        <p className="text-sm text-gray-500 mt-2">We'll help you set a new one.</p>
      </div>

      <div className="w-full max-w-md bg-white border border-green-100 shadow-2xl rounded-3xl p-8">

        {actionData?.error && (
          <div className="mb-6 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-100 text-center font-medium">
            {actionData.error}
          </div>
        )}

        {actionData?.done === "sent" && (
          <div className="mb-6 bg-green-50 border border-green-100 rounded-xl px-4 py-4 text-sm text-gray-700 flex gap-3">
            <CheckCircle2 className="text-green-600 shrink-0 mt-0.5" size={18} />
            <div>
              <p className="font-semibold text-green-700">Check your inbox</p>
              <p className="mt-1">
                If an account exists for that email, we've sent a reset link.
                The link is valid for <b>1 hour</b>. Don't forget to check your spam folder.
              </p>
              <Link to="/login" className="inline-block mt-3 text-green-700 font-bold hover:underline">← Back to sign in</Link>
            </div>
          </div>
        )}

        {actionData?.done === "manual" && (
          <div className="mb-6 bg-amber-50 border border-amber-100 rounded-xl px-4 py-4 text-sm text-gray-700 flex gap-3">
            <Info className="text-amber-600 shrink-0 mt-0.5" size={18} />
            <div>
              <p className="font-semibold text-amber-700">One more step</p>
              <p className="mt-1">
                Password-reset emails aren't switched on for PetAssistant yet.
                Please write to <b>support@petassists.com</b> from the email address on your
                account and we'll send you a reset link right away.
              </p>
              <Link to="/login" className="inline-block mt-3 text-green-700 font-bold hover:underline">← Back to sign in</Link>
            </div>
          </div>
        )}

        {!actionData?.done && (
          <Form method="post" className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider ml-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-green-600/60" />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition focus:bg-white"
                  required
                />
              </div>
              <p className="text-xs text-gray-400 mt-2 ml-1">
                Enter the email you used to create your PetAssistant account.
              </p>
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full bg-green-600 text-white font-bold py-3.5 rounded-full hover:bg-green-700 transition-all shadow-lg hover:shadow-green-500/30 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 mt-2 disabled:opacity-60 disabled:transform-none"
            >
              {sending ? "Sending..." : "Send reset link"} <Send size={18} />
            </button>
          </Form>
        )}

        {actionData?.done && (
          <Link to="/login" className="mt-6 w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-green-700 font-semibold">
            <ArrowLeft size={16} /> Back to sign in
          </Link>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-6 text-center max-w-md">
        For real emergencies with your pet, always call your veterinarian first.
      </p>
    </div>
  );
}
