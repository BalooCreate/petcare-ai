import { redirect } from "react-router";

// Această funcție rulează automat când intri pe /logout
export async function loader() {
  // Ștergem cookie-ul setându-i durata de viață la 0
  return redirect("/", {
    headers: {
      "Set-Cookie": "user_id=; Path=/; HttpOnly; Max-Age=0",
    },
  });
}

export default function LogoutPage() {
  return null; // Nu afișăm nimic, doar redirecționăm
}