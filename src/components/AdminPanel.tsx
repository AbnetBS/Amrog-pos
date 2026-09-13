"use client";

import { useState } from "react";
import {
  Settings, Utensils, Star, Lock, Plus, Trash2, Edit3, CheckCircle2, Save, LogOut, RefreshCw,
  Eye, EyeOff, Upload, Image as ImageIcon, Camera, TrendingUp, Users, QrCode, CreditCard, Monitor,
} from "lucide-react";
import { MenuItem, SiteSettings, Review, Category, GalleryItem } from "@/types";
import { compressImage } from "@/lib/image-utils";
import ReportsTab from "@/components/rms/ReportsTab";
import StaffTab from "@/components/rms/StaffTab";
import TablesQrTab from "@/components/rms/TablesQrTab";
import OrderHistoryTab from "@/components/rms/OrderHistoryTab";
import DailyBoardTab from "@/components/rms/DailyBoardTab";
import StationsTab from "@/components/rms/StationsTab";

interface AdminPanelProps {
  settings: SiteSettings;
  menuItems: MenuItem[];
  categories: Category[];
  reviews: Review[];
  galleryItems?: GalleryItem[];
  onRefreshData: () => void;
  onLogout: () => void;
}

type Tab = "reports" | "menu" | "board" | "stations" | "tables" | "staff" | "gallery" | "reviews" | "history" | "settings" | "security";

