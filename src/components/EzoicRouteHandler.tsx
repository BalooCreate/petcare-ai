"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { runEzoic } from "@/lib/ezoic";

export default function EzoicRouteHandler() {
    const pathname = usePathname();
    useEffect(() => {
        runEzoic(() => {
            window.ezstandalone?.destroyPlaceholders();
            requestAnimationFrame(() => {
                window.ezstandalone?.showAds();
            });
        });
    }, [pathname]);
    return null;
}