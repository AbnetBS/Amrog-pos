"use client";

import { useState, useEffect } from "react";
import {
  X,
  UtensilsCrossed,
  Receipt,
  Drumstick,
  CupSoda,
  ShieldCheck,
  ArrowLeft,
  KeyRound,
  User,
  AlertCircle,
} from "lucide-react";

export type RoleType = "waiter" | "cashier" | "barista" | "kitchen" | "buna" | "juice" | "admin";

interface StaffAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StaffLite {
  id: number;
  name: string;
  role: string;
}

export default function StaffAuthModal({ isOpen, onClose }: StaffAuthModalProps) {
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);
  const [staffList, setStaffList] = useState<StaffLite[]>([]);
  const [selectedName, setSelectedName] = useState("");
  const [customName, setCustomName] = useState("");
  const [pin, setPin] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset internal state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedRole(null);
      setSelectedName("");
      setCustomName("");
      setPin("");
      setAdminPassword("");
      setError("");
    }
  }, [isOpen]);

  // Load public staff names when a staff role is selected
  useEffect(() => {
    if (selectedRole && selectedRole !== "admin") {
      setLoading(true);
      fetch("/api/staff?public=1")
        .then((res) => res.json())
        .then((data: StaffLite[]) => {
          if (Array.isArray(data)) {
            const filtered = data.filter((s) => s.role === selectedRole);
            setStaffList(filtered);
            if (filtered.length > 0) {
              setSelectedName(filtered[0].name);
            } else {
              setSelectedName("");
            }
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [selectedRole]);

  if (!isOpen) return null;

  const handleRoleSelect = (role: RoleType) => {
    setSelectedRole(role);
    setError("");
    setPin("");
    setAdminPassword("");
  };

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const nameToUse = (selectedName || customName).trim();
    if (!nameToUse) {
      setError("Please select or enter your name.");
      return;
    }
    if (!pin.trim()) {
      setError("Please enter your PIN.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/staff/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameToUse,
          pin: pin.trim(),
          role: selectedRole,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.staff) {
        // Store staff session so the staff app recognizes login immediately
        const storageKey = `fana_${selectedRole}`;
        sessionStorage.setItem(storageKey, JSON.stringify(data.staff));
        localStorage.setItem(`fana_alerts_${selectedRole}`, "1");
        
        // Redirect to role dashboard
        const redirectUrl = `/${selectedRole}`;
        window.location.href = redirectUrl;
      } else {
        setError(data.error || "Invalid name or PIN. Please try again.");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!adminPassword.trim()) {
      setError("Please enter the owner password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPassword.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        window.location.href = "/admin";
      } else {
        setError("Incorrect password. Access denied.");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    {
      id: "waiter" as const,
      title: "Waiter",
      description: "Floor, tables & orders",
      icon: <UtensilsCrossed className="w-6 h-6 text-yellow-300" />,
      color: "from-neutral-600/30 to-neutral-900/30 border-yellow-500/40 hover:border-yellow-400",
      badgeBg: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
    },
    {
      id: "cashier" as const,
      title: "Cashier",
      description: "Billing, printing & receipts",
      icon: <Receipt className="w-6 h-6 text-purple-300" />,
      color: "from-purple-600/30 to-purple-900/30 border-purple-500/40 hover:border-purple-400",
      badgeBg: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    },
    {
      id: "kitchen" as const,
      title: "Amrogn Kitchen",
      description: "Chicken, shawarma, burgers & sides",
      icon: <Drumstick className="w-6 h-6 text-orange-300" />,
      color: "from-orange-600/30 to-orange-900/30 border-orange-500/40 hover:border-orange-400",
      badgeBg: "bg-orange-500/20 text-orange-300 border-orange-500/40",
    },
    {
      id: "juice" as const,
      title: "Juice & Cold Drinks",
      description: "Fresh juices, spris & cold beverages",
      icon: <CupSoda className="w-6 h-6 text-lime-300" />,
      color: "from-lime-600/30 to-lime-900/30 border-lime-500/40 hover:border-lime-400",
      badgeBg: "bg-lime-500/20 text-lime-300 border-lime-500/40",
    },
    {
      id: "admin" as const,
      title: "Admin / Owner",
      description: "Management & site settings",
      icon: <ShieldCheck className="w-6 h-6 text-[#F6C51B]" />,
      color: "from-[#F6C51B]/20 to-yellow-900/30 border-[#F6C51B]/50 hover:border-[#F6C51B]",
      badgeBg: "bg-[#F6C51B]/20 text-[#F6C51B] border-[#F6C51B]/40",
    },
  ];

  const activeRoleConfig = roles.find((r) => r.id === selectedRole);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#17171B] border border-[#F6C51B]/40 rounded-3xl p-6 md:p-8 text-white shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-stone-300 hover:text-white hover:bg-white/20 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 mb-6">
          <img src="/logo.png" alt="Amrogn Chicken" className="w-14 h-14 rounded-2xl object-contain bg-white p-1 mx-auto shadow-lg" />
          <h2 className="text-xl font-serif font-black text-white uppercase tracking-wide">
            Amrogn Chicken <span className="text-[#F6C51B]">• 4 Kilo</span>
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#F6C51B]">
            Staff & Owner Portal
          </p>
          <p className="text-xs text-stone-300">
            Select your role to open your station screen
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-4 bg-rose-950/90 border border-rose-500 text-rose-200 text-xs p-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Role Selection Grid */}
        {!selectedRole && (
          <div className="space-y-3">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider text-center mb-1">
              Select Your Role
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {roles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleRoleSelect(r.id)}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border bg-gradient-to-r ${r.color} transition text-left group hover:scale-[1.02] active:scale-[0.98]`}
                >
                  <div className="p-2 rounded-xl bg-black/40 border border-white/10 shrink-0">
                    {r.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white group-hover:text-yellow-200 transition">
                      {r.title}
                    </p>
                    <p className="text-[11px] text-stone-300 truncate">
                      {r.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Selected Role Login Form */}
        {selectedRole && (
          <div className="space-y-5">
            {/* Active Role Indicator & Back Button */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <button
                type="button"
                onClick={() => setSelectedRole(null)}
                className="flex items-center gap-1.5 text-xs text-yellow-300 hover:text-white bg-white/10 px-3 py-1.5 rounded-full transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Change Role</span>
              </button>
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-extrabold uppercase ${activeRoleConfig?.badgeBg}`}
              >
                {activeRoleConfig?.icon}
                <span>{activeRoleConfig?.title}</span>
              </div>
            </div>

            {/* FORM FOR STAFF (Waiter / Cashier / Kitchen / Juice & Drinks) */}
            {selectedRole !== "admin" ? (
              <form onSubmit={handleStaffLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-yellow-200 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#F6C51B]" />
                    <span>Select Staff Member</span>
                  </label>
                  {staffList.length > 0 ? (
                    <select
                      value={selectedName}
                      onChange={(e) => setSelectedName(e.target.value)}
                      className="w-full bg-[#1B1B20] border border-stone-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#F6C51B]"
                    >
                      {staffList.map((s) => (
                        <option key={s.id} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="Enter your name..."
                      className="w-full bg-[#1B1B20] border border-stone-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#F6C51B]"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-yellow-200 mb-1 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#F6C51B]" />
                    <span>Enter 4-Digit PIN</span>
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    required
                    autoFocus
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="••••"
                    className="w-full bg-[#1B1B20] border border-stone-700 rounded-xl px-4 py-3 text-sm text-white tracking-widest focus:outline-none focus:border-[#F6C51B]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#F6C51B] to-[#D9A409] hover:from-[#F9D34A] hover:to-[#E5B110] text-[#1B1B20] font-black text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-xl transition disabled:opacity-50"
                >
                  {loading ? "Logging in..." : `Login as ${activeRoleConfig?.title}`}
                </button>
              </form>
            ) : (
              /* FORM FOR ADMIN / OWNER */
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-yellow-200 mb-1 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#F6C51B]" />
                    <span>Owner Password</span>
                  </label>
                  <input
                    type="password"
                    required
                    autoFocus
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter owner password..."
                    className="w-full bg-[#1B1B20] border border-stone-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#F6C51B]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#F6C51B] to-[#D9A409] hover:from-[#F9D34A] hover:to-[#E5B110] text-[#1B1B20] font-black text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-xl transition disabled:opacity-50"
                >
                  {loading ? "Unlocking..." : "Login To Owner Dashboard"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
