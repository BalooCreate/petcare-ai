import { useCallback } from "react";

function useAuth() {
  const callbackUrl =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("callbackUrl")
      : null;

  // Login cu email/parola
  const signInWithCredentials = useCallback(
    async (options) => {
      const res = await fetch("/api/auth/signin/credentials-signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      window.location.href = callbackUrl ?? data.redirect ?? "/";
    },
    [callbackUrl]
  );

  // Înregistrare cu email/parola
  const signUpWithCredentials = useCallback(
    async (options) => {
      const res = await fetch("/api/auth/signin/credentials-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      window.location.href = callbackUrl ?? data.redirect ?? "/";
    },
    [callbackUrl]
  );

  // Login cu Google
  const signInWithGoogle = useCallback(() => {
    window.location.href = `/api/auth/signin/google?callbackUrl=${
      callbackUrl ?? "/"
    }`;
  }, [callbackUrl]);

  // Logout
  const signOut = useCallback(async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    window.location.href = "/";
  }, []);

  return {
    signInWithCredentials,
    signUpWithCredentials,
    signInWithGoogle,
    signOut,
  };
}

export default useAuth;
