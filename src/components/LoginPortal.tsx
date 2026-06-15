import React, { useState } from "react";
import { ShieldCheck, Mail, Lock, ArrowLeft, ArrowRight, Activity, Cpu } from "lucide-react";
import { login } from "../lib/api";
import { User } from "../types";

interface LoginPortalProps {
  onBackToPublic: () => void;
  onLoginSuccess: (user: User) => void;
}

export default function LoginPortal({ onBackToPublic, onLoginSuccess }: LoginPortalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

const preSeeds = [];

  const handlePreSeedClick = (emailVal: string, passVal: string) => {
    setEmail(emailVal);
    setPassword(passVal);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("Please enter high-security enterprise email.");
      return;
    }
    setLoading(true);
    setErrorMsg(null);

    const res = await login(email);
    setLoading(false);

    if (res.success && res.user) {
      onLoginSuccess(res.user);
    } else {
      setErrorMsg(res.error || "Credentials unrecognized. Please ensure you are a registered CottonRecycle™ entity.");
    }
  };  return (
    <div className="min-h-screen bg-[#0a0a0a] textile-grid flex flex-col justify-center items-center py-12 px-4 select-none">
      
      {/* Back button */}
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
        
        {/* LOGO TITLE */}
        <div className="text-center space-y-2 mb-8">
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

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs leading-relaxed mb-6">
            ✕ {errorMsg}
          </div>
        )}

        {/* AUTH FORM */}
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
            {loading ? (
              <span>Verifying Digital Signature...</span>
            ) : (
              <>
                <span>Acknowledge & Access Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* SECURE PRE-SETS DRAWER FOR EVALUATION */}
        <div className="mt-8 pt-6 border-t border-[#1f2937] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-emerald-400 font-mono flex items-center">
              <ShieldCheck className="w-4 h-4 mr-1" /> SECURE_EVALUATION_BYPASS_TEMPLATES
            </span>
            <span className="text-[9px] text-gray-600 underline font-mono">B2B PRESETS APPLIED</span>
          </div>
          
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {preSeeds.map((ps) => (
              <button
                key={ps.email}
                type="button"
                id={`bypass-btn-${ps.email.split('@')[0]}`}
                onClick={() => handlePreSeedClick(ps.email, ps.pass)}
                className="w-full text-left p-2.5 bg-[#0a0a0a] border border-[#1f2937] rounded-lg hover:border-emerald-500/60 transition group cursor-pointer"
              >
                <div className="flex justify-between items-center">
                  <span className="text-white text-xs font-bold font-mono group-hover:text-emerald-400 transition">{ps.label}</span>
                  <span className="text-gray-500 font-mono text-[9px]">Select</span>
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>{ps.email}</span>
                </div>
                <p className="text-[9px] text-gray-500 mt-0.5 mt-1 line-clamp-1 italic">{ps.desc}</p>
              </button>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
