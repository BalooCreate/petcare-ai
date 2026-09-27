// ============================================================================
//  /reset?token=... — alege o parolă nouă
// ============================================================================
//  Token-ul vine din email (sau din linkul generat de proprietar în /admin/resets).
//  Validare: hash în baza de date + neexpirat (1h) + nefolosit.
// ============================================================================

import { Form, Link, redirect, useActionData, useLoaderData, useNavigation } from "react-router";
import { PawPrint, Lock, ShieldCheck, AlertTriangle } from "lucide-react";
import { findValidReset, consumeReset } from "../../lib/reset.js";
import { hashPassword } from "../../lib/password.js";

export const meta = () => [{ title: "Choose a new password — PetAssistant" }];

export async function loader({ request }) {
  const token = new URL(request.url).searchParams.get("token") || "";
  const row = await findValidReset(token);
  return { valid: Boolean(row) };
}

export async function action({ request }) {
  const form = await request.formData();
  const token = String(form.get("token") || "");
  const password = String(form.get("password") || "");
  const confirm = String(form.get("confirm") || "");

  const row = await findValidReset(token);
  if (!row) {
    return { error: "This reset link is invalid or has expired. Please request a new one." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters long." };
  }
  if (password !== confirm) {
    return { error: "The two passwords don't match." };
  }

  try {
    await consumeReset(row.id, row.user_id, hashPassword(password));
    console.log(`[reset] parola a fost schimbată pentru userul ${row.user_id}`);
    return redirect("/login?reset=1");
  } catch (e) {
    console.error("[reset] consumeReset error:", e.message);
    return { error: "Server error. Please try again in a moment." };
  }
}

export default function ResetPage() {
  const { valid } = useLoaderData();
  const actionData = useActionData();
  const nav = useNavigation();
  const saving = nav.state === "submitting";

  const token = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("token") || ""
    : "";

  return (
    <div className="min-h-screen bg-green-50 flex flex-col justify-center items-center p-6 font-sans text-gray-800">
      <div className="mb-6 text-center">
        <Link to="/" className="bg-white p-3 rounded-full inline-block mb-3 shadow-md hover:shadow-lg transition border border-green-100">
          <PawPrint className="text-green-600" size={32} />
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Choose a new password</h1>
        <p className="text-sm text-gray-500 mt-2">Almost done 🐾</p>
      </div>

      <div className="w-full max-w-md bg-white border border-green-100 shadow-2xl rounded-3xl p-8">

        {!valid && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-4 text-sm text-gray-700 flex gap-3">
            <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
            <div>
              <p className="font-semibold text-amber-700">Link invalid or expired</p>
              <p className="mt-1">
                Reset links are valid for 1 hour and can be used once.
                Please request a new one.
              </p>
              <Link to="/forgot-password" className="inline-block mt-3 bg-green-600 text-white font-bold px-4 py-2 rounded-full hover:bg-green-700 transition">
                Request a new link
              </Link>
            </div>
          </div>
        )}

        {valid && (
          <>
            {actionData?.error && (
              <div className="mb-6 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-100 text-center font-medium">
                {actionData.error}
              </div>
            )}

            <Form method="post" className="space-y-5">
              <input type="hidden" name="token" value={token} />

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider ml-1">
                  New password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-green-600/60" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    placeholder="At least 8 characters"
                    minLength={8}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider ml-1">
                  Repeat password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ShieldCheck size={18} className="text-green-600/60" />
                  </div>
                  <input
                    type="password"
                    name="confirm"
                    placeholder="Same password again"
                    minLength={8}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition focus:bg-white"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-green-600 text-white font-bold py-3.5 rounded-full hover:bg-green-700 transition-all shadow-lg hover:shadow-green-500/30 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 mt-2 disabled:opacity-60 disabled:transform-none"
              >
                {saving ? "Saving..." : "Save new password"} <ShieldCheck size={18} />
              </button>
            </Form>

            <p className="text-xs text-gray-400 mt-5 text-center">
              For your safety, this link stops working after you use it.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
