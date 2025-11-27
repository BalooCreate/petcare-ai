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

// ✅ 1. CONFIGURARE META (Titlu, Viewport și Setări iPhone)
export const meta = () => [
  { title: "PetAssistant" },
  { charSet: "utf-8" },
  { name: "viewport", content: "width=device-width, initial-scale=1" },
  
  // --- Setări Speciale pentru iPhone (iOS) ---
  { name: "apple-mobile-web-app-capable", content: "yes" }, // Ascunde bara Safari
  { name: "apple-mobile-web-app-status-bar-style", content: "default" }, // Culoarea barei de sus
  { name: "apple-mobile-web-app-title", content: "PetAssistant" }, // Numele sub iconiță
];

// ✅ 2. CONFIGURARE LINKS (Manifest și Iconițe)
export const links = () => [
  { rel: "manifest", href: "/manifest.json" }, 
  { rel: "icon", href: "/icon.png", type: "image/png" }, 
  { rel: "apple-touch-icon", href: "/icon.png" }, // Esențial pentru iPhone
];

// Componenta de eroare
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

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Meta și Links sunt injectate automat aici din funcțiile de mai sus */}
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

export default function App() {
  // ✅ 3. PWA LOGIC: Activarea Service Worker-ului
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Încercăm să înregistrăm service worker-ul doar în producție sau dacă fișierul există
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((registration) => {
          console.log("PWA Service Worker înregistrat cu succes:", registration.scope);
        })
        .catch((error) => {
          // Erorile sunt normale în dev mode dacă nu ai generat sw.js, le ignorăm silențios sau dăm log
          console.log("Service Worker info:", error);
        });
    }
  }, []);

  return <Outlet />;
}