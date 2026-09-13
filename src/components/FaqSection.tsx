"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useT, useAutoT } from "@/lib/i18n";

export default function FaqSection() {
  const t = useT();
  const tx = useAutoT();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "What are Amrogn Chicken's opening hours?",
      a: "Amrogn Chicken 4 Kilo is open daily from 10:00 AM to 10:00 PM in Addis Ababa. Hours may vary slightly during public holidays. Call 097 895 7070 for holiday hours.",
    },
    {
      q: "How do I reserve a table in advance?",
      a: "Walk-ins are welcome. The 4 Kilo branch gets busy fast, especially at lunch and dinner, so call 097 895 7070 ahead to check for space.",
    },
    {
      q: "What are Amrogn Chicken's most popular menu items?",
      a: "Our Chicken Shawarma, Roasted Chicken and Chicken Mofo are loved across Addis Ababa. For the full table, our Chicken Fajita, Kabsa, family meal buckets and thick multi-layered Spris are customer favorites.",
    },
    {
      q: "Is Amrogn Chicken a good spot for meetings or catching up?",
      a: "Absolutely! The 4 Kilo branch provides a comfortable, vibrant environment with relaxed seating and great food, making it a favorite spot for business meetings, study sessions, and family time.",
    },
    {
      q: "Do you have vegetarian, vegan, and fasting options?",
      a: "Yes, our fresh fruit juices (Spris), mixed veggie sides and fasting-friendly options are clearly tagged on our menu.",
    },
  ];

  return (
    <section id="faq" className="py-20 bg-[#1B1B20] text-white relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F6C51B]/20 border border-[#F6C51B]/40 text-[#F6C51B] text-xs font-bold uppercase tracking-widest mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{tx("Got Questions?")}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white">
            {t("sec_faq")}
          </h2>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-[#2A2A31]/80 rounded-2xl border border-[#F6C51B]/20 overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 focus:outline-none"
                >
                  <span className="font-serif font-bold text-sm sm:text-base text-white">
                    {tx(faq.q)}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#F6C51B] transition-transform duration-300 shrink-0 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-stone-300 leading-relaxed font-light border-t border-stone-800 pt-3">
                    {tx(faq.a)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
