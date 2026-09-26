// ─────────────────────────────────────────────────────────────
//  OFERTA "MEMBRU FONDATOR"
//  €29 lifetime pentru PRIMII 100 de oameni. După ei, varianta
//  lifetime dispare — rămâne doar abonamentul lunar.
//
//  Contorul e REAL (citit din baza de date), nu o cifră inventată.
// ─────────────────────────────────────────────────────────────
import sql from "../app/api/utils/sql.js";

// Totalul se poate schimba din Render → Environment (FOUNDING_TOTAL=50),
// fără să fie nevoie de modificări în cod.
export const FOUNDING_TOTAL = Number(process.env.FOUNDING_TOTAL || 100);

export async function getFoundingStatus() {
  try {
    const rows = await sql`
      SELECT COUNT(*)::int AS n FROM users
      WHERE plan_type = 'lifetime' OR lifetime_paid = true
    `;
    const claimed = rows[0]?.n || 0;
    const remaining = Math.max(0, FOUNDING_TOTAL - claimed);
    return {
      total: FOUNDING_TOTAL,
      claimed,
      remaining,
      open: remaining > 0,
      percent: Math.min(100, Math.round((claimed / FOUNDING_TOTAL) * 100)),
    };
  } catch (e) {
    console.error("getFoundingStatus error:", e.message);
    // dacă baza de date nu răspunde, NU blocăm vânzarea
    return { total: FOUNDING_TOTAL, claimed: 0, remaining: FOUNDING_TOTAL, open: true, percent: 0 };
  }
}

export function isFoundingPlan(planParam = "") {
  return String(planParam).includes("lifetime");
}
