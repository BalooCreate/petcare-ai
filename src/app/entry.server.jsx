// ─────────────────────────────────────────────────────────────
//  SERVER ENTRY (copie oficială React Router + antete de securitate)
//  ADAUGĂ la fiecare răspuns:
//   - HSTS (forțează HTTPS)
//   - X-Content-Type-Options (browserul nu mai "ghicește" tipul fișierului)
//   - X-Frame-Options + frame-ancestors (nimeni nu poate pune site-ul într-un iframe → anti-clickjacking)
//   - Referrer-Policy, Permissions-Policy
//   - CSP (permisivă: permite Impact/Font Awesome/Stripe, blochează restul)
// ─────────────────────────────────────────────────────────────
import { PassThrough } from "node:stream";

import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter } from "react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";

export const streamTimeout = 5_000;

const CSP = [
  "default-src 'self'",
  "img-src 'self' data: blob: https:",
  "media-src 'self' https:",
  "style-src 'self' 'unsafe-inline' https://kit.fontawesome.com https://*.fontawesome.com https://fonts.googleapis.com",
  "font-src 'self' data: https://*.fontawesome.com https://fonts.gstatic.com",
  "script-src 'self' 'unsafe-inline' https://utt.impactcdn.com https://*.impactcdn.com https://kit.fontawesome.com https://*.fontawesome.com https://js.stripe.com",
  "connect-src 'self' https:",
  "frame-src 'self' https://js.stripe.com https://checkout.stripe.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self' https://checkout.stripe.com",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

function applySecurityHeaders(headers) {
  headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(self)");
  headers.set("Content-Security-Policy", CSP);
  return headers;
}

export default function handleRequest(
  request,
  responseStatusCode,
  responseHeaders,
  routerContext,
  loadContext
) {
  applySecurityHeaders(responseHeaders);

  // https://httpwg.org/specs/rfc9110.html#HEAD
  if (request.method.toUpperCase() === "HEAD") {
    return new Response(null, {
      status: responseStatusCode,
      headers: responseHeaders,
    });
  }

  return new Promise((resolve, reject) => {
    let shellRendered = false;
    let userAgent = request.headers.get("user-agent");

    let readyOption =
      (userAgent && isbot(userAgent)) || routerContext.isSpaMode
        ? "onAllReady"
        : "onShellReady";

    let timeoutId = setTimeout(() => abort(), streamTimeout + 1000);

    const { pipe, abort } = renderToPipeableStream(
      <ServerRouter context={routerContext} url={request.url} />,
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough({
            final(callback) {
              clearTimeout(timeoutId);
              timeoutId = undefined;
              callback();
            },
          });
          const stream = createReadableStreamFromReadable(body);

          responseHeaders.set("Content-Type", "text/html");

          pipe(body);

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            })
          );
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        },
      }
    );
  });
}
