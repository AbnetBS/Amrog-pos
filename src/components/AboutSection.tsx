"use client";

import { Drumstick, Heart, Sparkles, CheckCircle2, ShieldCheck } from "lucide-react";
import { SiteSettings } from "@/types";
import { useAutoT } from "@/lib/i18n";

interface AboutProps {
  settings: SiteSettings;
}

export default function AboutSection({ settings }: AboutProps) {
  const tx = useAutoT();
  const aboutTitle = settings.about_title || "Experience Authentic Chicken, Amrogn Style";
  const aboutDesc =
    settings.about_description ||
    "Since January 2018, Amrogn Chicken has been the home of authentic shawarma in Addis Ababa. From our first branch at Mekanisa to the 4 Kilo branch at Ambassador Mall, our chicken is marinated, scored, roasted and fried fresh every day. Famous for the city's best shawarma, mofo, burgers, combos and fresh juices."

  return (
    <section id="about" className="py-20 bg-[#FCFAF6] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Text Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#36363E]/10 border border-[#36363E]/20 text-[#36363E] text-xs font-bold uppercase tracking-widest">
              <Drumstick className="w-3.5 h-3.5 text-[#F6C51B]" />
              <span>{tx("Discover Our Story")}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1B1B20] leading-tight">
              {tx(aboutTitle)}
            </h2>

            <p className="text-stone-700 text-base sm:text-lg leading-relaxed font-normal">
              {tx(aboutDesc)}
            </p>

            {/* Highlights List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-[#F6C51B]/20 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-[#F6C51B] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-[#1B1B20] text-sm">{tx("Home of Authentic Shawarma")}</h4>
                  <p className="text-xs text-stone-600 mt-0.5">{tx("Marinated, scored and grilled the Amrogn way.")}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-[#F6C51B]/20 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-[#F6C51B] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-[#1B1B20] text-sm">{tx("Fresh Made Daily")}</h4>
                  <p className="text-xs text-stone-600 mt-0.5">{tx("Chicken, shawarma, burgers and 100% natural juices.")}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-[#F6C51B]/20 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-[#F6C51B] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-[#1B1B20] text-sm">{tx("A Packed House, Every Day")}</h4>
                  <p className="text-xs text-stone-600 mt-0.5">{tx("One of the busiest chicken houses in Addis Ababa.")}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-[#F6C51B]/20 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-[#F6C51B] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-[#1B1B20] text-sm">{tx("Dine-In, Takeaway & Delivery")}</h4>
                  <p className="text-xs text-stone-600 mt-0.5">{tx("Ambassador Mall, Ground Floor, 4 Kilo.")}</p>
                </div>
              </div>

            </div>

            {/* Quote Badge */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#36363E] to-[#1B1B20] text-white flex items-center gap-4 shadow-xl border-l-4 border-[#F6C51B]">
              <div className="w-12 h-12 rounded-full bg-[#F6C51B]/20 flex items-center justify-center shrink-0 text-[#F6C51B]">
                <Heart className="w-6 h-6 fill-[#F6C51B]" />
              </div>
              <div>
                <p className="text-sm italic font-light text-white">
                  {tx("“At Amrogn, every shawarma is made the way Addis loves it, and every guest is treated like long-time family.”")}
                </p>
                <p className="text-xs text-[#F6C51B] font-bold mt-1 uppercase tracking-wider">
                  {tx("The Amrogn Chicken Family")}
                </p>
              </div>
            </div>

          </div>

          {/* Visual Grid */}
          <div className="grid grid-cols-2 gap-4 relative">
            <div className="space-y-4">
              <div className="rounded-3xl overflow-hidden shadow-2xl border-2 border-[#F6C51B]/20 group">
                <img
                  src="/images/menu/shawarma.jpg"
                  alt="Amrogn Chicken Shawarma platter"
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="bg-[#36363E] text-white p-5 rounded-3xl shadow-xl border border-[#F6C51B]/30 text-center">
                <span className="text-3xl font-serif font-extrabold text-[#F6C51B] block">100%</span>
                <span className="text-xs uppercase font-bold tracking-wider block mt-1 text-yellow-200">
                  {tx("Chicken, Every Single Time")}
                </span>
              </div>
            </div>

            <div className="space-y-4 pt-8">
              <div className="bg-[#F6C51B] text-[#1B1B20] p-5 rounded-3xl shadow-xl text-center">
                <span className="text-3xl font-serif font-black block">Addis</span>
                <span className="text-xs uppercase font-extrabold tracking-wider block mt-1">
                  {tx("Heart of the City")}
                </span>
              </div>
              <div className="rounded-3xl overflow-hidden shadow-2xl border-2 border-[#F6C51B]/20 group">
                <img
                  src="/images/menu/roasted-full.jpg"
                  alt="Roasted chicken at Amrogn Chicken"
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
