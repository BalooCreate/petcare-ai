"use client";
import { useEffect } from "react";
import { useLocation } from "react-router";

export default function EzoicRouteHandler() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window !== "undefined" && window.ezstandalone) {
      window.ezstandalone.cmd.push(function () {
        // Destroy old placeholders and show ads on route change
        if (window.ezstandalone.destroyPlaceholders) {
          window.ezstandalone.destroyPlaceholders();
        }
        requestAnimationFrame(() => {
          window.ezstandalone.showAds();
        });
      });
    }
  }, [location.pathname]);

  return null;
}