"use client";

import { UtensilsCrossed, QrCode, Users, Briefcase, ArrowUpRight, ShieldCheck } from "lucide-react";
import { useT, useAutoT } from "@/lib/i18n";

export default function ServicesSection() {
  const t = useT();
  const tx = useAutoT();
  const services = [
    {
      icon: UtensilsCrossed,
      title: "Dine-In",
      desc: "Enjoy freshly prepared chicken, aromatic shawarma, and fresh juices in our warm dining space at 4 Kilo, Addis Ababa.",
      badge: "In-House Hospitality",
    },
    {
      icon: QrCode,
      title: "QR Digital Menu",
      desc: "Every table has a QR code. Scan it to browse our full menu with photos, prices and descriptions right from your phone.",
      badge: "Contactless Browsing",
    },
    {
      icon: Users,
      title: "Personal Waiter Service",
      desc: "Our waiters take your order tableside, add your personal notes (Extra Spicy, No Onion...), and your bill stays open until you pay.",
      badge: "Tableside Care",
    },
    {
      icon: Briefcase,
      title: "Business & Meetings",
      desc: "A comfortable, professional space with great food for productive team catch-ups and meetings.",
      badge: "Productive Vibe",
    },
  ];

  return (
    <section id="services" className="py-20 bg-[#1B1B20] text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F6C51B]/20 border border-[#F6C51B]/40 text-[#F6C51B] text-xs font-bold uppercase tracking-widest mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{tx("Tailored Hospitality")}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white">{t("sec_how")}</h2>
          <p className="text-stone-300 text-sm sm:text-base mt-3 font-light">
            {tx("A modern table-service experience: scan, browse, order through your waiter, pay when you're done.")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((srv, idx) => {
            const Icon = srv.icon;
            return (
              <div
                key={idx}
                className="bg-[#2A2A31]/80 backdrop-blur-md p-6 rounded-3xl border border-[#F6C51B]/20 hover:border-[#F6C51B]/60 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F6C51B] to-[#D9A409] flex items-center justify-center text-[#1B1B20] shadow-lg group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] uppercase font-bold text-[#F6C51B] bg-[#F6C51B]/10 px-2 py-0.5 rounded border border-[#F6C51B]/20">
                      {tx(srv.badge)}
                    </span>
                  </div>
                  <h3 className="text-xl font-serif font-bold text-stone-100 group-hover:text-[#F6C51B] transition-colors">
                    {tx(srv.title)}
                  </h3>
                  <p className="text-stone-300 text-xs mt-2 leading-relaxed font-light">{tx(srv.desc)}</p>
                </div>
                <div className="mt-6 pt-3 border-t border-stone-800 text-xs font-extrabold text-[#F6C51B] flex items-center justify-between">
                  <span>{tx("Always available")}</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
