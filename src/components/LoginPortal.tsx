import React, { useState } from "react";
import { ShieldCheck, Mail, Lock, ArrowLeft, ArrowRight, Building, UserPlus } from "lucide-react";
import { login } from "../lib/api";
import { User, UserRole } from "../types";

interface LoginPortalProps {
  onBackToPublic: () => void;
  onLoginSuccess: (user: User) => void;
}

type AuthMode = "login" | "register";

type RegistrationForm = {
  name: string;
  company: string;
  email: string;
  password: string;
  role: Exclude<UserRole, "ADMIN">;
};

export default function LoginPortal({ onBackToPublic, onLoginSuccess }: LoginPortalProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [registration, setRegistration] = useState<RegistrationForm>({
    name: "",
    company: "",
    email: "",
    password: "",
    role: "INVESTOR",
  });

  const resetMessages = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("Please enter high-security enterprise email.");
      return;
    }
    setLoading(true);
    resetMessages();

    const res = await login(email);
    setLoading(false);

    if (res.success && res.user) {
      onLoginSuccess(res.user);
    } else {
      setErrorMsg(res.error || "Credentials unrecognized. Please ensure you are a registered CottonRecycle™ entity.");
    }
  };

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!registration.name || !registration.company || !registration.email || !registration.password) {
      setErrorMsg("Complete all registration fields before submitting access request.");
      return;
    }

    if (registration.password.length < 8) {
      setErrorMsg("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "REGISTRATION",
          name: registration.name,
          company: registration.company,
          email: registration.email,
          message: `New portal registration request for role ${registration.role}`,
          payload: {
            requestedRole: registration.role,
            passwordLength: registration.password.length,
            source: "CottonRecycle portal registration",
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Registration request failed");
      }

      setSuccessMsg("Registration request received. Admin approval is required before portal access is activated.");
      setRegistration({ name: "", company: "", email: "", password: "", role: "INVESTOR" });
    } catch (error) {
      setErrorMsg("Registration failed. Please try again or contact info@cottonrecycle.com.");
    } finally {
      setLoading(false);
    }
  };

  const updateRegistration = (field: keyof RegistrationForm, value: string) => {
    setRegistration((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] textile-grid flex flex-col justify-center items-center py-12 px-4 select-none">
      <div className="absolute top-6 left-6">
        <button 
          onClick={onBackToPublic}
          className="px-4 py-2 bg-gray-950 border border-[#1f2937] hover:border-gray-700 text-gray-300 hover:text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to Public Site</span>
        </button>
      </div>

      <div className="max-w-md w-full bg-[#111827] border border-[#1f2937] rounded-2xl p-6 md:p-8 emerald-glow">
        <div className="text-center space-y-2 mb-6">
          <div className="bg-emerald-500 text-black px-3 py-1 rounded inline-block font-mono tracking-tighter text-sm font-bold">
            CR PORTAL
          </div>
          <h2 className="font-display font-extrabold text-2xl md:text-3xl text-white tracking-tight">
            CottonRecycle<span className="text-emerald-500">™</span>
          </h2>
          <p className="text-gray-500 text-xs">
            MECHANIZED B2B CIRCULAR ECONOMY PLATFORM
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-6 bg-[#0a0a0a] border border-[#1f2937] rounded-xl p-1">
          <button
            type="button"
            onClick={() => { setMode("login"); resetMessages(); }}
            className={`py-2 rounded-lg text-xs font-bold transition ${mode === "login" ? "bg-emerald-500 text-black" : "text-gray-400 hover:text-white"}`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => { setMode("register"); resetMessages(); }}
            className={`py-2 rounded-lg text-xs font-bold transition ${mode === "register" ? "bg-emerald-500 text-black" : "text-gray-400 hover:text-white"}`}
          >
            Register
          </button>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs leading-relaxed mb-6">
            ✕ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-lg text-xs leading-relaxed mb-6">
            ✓ {successMsg}
          </div>
        )}

        {mode === "login" ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block">Enterprise Account Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-600 absolute left-3 top-3.5" />
                <input 
                  id="portal-email-input"
                  type="email" 
                  placeholder="e.g. email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#374151] rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-500 text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono text-gray-400">
                <span className="uppercase tracking-wider">Access Token / Password</span>
                <span className="text-gray-600 hover:text-emerald-400 cursor-pointer transition">FORGOT CREDENTIALS?</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-600 absolute left-3 top-3.5" />
                <input 
                  id="portal-password-input"
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#374151] rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-500 text-white"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center space-x-2 text-gray-400 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={rememberMe} 
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="accent-emerald-500" 
                />
                <span>Remember secure session token</span>
              </label>
            </div>

            <button 
              id="portal-login-submit-btn"
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm rounded-xl transition flex items-center justify-center space-x-1.5 emerald-glow-strong cursor-pointer disabled:opacity-50"
            >
              {loading ? <span>Verifying Digital Signature...</span> : <><span>Acknowledge & Access Portal</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegistrationSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block">Full Name</label>
              <div className="relative">
                <UserPlus className="w-4 h-4 text-gray-600 absolute left-3 top-3.5" />
                <input
                  type="text"
                  value={registration.name}
                  onChange={(e) => updateRegistration("name", e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#374151] rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-500 text-white"
                  placeholder="Raymond Schilperoort"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block">Company</label>
              <div className="relative">
                <Building className="w-4 h-4 text-gray-600 absolute left-3 top-3.5" />
                <input
                  type="text"
                  value={registration.company}
                  onChange={(e) => updateRegistration("company", e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#374151] rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-500 text-white"
                  placeholder="Company name"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block">Business Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-600 absolute left-3 top-3.5" />
                <input
                  type="email"
                  value={registration.email}
                  onChange={(e) => updateRegistration("email", e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#374151] rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-500 text-white"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block">Role</label>
                <select
                  value={registration.role}
                  onChange={(e) => updateRegistration("role", e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#374151] rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-emerald-500 text-white"
                >
                  <option value="INVESTOR">Investor</option>
                  <option value="SUPPLIER">Supplier</option>
                  <option value="BUYER">Buyer</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-600 absolute left-3 top-3.5" />
                  <input
                    type="password"
                    value={registration.password}
                    onChange={(e) => updateRegistration("password", e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-[#374151] rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-500 text-white"
                    placeholder="8+ chars"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm rounded-xl transition flex items-center justify-center space-x-1.5 emerald-glow-strong cursor-pointer disabled:opacity-50"
            >
              {loading ? <span>Submitting Registration...</span> : <><span>Request Portal Access</span><ArrowRight className="w-4 h-4" /></>}
            </button>

            <p className="text-[10px] text-gray-500 leading-relaxed">
              New accounts are routed into Incoming Leads as registration requests. Admin approval keeps the portal clean and prevents random access.
            </p>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-[#1f2937] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-emerald-400 font-mono flex items-center">
              <ShieldCheck className="w-4 h-4 mr-1" /> SECURE_PORTAL_ACCESS
            </span>
            <span className="text-[9px] text-gray-600 underline font-mono">B2B VERIFIED</span>
          </div>
          <p className="text-[10px] text-gray-500 leading-relaxed">
            Approved partners, investors and suppliers can access the CottonRecycle™ dashboard after verification.
          </p>
        </div>
      </div>
    </div>
  );
}
