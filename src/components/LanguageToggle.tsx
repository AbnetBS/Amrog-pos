"use client";

import { Globe, ArrowLeftRight } from "lucide-react";
import { useLang } from "@/lib/i18n";

/**
 * Floating 🌐 English ⇄ አማርኛ toggle.
 *
 * Native implementation:
 *  • switches INSTANTLY — no page reload, no third-party script
 *  • choice persists in localStorage → survives new tabs & revisits
 *  • synced across all open tabs
 *  • never rewrites the DOM, so React (and the order flow) keep working
 */
export default function LanguageToggle({ className = "" }: { className?: string }) {
  const [lang, setLang] = useLang();
  const isAm = lang === "am";

  return (
    <button
      onClick={() => setLang(isAm ? "en" : "am")}
      className={`fixed bottom-5 right-5 z-40 flex items-center gap-2 bg-[#1B1B20] text-white border-2 border-[#F6C51B] px-4 py-2.5 rounded-full shadow-2xl hover:scale-105 transition-transform ${className}`}
      aria-label={isAm ? "Switch to English" : "በአማርኛ ያንብቡ"}
      title={isAm ? "Switch to English" : "በአማርኛ ያንብቡ"}
    >
      <Globe className="w-4 h-4 text-[#F6C51B]" />
      <span className="text-xs font-black tracking-wider">{isAm ? "English" : "አማርኛ"}</span>
      <ArrowLeftRight className="w-3.5 h-3.5 text-[#F6C51B]" />
    </button>
  );
}
