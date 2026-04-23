import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { 
  Users, 
  Building, 
  FileText, 
  CheckSquare, 
  BarChart3, 
  LogOut,
  LayoutDashboard,
  User,
  ChevronLeft,
  Menu,
  Calendar
} from 'lucide-react';
import { cn } from '../utils/cn';

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  const getLinks = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { to: '/admin/users', icon: Users, label: 'Manajemen User' },
          { to: '/admin/satker', icon: Building, label: 'Manajemen Satker' },
        ];
      case 'operator':
        return [
          { to: '/operator/periode', icon: Calendar, label: 'Manajemen Periode' },
          { to: '/operator/perkin', icon: FileText, label: 'Perjanjian Kinerja' },
          { to: '/operator/perkin-satker', icon: Building, label: 'Plotting Satker' },
          { to: '/operator/export', icon: BarChart3, label: 'Export Data' },
        ];
      case 'user':
        return [
          { to: '/user/kinerja', icon: FileText, label: 'Input Kinerja' },
          { to: '/user/riwayat', icon: CheckSquare, label: 'Riwayat Kinerja' },
          { to: '/user/export', icon: BarChart3, label: 'Export LKB' },
        ];
      case 'pimpinan':
        return [
          { to: '/pimpinan/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-full bg-sidebar text-white flex flex-col border-r border-white/5 z-[60] shadow-2xl shadow-black/20 transition-all duration-300 ease-in-out",
      sidebarCollapsed ? "w-[80px] -translate-x-full lg:translate-x-0" : "w-[260px] translate-x-0"
    )}>
      {/* Sidebar Toggle Button (Desktop Only) */}
      <button 
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 w-6 h-6 bg-accent rounded-full hidden lg:flex items-center justify-center text-white shadow-lg shadow-accent/40 border border-white/20 transition-transform active:scale-95"
      >
        <ChevronLeft className={cn("w-4 h-4 transition-transform duration-500", sidebarCollapsed && "rotate-180")} />
      </button>

      <div className={cn("p-6 pb-10 flex items-center transition-all duration-300", sidebarCollapsed ? "justify-center" : "justify-start gap-3")}>
        <div className="w-10 h-10 min-w-[40px] rounded-xl bg-gradient-to-tr from-accent to-accent-hover flex items-center justify-center shadow-lg shadow-accent/20 border border-white/10 shrink-0">
          <span className="font-extrabold text-xl text-white tracking-widest">C</span>
        </div>
        {!sidebarCollapsed && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="overflow-hidden"
          >
            <h1 className="font-extrabold text-lg leading-none tracking-tight whitespace-nowrap uppercase">CAKAPKU</h1>
            <p className="text-[0.65rem] text-white/40 font-bold tracking-[0.2em] mt-1.5 grayscale opacity-80 uppercase whitespace-nowrap">Kulon Progo</p>
          </motion.div>
        )}
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto custom-scrollbar">
        {!sidebarCollapsed && (
          <p className="px-4 text-[0.65rem] font-bold text-white/30 uppercase tracking-[0.2em] mb-4">Navigation</p>
        )}
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            title={sidebarCollapsed ? link.label : ''}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3.5 py-3 text-[0.8125rem] font-semibold transition-all duration-300 rounded-xl group relative overflow-hidden',
                sidebarCollapsed ? 'px-0 justify-center' : 'px-4',
                isActive
                  ? 'bg-accent/15 text-white'
                  : 'text-white/50 hover:bg-white/[0.03] hover:text-white/80'
              )
            }
          >
            {({ isActive }) => (
              <>
                <link.icon className={cn("w-[20px] h-[20px] shrink-0 transition-transform duration-500 group-hover:scale-110", isActive ? "text-accent" : "text-white/30 group-hover:text-white/60")} />
                {!sidebarCollapsed && <span>{link.label}</span>}
                {isActive && (
                  <motion.div 
                    layoutId="active-nav-indicator"
                    className={cn("absolute bg-accent rounded-full", sidebarCollapsed ? "inset-0 bg-accent/5 -z-10" : "left-0 top-1/2 -translate-y-1/2 w-1 h-6")}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <div className={cn(
          "p-4 bg-white/5 rounded-2xl border border-white/5 overflow-hidden relative group transition-all duration-300",
          sidebarCollapsed ? "p-3 flex justify-center" : "p-4"
        )}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/20 transition-colors" />
          <div className="relative z-10 flex flex-col items-center">
            {sidebarCollapsed ? (
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" title="Production v2.4" />
            ) : (
              <>
                <p className="text-[0.65rem] font-bold text-white/30 uppercase tracking-[0.1em] mb-1">Status</p>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  <span className="text-[0.7rem] font-bold text-white/90">Production v2.4</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
