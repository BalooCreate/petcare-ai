import { getToken } from "@auth/core/jwt";
import { getContext } from "hono/context-storage";

export async function auth() {
  const c = getContext();
  const token = await getToken({
    req: c.req.raw,
    secret: process.env.AUTH_SECRET,
    secureCookie: process.env.AUTH_URL?.startsWith("https"),
  });

  if (!token) return null;

  return {
    user: {
      id: token.sub,
      email: token.email,
      name: token.name,
      image: token.picture,
    },
    expires: token.exp?.toString(),
  };
}
