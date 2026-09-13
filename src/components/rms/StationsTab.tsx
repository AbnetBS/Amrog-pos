"use client";

import { useState, useEffect } from "react";
import { Drumstick, Citrus, Save, CheckCircle2 } from "lucide-react";
import { DEFAULT_CATEGORY_ROUTING } from "@/lib/initial-data";

// Engine lane keys stay three-way (legacy branches still use "barista");
// Amrogn 4 Kilo only ever assigns KITCHEN or JUICE — the juice tablet is the
// single Juice & Cold Drinks crew, so every beverage category lands there.
type Station = "barista" | "kitchen" | "juice";

export default function StationsTab() {
  const [categories, setCategories] = useState<Array<{ id: number; name: string; slug: string }>>([]);
  const [routing, setRouting] = useState<Record<string, Station>>(DEFAULT_CATEGORY_ROUTING);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  const load = async () => {
    const [cRes, sRes] = await Promise.all([fetch("/api/categories"), fetch("/api/settings")]);
    if (cRes.ok) {
      const all = await cRes.json();
      setCategories(all.filter((c: any) => c.slug !== "all"));
    }
    if (sRes.ok) {
      const s = await sRes.json();
      if (s.category_routing) {
        try {
          const saved: Record<string, Station> = JSON.parse(s.category_routing);
          // One beverage crew: any old "barista" assignment shows as Juice.
          for (const [slug, station] of Object.entries(saved)) {
            if (station === "barista") saved[slug] = "juice";
          }
          setRouting((prev) => ({ ...prev, ...saved }));
        } catch {}
      }
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    setSaving(true);
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category_routing: JSON.stringify(routing) }),
    });
    setSaving(false);
    if (res.ok) {
      setSavedMsg("✓ Station routing saved • all new orders will split correctly between kitchen and drinks.");
      setTimeout(() => setSavedMsg(""), 3500);
    } else alert("Failed to save routing.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-serif font-bold text-white">🍗 Stations Routing (Kitchen vs Juice &amp; Cold Drinks)</h2>
          <p className="text-xs text-stone-400">
            Choose which station each category goes to. Chicken, shawarma, burgers, combos &amp; sides go to{" "}
            <strong className="text-emerald-200">Amrogn Kitchen</strong>; soft drinks, cold beverages and fresh juices all go to the{" "}
            <strong className="text-lime-200">Juice &amp; Cold Drinks</strong> station.
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="bg-[#F6C51B] hover:bg-yellow-400 text-[#1B1B20] font-black text-xs uppercase px-5 py-3 rounded-xl flex items-center gap-2 disabled:opacity-40"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Routing"}
        </button>
      </div>

      {savedMsg && (
        <div className="bg-emerald-900/60 border border-emerald-500 text-emerald-200 text-xs p-3 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{savedMsg}</span>
        </div>
      )}

      <div className="bg-[#1B1B20] rounded-2xl border border-[#F6C51B]/30 p-5 space-y-1">
        <div className="grid grid-cols-[1fr_auto_auto] gap-3 items-center pb-3 border-b border-stone-800 text-[10px] uppercase font-extrabold text-stone-400">
          <span>Category</span>
          <span className="flex items-center gap-1.5 text-emerald-200"><Drumstick className="w-3.5 h-3.5" /> Kitchen</span>
          <span className="flex items-center gap-1.5 text-lime-200"><Citrus className="w-3.5 h-3.5" /> Juice &amp; Drinks</span>
        </div>

        <div className="divide-y divide-stone-800">
          {categories.map((c) => (
            <div key={c.id} className="grid grid-cols-[1fr_auto_auto] gap-3 items-center py-2.5">
              <span className="text-xs font-bold text-white">{c.name}</span>
              <button
                onClick={() => setRouting({ ...routing, [c.slug]: "kitchen" })}
                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition ${
                  routing[c.slug] === "kitchen"
                    ? "bg-emerald-500 border-emerald-400"
                    : "border-stone-600 hover:border-emerald-500"
                }`}
                title={`Send "${c.name}" to Amrogn Kitchen`}
                aria-label={`Route ${c.name} to the kitchen`}
              >
                {routing[c.slug] === "kitchen" && <span className="w-3 h-3 rounded-full bg-white" />}
              </button>
              <button
                onClick={() => setRouting({ ...routing, [c.slug]: "juice" })}
                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition ${
                  routing[c.slug] === "juice" || routing[c.slug] === "barista"
                    ? "bg-lime-500 border-lime-400"
                    : "border-stone-600 hover:border-lime-500"
                }`}
                title={`Send "${c.name}" to the Juice & Cold Drinks station`}
                aria-label={`Route ${c.name} to the drinks station`}
              >
                {(routing[c.slug] === "juice" || routing[c.slug] === "barista") && <span className="w-3 h-3 rounded-full bg-white" />}
              </button>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="py-6 text-center text-xs text-stone-500">No categories yet. Add them under the Menu tab.</p>
          )}
        </div>
      </div>

      <div className="bg-[#1B1B20]/70 border border-stone-800 rounded-xl p-4 text-xs text-stone-400 space-y-1.5">
        <p className="font-bold text-yellow-200">🔁 Workflow after cashier accepts an order:</p>
        <p>1. Items auto-split instantly: soft drinks, cold beverages &amp; fresh juices → <strong>Juice &amp; Cold Drinks</strong> | chicken, shawarma, burgers, combos &amp; sides → <strong>Amrogn Kitchen</strong></p>
        <p>2. The two crews see their own lane (<code className="text-[#F6C51B]">/kitchen</code> and <code className="text-[#F6C51B]">/juice</code>), press <strong>Accept</strong> to start, <strong>Done</strong> when finished.</p>
        <p>3. The cashier sees live preparation progress per table at a glance.</p>
      </div>
    </div>
  );
}
