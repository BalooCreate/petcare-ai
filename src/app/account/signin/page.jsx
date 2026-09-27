// ============================================================================
//  /account/signin — PAGINĂ FALSĂ, ÎNLOCUITĂ CU O REDIRECȚIONARE
// ============================================================================
//  Problema veche: pagina ARĂTA ca un login, dar butonul făcea doar
//  `setTimeout(() => navigate("/dashboard"))` — fără verificarea parolei, fără
//  cookie de sesiune. Cine ajungea aici (inclusiv din căutări Google) credea că
//  „s-a logat", iar apoi era dat afară de pe fiecare pagină protejată.
//
//  Acum trimite simplu către login-ul real, ca nimeni să nu se mai încurce.
// ============================================================================

import { redirect } from "react-router";

export const meta = () => [{ title: "Sign in — PetAssistant" }];

export function loader() {
  return redirect("/login");
}

export function action() {
  return redirect("/login");
}

export default function AccountSigninRedirect() {
  return null;
}
