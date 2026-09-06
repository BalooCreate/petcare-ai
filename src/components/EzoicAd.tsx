"use client";
import { useEffect, useRef } from "react";

export default function EzoicAd() {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.ezstandalone) {
      window.ezstandalone.cmd.push(function () {
        window.ezstandalone.showAds({});
      });
    }
  }, []);

  return <div ref={adRef} className="ezoic-ad-placeholder" style={{ minHeight: "250px", margin: "20px 0" }} />;
}