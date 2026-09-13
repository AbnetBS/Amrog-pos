"use client";

import { Drumstick, Calendar, Utensils, Star, MapPin, Clock, ArrowRight, Sparkles } from "lucide-react";
import { SiteSettings } from "@/types";
import { useT, useAutoT } from "@/lib/i18n";

interface HeroProps {
  settings: SiteSettings;
  onOpenMenu: () => void;
  onOpenLocation: () => void;
}

export default function HeroSection({ settings, onOpenMenu, onOpenLocation }: HeroProps) {
  const t = useT();
  const tx = useAutoT();
  const title = settings.hero_title || "Home of Authentic Chicken in Addis Ababa";
  const subtitle =
    settings.hero_subtitle ||
    "Addis Ababa's favorite chicken house since 2018. Famous chicken shawarma, roasted & grilled chicken, mofo, burgers, combos and fresh juices. Dine-in, takeaway & delivery at Ambassador Mall, 4 Kilo."
  const heroBgImage =
    settings.hero_bg_image ||
    "/images/menu/fried-hero.jpg";
  const openingHours = settings.opening_hours || "Open Daily 10:00 - 22:00";

  return (
    <section id="hero" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-16 lg:py-24 bg-[#1B1B20]">
      {/* Background Image with Gradient Overlays */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBgImage}
          alt="Amrogn Chicken 4 Kilo dining ambience"
          className="w-full h-full object-cover object-center opacity-40 scale-105 transform hover:scale-100 transition-transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1B1B20] via-[#1B1B20]/75 to-black/40" />
        <div className="absolute inset-0 bg-radial-gradient from-yellow-500/10 via-transparent to-transparent" />
      </div>

      {/* Decorative Floating Lights / Steam Elements */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-[#F6C51B]/10 rounded-full blur-3xl pointer-events-none animate-ambient-pulse" />
      <div className="absolute bottom-1/3 right-10 w-96 h-96 bg-[#36363E]/40 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        
        {/* Status Pills */}
        <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-[#F6C51B]/40 px-4 py-2 rounded-full mb-8 shadow-xl text-xs sm:text-sm">
          <span className="flex items-center gap-1.5 font-bold text-yellow-300">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            {t("hero_open_daily")}
          </span>
          <span className="text-yellow-200/50">•</span>
          <span className="flex items-center gap-1 text-stone-200">
            <Clock className="w-3.5 h-3.5 text-[#F6C51B]" />
            {tx(openingHours)}
          </span>
          <span className="hidden sm:inline text-yellow-200/50">•</span>
          <span className="hidden sm:flex items-center gap-1 text-stone-200">
            <MapPin className="w-3.5 h-3.5 text-[#F6C51B]" />
            Ambassador Mall, 4 Kilo
          </span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-black tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-[#FEF3C7] to-yellow-200 max-w-4xl mx-auto drop-shadow-md">
          {tx(title)}
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-xl text-stone-200 max-w-2xl mx-auto leading-relaxed font-light drop-shadow">
          {tx(subtitle)}
        </p>

        {/* Action Call to Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <a
            href="#menu"
            onClick={(e) => {
              e.preventDefault();
              onOpenMenu();
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#F6C51B] to-[#D9A409] hover:from-[#F9D34A] hover:to-[#E5B110] text-[#1B1B20] font-extrabold text-sm uppercase tracking-wider px-8 py-4 rounded-full shadow-xl hover:shadow-yellow-500/20 hover:scale-105 transition duration-200"
          >
            <Utensils className="w-4 h-4" />
            <span>{t("hero_cta_menu")}</span>
            <ArrowRight className="w-4 h-4" />
          </a>

          <button
            onClick={onOpenLocation}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-sm uppercase tracking-wider px-8 py-4 rounded-full border border-yellow-400/30 backdrop-blur-md transition hover:scale-105"
          >
            <MapPin className="w-4 h-4 text-[#F6C51B]" />
            <span>{t("hero_cta_location")}</span>
          </button>
        </div>

        {/* Highlights Bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 text-left max-w-4xl mx-auto">
          
          <div className="bg-[#2A2A31]/80 backdrop-blur-md p-4 rounded-2xl border border-[#F6C51B]/30 shadow-lg flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F6C51B]/20 flex items-center justify-center text-[#F6C51B] shrink-0">
              <Drumstick className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-stone-400 font-medium">{t("hero_hl_brews")}</p>
              <p className="text-sm font-bold text-stone-100">{t("hero_hl_macchiato")}</p>
            </div>
          </div>

          <div className="bg-[#2A2A31]/80 backdrop-blur-md p-4 rounded-2xl border border-[#F6C51B]/30 shadow-lg flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F6C51B]/20 flex items-center justify-center text-[#F6C51B] shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-stone-400 font-medium">{t("hero_hl_juices")}</p>
              <p className="text-sm font-bold text-stone-100">{t("hero_hl_spris")}</p>
            </div>
          </div>

          <div className="bg-[#2A2A31]/80 backdrop-blur-md p-4 rounded-2xl border border-[#F6C51B]/30 shadow-lg flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F6C51B]/20 flex items-center justify-center text-[#F6C51B] shrink-0">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-stone-400 font-medium">{t("hero_hl_dining")}</p>
              <p className="text-sm font-bold text-stone-100">{t("hero_hl_sandwich")}</p>
            </div>
          </div>

          <div className="bg-[#2A2A31]/80 backdrop-blur-md p-4 rounded-2xl border border-[#F6C51B]/30 shadow-lg flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F6C51B]/20 flex items-center justify-center text-[#F6C51B] shrink-0">
              <Star className="w-5 h-5 fill-[#F6C51B] text-[#F6C51B]" />
            </div>
            <div>
              <p className="text-xs text-stone-400 font-medium">{t("hero_hl_reviews")}</p>
              <p className="text-sm font-bold text-stone-100">4.1 ★ (195+ Reviews)</p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
