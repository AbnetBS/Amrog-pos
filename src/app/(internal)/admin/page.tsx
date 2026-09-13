"use client";

import { useState, useEffect } from "react";
import AdminPanel from "@/components/AdminPanel";
import { MenuItem, Category, SiteSettings, Review, GalleryItem } from "@/types";
import { DEFAULT_SETTINGS, DEFAULT_CATEGORIES, DEFAULT_MENU_ITEMS, DEFAULT_REVIEWS, DEFAULT_GALLERY } from "@/lib/initial-data";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function DedicatedAdminPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS as SiteSettings);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES as Category[]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(DEFAULT_MENU_ITEMS as MenuItem[]);
  const [reviews, setReviews] = useState<Review[]>(DEFAULT_REVIEWS as Review[]);
  const [gallery, setGallery] = useState<GalleryItem[]>(DEFAULT_GALLERY as GalleryItem[]);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loadAdminData = async () => {
    try {
      // PERFORMANCE: no /api/seed call (routes self-initialize); all reads parallel.
      // The ?v= busts the public HTTP cache so the owner ALWAYS sees fresh data
      // after saving (public GETs are now `Cache-Control: max-age=60`).
      const v = Date.now();
      const [sRes, cRes, mRes, rRes, gRes] = await Promise.all([
        fetch(`/api/settings?v=${v}`),
        fetch(`/api/categories?v=${v}`),
        fetch(`/api/menu?v=${v}`),
        fetch(`/api/reviews?v=${v}&all=1`), // full list for moderation (approve/reject)
        fetch(`/api/gallery?v=${v}`),
      ]);

      if (sRes.ok) setSettings(await sRes.json());
      if (cRes.ok) setCategories(await cRes.json());
      if (mRes.ok) setMenuItems(await mRes.json());
      if (rRes.ok) setReviews(await rRes.json());
      if (gRes.ok) setGallery(await gRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetch("/api/admin/verify")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setIsAuthenticated(true);
          loadAdminData();
        } else {
          setIsAuthenticated(false);
        }
      })
      .catch(() => setIsAuthenticated(false));
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        loadAdminData();
      } else {
        setErrorMsg("Incorrect password. Access denied.");
      }
    } catch (err) {
      setErrorMsg("Incorrect password. Access denied.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#17171B] flex items-center justify-center text-yellow-200 text-sm">
        Verifying admin access...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#17171B] flex flex-col items-center justify-center p-4 text-white">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-xs text-[#F6C51B] hover:underline bg-white/10 px-4 py-2 rounded-full">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Amrogn Chicken Website</span>
          </Link>
        </div>

        <div className="bg-[#1B1B20] p-8 rounded-3xl border border-[#F6C51B] max-w-md w-full shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <img src="/logo.png" alt="Amrogn Chicken" className="w-16 h-16 rounded-2xl object-contain bg-white p-1 mx-auto shadow-lg" />
            <h1 className="text-xl sm:text-2xl font-serif font-black text-white uppercase tracking-wide">Amrogn Chicken <span className="text-[#F6C51B]">• 4 Kilo Branch</span></h1>
            <p className="text-xs font-bold uppercase tracking-widest text-[#F6C51B]">Owner Dashboard</p>
            <p className="text-xs text-stone-300">Enter your security credentials to access the management dashboard.</p>
          </div>

          {errorMsg && (
            <div className="bg-rose-950/80 border border-rose-500 text-rose-200 text-xs p-3 rounded-xl flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-yellow-200 mb-1">Owner Password</label>
              <input
                type="password"
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full bg-[#2A2A31] border border-stone-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#F6C51B]"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#F6C51B] to-[#D9A409] hover:from-[#F9D34A] hover:to-[#E5B110] text-[#1B1B20] font-black text-xs uppercase tracking-wider py-4 rounded-xl shadow-xl transition"
            >
              {isLoading ? "Unlocking..." : "Login To Dashboard"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <AdminPanel
      settings={settings}
      menuItems={menuItems}
      categories={categories}
      reviews={reviews}
      galleryItems={gallery}
      onRefreshData={loadAdminData}
      onLogout={async () => {
        await fetch("/api/admin/verify", { method: "DELETE" });
        setIsAuthenticated(false);
        window.location.href = "/";
      }}
    />
  );
}
