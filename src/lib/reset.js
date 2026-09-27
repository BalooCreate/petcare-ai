// ============================================================================
//  RESETAREA PAROLEI — token-uri sigure
// ============================================================================
//  Înainte, „Forgot Password?" era un link mort (`href="#"`): clientul apăsa și
//  nu se întâmpla nimic. Aici e fluxul real:
//
//    1. clientul scrie emailul pe /forgot-password
//    2. se creează un token ALEATORIU (32 bytes). În baza de date se salvează
//       DOAR hash-ul SHA-256 al token-ului — dacă baza de date e citită de
//       cineva, nu poate folosi token-urile.
//    3. token-ul expiră în 1 oră și poate fi folosit O SINGURĂ DATĂ.
//    4. /reset?token=... verifică token-ul și salvează parola nouă (hash scrypt).
//
//  Trimiterea emailului: dacă există RESEND_API_KEY în Render, emailul pleacă
//  automat. Dacă nu, site-ul spune ADEVĂRUL (nu minte că „am trimis emailul") și
//  îndrumă clientul spre support@petassists.com — vezi și /admin/resets, de unde
//  proprietarul poate genera manual un link și îl poate trimite.
//
//  Server-only: citește process.env, deci nu se importă în cod de client.
// ============================================================================

import crypto from "node:crypto";
import sql from "../app/api/utils/sql.js";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 oră
const MAX_REQUESTS_PER_HOUR = 3; // anti-abuz (ca să nu spamăm un client)

export function hashToken(raw) {
  return crypto.createHash("sha256").update(String(raw)).digest("hex");
}

/** Creează tabelul dacă lipsește (idempotent, sigur de rulat des). */
export async function ensureResetTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS password_resets (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      used BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS password_resets_user_idx ON password_resets (user_id)`;
}

/**
 * Generează un token nou pentru un user.
 * @returns {Promise<string>} token-ul ÎN CLAR (se trimite clientului; NU se salvează așa)
 */
export async function createResetToken(userId) {
  await ensureResetTable();
  const raw = crypto.randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + TOKEN_TTL_MS).toISOString();
  await sql`
    INSERT INTO password_resets (user_id, token_hash, expires_at)
    VALUES (${String(userId)}, ${hashToken(raw)}, ${expires})
  `;
  return raw;
}

/** Câte cereri s-au făcut în ultima oră pentru acest user (anti-abuz). */
export async function recentRequestCount(userId) {
  try {
    await ensureResetTable();
    const rows = await sql`
      SELECT COUNT(*)::int AS n FROM password_resets
      WHERE user_id = ${String(userId)} AND created_at > NOW() - INTERVAL '1 hour'
    `;
    return rows[0]?.n || 0;
  } catch {
    return 0;
  }
}

/** Token valid & nefolosit & neexpirat → { id, user_id } sau null. */
export async function findValidReset(raw) {
  if (!raw || typeof raw !== "string" || raw.length < 20) return null;
  try {
    await ensureResetTable();
    const rows = await sql`
      SELECT id, user_id FROM password_resets
      WHERE token_hash = ${hashToken(raw)}
        AND used = FALSE
        AND expires_at > NOW()
      LIMIT 1
    `;
    return rows[0] || null;
  } catch (e) {
    console.error("[reset] findValidReset error:", e.message);
    return null;
  }
}

/** Salvează parola nouă și arde token-ul (plus orice alt token al userului). */
export async function consumeReset(resetId, userId, newPasswordHash) {
  await sql`UPDATE users SET password = ${newPasswordHash} WHERE id = ${userId}`;
  await sql`UPDATE password_resets SET used = TRUE WHERE id = ${resetId}`;
  await sql`
    UPDATE password_resets SET used = TRUE
    WHERE user_id = ${String(userId)} AND used = FALSE
  `;
}

/** Linkul complet pe care îl primește clientul. */
export function resetUrl(raw) {
  const base = (process.env.APP_URL || "https://petassists.com").replace(/\/+$/, "");
  return `${base}/reset?token=${encodeURIComponent(raw)}`;
}

/** Este configurată trimiterea de emailuri? (RESEND_API_KEY în Render) */
export function emailConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

/**
 * Trimite emailul de resetare prin Resend (dacă e configurat).
 * @returns {Promise<boolean>} true doar dacă emailul chiar a plecat
 */
export async function sendResetEmail(to, link) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(key);
    // Resend cere un domeniu verificat pentru „from". Până atunci,
    // onboarding@resend.dev funcționează doar către adresa contului Resend.
    const from = process.env.EMAIL_FROM || "onboarding@resend.dev";

    const { error } = await resend.emails.send({
      from: `PetAssistant <${from}>`,
      to,
      subject: "Reset your PetAssistant password",
      text:
        `Hi,\n\n` +
        `Someone asked to reset the password for your PetAssistant account.\n\n` +
        `Open this link to choose a new password (valid for 1 hour):\n${link}\n\n` +
        `If this wasn't you, you can safely ignore this email — your password stays the same.\n\n` +
        `— PetAssistant · https://petassists.com`,
      html:
        `<div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#1f2937">` +
        `<h2 style="color:#16a34a;margin:0 0 12px">Reset your password 🐾</h2>` +
        `<p>Someone asked to reset the password for your <b>PetAssistant</b> account.</p>` +
        `<p><a href="${link}" style="display:inline-block;background:#16a34a;color:#fff;padding:12px 22px;border-radius:9999px;font-weight:700;text-decoration:none">Choose a new password</a></p>` +
        `<p style="color:#6b7280;font-size:13px">Link valid for 1 hour. If you didn't ask for this, ignore this email — your password stays the same.</p>` +
        `<p style="color:#9ca3af;font-size:12px">PetAssistant · <a href="https://petassists.com" style="color:#9ca3af">petassists.com</a></p>` +
        `</div>`,
    });

    if (error) {
      console.error("[reset] Resend a refuzat emailul:", error?.message || error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[reset] sendResetEmail error:", e.message);
    return false;
  }
}
