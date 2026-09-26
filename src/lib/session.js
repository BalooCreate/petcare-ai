// ─────────────────────────────────────────────────────────────
//  SESIUNI SEMNATE (HMAC) — înlocuiește cookie-ul nesemnat "user_id"
//  Înainte: oricine putea scrie în browser user_id=<orice număr> și
//  intra în contul altcuiva (inclusiv admin), fără parolă.
//  Acum: cookie-ul conține o semnătură secretă; dacă cineva îl
//  modifică, semnătura nu mai corespunde și sesiunea e respinsă.
// ─────────────────────────────────────────────────────────────
import crypto from "node:crypto";

const COOKIE_NAME = "ps_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 zile

// Secretul de semnare. Se pune în Render (Environment): SESSION_SECRET
let _secret = null;
function getSecret() {
  if (_secret) return _secret;
  const fromEnv = process.env.SESSION_SECRET || process.env.AUTH_SECRET;
  if (fromEnv && String(fromEnv).length >= 16) {
    _secret = String(fromEnv);
  } else {
    // Fără secret în mediu: generăm unul aleator la pornire.
    // (Securitate OK, dar utilizatorii sunt delogați la fiecare restart.
    //  → setează SESSION_SECRET în Render ca să nu se întâmple asta.)
    _secret = crypto.randomBytes(32).toString("hex");
    console.warn(
      "[session] SESSION_SECRET lipsește — folosesc un secret aleator pentru această pornire. " +
        "Setează SESSION_SECRET în Render ca sesiunile să rămână valide după restart."
    );
  }
  return _secret;
}

const b64url = (buf) =>
  Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

function sign(payload) {
  return b64url(crypto.createHmac("sha256", getSecret()).update(payload).digest());
}

function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

// Creează valoarea cookie-ului:  userId.expirare.semnătură
export function createSessionToken(userId) {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS;
  const payload = `${String(userId)}.${exp}`;
  return `${payload}.${sign(payload)}`;
}

// Citește cookie-ul din antetul requestului și verifică semnătura + expirarea.
// Returnează userId (string) sau null. NU acceptă cookie-ul vechi "user_id".
export function readUserId(request) {
  try {
    const cookieHeader = request?.headers?.get?.("Cookie") || "";
    const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
    if (!match) return null;

    const parts = decodeURIComponent(match[1]).split(".");
    if (parts.length !== 3) return null;

    const [userId, exp, sig] = parts;
    const expected = sign(`${userId}.${exp}`);
    if (!safeEqual(sig, expected)) {
      console.warn("[session] cookie cu semnătură INVALIDĂ respins (posibil atac)");
      return null;
    }
    if (!/^\d+$/.test(userId)) return null;
    if (Number(exp) < Math.floor(Date.now() / 1000)) return null;
    return userId;
  } catch (e) {
    console.error("[session] readUserId error:", e.message);
    return null;
  }
}

// Cookie-ul de sesiune gata de trimis în Set-Cookie (cu Secure).
export function sessionCookieHeader(userId) {
  return `${COOKIE_NAME}=${createSessionToken(userId)}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=${MAX_AGE_SECONDS}`;
}

// Curăță localStorage-ul de cookie-uri vechi (nesemnate) + sesiunea curentă.
export function clearSessionCookieHeaders() {
  const expired = "Max-Age=0; Path=/; HttpOnly; SameSite=Lax; Secure";
  return [`${COOKIE_NAME}=; ${expired}`, `user_id=; ${expired}`];
}

export { COOKIE_NAME };
