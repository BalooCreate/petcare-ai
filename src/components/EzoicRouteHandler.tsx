"use client";
import { useEffect } from "react";
import { useLocation } from "react-router";
import { runEzoic } from "@/lib/ezoic";

export default function EzoicRouteHandler() {
    const location = useLocation();
    useEffect(() => {
        runEzoic(() => {
            window.ezstandalone?.destroyPlaceholders();
            requestAnimationFrame(() => {
                window.ezstandalone?.showAds();
            });
        });
    }, [location.pathname]);
    return null;
}