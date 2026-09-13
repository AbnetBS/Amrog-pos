"use client";

import { Utensils, Phone, MapPin } from "lucide-react";
import { SiteSettings } from "@/types";
import { useT } from "@/lib/i18n";

interface CtaBannerProps {
  settings: SiteSettings;
  onOpenMenu: () => void;
}

export default function CtaBanner({ settings, onOpenMenu }: CtaBannerProps) {
  const t = useT();
  const phone = settings.phone || "097 895 7070";

  return (
    <section className="py-16 bg-gradient-to-r from-[#36363E] via-[#1B1B20] to-[#2A2A31] text-white relative overflow-hidden border-y-2 border-[#F6C51B]/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center relative z-10 space-y-6">
        <span className="text-[#F6C51B] text-xs font-bold uppercase tracking-widest bg-[#F6C51B]/10 px-3 py-1 rounded-full border border-[#F6C51B]/30">
          {t("cta_badge")}
        </span>

        <h2 className="text-3xl sm:text-5xl font-serif font-black text-white max-w-3xl mx-auto leading-tight">
          {t("cta_title")}
        </h2>

        <p className="text-stone-300 text-sm sm:text-base max-w-xl mx-auto font-light">
          {t("cta_sub")}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={onOpenMenu}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#F6C51B] hover:bg-yellow-400 text-[#1B1B20] font-black text-xs uppercase tracking-wider px-8 py-4 rounded-full shadow-2xl hover:scale-105 transition"
          >
            <Utensils className="w-4 h-4" />
            <span>{t("cta_menu")}</span>
          </button>

          <a
            href={`tel:${phone.replace(/\s+/g, "")}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider px-8 py-4 rounded-full border border-yellow-400/30 transition"
          >
            <Phone className="w-4 h-4 text-[#F6C51B]" />
            <span>{t("cta_call")} {phone}</span>
          </a>

          <a
            href="#contact"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-stone-900 text-yellow-200 font-bold text-xs uppercase tracking-wider px-6 py-4 rounded-full border border-stone-700 hover:bg-stone-800 transition"
          >
            <MapPin className="w-4 h-4 text-[#F6C51B]" />
            <span>{t("cta_find")}</span>
          </a>
        </div>
      </div>
    </section>
  );
}
