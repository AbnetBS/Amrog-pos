"use client";

import { useState } from "react";
import { Star, CheckCircle2, ThumbsUp, Plus, UserCheck, MapPin, MessageSquareQuote } from "lucide-react";
import { Review } from "@/types";
import { useT, useAutoT } from "@/lib/i18n";

interface ReviewsProps {
  reviews: Review[];
  onReviewSubmitted: () => void;
}

export default function ReviewsSection({ reviews, onReviewSubmitted }: ReviewsProps) {
  const t = useT();
  const tx = useAutoT();
  const [showAddModal, setShowAddModal] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const highlights = [
    "The Famous Chicken Shawarma",
    "Crispy Fried Chicken",
    "Family Meal Buckets",
    "Refreshing Spris",
    "Friendly Staff",
    "Packed 4 Kilo Floor",
  ].map(tx);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !reviewText) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          rating,
          reviewText,
        }),
      });

      if (res.ok) {
        setCustomerName("");
        setReviewText("");
        setShowAddModal(false);
        onReviewSubmitted();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="reviews" className="py-20 bg-[#FCFAF6] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#36363E]/10 border border-[#36363E]/20 text-[#36363E] text-xs font-bold uppercase tracking-widest mb-3">
            <Star className="w-3.5 h-3.5 text-[#F6C51B] fill-[#F6C51B]" />
            <span>{tx("Google Maps Reviews")}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#1B1B20]">
            {t("sec_reviews")}
          </h2>

          <p className="text-stone-600 text-sm sm:text-base mt-3">
            {tx("Real feedback and ratings from Google Maps visitors to Amrogn Chicken at Ambassador Mall, 4 Kilo, Addis Ababa.")}
          </p>
        </div>

        {/* Highlight Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto mb-12">
          {highlights.map((hl, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1.5 bg-white border border-[#F6C51B]/30 px-3.5 py-2 rounded-full text-xs font-bold text-[#1B1B20] shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{hl}</span>
            </div>
          ))}
        </div>

        {/* Rating Summary Header with Google Rating Badge */}
        <div className="bg-[#36363E] text-white rounded-3xl p-6 sm:p-8 border border-[#F6C51B]/30 shadow-xl mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="text-4xl sm:text-5xl font-serif font-black text-[#F6C51B]">4.1</div>
            <div>
              <div className="flex justify-center md:justify-start gap-1 text-[#F6C51B]">
                {[...Array(4)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-[#F6C51B]" />
                ))}
                <Star className="w-5 h-5 text-yellow-500/40" />
              </div>
              <p className="text-xs text-white/90 mt-1 font-bold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#F6C51B]" />
                {tx("Google Maps Rating (195+ Reviews)")}
              </p>
            </div>
          </div>

          <div className="text-xs text-stone-300 max-w-md bg-black/30 p-4 rounded-2xl border border-yellow-500/20">
            <p className="italic">
              {tx("“Guests frequently compliment our fresh shawarma, roasted chicken, and the busy 4 Kilo branch at Ambassador Mall. We continuously work to serve the crowd faster during peak hours.”")}
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 bg-[#F6C51B] hover:bg-yellow-400 text-[#1B1B20] font-extrabold text-xs uppercase tracking-wider px-6 py-3.5 rounded-full shadow-lg hover:scale-105 transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{t("write_review")}</span>
          </button>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-3xl p-6 border border-[#F6C51B]/20 shadow-md flex flex-col justify-between space-y-4 hover:border-[#F6C51B]/50 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-[#36363E] text-[#F6C51B] font-bold text-sm flex items-center justify-center">
                      {rev.customerName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1B1B20] text-sm flex items-center gap-1">
                        <span>{rev.customerName}</span>
                        {rev.isVerified && (
                          <span title="Google Maps Local Guide">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                          </span>
                        )}
                      </h4>
                      <p className="text-[10px] text-stone-400">{rev.reviewDate}</p>
                    </div>
                  </div>

                  <div className="flex gap-1 text-[#F6C51B]">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#F6C51B]" />
                    ))}
                  </div>
                </div>

                <p className="text-stone-700 text-xs sm:text-sm leading-relaxed font-light italic">
                  "{tx(rev.reviewText)}"
                </p>
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                <span className="flex items-center gap-1 text-stone-500 font-semibold">
                  <MessageSquareQuote className="w-3.5 h-3.5 text-[#F6C51B]" /> {tx("Google Local Guide")}
                </span>
                <span className="flex items-center gap-1 text-[#36363E] font-semibold">
                  <ThumbsUp className="w-3 h-3 text-[#F6C51B]" /> {tx("Verified")}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Review Submission Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#1B1B20] rounded-3xl p-6 max-w-md w-full border border-[#F6C51B] shadow-2xl text-white">
            
            <div className="flex justify-between items-center pb-4 border-b border-stone-800">
              <h3 className="font-serif font-bold text-lg text-white">{tx("Leave Feedback for Amrogn Chicken")}</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold uppercase text-yellow-200 mb-1">{t("your_name_ph")}</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Samuel Yohannes"
                  className="w-full bg-[#2A2A31] border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-[#F6C51B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-yellow-200 mb-1">{tx("Rating")}</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`p-2 rounded-lg border text-sm font-bold flex items-center gap-1 ${
                        rating >= star
                          ? "bg-[#F6C51B] text-[#1B1B20] border-[#F6C51B]"
                          : "bg-[#2A2A31] text-stone-400 border-stone-700"
                      }`}
                    >
                      ★ {star}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-yellow-200 mb-1">{tx("Review Comments")}</label>
                <textarea
                  rows={3}
                  required
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder={tx("Tell us what you enjoyed about the famous chicken shawarma, family combos, or the 4 Kilo experience...")}
                  className="w-full bg-[#2A2A31] border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-[#F6C51B]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#F6C51B] text-[#1B1B20] font-bold text-xs uppercase tracking-wider py-3 rounded-xl hover:bg-yellow-400 transition"
              >
                {isSubmitting ? t("sending") : t("submit_review")}
              </button>
            </form>

          </div>
        </div>
      )}

    </section>
  );
}
