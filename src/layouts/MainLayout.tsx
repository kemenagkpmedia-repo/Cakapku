import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { motion, AnimatePresence } from 'motion/react';
import { useUIStore } from '../store/uiStore';
import { cn } from '../utils/cn';

export const MainLayout: React.FC = () => {
  const location = useLocation();
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore();

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
              className="max-w-[1600px] mx-auto w-full pt-4"
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
