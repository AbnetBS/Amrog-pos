"use client";

import { Drumstick, MapPin, Phone, Clock, Lock, Heart, ShieldCheck, Camera, Music2 } from "lucide-react";
import Link from "next/link";
import { SiteSettings } from "@/types";
import { fixBrandText } from "@/lib/brand";
import { useT, useAutoT } from "@/lib/i18n";
import { FACEBOOK_URL, GOOGLE_MAPS_DIRECTIONS_URL, INSTAGRAM_URL, TIKTOK_URL } from "@/lib/business-links";

interface FooterProps {
  settings: SiteSettings;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
}

export default function Footer({ settings, onOpenAdmin, isAdminLoggedIn }: FooterProps) {
  const t = useT();
  const tx = useAutoT();
  const cafeName = fixBrandText(settings.cafe_name || "Amrogn Chicken");
  const tagline = settings.tagline || "Home of Authentic Shawarma in Addis Ababa";
  const phone = settings.phone || "097 895 7070";
  const address = settings.address || "Addis Ababa, Ethiopia";
  const plusCode = settings.plus_code || "2QM5+XFX";
  const openingHours = settings.opening_hours || "Open Daily 10:00 - 22:00";

  return (
    <footer className="bg-[#17171B] text-stone-300 pt-16 pb-8 border-t border-[#F6C51B]/30 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-stone-800">
          
          {/* Col 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F6C51B] to-[#A87E0A] flex items-center justify-center text-[#1B1B20] font-bold">
                <Drumstick className="w-5 h-5 text-[#1B1B20]" />
              </div>
              <span className="text-2xl font-serif font-black text-white tracking-wider">
                {tx(cafeName)}
              </span>
            </div>

            <p className="text-stone-400 leading-relaxed font-light text-xs">
              {tx(tagline)}
            </p>

            <div className="flex items-center gap-2 pt-1 text-xs text-[#F6C51B] font-semibold">
              <MapPin className="w-4 h-4" />
              <span>Addis Ababa • Plus Code: {plusCode}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1" aria-label="Amrogn Chicken official links">
              <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" aria-label="Amrogn Chicken on Facebook" title="Facebook" className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#1877F2] text-white flex items-center justify-center transition">
                <span aria-hidden="true" className="font-sans font-black text-base leading-none">f</span>
              </a>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Amrogn Chicken on Instagram" title="Instagram" className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#C13584] text-white flex items-center justify-center transition">
                <Camera className="w-4 h-4" aria-hidden="true" />
              </a>
              <a href={TIKTOK_URL} target="_blank" rel="noopener noreferrer" aria-label="Amrogn Chicken on TikTok" title="TikTok" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white hover:text-black text-white flex items-center justify-center transition">
                <Music2 className="w-4 h-4" aria-hidden="true" />
              </a>
              <a href={GOOGLE_MAPS_DIRECTIONS_URL} target="_blank" rel="noopener noreferrer" aria-label="Get directions to Amrogn Chicken on Google Maps" title="Google Maps" className="w-8 h-8 rounded-full bg-white/10 hover:bg-emerald-600 text-white flex items-center justify-center transition">
                <MapPin className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Col 2: Navigation Shortcuts */}
          <div className="space-y-3">
            <h4 className="text-white font-serif font-bold uppercase tracking-wider text-xs border-b border-[#F6C51B]/30 pb-2">
              {t("footer_quick_links")}
            </h4>
            <ul className="space-y-2 text-stone-400">
              <li><a href="#hero" className="hover:text-[#F6C51B] transition">{t("fl_home")}</a></li>
              <li><a href="#about" className="hover:text-[#F6C51B] transition">{t("fl_about")}</a></li>
              <li><a href="#why-us" className="hover:text-[#F6C51B] transition">{t("fl_why")}</a></li>
              <li><a href="#menu" className="hover:text-[#F6C51B] transition">{t("fl_menu")}</a></li>
              <li><a href="#services" className="hover:text-[#F6C51B] transition">{t("fl_services")}</a></li>
              <li><a href="#gallery" className="hover:text-[#F6C51B] transition">{t("fl_gallery")}</a></li>
            </ul>
          </div>

          {/* Col 3: Hours & Info */}
          <div className="space-y-3">
            <h4 className="text-white font-serif font-bold uppercase tracking-wider text-xs border-b border-[#F6C51B]/30 pb-2">
              {t("footer_hours")}
            </h4>
            <div className="space-y-2 text-stone-400 text-xs">
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#F6C51B] shrink-0" />
                <span>{tx(openingHours)}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#F6C51B] shrink-0" />
                <a href={`tel:${phone.replace(/\s+/g, "")}`} className="hover:text-yellow-200 font-bold">
                  {phone}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#F6C51B] shrink-0" />
                <span>{tx(address)}</span>
              </p>
            </div>
          </div>

          {/* Col 4: Admin Live Control */}
          <div className="space-y-3">
            <h4 className="text-white font-serif font-bold uppercase tracking-wider text-xs border-b border-[#F6C51B]/30 pb-2">
              Website Admin
            </h4>
            <p className="text-stone-400 text-xs leading-relaxed">
              Protected live control panel to edit menu items, prices, reservations, orders, and content.
            </p>

            <button
              onClick={onOpenAdmin}
              className={`w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition shadow-md ${
                isAdminLoggedIn
                  ? "bg-emerald-600 text-white hover:bg-emerald-500"
                  : "bg-white/10 hover:bg-white/20 text-yellow-200 border border-yellow-500/30"
              }`}
            >
              {isAdminLoggedIn ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-yellow-300" />
                  <span>Open Live Admin Panel</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-[#F6C51B]" />
                  <span>Staff & Owner Portal</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Bottom copyright + developer signature */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-stone-500 text-xs gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <p>© {new Date().getFullYear()} {cafeName} Addis Ababa. {t("footer_rights")}</p>
            <div className="flex items-center gap-3">
              <Link href="/privacy" className="hover:text-[#F6C51B] transition">
                {t("footer_privacy")}
              </Link>
              <span className="text-stone-700">•</span>
              <Link href="/terms" className="hover:text-[#F6C51B] transition">
                {t("footer_terms")}
              </Link>
            </div>
          </div>
          <a
            href="tel:+251919081802"
            className="flex items-center gap-2 bg-[#F6C51B]/10 hover:bg-[#F6C51B]/20 border border-[#F6C51B]/30 px-3.5 py-2 rounded-xl transition"
          >
            <Heart className="w-4 h-4 text-[#F6C51B] fill-[#F6C51B]" />
            <span className="font-extrabold text-[#F6C51B] tracking-wide">Powered by - +251919081802</span>
          </a>
        </div>

      </div>
    </footer>
  );
}
