// ============================================================================
//  INSTALL PROMPT — „reamintește-mi de instalare"
// ============================================================================
//  Problema: banner-ul „Install the App" se închide cu X și apoi NU mai poate fi
//  readus (evenimentul `beforeinstallprompt` se emite o singură dată, la încărcarea
//  paginii). Acest modul ține minte evenimentul, ca butonul „Install the app" din
//  Setări să poată relansa instalarea oricând.
// ============================================================================

let deferred = null;

export function rememberInstallPrompt(event) {
  deferred = event;
}

export function getInstallPrompt() {
  return deferred;
}

export function clearInstallPrompt() {
  deferred = null;
}

/** Instrucțiuni pentru când browserul nu permite prompt automat. */
export const MANUAL_INSTALL_HELP =
  "To install on Android: open the browser menu (⋮) and tap “Install app” or “Add to Home screen”.\n" +
  "On iPhone: tap the Share button, then “Add to Home Screen”.";
