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

// Importăm componentele de eroare direct, simplificat
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

export const links = () => [
  // Aici poți adăuga fonturi Google dacă vrei, ex:
  // { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" }
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
        {/* FontAwesome script păstrat din original */}
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
  // Am eliminat SessionProvider-ul "fantomă". 
  // React Router v7 gestionează starea prin loadere.
  return <Outlet />;
}