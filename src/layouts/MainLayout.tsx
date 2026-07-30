import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { cn } from '../utils/cn';

export const MainLayout: React.FC = () => {
  const { user, login, isAuthenticated, config, isSwitching } = useAuthStore();
  const location = useLocation();
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore();
  const [isHydrated, setIsHydrated] = React.useState(false);
  const hasFetched = React.useRef(false);

  // Check for hydration
  useEffect(() => {
    const checkHydration = () => {
      if (useAuthStore.persist.hasHydrated()) {
        setIsHydrated(true);
      }
    };
    checkHydration();
    return useAuthStore.persist.onFinishHydration(() => setIsHydrated(true));
  }, []);

  // Fetch current user and config ONLY on first mount
  useEffect(() => {
    if (isAuthenticated && isHydrated && !hasFetched.current) {
      hasFetched.current = true;
      import('../api/axios').then(({ default: api }) => {
        // Kirim active_role saat ini agar backend tidak reset ke default
        const activeRole = useAuthStore.getState().config?.active_role;
        const params = activeRole ? `?role=${activeRole}` : '';
        api.get(`/me${params}`).then(res => {
          const { user: updatedUser, config: updatedConfig } = res.data;
          const { token } = useAuthStore.getState();
          if (token && updatedUser && updatedConfig) {
            login(updatedUser, token, updatedConfig);
          }
        }).catch(err => {
          console.error('Failed to fetch user config:', err);
        });
      });
    }
  }, [isAuthenticated, isHydrated]);

  // Close sidebar on mobile when navigating
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarCollapsed]);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarCollapsed(true);
    }
  }, [location.pathname, setSidebarCollapsed]);

  if (!isHydrated || (isAuthenticated && !config) || isSwitching) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background overflow-hidden antialiased mesh-bg">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-10 h-10 text-accent animate-spin" />
          <p className="text-text-muted font-medium animate-pulse">
            {isSwitching ? 'Menyiapkan akses role baru...' : 'Menyiapkan dashboard...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden antialiased mesh-bg">
      <Sidebar />
      
      {/* Mobile Backdrop */}
      {!sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      <div className={cn(
        "flex flex-col flex-1 overflow-hidden relative transition-all duration-300 ease-in-out",
        sidebarCollapsed ? "lg:ml-[80px]" : "lg:ml-[260px]"
      )}>
        <Header />
        <main className="flex-1 overflow-y-auto overflow-x-hidden pt-4 px-4 sm:px-8 pb-12 scroll-smooth">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
              transition={{ 
                duration: 0.35, 
                ease: [0.22, 1, 0.36, 1] 
              }}
              className="w-full pt-4"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
        
        {/* Subtle decorative elements for professional look */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none -z-10 translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/2 rounded-full blur-3xl pointer-events-none -z-10 -translate-x-1/4 translate-y-1/4" />
      </div>
    </div>
  );
};
