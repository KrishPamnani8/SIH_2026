import React, { useState } from 'react';
import { Satellite, ArrowRight, Shield, CheckCircle2, Lock, Sparkles, Sun, Moon } from 'lucide-react';
import type { ThemeMode } from '../types/satquery';

interface LoginPageProps {
  onLogin: (userEmail: string) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, theme, onToggleTheme }) => {
  const [email, setEmail] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStep, setAuthStep] = useState('');

  const isDark = theme === 'dark';

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsAuthenticating(true);
    setAuthStep('Validating credentials...');

    setTimeout(() => {
      setAuthStep('Initializing ISRO EO Security Tokens...');
      setTimeout(() => {
        onLogin(email);
      }, 600);
    }, 700);
  };

  const handleQuickDemoLogin = (role: string = 'Evaluator Judge') => {
    const demoEmail = `isro.${role.toLowerCase().replace(/\s+/g, '')}@sac.gov.in`;
    setEmail(demoEmail);
    setIsAuthenticating(true);
    setAuthStep(`Authenticating as ISRO ${role}...`);

    setTimeout(() => {
      onLogin(demoEmail);
    }, 800);
  };

  return (
    <div
      className={`min-h-screen flex flex-col justify-between transition-colors duration-300 ${
        isDark ? 'bg-[#0f172a] text-slate-100' : 'bg-[#f8fafc] text-slate-900'
      }`}
    >
      {/* Top minimal header */}
      <header className="p-4 flex items-center justify-between max-w-6xl w-full mx-auto">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 via-indigo-500 to-emerald-400 p-0.5 shadow-md flex items-center justify-center">
            <div className={`w-full h-full rounded-[6px] flex items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-slate-950'}`}>
              <Satellite className="w-4 h-4 text-sky-400" />
            </div>
          </div>
          <span className="font-bold text-base tracking-tight bg-gradient-to-r from-sky-400 via-emerald-400 to-amber-400 bg-clip-text text-transparent">
            SatQuery AI
          </span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          className={`p-2 rounded-lg border transition-all duration-200 cursor-pointer ${
            isDark
              ? 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300'
              : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700 shadow-sm'
          }`}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-600" />}
        </button>
      </header>

      {/* Main Centered Login Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-6">
          {/* Header Title */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold border bg-sky-500/10 text-sky-400 border-sky-500/30">
              <Shield className="w-3.5 h-3.5" />
              <span>ISRO / SAC Hackathon Portal</span>
            </div>
            <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Welcome to SatQuery AI
            </h1>
            <p className={`text-xs sm:text-sm max-w-sm mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Agentic Vision-Language Assistant for Remote Sensing & Satellite Image Analysis
            </p>
          </div>

          {/* Login Card */}
          <div
            className={`p-6 sm:p-8 rounded-2xl border transition-all shadow-xl space-y-5 ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            {/* Quick Judge/Evaluator Access Button */}
            <button
              onClick={() => handleQuickDemoLogin('Evaluator')}
              disabled={isAuthenticating}
              className="w-full py-3 px-4 rounded-xl font-semibold text-xs bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500 text-white shadow-lg shadow-sky-500/20 hover:opacity-95 transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4 fill-white" />
              <span>⚡ Quick Demo Login (Judge / Evaluator)</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className={`w-full border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`} />
              <span className={`absolute px-3 text-[10px] font-bold uppercase tracking-wider ${
                isDark ? 'bg-slate-900 text-slate-500' : 'bg-white text-slate-400'
              }`}>
                Or Sign In With
              </span>
            </div>

            {/* Federated Login Options */}
            <div className="space-y-2.5">
              {/* Google Button */}
              <button
                onClick={() => handleQuickDemoLogin('Google User')}
                disabled={isAuthenticating}
                className={`w-full py-2.5 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                  isDark
                    ? 'bg-slate-800/60 hover:bg-slate-800 border-slate-700 text-slate-200'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-800'
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* ISRO SSO Button */}
              <button
                onClick={() => handleQuickDemoLogin('ISRO Officer')}
                disabled={isAuthenticating}
                className={`w-full py-2.5 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                  isDark
                    ? 'bg-slate-800/60 hover:bg-slate-800 border-slate-700 text-slate-200'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-800'
                }`}
              >
                <Lock className="w-4 h-4 text-emerald-500" />
                <span>Continue with ISRO SSO</span>
              </button>
            </div>

            <div className="relative flex items-center justify-center">
              <div className={`w-full border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`} />
              <span className={`absolute px-3 text-[10px] font-bold uppercase tracking-wider ${
                isDark ? 'bg-slate-900 text-slate-500' : 'bg-white text-slate-400'
              }`}>
                Work Email
              </span>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailSubmit} className="space-y-3">
              <div>
                <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@isro.gov.in"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs transition-colors focus:outline-none ${
                    isDark
                      ? 'bg-slate-950/80 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-sky-500'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-sky-600 focus:bg-white'
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={isAuthenticating || !email.trim()}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                  isAuthenticating || !email.trim()
                    ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    : 'bg-sky-500 hover:bg-sky-400 text-white shadow-md shadow-sky-500/20 active:scale-95'
                }`}
              >
                {isAuthenticating ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{authStep || 'Authenticating...'}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1.5">
                    <span>Continue with Email</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
            </form>
          </div>

          {/* Privacy Footnote */}
          <p className={`text-[11px] text-center leading-relaxed ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
            By signing in, you agree to SatQuery AI's{' '}
            <span className="underline hover:text-sky-400 cursor-pointer">Terms of Service</span> &{' '}
            <span className="underline hover:text-sky-400 cursor-pointer">ISRO Evaluation Standards</span>.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className={`p-4 border-t text-center text-[11px] ${
        isDark ? 'border-slate-800/80 text-slate-500' : 'border-slate-200 text-slate-500'
      }`}>
        <p>SatQuery AI • Remote Sensing & Geospatial Intelligence • ISRO / SAC Hackathon Prototype</p>
      </footer>
    </div>
  );
};
