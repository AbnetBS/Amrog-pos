"use client";

import { useState } from "react";
import { MapPin, Phone, Clock, Navigation, Copy, Check, ExternalLink, Calendar } from "lucide-react";
import { SiteSettings } from "@/types";
import { useT, useAutoT } from "@/lib/i18n";
import { GOOGLE_MAPS_DIRECTIONS_URL } from "@/lib/business-links";

interface LocationProps {
  settings: SiteSettings;
}

export default function LocationSection({ settings }: LocationProps) {
  const t = useT();
  const tx = useAutoT();
  const [copiedCode, setCopiedCode] = useState(false);

  const phone = settings.phone || "097 895 7070";
  const address = settings.address || "Ambassador Mall, Ground Floor, 4 Kilo, Addis Ababa, Ethiopia";
  const plusCode = settings.plus_code || "2QM5+XFX Addis Ababa";
  const openingHours = settings.opening_hours || "Open Daily 10:00 - 22:00 (Hours may vary during holidays)";

  const handleCopyPlusCode = () => {
    navigator.clipboard.writeText(plusCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <section id="contact" className="py-20 bg-[#FCFAF6] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#36363E]/10 border border-[#36363E]/20 text-[#36363E] text-xs font-bold uppercase tracking-widest mb-3">
            <MapPin className="w-3.5 h-3.5 text-[#F6C51B]" />
            <span>{tx("Exact Google Maps Location")}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#1B1B20]">
            {t("sec_location")}
          </h2>

          <p className="text-stone-600 text-sm sm:text-base mt-3">
            {tx("Located at Ambassador Mall, Ground Floor, 4 Kilo, in front of the Parliament, Addis Ababa. Drop in for shawarma or call ahead.")}
          </p>
        </div>

        {/* Location Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          
          {/* Card 1: Address & Plus Code */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F6C51B]/30 shadow-lg flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#36363E] text-[#F6C51B] flex items-center justify-center shadow-md">
                <MapPin className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-xl font-serif font-bold text-[#1B1B20]">{tx("Ambassador Mall, 4 Kilo")}</h3>
                <p className="text-stone-600 text-sm mt-1 leading-relaxed">{tx(address)}</p>
              </div>

              <div className="bg-[#FCFAF6] p-4 rounded-2xl border border-[#F6C51B]/20 space-y-2">
                <span className="text-[10px] uppercase font-extrabold text-[#36363E] tracking-widest block">
                  {tx("Google Maps Plus Code")}
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#1B1B20] text-sm sm:text-base">{plusCode}</span>
                  <button
                    onClick={handleCopyPlusCode}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#F6C51B] bg-white border border-[#F6C51B]/40 px-2.5 py-1 rounded-lg hover:bg-yellow-50"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? tx("Copied") : tx("Copy")}</span>
                  </button>
                </div>
              </div>
            </div>

            <a
              href={GOOGLE_MAPS_DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#36363E] hover:bg-[#2A2A31] text-yellow-200 font-bold text-xs uppercase py-3.5 rounded-2xl shadow transition"
            >
              <Navigation className="w-4 h-4 text-[#F6C51B]" />
              <span>{tx("Open in Google Maps App")}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Card 2: Hours & Direct Phone */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F6C51B]/30 shadow-lg flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#36363E] text-[#F6C51B] flex items-center justify-center shadow-md">
                <Clock className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-xl font-serif font-bold text-[#1B1B20]">{tx("Opening Hours & Phone")}</h3>
                <p className="text-stone-600 text-xs mt-1">{tx("Open daily for lunch, dinners, juices and takeaways.")}</p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 p-3 bg-yellow-50/50 rounded-xl border border-yellow-200/60">
                  <Clock className="w-4 h-4 text-[#F6C51B] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-[#1B1B20] block">{tx("Daily Schedule")}</span>
                    <span className="text-xs text-stone-600">{tx(openingHours)}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-yellow-50/50 rounded-xl border border-yellow-200/60">
                  <Phone className="w-4 h-4 text-[#F6C51B] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-[#1B1B20] block">{tx("Direct Phone")}</span>
                    <a href={`tel:${phone.replace(/\s+/g, "")}`} className="text-xs font-bold text-[#36363E] hover:underline">
                      {phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <a
              href="#menu"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#F6C51B] hover:bg-yellow-400 text-[#1B1B20] font-extrabold text-xs uppercase py-3.5 rounded-2xl shadow transition"
            >
              <Calendar className="w-4 h-4" />
              <span>{tx("Browse Our Menu")}</span>
            </a>
          </div>

          {/* Card 3: Precise Coordinates Google Maps Embed */}
          <div className="bg-white rounded-3xl border border-[#F6C51B]/30 shadow-lg overflow-hidden flex flex-col min-h-[320px]">
            <div className="bg-[#36363E] text-white px-5 py-3 text-xs font-bold flex items-center justify-between border-b border-[#F6C51B]/30">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#F6C51B]" /> 4 Kilo Embed Map
              </span>
              <span className="text-[10px] text-yellow-300">9.0349875, 38.7587344</span>
            </div>
            <div className="flex-1 w-full bg-stone-200 relative">
              <iframe
                title="Amrogn Chicken 4 Kilo Google Maps Location"
                src="https://maps.google.com/maps?q=9.0349875,38.7587344&hl=en&z=17&output=embed"
                className="w-full h-full min-h-[280px] border-0"
                loading="lazy"
                allowFullScreen
              />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