export default function AdminPanel({
  settings,
  menuItems,
  categories,
  reviews,
  galleryItems = [],
  onRefreshData,
  onLogout,
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("reports");

  const [settingsForm, setSettingsForm] = useState({
    cafe_name: settings.cafe_name || "Amrogn Chicken",
    tagline: settings.tagline || "Home of Authentic Shawarma in Addis Ababa",
    hero_title: settings.hero_title || "Home of Authentic Shawarma",
    hero_subtitle:
      settings.hero_subtitle || "Amrogn Chicken, 4 Kilo branch on the ground floor of Ambassador Mall. Famous chicken shawarma, fire-grilled and roasted chicken, tandoor mofo and crispy fried chicken. Dine in, take away, or scan your table QR and order in English or Amharic.",
    hero_bg_image:
      settings.hero_bg_image || "/images/menu/fried-hero.jpg",
    logo_url: String(settings.logo_url || ""),
    receipt_enabled: String(settings.receipt_enabled ?? "true"),
    cashier_mode: settings.cashier_mode === "full" ? "full" : "print-queue",
    phone: settings.phone || "097 895 7070",
    address: settings.address || "Ambassador Mall, Ground Floor, 4 Kilo, Addis Ababa, Ethiopia",
    plus_code: settings.plus_code || "2QM5+XFX Addis Ababa",
    opening_hours: settings.opening_hours || "Open Daily 10:00 AM - 10:00 PM",
    announcement: settings.announcement || "🍗 Welcome to Amrogn Chicken, 4 Kilo (Ambassador Mall)! Scan the QR on your table to order, no waiting for a waiter.",
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState("");

  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [isMenuSubmitting, setIsMenuSubmitting] = useState(false);
  const [editingGallery, setEditingGallery] = useState<Partial<GalleryItem> | null>(null);
  const [isGallerySubmitting, setIsGallerySubmitting] = useState(false);
  const [bulkPrepTime, setBulkPrepTime] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState("");

  const toBase64 = async (file: File, cb: (data: string) => void) => {
    try {
      // Compress on device and keep the data-URL in form state. The SERVER
      // persists it to cdn_images only when the record is actually saved, so a
      // canceled upload/change never writes anything to the database.
      const small = await compressImage(file, 640, 0.6);
      cb(small);
    } catch {
      alert("Couldn't read that image. Please try a JPG/PNG under 10MB.");
    }
  };

  // Auto-save ONE setting key immediately (used right after photo selection)
  const autoSaveSetting = async (key: string, value: string, label: string) => {
    setSettingsMsg(`⏳ Uploading ${label}...`);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });
      if (res.ok) {
        setSettingsMsg(`✓ ${label} saved instantly. Refresh the site to see it!`);
        onRefreshData();
      } else {
        setSettingsMsg(`✗ Failed to save ${label}. Try a smaller JPG/PNG.`);
      }
    } catch {
      setSettingsMsg(`✗ Network error saving ${label}.`);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsMsg("");
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsForm),
      });
      if (res.ok) {
        setSettingsMsg("✓ Website info saved successfully!");
        onRefreshData();
      } else setSettingsMsg("Failed to save. Try again.");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSaveMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsMenuSubmitting(true);
    try {
      const method = editingItem.id ? "PUT" : "POST";
      const res = await fetch("/api/menu", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingItem),
      });
      const data = await res.json();
      if (res.ok) {
        setEditingItem(null);
        onRefreshData();
        alert(editingItem.id ? "✓ Menu item updated!" : "✓ New menu item added!");
      } else alert("Failed to save menu item.");
    } finally {
      setIsMenuSubmitting(false);
    }
  };

  const handleDeleteMenuItem = async (id: number) => {
    if (!confirm("Delete this menu item?")) return;
    await fetch(`/api/menu?id=${id}`, { method: "DELETE" });
    onRefreshData();
  };

  const handleSaveGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGallery) return;
    setIsGallerySubmitting(true);
    try {
      const method = editingGallery.id ? "PUT" : "POST";
      const res = await fetch("/api/gallery", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingGallery),
      });
      if (res.ok) {
        setEditingGallery(null);
        onRefreshData();
        alert(editingGallery.id ? "✓ Gallery photo updated!" : "✓ Gallery photo added!");
      } else alert("Failed to save gallery photo.");
    } finally {
      setIsGallerySubmitting(false);
    }
  };

  const handleDeleteGalleryItem = async (id: number) => {
    if (!confirm("Delete this gallery photo?")) return;
    await fetch(`/api/gallery?id=${id}`, { method: "DELETE" });
    onRefreshData();
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 4) {
      setPasswordMsg("Password must be at least 4 characters.");
      return;
    }
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ admin_password: newPassword }),
    });
    if (res.ok) {
      setPasswordMsg("✓ Admin password updated successfully!");
      setNewPassword("");
    }
  };

  const tabs: Array<{ key: Tab; label: string; icon: React.ReactNode }> = [
    { key: "reports", label: "Reports", icon: <TrendingUp className="w-4 h-4" /> },
    { key: "menu", label: `Menu (${menuItems.length})`, icon: <Utensils className="w-4 h-4" /> },
    { key: "board", label: "Daily Board", icon: <TrendingUp className="w-4 h-4" /> },
    { key: "stations", label: "Stations", icon: <Users className="w-4 h-4" /> },
    { key: "tables", label: "Tables & QR", icon: <QrCode className="w-4 h-4" /> },
    { key: "staff", label: "Staff", icon: <Users className="w-4 h-4" /> },
    { key: "gallery", label: `Gallery (${galleryItems.length})`, icon: <Camera className="w-4 h-4" /> },
    { key: "reviews", label: `Reviews (${reviews.length})`, icon: <Star className="w-4 h-4" /> },
    { key: "history", label: "Order History", icon: <QrCode className="w-4 h-4" /> },
    { key: "settings", label: "Website Info", icon: <Settings className="w-4 h-4" /> },
    { key: "security", label: "Password", icon: <Lock className="w-4 h-4" /> },
  ];

  return (
    <div id="fana-admin" className="bg-[#17171B] text-white min-h-screen p-4 sm:p-8">
      {/* Header (hidden when the owner prints a report) */}
      <div className="no-print max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-[#F6C51B]/30">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Amrogn Chicken" className="w-11 h-11 rounded-xl object-contain bg-white p-0.5" />
          <div>
            <h1 className="font-serif font-black text-xl sm:text-2xl text-white uppercase tracking-wide">Amrogn Chicken <span className="text-[#F6C51B]">• 4 Kilo Branch</span></h1>
            <p className="text-xs text-yellow-200/70">Owner dashboard • menu, tables, staff, branch reports, reviews & business info</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a href="/waiter" className="p-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5">
            <Users className="w-4 h-4" /> Waiter App
          </a>
          <button onClick={onRefreshData} className="p-2 bg-white/10 hover:bg-white/20 text-yellow-200 rounded-xl text-xs flex items-center gap-1.5 font-semibold">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={onLogout} className="p-2 bg-rose-600/80 hover:bg-rose-600 text-white rounded-xl text-xs flex items-center gap-1.5 font-bold">
            <LogOut className="w-4 h-4" /> Exit
          </button>
        </div>
      </div>

      {/* Tabs (hidden when the owner prints a report) */}
      <div className="no-print max-w-7xl mx-auto my-6 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === t.key ? "bg-[#F6C51B] text-[#1B1B20]" : "bg-[#1B1B20] text-stone-300 hover:bg-white/10"
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <div className="max-w-7xl mx-auto">
        {/* REPORTS */}
        {activeTab === "reports" && <ReportsTab />}

        {/* DAILY BOARD */}
        {activeTab === "board" && <DailyBoardTab />}

        {/* STATIONS */}
        {activeTab === "stations" && <StationsTab />}

        {/* ORDER HISTORY */}
        {activeTab === "history" && <OrderHistoryTab />}

        {/* STAFF */}
        {activeTab === "staff" && <StaffTab />}

        {/* TABLES & QR */}
        {activeTab === "tables" && <TablesQrTab />}

        {/* WEBSITE SETTINGS */}
        {activeTab === "settings" && (
          <form onSubmit={handleSaveSettings} className="bg-[#1B1B20] p-6 sm:p-8 rounded-3xl border border-[#F6C51B]/30 space-y-6">
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <div>
                <h2 className="text-xl font-serif font-bold text-white">Business Info & Hero Photo</h2>
                <p className="text-xs text-stone-400">Upload background photo, edit titles, phone, and announcement text.</p>
              </div>
              <button type="submit" disabled={savingSettings} className="bg-[#F6C51B] hover:bg-yellow-400 text-[#1B1B20] font-bold text-xs uppercase px-6 py-3 rounded-xl flex items-center gap-2">
                <Save className="w-4 h-4" />
                <span>{savingSettings ? "Saving..." : "Save Info"}</span>
              </button>
            </div>

            {settingsMsg && (
              <div className="bg-emerald-900/60 border border-emerald-500 text-emerald-200 text-xs p-3 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{settingsMsg}</span>
              </div>
            )}
            {/* Receipt photo switch — controls waiter card/online payment flow */}
            <div className="bg-[#2A2A31] p-5 rounded-2xl border border-[#F6C51B]/30 flex items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-sm font-bold text-yellow-200 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#F6C51B]" /> Receipt Photo on Card/Telebirr Payments
                </h3>
                <p className="text-[11px] text-stone-400 mt-1">
                  ON = waiter photographs each card/Telebirr receipt (stored in DB, ~70KB each).
                  OFF = receipts skipped entirely (payments still recorded normally, with zero photo storage).
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setSettingsForm({
                    ...settingsForm,
                    receipt_enabled: settingsForm.receipt_enabled === "true" ? "false" : "true",
                  })
                }
                className={`px-4 py-2.5 rounded-xl text-xs font-black transition shrink-0 ${
                  settingsForm.receipt_enabled === "true"
                    ? "bg-emerald-600 text-white"
                    : "bg-stone-700 text-stone-300"
                }`}
              >
                {settingsForm.receipt_enabled === "true" ? "ON" : "OFF"}
              </button>
            </div>

            {/* Cashier mode switch — print-queue (EFD workflow) vs full payment recording */}
            <div className="bg-[#2A2A31] p-5 rounded-2xl border border-[#F6C51B]/30 flex items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-sm font-bold text-yellow-200 flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-[#F6C51B]" /> Cashier Print-Queue Mode
                </h3>
                <p className="text-[11px] text-stone-400 mt-1">
                  ON = cashier does ONE click per order (keys it into the EFD/POS, prints, taps ✓ PRINTED) • payments stay in the EFD; waiters free tables with &quot;Table cleared&quot;.
                  OFF = full payment mode (cashier records payment method and marks bills Paid, for cafes without an EFD/POS).
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setSettingsForm({
                    ...settingsForm,
                    cashier_mode: settingsForm.cashier_mode === "print-queue" ? "full" : "print-queue",
                  })
                }
                className={`px-4 py-2.5 rounded-xl text-xs font-black transition shrink-0 ${
                  settingsForm.cashier_mode === "print-queue"
                    ? "bg-emerald-600 text-white"
                    : "bg-stone-700 text-stone-300"
                }`}
              >
                {settingsForm.cashier_mode === "print-queue" ? "ON" : "OFF"}
              </button>
            </div>

            {/* Logo upload */}
            <div className="bg-[#2A2A31] p-5 rounded-2xl border border-[#F6C51B]/30 space-y-3">
              <h3 className="text-sm font-bold text-yellow-200 flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#F6C51B]" /> Restaurant Logo (navbar, QR menu & staff apps)
              </h3>
              <p className="text-[11px] text-stone-400">
                Tip: the logo shows inside a <strong>small circle</strong>: a square or round icon (not wide text banners) looks best, like the Amrogn Chicken emblem.
              </p>
              <div className="flex items-center gap-4">
                <img
                  src={settingsForm.logo_url || "/logo.png"}
                  alt="Logo preview"
                  className="w-16 h-16 rounded-full object-contain bg-white border-2 border-[#F6C51B] p-1"
                />
                <div className="flex-1 space-y-2">
                  <label className="flex items-center justify-center gap-2 w-full bg-[#F6C51B] hover:bg-yellow-400 text-[#1B1B20] font-extrabold text-xs py-2.5 px-4 rounded-xl cursor-pointer shadow transition">
                    <Upload className="w-4 h-4" />
                    <span>Upload New Logo From Device</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) toBase64(f, (d) => {
                          setSettingsForm((prev) => ({ ...prev, logo_url: d }));
                          // AUTO-SAVE instantly — no need to press Save after this
                          autoSaveSetting("logo_url", d, "Logo");
                        });
                      }}
                    />
                  </label>
                  <input
                    type="text"
                    value={settingsForm.logo_url}
                    onChange={(e) => setSettingsForm({ ...settingsForm, logo_url: e.target.value })}
                    placeholder="...or paste logo URL (empty = default Amrogn logo)"
                    className="w-full bg-[#1B1B20] border border-stone-700 rounded-xl p-2.5 text-xs text-stone-200"
                  />
                </div>
              </div>
            </div>

            {/* Hero background */}
            <div className="bg-[#2A2A31] p-5 rounded-2xl border border-[#F6C51B]/30 space-y-3">
              <h3 className="text-sm font-bold text-yellow-200 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#F6C51B]" /> Hero Background Photo
              </h3>
              {settingsForm.hero_bg_image && (
                <div className="relative h-44 w-full rounded-2xl overflow-hidden border border-stone-700 bg-stone-900">
                  <img src={settingsForm.hero_bg_image} alt="Hero preview" className="w-full h-full object-cover" />
                </div>
              )}
              <label className="flex items-center justify-center gap-2 w-full bg-[#F6C51B] hover:bg-yellow-400 text-[#1B1B20] font-extrabold text-xs py-3 px-4 rounded-xl cursor-pointer shadow transition">
                <Upload className="w-4 h-4" />
                <span>Upload Custom Hero Image From Device</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) toBase64(f, (d) => { setSettingsForm((prev) => ({ ...prev, hero_bg_image: d })); autoSaveSetting("hero_bg_image", d, "Hero photo"); }); }} />
              </label>
              <input
                type="text"
                value={settingsForm.hero_bg_image}
                onChange={(e) => setSettingsForm({ ...settingsForm, hero_bg_image: e.target.value })}
                placeholder="...or paste image URL"
                className="w-full bg-[#1B1B20] border border-stone-700 rounded-xl p-2.5 text-xs text-stone-200"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(
                [
                  ["Café Name", "cafe_name"],
                  ["Tagline", "tagline"],
                  ["Hero Title", "hero_title"],
                  ["Phone Number", "phone"],
                  ["Plus Code (Google Maps)", "plus_code"],
                  ["Opening Hours Text", "opening_hours"],
                  ["Address", "address"],
                  ["Announcement Text", "announcement"],
                ] as Array<[string, keyof typeof settingsForm]>
              ).map(([label, key]) => (
                <div key={key} className={String(key).includes("hero_title") || String(key).includes("announcement") ? "md:col-span-2" : ""}>
                  <label className="block text-xs font-bold text-yellow-200 mb-1">{label}</label>
                  <input
                    type="text"
                    value={settingsForm[key]}
                    onChange={(e) => setSettingsForm({ ...settingsForm, [key]: e.target.value })}
                    className="w-full bg-[#2A2A31] border border-stone-700 rounded-xl p-3 text-xs text-white"
                  />
                </div>
              ))}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-yellow-200 mb-1">Hero Subtitle</label>
                <textarea
                  rows={2}
                  value={settingsForm.hero_subtitle}
                  onChange={(e) => setSettingsForm({ ...settingsForm, hero_subtitle: e.target.value })}
                  className="w-full bg-[#2A2A31] border border-stone-700 rounded-xl p-3 text-xs text-white"
                />
              </div>
            </div>
          </form>
        )}

        {/* 🗑 FACTORY RESET — one-time zone to clear test data before launching */}
        {activeTab === "settings" && (
          <div className="bg-rose-950/30 border-2 border-rose-700/60 rounded-3xl p-6 space-y-4">
            <div>
              <h3 className="font-serif font-black text-lg text-rose-300 flex items-center gap-2">🗑 Factory Reset (Danger Zone)</h3>
              <p className="text-[11px] text-rose-200/70 mt-1">
                One-time setup zone before launching live. Deletes test orders, photos & announcements you uploaded while testing.
                This is PERMANENT, there is no undo button. Read each button before pressing.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {(
                [
                  { action: "orders", label: "Delete Test Orders", desc: "Bills, receipts, reports → 0" },
                  { action: "menu", label: "Delete All Menu Items", desc: "Test dishes & photos gone" },
                  { action: "announcements", label: "Delete Announcements", desc: "Daily Board slides cleared" },
                  { action: "gallery", label: "Delete Gallery Photos", desc: "Test gallery images gone" },
                ] as const
              ).map((b) => (
                <button
                  key={b.action}
                  onClick={async () => {
                    if (!confirm(`⚠️ ${b.label}?\n\n${b.desc}\n\nThis CANNOT be undone. Continue?`)) return;
                    const r = await fetch("/api/reset", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ action: b.action }),
                    });
                    const d = await r.json();
                    alert(d.message || d.error || "Done");
                    onRefreshData();
                  }}
                  className="bg-rose-700/40 hover:bg-rose-600/70 border border-rose-500/50 text-rose-100 rounded-2xl p-4 text-left transition group"
                >
                  <p className="font-black text-sm group-hover:text-white">{b.label}</p>
                  <p className="mt-1 text-[10px] text-rose-300/80">{b.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MENU MANAGER */}
        {activeTab === "menu" && (
          <div className="space-y-6">
            {/* 📂 CATEGORIES MANAGER — owner renames/reorders/adds food groups easily */}
            <div className="bg-[#1B1B20] rounded-2xl border border-[#F6C51B]/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-yellow-200">📂 Menu Categories ({categories.length})</h3>
                <p className="text-[10px] text-stone-500">Rename or organize food groups, dishes follow automatically.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <div key={c.id} className="flex items-center gap-1.5 bg-[#2A2A31] border border-stone-700 rounded-xl pl-2.5 pr-1 py-1">
                    <input
                      defaultValue={c.name}
                      onBlur={(e) => {
                        const v = e.target.value.trim();
                        if (v && v !== c.name) {
                          fetch("/api/categories", {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ id: c.id, name: v }),
                          }).then(() => onRefreshData());
                        }
                      }}
                      className="bg-transparent text-xs font-bold text-white w-28 focus:outline-none"
                    />
                    {c.slug !== "all" && (
                      <button
                        onClick={async () => {
                          if (confirm(`Delete category "${c.name}"? Dishes keep their old group (hidden from filters).`)) {
                            await fetch(`/api/categories?id=${c.id}`, { method: "DELETE" });
                            onRefreshData();
                          }
                        }}
                        className="w-6 h-6 rounded-md bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white flex items-center justify-center text-xs"
                        title="Delete category"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  const name = String(fd.get("name") || "").trim();
                  if (!name) return;
                  const icon = String(fd.get("icon") || "Utensils");
                  await fetch("/api/categories", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      name,
                      icon,
                      slug: name.toLowerCase().replace(/&/g, "").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-"),
                      sortOrder: categories.length,
                    }),
                  });
                  (e.target as HTMLFormElement).reset();
                  onRefreshData();
                }}
                className="flex flex-wrap gap-2 items-end pt-2 border-t border-stone-800"
              >
                <input
                  name="name"
                  placeholder="New group name (e.g. Grilled Platters)"
                  className="flex-1 min-w-[160px] bg-[#2A2A31] border border-stone-700 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500"
                />
                <select
                  name="icon"
                  defaultValue="Utensils"
                  className="bg-[#2A2A31] border border-stone-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="Utensils">🍽️ All Items</option>
                  <option value="Sandwich">🌯 Shawarma</option>
                  <option value="Drumstick">🍗 Chicken</option>
                  <option value="Hamburger">🍔 Chicken Burgers</option>
                  <option value="Popcorn">🍟 Sides</option>
                  <option value="UtensilsCrossed">🍱 Combos</option>
                  <option value="Users">👨‍👩‍👧 Family Meals</option>
                  <option value="CupSoda">🥤 Drinks</option>
                  <option value="Citrus">🧃 Fresh Juices</option>
                  <option value="Flame">⭐ Specials</option>
                  <option value="CookingPot">🍳 Kitchen / Other</option>
                  <option value="Package">📦 Packaged</option>
                  <option value="Cake">🍰 Dessert</option>
                </select>
                <button type="submit" className="bg-[#F6C51B] hover:bg-yellow-400 text-[#1B1B20] font-black text-xs uppercase px-4 py-2 rounded-xl flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> Add Group
                </button>
              </form>
            </div>

            {/* 📋 BULK MENU IMPORT — paste your entire dish list at once */}
            <div className="bg-[#1B1B20] rounded-2xl border border-emerald-700/40 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-emerald-300">📋 Bulk Menu Import</h3>
                  <p className="text-[11px] text-stone-400 mt-0.5">Paste your full dish list, one line per item in the format below. Items matching an existing name are updated in place (only the differences change, e.g. a new prep time).</p>
                </div>
                <button
                  id="bulk-import-btn"
                  onClick={async () => {
                    const ta = document.getElementById("bulk-menu-text") as HTMLTextAreaElement | null;
                    if (!ta?.value?.trim()) return alert("Paste your menu text first");
                    const btn = ta.closest("div")?.querySelector("#bulk-import-btn") as HTMLButtonElement | null;
                    if (btn) btn.disabled = true;
                    try {
                      const r = await fetch("/api/menu-bulk", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ text: ta.value, prepTime: bulkPrepTime }),
                      });
                      const d = await r.json();
                      alert(d.message || d.error || "Import done");
                      ta.value = "";
                      onRefreshData();
                    } catch (e) {
                      alert("Import failed: " + String(e));
                    } finally {
                      if (btn) btn.disabled = false;
                    }
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase px-5 py-3 rounded-xl flex items-center gap-2 disabled:opacity-40"
                >
                  <Upload className="w-4 h-4" /> Import Items
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-emerald-200 mb-1">⏱ Prep Time to apply (all items)</label>
                  <input
                    value={bulkPrepTime}
                    onChange={(e) => setBulkPrepTime(e.target.value)}
                    placeholder="e.g. 15-20 min • leave empty to keep existing times"
                    className="w-full bg-black/30 border border-stone-700 rounded-xl p-2.5 text-xs text-stone-200"
                  />
                  <p className="text-[10px] text-stone-500 mt-1">Type a time here to set/update it on EVERY item in your paste (even existing ones). Leave empty to keep each item's current time. A per-line &quot;Name | Category | Price | PrepTime | Description&quot; value wins for that item.</p>
                </div>
              </div>

              <textarea
                id="bulk-menu-text"
                rows={5}
                placeholder="Chicken Shawarma | shawarma | 285 | 10 min | Char-grilled chicken, garlic sauce & pickles in saj bread&#10;Crispy Fried Chicken (2 pcs) | chicken | 380 | 15-20 min | Juicy inside, light & crispy outside&#10;Soft Drink | drinks | 70 | 2 min | Coca, Sprite or Fanta, ice cold&#10;...paste more lines..."
                className="w-full bg-black/30 border border-stone-700 rounded-xl p-3 text-xs text-stone-200 font-mono leading-relaxed"
              />
              <p className="text-[10px] text-stone-500">
                Format per line: <code className="text-[#F6C51B]">Name | Category-slug | Price | PrepTime(optional) | Description(optional)</code>. Categories: shawarma, chicken, burgers, sides, combos, family-meals, drinks, fresh-juices, specials (legacy cafe slugs still route). Same name → updates the item (re-category, re-price, new prep time) instead of duplicating.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-serif font-bold text-white">Menu Manager</h2>
                <p className="text-xs text-stone-400">Add/edit dishes, ETB prices, photos from device, In/Out of stock.</p>
              </div>
              <button
                onClick={() =>
                  setEditingItem({
                    id: undefined,
                    name: "",
                    category: "chicken",
                    price: 285,
                    description: "",
                    imageUrl: "/images/menu/fried-hero.jpg",
                    isPopular: false,
                    isAvailable: true,
                    isBuna: false,
                    stationOverride: null,
                    dietaryTags: "",
                    prepTime: "10 min",
                    badge: "",
                  })
                }
                className="bg-[#F6C51B] hover:bg-yellow-400 text-[#1B1B20] font-bold text-xs uppercase px-5 py-3 rounded-2xl flex items-center gap-2 shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Add Dish</span>
              </button>
            </div>

            <div className="bg-[#1B1B20] rounded-3xl border border-[#F6C51B]/30 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#2A2A31] text-yellow-200 uppercase font-bold text-[10px] tracking-wider">
                    <tr>
                      <th className="p-4">Dish & Photo</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price (ETB)</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800">
                    {menuItems.map((item) => (
                      <tr key={item.id} className="hover:bg-stone-900/40">
                        <td className="p-4 flex items-center gap-3">
                          <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-xl object-cover shrink-0 border border-yellow-500/30" />
                          <div>
                            <p className="font-bold text-white text-sm flex items-center gap-2 flex-wrap">
                              {item.name}
                              {item.isBuna && (
                                <span className="text-[9px] font-black uppercase bg-lime-900/40 text-lime-300 border border-lime-700/60 rounded px-1.5 py-0.5">
                                  🥤 Juice &amp; Drinks
                                </span>
                              )}
                              {(item.stationOverride === "barista" || item.stationOverride === "juice") && (
                                <span className="text-[9px] font-black uppercase bg-lime-900/40 text-lime-300 border border-lime-700/60 rounded px-1.5 py-0.5">
                                  🥤 Juice &amp; Drinks
                                </span>
                              )}
                              {item.stationOverride === "kitchen" && (
                                <span className="text-[9px] font-black uppercase bg-emerald-900/40 text-emerald-300 border border-emerald-700/60 rounded px-1.5 py-0.5">
                                  🍗 Kitchen
                                </span>
                              )}

                            </p>
                            <p className="text-[11px] text-stone-400 line-clamp-1 max-w-xs">{item.description}</p>
                          </div>
                        </td>
                        <td className="p-4 font-semibold text-stone-300 capitalize">{item.category.replace("-", " ")}</td>
                        <td className="p-4 font-serif font-black text-[#F6C51B] text-sm">{item.price} ETB</td>
                        <td className="p-4">
                          {item.isAvailable ? (
                            <span className="text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded text-[10px] font-bold border border-emerald-800">In Stock</span>
                          ) : (
                            <span className="text-rose-400 bg-rose-950/60 px-2.5 py-1 rounded text-[10px] font-bold border border-rose-800">Out of Stock</span>
                          )}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button onClick={() => setEditingItem(item)} className="p-2 bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500 hover:text-black rounded-lg transition" title="Edit">
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDeleteMenuItem(item.id)} className="p-2 bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white rounded-lg transition" title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* GALLERY MANAGER */}
        {activeTab === "gallery" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-serif font-bold text-white">Gallery Manager</h2>
                <p className="text-xs text-stone-400">Upload real Amrogn kitchen &amp; chicken photos from your device.</p>
              </div>
              <button
                onClick={() => setEditingGallery({ title: "", category: "Interior", imageUrl: "", caption: "" })}
                className="bg-[#F6C51B] hover:bg-yellow-400 text-[#1B1B20] font-bold text-xs uppercase px-5 py-3 rounded-2xl flex items-center gap-2 shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Add Photo</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryItems.map((gal) => (
                <div key={gal.id} className="bg-[#1B1B20] rounded-3xl overflow-hidden border border-[#F6C51B]/30 shadow-xl flex flex-col justify-between">
                  <div className="relative h-48 bg-stone-900">
                    <img src={gal.imageUrl} alt={gal.title} className="w-full h-full object-cover" />
                    <span className="absolute top-3 left-3 bg-black/70 text-[#F6C51B] text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border border-[#F6C51B]/40">
                      {gal.category}
                    </span>
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-serif font-bold text-white text-sm">{gal.title}</h3>
                    {gal.caption && <p className="text-stone-400 text-xs line-clamp-2">{gal.caption}</p>}
                  </div>
                  <div className="p-4 pt-0 flex justify-end gap-2">
                    <button onClick={() => setEditingGallery(gal)} className="p-2 bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500 hover:text-black rounded-lg text-xs font-bold transition flex items-center gap-1">
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button onClick={() => handleDeleteGalleryItem(gal.id)} className="p-2 bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white rounded-lg text-xs font-bold transition flex items-center gap-1">
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REVIEWS MODERATION */}
        {activeTab === "reviews" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-serif font-bold text-white">Reviews Moderation</h2>
              <p className="text-xs text-stone-400">New reviews are hidden until you approve them. Approve = publicly visible.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="bg-[#1B1B20] p-5 rounded-3xl border border-[#F6C51B]/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">{rev.customerName}</h4>
                      <p className="text-[10px] text-stone-400">{rev.reviewDate}</p>
                    </div>
                    <div className="text-[#F6C51B] font-bold">★ {rev.rating}/5</div>
                  </div>
                  <p className="text-xs text-stone-300 italic">"{rev.reviewText}"</p>
                  <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-xs">
                    <span className={rev.isApproved ? "text-emerald-400" : "text-yellow-400"}>
                      {rev.isApproved ? "✓ Publicly visible" : "⏳ Pending approval"}
                    </span>
                    <div className="flex gap-3">
                      {!rev.isApproved && (
                        <button
                          onClick={async () => {
                            await fetch("/api/reviews", {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ id: rev.id, isApproved: true, customerName: rev.customerName, rating: rev.rating, reviewText: rev.reviewText }),
                            });
                            onRefreshData();
                          }}
                          className="text-emerald-400 hover:underline text-[11px] font-bold"
                        >
                          Approve
                        </button>
                      )}
                      <button
                        onClick={async () => {
                          await fetch(`/api/reviews?id=${rev.id}`, { method: "DELETE" });
                          onRefreshData();
                        }}
                        className="text-rose-400 hover:underline text-[11px]"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECURITY */}
        {activeTab === "security" && (
          <div className="bg-[#1B1B20] p-6 sm:p-8 rounded-3xl border border-[#F6C51B]/30 max-w-lg mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-serif font-bold text-white">Update Owner Password</h2>
              <p className="text-xs text-stone-400">Master password that protects this dashboard.</p>
            </div>
            {passwordMsg && <div className="bg-neutral-800/60 border border-yellow-500 text-yellow-200 text-xs p-3 rounded-xl">{passwordMsg}</div>}
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-yellow-200 mb-1">New Admin Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new admin password"
                    className="w-full bg-[#2A2A31] border border-stone-700 rounded-xl p-3 text-xs text-white pr-10"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" className="w-full bg-[#F6C51B] text-[#1B1B20] font-black text-xs uppercase tracking-wider py-3.5 rounded-xl hover:bg-yellow-400 transition">
                Update Master Password
              </button>
            </form>
          </div>
        )}
      </div>

      {/* EDIT MENU MODAL */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#1B1B20] rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 border border-[#F6C51B] shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-serif font-bold text-lg text-white">{editingItem.id ? "Edit Dish" : "Add New Dish"}</h3>
              <button onClick={() => setEditingItem(null)} className="text-stone-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveMenuItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-yellow-200 mb-1">Name *</label>
                <input type="text" required value={editingItem.name || ""} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} placeholder="e.g. Chicken Shawarma" className="w-full bg-[#2A2A31] border border-stone-700 rounded-xl p-2.5 text-xs text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-yellow-200 mb-1">Category *</label>
                  <select value={editingItem.category || "chicken"} onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })} className="w-full bg-[#2A2A31] border border-stone-700 rounded-xl p-2.5 text-xs text-white">
                    {categories.filter((c) => c.slug !== "all").map((c) => (
                      <option key={c.slug} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-yellow-200 mb-1">Price (ETB) *</label>
                  <input type="number" required value={editingItem.price || 0} onChange={(e) => setEditingItem({ ...editingItem, price: Number(e.target.value) })} className="w-full bg-[#2A2A31] border border-stone-700 rounded-xl p-2.5 text-xs text-white font-bold" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-yellow-200 mb-1">Description *</label>
                <textarea rows={2} required value={editingItem.description || ""} onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })} placeholder="Taste, ingredients..." className="w-full bg-[#2A2A31] border border-stone-700 rounded-xl p-2.5 text-xs text-white" />
              </div>

              {/* Photo */}
              <div className="bg-[#2A2A31] p-4 rounded-2xl border border-[#F6C51B]/30 space-y-3">
                <label className="text-xs font-bold text-yellow-200 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-[#F6C51B]" /> Food Photo
                </label>
                {editingItem.imageUrl && (
                  <div className="relative h-32 w-full rounded-xl overflow-hidden border border-stone-700 bg-stone-900">
                    <img src={editingItem.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <label className="flex items-center justify-center gap-2 w-full bg-[#F6C51B] hover:bg-yellow-400 text-[#1B1B20] font-extrabold text-xs py-2.5 px-4 rounded-xl cursor-pointer shadow transition">
                  <Upload className="w-4 h-4" />
                  <span>Upload Photo From Device</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) toBase64(f, (d) => setEditingItem((prev) => ({ ...prev, imageUrl: d }))); }} />
                </label>
                <input type="text" value={editingItem.imageUrl || ""} onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })} placeholder="...or paste image URL" className="w-full bg-[#1B1B20] border border-stone-700 rounded-xl p-2 text-xs text-stone-200" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-yellow-200 mb-1">Badge (optional)</label>
                  <input type="text" value={editingItem.badge || ""} onChange={(e) => setEditingItem({ ...editingItem, badge: e.target.value })} placeholder="e.g. Best Seller" className="w-full bg-[#2A2A31] border border-stone-700 rounded-xl p-2.5 text-xs text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-yellow-200 mb-1">Prep Time (optional)</label>
                  <input type="text" value={editingItem.prepTime || "10 min"} onChange={(e) => setEditingItem({ ...editingItem, prepTime: e.target.value })} className="w-full bg-[#2A2A31] border border-stone-700 rounded-xl p-2.5 text-xs text-white" />
                </div>
              </div>

              {/* SCHEDULED SALE PRICE — automatically applies between dates, auto-reverts after */}
              <div className="bg-[#2A2A31] p-4 rounded-2xl border border-emerald-700/40 space-y-3">
                <p className="text-xs font-bold text-emerald-300">🏷 Auto Sale Price (optional)</p>
                <p className="text-[10px] text-stone-400">Sets a SALE price between the start & end dates. After the end date, the normal price returns automatically.</p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-emerald-200 mb-1">Sale Price (ETB)</label>
                    <input
                      type="number"
                      value={editingItem.salePrice ?? ""}
                      onChange={(e) => setEditingItem({ ...editingItem, salePrice: e.target.value ? Number(e.target.value) : null })}
                      placeholder="e.g. 180"
                      className="w-full bg-[#1B1B20] border border-stone-700 rounded-xl p-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-emerald-200 mb-1">Start</label>
                    <input
                      type="date"
                      value={editingItem.saleStart || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, saleStart: e.target.value })}
                      className="w-full bg-[#1B1B20] border border-stone-700 rounded-xl p-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-emerald-200 mb-1">End</label>
                    <input
                      type="date"
                      value={editingItem.saleEnd || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, saleEnd: e.target.value })}
                      className="w-full bg-[#1B1B20] border border-stone-700 rounded-xl p-2 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-white cursor-pointer">
                  <input type="checkbox" checked={editingItem.isAvailable ?? true} onChange={(e) => setEditingItem({ ...editingItem, isAvailable: e.target.checked })} className="w-4 h-4 accent-[#F6C51B]" />
                  <span>In Stock</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-white cursor-pointer">
                  <input type="checkbox" checked={editingItem.isPopular ?? false} onChange={(e) => setEditingItem({ ...editingItem, isPopular: e.target.checked })} className="w-4 h-4 accent-[#F6C51B]" />
                  <span>Popular Highlights</span>
                </label>
              </div>

              {/* WHO PREPARES IT — the per-item station switch. "Automatic" follows
                  the category routing from the Stations tab; the other three point
                  this ONE item at a specific crew, whatever its category says. */}
              <div className="bg-[#2A2A31] p-4 rounded-2xl border border-[#F6C51B]/30 space-y-2">
                <label className="block text-xs font-bold text-yellow-200">👨‍🍳 Prepared by (which crew makes it)</label>
                <select
                  value={editingItem.isBuna ? "buna" : editingItem.stationOverride || "auto"}
                  onChange={(e) => {
                    const v = e.target.value;
                    setEditingItem({
                      ...editingItem,
                      // "buna" keeps using the per-item isBuna flag; the three
                      // other crews use the station override; "auto" clears both.
                      isBuna: v === "buna",
                      stationOverride: v === "barista" || v === "kitchen" || v === "juice" ? v : null,
                    });
                  }}
                  className="w-full bg-[#1B1B20] border border-stone-700 rounded-xl p-2.5 text-xs text-white"
                >
                  <option value="auto">Automatic (follow the category, Stations tab)</option>
                  <option value="kitchen">🍗 Amrogn Kitchen (chicken, shawarma, burgers, sides, take away...)</option>
                  <option value="juice">🥤 Juice &amp; Cold Drinks (juices, spris, soft drinks, cold beverages...)</option>
                </select>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  Almost everything follows the category automatically. Use this only when a single item breaks the
                  rule: a bottled drink stored with the food still goes to{" "}
                  <strong className="text-yellow-200">Juice &amp; Cold Drinks</strong>, whatever the category routing says.
                </p>
              </div>

              <button type="submit" disabled={isMenuSubmitting} className="w-full bg-gradient-to-r from-[#F6C51B] to-[#D9A409] text-[#1B1B20] font-black text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-xl transition mt-4">
                {isMenuSubmitting ? "Saving..." : "Save Dish"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT GALLERY MODAL */}
      {editingGallery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#1B1B20] rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 border border-[#F6C51B] shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-serif font-bold text-lg text-white">{editingGallery.id ? "Edit Gallery Photo" : "Add Gallery Photo"}</h3>
              <button onClick={() => setEditingGallery(null)} className="text-stone-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSaveGalleryItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-yellow-200 mb-1">Photo Title *</label>
                <input type="text" required value={editingGallery.title || ""} onChange={(e) => setEditingGallery({ ...editingGallery, title: e.target.value })} placeholder="e.g. Shawarma on the grill at 4 Kilo" className="w-full bg-[#2A2A31] border border-stone-700 rounded-xl p-2.5 text-xs text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-yellow-200 mb-1">Category</label>
                <select value={editingGallery.category || "Interior"} onChange={(e) => setEditingGallery({ ...editingGallery, category: e.target.value })} className="w-full bg-[#2A2A31] border border-stone-700 rounded-xl p-2.5 text-xs text-white">
                  {["Shawarma", "Fried", "Grilled", "Mofo", "Burgers", "Interior", "Vibe"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="bg-[#2A2A31] p-4 rounded-2xl border border-[#F6C51B]/30 space-y-3">
                <label className="text-xs font-bold text-yellow-200 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-[#F6C51B]" /> Photo *
                </label>
                {editingGallery.imageUrl && (
                  <div className="relative h-36 w-full rounded-xl overflow-hidden border border-stone-700 bg-stone-900">
                    <img src={editingGallery.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <label className="flex items-center justify-center gap-2 w-full bg-[#F6C51B] hover:bg-yellow-400 text-[#1B1B20] font-extrabold text-xs py-2.5 px-4 rounded-xl cursor-pointer shadow transition">
                  <Upload className="w-4 h-4" />
                  <span>Upload From Device</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) toBase64(f, (d) => setEditingGallery((prev) => ({ ...prev, imageUrl: d }))); }} />
                </label>
                <input type="text" value={editingGallery.imageUrl || ""} onChange={(e) => setEditingGallery({ ...editingGallery, imageUrl: e.target.value })} placeholder="...or paste photo URL" className="w-full bg-[#1B1B20] border border-stone-700 rounded-xl p-2 text-xs text-stone-200" />
              </div>
              <div>
                <label className="block text-xs font-bold text-yellow-200 mb-1">Caption</label>
                <input type="text" value={editingGallery.caption || ""} onChange={(e) => setEditingGallery({ ...editingGallery, caption: e.target.value })} placeholder="Short description" className="w-full bg-[#2A2A31] border border-stone-700 rounded-xl p-2.5 text-xs text-white" />
              </div>
              <button type="submit" disabled={isGallerySubmitting} className="w-full bg-gradient-to-r from-[#F6C51B] to-[#D9A409] text-[#1B1B20] font-black text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-xl transition mt-4">
                {isGallerySubmitting ? "Saving..." : "Save Photo"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
