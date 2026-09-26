// ─────────────────────────────────────────────────────────────
//  PAROLE — hash scrypt (înainte erau salvate ÎN CLAR în baza de date)
//  Format stocat:  scrypt$<salt_hex>$<hash_hex>
//  Compatibilitate: parolele vechi (text simplu) încă funcționează la
//  login și sunt transformate automat în hash după prima autentificare.
// ─────────────────────────────────────────────────────────────
import crypto from "node:crypto";

const KEY_LEN = 64;

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(String(password), salt, KEY_LEN).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function isHashed(stored) {
  return typeof stored === "string" && stored.startsWith("scrypt$");
}

// Returnează true dacă parola introdusă corespunde valorii din baza de date
// (fie hash scrypt nou, fie parolă veche în clar).
export function verifyPassword(password, stored) {
  try {
    if (isHashed(stored)) {
      const [, salt, hash] = String(stored).split("$");
      if (!salt || !hash) return false;
      const calc = crypto.scryptSync(String(password), salt, KEY_LEN);
      const known = Buffer.from(hash, "hex");
      if (calc.length !== known.length) return false;
      return crypto.timingSafeEqual(calc, known);
    }
    // Parolă veche, în clar → comparație în timp constant
    const a = Buffer.from(String(password));
    const b = Buffer.from(String(stored ?? ""));
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch (e) {
    console.error("[password] verifyPassword error:", e.message);
    return false;
  }
}
