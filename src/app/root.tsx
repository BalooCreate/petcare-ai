import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
  isRouteErrorResponse,
} from "react-router";
import { type ReactNode, useEffect } from "react";
import "./global.css";
import { Toaster } from "sonner";

/* -------------------------------------------
   META TAGS COMPLETE PWA (iOS + Android)
-------------------------------------------- */
export const meta = () => [
  { title: "PetAssistant" },
  { charSet: "utf-8" },

  // Viewport + notch support
  { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },

  // PWA – Android
  { name: "theme-color", content: "#16a34a" },
  { name: "mobile-web-app-capable", content: "yes" },
  { name: "application-name", content: "PetAssistant" },

  // PWA – iOS
  { name: "apple-mobile-web-app-capable", content: "yes" },
  { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
  { name: "apple-mobile-web-app-title", content: "PetAssistant" },
  { name: "apple-touch-fullscreen", content: "yes" },

  // AWIN / IMPACT SITE VERIFICATION
  { name: "impact-site-verification", content: "f5c114c4-840b-4faa-b39b-aee5d4f11bc0" },

  // Security
  { httpEquiv: "X-UA-Compatible", content: "IE=edge" },
  { httpEquiv: "Permissions-Policy", content: "interest-cohort=()" },

  // SEO
  { name: "description", content: "Your AI-powered pet assistant for care, routines, reminders and health tracking." },
  { name: "robots", content: "index,follow" },

  // SOCIAL – Facebook / WhatsApp
  { property: "og:title", content: "PetAssistant" },
  { property: "og:description", content: "Your AI-powered pet assistant." },
  { property: "og:type", content: "website" },
  { property: "og:url", content: "https://petassists.com" },
  { property: "og:image", content: "/icon.png" },

  // SOCIAL – Twitter
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "PetAssistant" },
  { name: "twitter:description", content: "Your AI-powered pet assistant." },
  { name: "twitter:image", content: "/icon.png" }
];

/* -------------------------------------------
   LINKS (manifest, icons, splash screen)
-------------------------------------------- */
export const links = () => [
  { rel: "manifest", href: "/manifest.json" },
  { rel: "icon", href: "/icon.png", type: "image/png" },
  { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
  { rel: "apple-touch-startup-image", href: "/splash.png" },
];

/* -------------------------------------------
   ERROR COMPONENT
-------------------------------------------- */
function ErrorDisplay({ error }: { error: unknown }) {
  let message = "An unexpected error occurred.";

  if (isRouteErrorResponse(error)) {
    message = `${error.status} ${error.statusText}`;
  } else if (error instanceof Error) {
    message = error.message;
  }

  // Guests must never see a stack trace: it looks broken and leaks internals.
  // The real error still goes to the console for debugging.
  if (typeof console !== "undefined") {
    console.error("[error-boundary]", error);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
        <div className="text-4xl mb-3">🐾</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Refreshing this page…</h1>
        <p className="text-gray-600 text-sm mb-5">
          This was a temporary glitch on our side — your data is safe. The page is
          reloading by itself in a second.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
          >
            Reload now
          </button>
          <a
            href="/"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            Homepage
          </a>
        </div>
        {import.meta.env.DEV && (
          <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs text-left overflow-auto max-h-48 mt-5">
            {message}
          </pre>
        )}
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  // Most of these errors are third-party DOM glitches (ad scripts moving nodes
  // under React). A reload fixes them instantly, so we do it for the visitor —
  // once every 30 seconds, so a permanent error cannot loop forever.
  useEffect(() => {
    if (typeof window === "undefined" || typeof sessionStorage === "undefined") return;
    const KEY = "pa-auto-reload-at";
    const last = Number(sessionStorage.getItem(KEY) || 0);
    if (Date.now() - last < 30000) {
      const t = setTimeout(() => window.location.reload(), 900);
      return () => clearTimeout(t);
    }
    return undefined;
  }, []);

  return <ErrorDisplay error={error} />;
}


/* -------------------------------------------
   LAYOUT ROOT
-------------------------------------------- */
export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="font-sans antialiased">
        {children}
        <Toaster position="bottom-right" />
        <ScrollRestoration />
        <Scripts />

        {/* -------------------------------------------
            IMPACT / AWIN TRACKING SCRIPT
        -------------------------------------------- */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(i,m,p,a,c,t){
                c.ire_o=p;
                c[p]=c[p]||function(){(c[p].a=c[p].a||[]).push(arguments)};
                t=a.createElement(m);
                var z=a.getElementsByTagName(m)[0];
                t.async=1;
                t.src=i;
                z.parentNode.insertBefore(t,z)
              })(
                'https://utt.impactcdn.com/P-A5017366-5e83-4096-86ed-53f2433f57141.js',
                'script',
                'impactStat',
                document,
                window
              );
              impactStat('transformLinks');
              impactStat('trackImpression');
            `,
          }}
        />

        {/* FontAwesome */}
        <script
          src="https://kit.fontawesome.com/2c15cc0cc7.js"
          crossOrigin="anonymous"
          async
        />
      </body>
    </html>
  );
}

/* -------------------------------------------
   PWA – activare Service Worker
-------------------------------------------- */
export default function App() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((registration) => {
          console.log("PWA Service Worker registered successfully:", registration.scope);
        })
        .catch((error) => {
          console.log("Service Worker info:", error);
        });
    }
  }, []);

  return <Outlet />;
}
