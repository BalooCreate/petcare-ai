// ============================================================================
//  /account/signup — PAGINĂ FALSĂ, ÎNLOCUITĂ CU O REDIRECȚIONARE
// ============================================================================
//  La fel ca /account/signin: arăta ca o înregistrare, dar nu crea niciun cont —
//  doar te trimitea la /dashboard. Acum duce către signup-ul real (/signup),
//  care chiar creează contul și sesiunea.
// ============================================================================

import { redirect } from "react-router";

export const meta = () => [{ title: "Create account — PetAssistant" }];

export function loader() {
  return redirect("/signup");
}

export function action() {
  return redirect("/signup");
}

export default function AccountSignupRedirect() {
  return null;
}
