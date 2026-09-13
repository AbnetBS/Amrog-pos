"use client";

import { Drumstick, Utensils, GlassWater, Sparkles, HeartHandshake, Briefcase, Heart, BookOpen, Users, Sun } from "lucide-react";
import { useT, useAutoT } from "@/lib/i18n";

export default function WhyChooseSection() {
  const t = useT();
  const tx = useAutoT();
  const features = [
    {
      icon: Drumstick,
      title: "Signature Chicken",
      desc: "Famous chicken shawarma, roasted, grilled and fried chicken, marinated and made fresh every day.",
      badge: "Since 2018",
    },
    {
      icon: Utensils,
      title: "Burgers, Combos & More",
      desc: "From chicken fajita and kabsa to family meal buckets, satisfying meals for the whole table.",
      badge: "Quality Ingredients",
    },
    {
      icon: GlassWater,
      title: "Fresh Juices",
      desc: "Taste naturally refreshing mixed fruit juices (Spris), avocado blends, and seasonal fruit punches.",
      badge: "100% Pure Fruit",
    },
    {
      icon: Sparkles,
      title: "Bold, Busy, Loved",
      desc: "The packed 4 Kilo branch at Ambassador Mall, with warm lighting, fast service and a lively floor.",
      badge: "4 Kilo Vibe",
    },
    {
      icon: HeartHandshake,
      title: "Friendly Service",
      desc: "Our goal is to provide every guest with warm Addis hospitality and a memorable chicken experience.",
      badge: "Warm Hospitality",
    },
  ];

  const occasions = [
    { icon: Briefcase, label: "Business Meetings" },
    { icon: Heart, label: "Date Night" },
    { icon: BookOpen, label: "Office Lunches" },
    { icon: Users, label: "Family Lunches" },
    { icon: Sun, label: "Catching Up With Friends" },
  ];

  return (
    <section id="why-us" className="py-20 bg-[#1B1B20] text-white relative overflow-hidden">
      {/* Decorative Blur BG */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#F6C51B]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#36363E]/50 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F6C51B]/20 border border-[#F6C51B]/40 text-[#F6C51B] text-xs font-bold uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{tx("Why Choose Amrogn Chicken")}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white">
            {t("sec_why")}
          </h2>

          <p className="text-stone-300 text-base sm:text-lg mt-4 font-light">
            {tx("Whether you are grabbing the famous shawarma for lunch or ordering a family bucket for dinner, Amrogn Chicken offers a welcoming spot for every guest.")}
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const IconComponent = feat.icon;
            return (
              <div
                key={idx}
                className="bg-[#2A2A31]/70 backdrop-blur-md p-6 rounded-3xl border border-[#F6C51B]/20 hover:border-[#F6C51B]/60 transition-all duration-300 hover:-translate-y-1 group shadow-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F6C51B] to-[#D9A409] flex items-center justify-center text-[#1B1B20] shadow-lg group-hover:scale-110 transition-transform">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#F6C51B] bg-[#F6C51B]/10 px-2.5 py-1 rounded-full border border-[#F6C51B]/20">
                    {tx(feat.badge)}
                  </span>
                </div>

                <h3 className="text-xl font-serif font-bold text-stone-100 group-hover:text-[#F6C51B] transition-colors">
                  {tx(feat.title)}
                </h3>

                <p className="text-stone-300 text-sm mt-2 leading-relaxed font-light">
                  {tx(feat.desc)}
                </p>
              </div>
            );
          })}

          {/* Occasions Card */}
          <div className="bg-gradient-to-br from-[#36363E] to-[#1B1B20] p-6 rounded-3xl border-2 border-[#F6C51B]/40 shadow-xl flex flex-col justify-between">
            <div>
              <div className="inline-block bg-[#F6C51B] text-[#1B1B20] font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full mb-3">
                {tx("Versatile Environment")}
              </div>
              <h3 className="text-2xl font-serif font-bold text-white mb-2">
                {tx("Designed For Every Occasion")}
              </h3>
              <p className="text-stone-300 text-xs leading-relaxed mb-4">
                {tx("A place where productivity and relaxation flow naturally together.")}
              </p>
            </div>

            <div className="space-y-2">
              {occasions.map((occ, oIdx) => {
                const OccIcon = occ.icon;
                return (
                  <div key={oIdx} className="flex items-center gap-2.5 text-xs text-yellow-200/90 font-medium bg-black/20 px-3 py-1.5 rounded-lg">
                    <OccIcon className="w-3.5 h-3.5 text-[#F6C51B]" />
                    <span>{occ.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
