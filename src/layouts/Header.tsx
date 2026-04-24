import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useSatkerStore } from '../store/satkerStore';
import { User, LogOut, ChevronDown, UserCircle, Menu, X, ArrowLeftCircle } from 'lucide-react';
import { cn } from '../utils/cn';
import { useUIStore } from '../store/uiStore';

export const Header: React.FC = () => {
  const { user, originalAdmin, logout, stopImpersonation } = useAuthStore();
  const { satkers } = useSatkerStore();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const satker = satkers.find(s => s.id === user?.satker_id);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleStopImpersonation = () => {
    stopImpersonation();
    navigate('/admin/users');
  };

  return (
    <header className={cn(
      "h-20 glass-panel border-b border-white/10 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-50",
      originalAdmin && "bg-amber-50/80 border-amber-200"
    )}>
      <div className="flex items-center gap-4">
        {/* Mobile Menu Toggle */}
        <button 
          onClick={toggleSidebar}
          className="lg:hidden p-2.5 rounded-xl bg-accent text-white hover:bg-accent-hover active:scale-95 transition-all shadow-lg shadow-accent/20"
        >
          {sidebarCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
        </button>

        <div className="flex items-center lg:hidden gap-3 mr-2">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white shrink-0">
            <span className="font-black text-sm">C</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[0.65rem] font-bold text-accent uppercase tracking-[0.15em] leading-none">CAKAPKU</span>
              <div className="w-1 h-1 rounded-full bg-border" />
              <div className="flex items-center gap-2">
                <span className="text-[0.65rem] font-bold text-text-muted/60 uppercase tracking-[0.1em]">{user?.role}</span>
                {originalAdmin && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[0.6rem] font-black border border-amber-200">
                    <span className="animate-pulse w-1 h-1 rounded-full bg-amber-500" />
                    IMPERSONATING
                  </div>
                )}
              </div>
            </div>
            {satker && (
              <div className="text-xs font-semibold text-text-header mt-1 tracking-tight">
                {satker.name}
              </div>
            )}
          </div>

          {originalAdmin && (
            <button
              onClick={handleStopImpersonation}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-amber-200 text-amber-700 text-[0.7rem] font-black uppercase tracking-widest hover:bg-amber-100 transition-all shadow-sm"
            >
              <ArrowLeftCircle className="w-4 h-4" />
              Keluar Sesi
            </button>
          )}
        </div>
      </div>

      <div className="relative" ref={dropdownRef}>
        <button 
          className="flex items-center gap-3 cursor-pointer hover:bg-black/[0.02] active:scale-[0.98] transition-all p-1.5 rounded-xl border border-transparent hover:border-border"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          aria-expanded={isDropdownOpen}
        >
          <div className="text-right hidden sm:block">
            <div className="text-[0.8125rem] font-bold text-text-header leading-none tracking-tight">{user?.nama}</div>
            <div className="text-[0.65rem] text-text-muted mt-1 font-medium">{user?.email}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-accent/20 border border-white/20">
            {user?.nama.charAt(0).toUpperCase()}
          </div>
          <ChevronDown className={cn("w-4 h-4 text-text-muted/60 transition-transform duration-300", isDropdownOpen && "rotate-180")} />
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-3 w-56 bg-surface border border-border rounded-2xl shadow-elegant py-2 z-30 animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right">
            <div className="px-4 py-3 mb-1">
              <p className="text-[0.65rem] font-bold text-text-muted uppercase tracking-widest leading-none">Account</p>
              <p className="text-sm font-bold text-text-header mt-1.5 truncate">{user?.name}</p>
            </div>
            
            <div className="px-2 space-y-0.5">
              {user?.role === 'USER' && (
                <Link 
                  to="/user/biodata" 
                  className="flex items-center gap-3 px-3 py-2.5 text-[0.8125rem] font-semibold text-text-main hover:bg-accent/5 hover:text-accent rounded-xl transition-all group"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <UserCircle className="w-4 h-4 text-text-muted group-hover:text-accent transition-colors" />
                  Profil & Biodata
                </Link>
              )}

              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 text-[0.8125rem] font-semibold text-red-600 hover:bg-red-50 rounded-xl w-full text-left transition-all group"
              >
                <LogOut className="w-4 h-4 text-red-400 group-hover:text-red-500 transition-colors" />
                Logout Session
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
