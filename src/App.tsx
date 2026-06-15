import React, { useState, useEffect } from "react";
import { User } from "./types";
import { getMe, logout } from "./lib/api";
import PublicWebsite from "./components/PublicWebsite";
import LoginPortal from "./components/LoginPortal";
import DashboardPortal from "./components/DashboardPortal";
import { CheckCircle, ShieldAlert } from "lucide-react";

export default function App() {
  const [currentView, setCurrentView] = useState<"public" | "login" | "dashboard">("public");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  
  // High-fidelity flash notification toast
  const [notifyMsg, setNotifyMsg] = useState<string | null>(null);
  const [notifyTimer, setNotifyTimer] = useState<NodeJS.Timeout | null>(null);

  const triggerNotification = (msg: string) => {
    if (notifyTimer) clearTimeout(notifyTimer);
    setNotifyMsg(msg);
    const tm = setTimeout(() => {
      setNotifyMsg(null);
    }, 6000);
    setNotifyTimer(tm);
  };

  // Check active session token on startup
  useEffect(() => {
    const resumeSession = async () => {
      try {
        const user = await getMe();
        if (user) {
          setCurrentUser(user);
          setCurrentView("dashboard");
          triggerNotification(`Sourcing session verified. Connected to role: ${user.role} (${user.company})`);
        }
      } catch (err) {
        console.error("Session resume exception", err);
      } finally {
        setLoadingSession(false);
      }
    };
    resumeSession();
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setCurrentView("dashboard");
    triggerNotification(`Security handshake acknowledged. Welcome back, ${user.name}.`);
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    setCurrentView("public");
    triggerNotification("Secure session closed. Decoupled from CottonRecycle™ microgrid.");
  };

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col justify-center items-center">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <span className="absolute inset-0 m-auto w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
        </div>
        <p className="mt-4 text-xs font-mono text-emerald-400 uppercase tracking-widest animate-pulse">
          Validating Security Tokens...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-100 flex flex-col relative selection:bg-emerald-500 selection:text-black">
      
      {/* PERSISTENT HEADER BAR ON TOP (FOR QUICK NAV TO LOGOUT / LOGIN STATES) */}
      {currentView !== "login" && (
        <header className="bg-black/90 border-b border-gray-800 py-3 px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
          <div 
            onClick={() => setCurrentView("public")}
            className="flex items-center space-x-2 cursor-pointer select-none"
          >
            <div className="w-6 h-6 rounded bg-emerald-500 text-black flex items-center justify-center font-bold text-xs font-mono">
              C
            </div>
            <span className="font-display font-extrabold text-sm text-white tracking-widest">
              CottonRecycle<span className="text-emerald-500 font-semibold">™</span>
            </span>
          </div>

          <div className="flex items-center space-x-3.5">
            {currentUser ? (
              <div className="flex items-center space-x-3">
                <span className="text-[10px] font-mono text-gray-500 hidden sm:inline">
                  SECURE DUPLEX CHANNEL STABLE
                </span>
                <button
                  onClick={() => setCurrentView("dashboard")}
                  id="header-portal-btn"
                  className="px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 rounded text-xs font-semibold select-none transition cursor-pointer"
                >
                  My Sourcing Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  id="header-logout-btn"
                  className="px-3 py-1.5 bg-gray-900 hover:bg-red-500/10 text-gray-400 hover:text-red-400 rounded text-xs font-semibold select-none transition cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCurrentView("login")}
                id="header-login-btn"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg text-xs font-bold tracking-tight select-none transition cursor-pointer flex items-center"
              >
                <span>Access Secure Portal</span>
              </button>
            )}
          </div>
        </header>
      )}

      {/* CORE VIEW MULTIPLEXER */}
      <div className="flex-1">
        {currentView === "public" && (
          <PublicWebsite 
            onLoginClick={() => setCurrentView("login")} 
            onSupplierRegisterSuccess={(msg) => triggerNotification(msg)}
            onBuyerRegisterSuccess={(msg) => triggerNotification(msg)}
          />
        )}
        
        {currentView === "login" && (
          <LoginPortal 
            onBackToPublic={() => setCurrentView("public")} 
            onLoginSuccess={handleLoginSuccess}
          />
        )}
        
        {currentView === "dashboard" && currentUser && (
          <DashboardPortal 
            user={currentUser} 
            onLogout={handleLogout} 
            onShowNotification={triggerNotification}
          />
        )}
      </div>

      {/* SECURE ENTERPRISE ALERT HUD (FLOAT MESSAGE TOAST) */}
      {notifyMsg && (
        <div 
          id="global-alert-hud" 
          className="fixed bottom-6 right-6 z-50 max-w-sm bg-[#111827] border border-[#1f2937] border-l-2 border-l-emerald-500 rounded-xl p-4 shadow-2xl animate-bounce flex items-start space-x-3 text-xs leading-relaxed"
        >
          <div className="p-1 bg-emerald-500/10 rounded-lg text-emerald-400 mt-0.5">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div>
            <span className="font-mono text-[10px] text-emerald-400 block font-semibold uppercase tracking-wider">COTTONRECYCLE SYSTEM LOG MESSAGE</span>
            <p className="text-gray-300 mt-0.5 font-sans font-medium">{notifyMsg}</p>
          </div>
        </div>
      )}

    </div>
  );
}
