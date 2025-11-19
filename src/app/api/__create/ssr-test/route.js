import { getToken } from "@auth/core/jwt";
import React from "react";
import path from "node:path";
import { renderToString } from "react-dom/server";
import routes from "../../../routes";
import { serializeError } from "serialize-error";
import cleanStack from "clean-stack";

function serializeClean(err) {
  if (!err || !err.stack) return serializeError(err || {});

  err.stack = cleanStack(err.stack, {
    pretty: true,
    pathFilter: (p) => {
      // Eliminăm liniile care nu țin de codul sursă
      return !p.includes("node_modules") && !p.includes("dist");
    },
  });

  return serializeError(err);
}

function getHTMLOrError(component) {
  try {
    const html = renderToString(React.createElement(component));
    return { html, error: null };
  } catch (error) {
    return { html: null, error: serializeClean(error) };
  }
}

export async function GET(request) {
  const results = await Promise.allSettled(
    routes.map(async (route) => {
      try {
        // Import dinamic al componentului
        const filePath = path.join(process.cwd(), "src", route.file);
        const module = await import(/* @vite-ignore */ filePath);
        const component = module.default;
        if (!component) return null;

        const rendered = getHTMLOrError(component);
        return {
          route: route.file,
          path: route.path,
          ...rendered,
        };
      } catch (error) {
        console.error("Error rendering route:", route.file, error);
        return {
          route: route.file,
          path: route.path,
          html: null,
          error: serializeClean(error),
        };
      }
    })
  );

  const cleanedResults = results
    .filter((r) => r.status === "fulfilled" && r.value)
    .map((r) => r.value);

  return Response.json({ results: cleanedResults });
}
