import { redirect } from "react-router";

// This function runs automatically when you visit /logout
export async function loader() {
  // Delete the cookie by setting its lifetime to 0
  return redirect("/", {
    headers: {
      "Set-Cookie": "user_id=; Path=/; HttpOnly; Max-Age=0",
    },
  });
}

export default function LogoutPage() {
  return null; // Render nothing, just redirect
}