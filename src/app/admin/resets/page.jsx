// ============================================================================
//  /admin/resets — generarea manuală a linkurilor de resetare
// ============================================================================
//  De ce există: până când emailul automat e configurat (RESEND_API_KEY),
//  clientul care a uitat parola scrie la support@petassists.com. Proprietarul
//  intră aici, scrie emailul clientului, primește un link de resetare (valid 1h)
//  și i-l trimite. Așa funcționează „Forgot password" DIN PRIMA ZI.
//
//  Acces: cont de admin SAU linkul cu token-ul de diagnostic (?token=DIAG_TOKEN),
//  ca proprietarul să poată intra chiar dacă nu are încă rol de admin.
// ============================================================================

import { Form, Link, redirect, useActionData, useLoaderData, useNavigation } from "react-router";
import { useState } from "react";
import { KeyRound, Copy, Check, ShieldAlert, ArrowLeft, Mail } from "lucide-react";
import sql from "../../api/utils/sql";
import { readUserId } from "../../../lib/session.js";
import { createResetToken, resetUrl, ensureResetTable, emailConfigured } from "../../../lib/reset.js";

export const meta = () => [{ title: "Password resets — PetAssistant admin" }];

function tokenOk(request) {
  const diag = process.env.DIAG_TOKEN || "";
  if (!diag) return false;
  const t = new URL(request.url).searchParams.get("token") || "";
  return t === diag;
}

async function isAdmin(request) {
  try {
    const userId = readUserId(request);
    if (!userId) return false;
    const rows = await sql`SELECT is_admin FROM users WHERE id = ${userId}`;
    return Boolean(rows[0]?.is_admin);
  } catch {
    return false;
  }
}

export async function loader({ request }) {
  const allowed = (await isAdmin(request)) || tokenOk(request);
  if (!allowed) return redirect("/login");

  let requests = [];
  try {
    await ensureResetTable();
    requests = await sql`
      SELECT pr.id, pr.created_at, pr.used, pr.expires_at, u.email
      FROM password_resets pr
      LEFT JOIN users u ON u.id::text = pr.user_id
      ORDER BY pr.created_at DESC
      LIMIT 15
    `;
  } catch (e) {
    console.error("[admin/resets] loader:", e.message);
  }

  return { requests, emailOn: emailConfigured() };
}

export async function action({ request }) {
  const allowed = (await isAdmin(request)) || tokenOk(request);
  if (!allowed) return redirect("/login");

  const form = await request.formData();
  const email = String(form.get("email") || "").trim().toLowerCase();

  if (!email.includes("@")) return { error: "Enter the customer's email address." };

  try {
    const rows = await sql`SELECT id FROM users WHERE email = ${email}`;
    const user = rows[0];
    if (!user) return { error: `No account found for ${email}.` };

    const raw = await createResetToken(user.id);
    return { link: resetUrl(raw), email };
  } catch (e) {
    console.error("[admin/resets] action:", e.message);
    return { error: "Could not create the link. Check the server logs." };
  }
}

function CopyRow({ link }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-3 flex flex-col sm:flex-row gap-2">
      <input
        readOnly
        value={link}
        onFocus={(e) => e.target.select()}
        className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 font-mono"
      />
      <button
        type="button"
        onClick={() => {
          navigator.clipboard?.writeText(link);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className="bg-green-600 text-white font-bold text-xs px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 shrink-0"
      >
        {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy link</>}
      </button>
    </div>
  );
}

export default function AdminResets() {
  const { requests, emailOn } = useLoaderData();
  const actionData = useActionData();
  const nav = useNavigation();
  const working = nav.state === "submitting";

  const token = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("token") || ""
    : "";
  const postAction = token ? `/admin/resets?token=${encodeURIComponent(token)}` : "/admin/resets";

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 font-sans">
      <div className="max-w-3xl mx-auto py-6">

        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6">
          <ArrowLeft size={16} /> Back to dashboard
        </Link>

        <h1 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
          <KeyRound className="text-green-400" /> Password resets
        </h1>
        <p className="text-sm text-gray-400 mb-6">
          Generate a reset link for a customer who forgot their password. The link is valid for
          <b> 1 hour</b> and can be used once.
        </p>

        <div className={`mb-6 text-xs rounded-xl px-4 py-3 border ${
          emailOn
            ? "bg-green-950/40 border-green-800 text-green-200"
            : "bg-amber-950/40 border-amber-800 text-amber-200"
        }`}>
          {emailOn ? (
            <>✅ Automatic emails are ON — when a customer uses “Forgot password”, the link is emailed to them directly. This page stays useful as a backup.</>
          ) : (
            <>⚠️ Automatic emails are OFF (no RESEND_API_KEY). Customers who forget their password are told to write to support@petassists.com — you generate the link here and send it to them.</>
          )}
        </div>

        <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700 mb-6">
          <Form method="post" action={postAction} className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1 ml-1">
                Customer email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  name="email"
                  placeholder="customer@example.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={working}
              className="bg-green-600 text-white font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-green-700 disabled:opacity-60 shrink-0"
            >
              {working ? "Working..." : "Generate link"}
            </button>
          </Form>

          {actionData?.error && (
            <div className="mt-4 bg-red-950/50 border border-red-800 text-red-200 text-sm rounded-lg px-4 py-3">
              {actionData.error}
            </div>
          )}

          {actionData?.link && (
            <div className="mt-4 bg-green-950/40 border border-green-800 rounded-lg px-4 py-3">
              <p className="text-sm text-green-200 font-semibold">
                Link ready for <b>{actionData.email}</b> — send it to them (Gmail, WhatsApp, wherever):
              </p>
              <CopyRow link={actionData.link} />
              <p className="text-xs text-green-300/70 mt-2">
                Expires in 1 hour. If it expires, just generate a new one.
              </p>
            </div>
          )}
        </div>

        <h2 className="text-lg font-bold text-white mb-3">Recent requests</h2>
        {requests.length === 0 ? (
          <p className="text-sm text-gray-500">No reset requests yet.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-700">
            <table className="w-full text-sm">
              <thead className="bg-gray-800 text-gray-400 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-2">Email</th>
                  <th className="text-left px-4 py-2">When</th>
                  <th className="text-left px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => {
                  const expired = new Date(r.expires_at).getTime() < Date.now();
                  return (
                    <tr key={r.id} className="border-t border-gray-800">
                      <td className="px-4 py-2 text-gray-200">{r.email || "(cont șters)"}</td>
                      <td className="px-4 py-2 text-gray-400">
                        {new Date(r.created_at).toLocaleString("ro-RO")}
                      </td>
                      <td className="px-4 py-2">
                        {r.used ? (
                          <span className="text-gray-500">used</span>
                        ) : expired ? (
                          <span className="text-amber-400">expired</span>
                        ) : (
                          <span className="text-green-400">active</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs text-gray-500 mt-6 flex items-start gap-2">
          <ShieldAlert size={14} className="mt-0.5 shrink-0" />
          Only you should see this page. Never share a reset link in public — anyone who has it
          can set a new password for that account.
        </p>
      </div>
    </div>
  );
}
