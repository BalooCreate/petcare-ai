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

  // Security
  { httpEquiv: "X-UA-Compatible", content: "IE=edge" },
  { httpEquiv: "Permissions-Policy", content: "interest-cohort=()" },

  // SEO
  { name: "description", content: "Your AI-powered pet assistant for care, routines, and health tracking." },
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
  { rel: "apple-touch-icon", href: "/icon.png" },

  // Splash screen iOS (trebuie să ai /public/splash.png)
  { rel: "apple-touch-startup-image", href: "/splash.png" },
];

/* -------------------------------------------
   COMPONENTĂ EROARE
-------------------------------------------- */
function ErrorDisplay({ error }: { error: unknown }) {
  let message = "An unexpected error occurred.";
  let details = "";

  if (isRouteErrorResponse(error)) {
    message = `${error.status} ${error.statusText}`;
    details = error.data;
  } else if (error instanceof Error) {
    message = error.message;
    details = error.stack || "";
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded shadow-md max-w-lg w-full">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Application Error</h1>
        <p className="text-gray-800 font-medium mb-2">{message}</p>
        {details && (
          <pre className="bg-gray-900 text-gray-100 p-4 rounded text-sm overflow-auto max-h-64">
            {details}
          </pre>
        )}
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
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
          console.log("PWA Service Worker înregistrat cu succes:", registration.scope);
        })
        .catch((error) => {
          console.log("Service Worker info:", error);
        });
    }
  }, []);

  return <Outlet />;
}
