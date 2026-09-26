// ─────────────────────────────────────────────────────────────
//  DATELE FIRMEI — un singur loc de modificat
//  Necesare pentru verificarea Google Play (cont de organizație)
//  și pentru legislația românească (Legea 365/2002).
// ─────────────────────────────────────────────────────────────
export const COMPANY = {
  legalName: "DUAL DELIGHT SRL",
  cui: "50284995",
  regCom: "J40/12583/2024",
  address: "Drum Dealu Aluniș 37, Bl. 4, Et. 3, Ap. 22, Sector 4, București 041124, România",
  city: "București, România",
  email: "support@petassists.com",
  country: "România",
  // Telefonul public îl adaugi aici când vrei să apară pe site:
  phone: "",
  year: 2026,
};

export const COMPANY_LINE =
  `${COMPANY.legalName} · CUI ${COMPANY.cui} · Reg. Com. ${COMPANY.regCom} · ${COMPANY.address}`;
