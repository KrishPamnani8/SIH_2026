import React from 'react';
import { Sun, Moon, ShieldCheck, Activity, Satellite, LogOut, User } from 'lucide-react';
import type { ThemeMode } from '../types/satquery';

interface NavbarProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenTraceModal: () => void;
  latencyMs?: number;
  userEmail?: string;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  onToggleTheme,
  onOpenTraceModal,
  latencyMs = 418,
  userEmail = 'analyst@isro.gov.in',
  onLogout,
}) => {
  const isDark = theme === 'dark';

  return (
    <header
      className="sticky top-0 z-40 w-full border-b backdrop-blur-md transition-colors duration-300 shadow-sm"
      style={{
        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.95)',
        borderColor: isDark ? '#334155' : '#cbd5e1',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-sky-500/20 flex items-center justify-center">
            <div className={`w-full h-full rounded-[10px] flex items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-slate-950'}`}>
              <Satellite className="w-5 h-5 text-sky-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className={`font-bold text-lg tracking-tight bg-gradient-to-r ${isDark ? 'from-sky-400 via-emerald-400 to-amber-400' : 'from-sky-600 via-emerald-600 to-amber-600'} bg-clip-text text-transparent`}>
                SatQuery AI
              </h1>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-emerald-100 text-emerald-700 border-emerald-300'
              }`}>
                ISRO / SAC Prototype
              </span>
            </div>
            <p className={`text-xs hidden sm:block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Agentic Vision-Language Assistant for Remote Sensing & Satellite Analysis
            </p>
          </div>
        </div>

        {/* Quick Metrics, User Badge & Actions */}
        <div className="flex items-center space-x-2.5">
          {/* Latency badge */}
          <div className={`hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-medium border ${
            isDark ? 'bg-slate-800/80 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-700'
          }`}>
            <Activity className={`w-3.5 h-3.5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <span>Latency: <strong className={isDark ? 'text-emerald-400' : 'text-emerald-700'}>{latencyMs} ms</strong></span>
          </div>

          {/* Observable Execution Trace Trigger */}
          <button
            onClick={onOpenTraceModal}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 shadow-sm active:scale-95 cursor-pointer ${
              isDark
                ? 'bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border-sky-500/30 shadow-sky-500/10'
                : 'bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-300'
            }`}
          >
            <ShieldCheck className={`w-4 h-4 ${isDark ? 'text-sky-400' : 'text-sky-600'}`} />
            <span className="hidden sm:inline">Observable Trace</span>
          </button>

          {/* User Profile Badge */}
          <div className={`hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs border ${
            isDark ? 'bg-slate-800/50 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-700'
          }`}>
            <User className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-semibold truncate max-w-[120px]">{userEmail}</span>
          </div>

          {/* Log Out Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              title="Log Out"
              className={`p-2 rounded-lg border transition-all duration-200 cursor-pointer ${
                isDark
                  ? 'bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-400 border-slate-700 text-slate-300'
                  : 'bg-slate-100 hover:bg-rose-50 hover:text-rose-600 border-slate-300 text-slate-700 shadow-sm'
              }`}
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}

          {/* Theme Toggle (Dark / Light) */}
          <button
            onClick={onToggleTheme}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            className={`p-2 rounded-lg border transition-all duration-200 active:scale-95 cursor-pointer ${
              isDark
                ? 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700 hover:text-slate-900 shadow-sm'
            }`}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-sky-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
