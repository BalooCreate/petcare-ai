import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useAsyncError,
  useRouteError,
  isRouteErrorResponse,
  useNavigate,
  useLocation,
} from "react-router";
import { type ReactNode, useEffect } from "react";
import "./global.css";
import { Toaster } from "sonner";

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

// ✅ PWA LINKS: Manifestul și iconițele sunt definite aici
export const links = () => [
  { rel: "manifest", href: "/manifest.json" }, 
  { rel: "icon", href: "/icon.png", type: "image/png" }, 
  { rel: "apple-touch-icon", href: "/icon.png" }, 
];

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
  // ✅ PWA LOGIC: Activarea Service Worker-ului
  useEffect(() => {
    // Verificăm dacă browserul suportă Service Worker și nu suntem pe server
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((registration) => {
          console.log("PWA Service Worker înregistrat:", registration.scope);
        })
        .catch((error) => {
          console.error("PWA Service Worker eșec:", error);
        });
    }
  }, []);

  return <Outlet />;
}