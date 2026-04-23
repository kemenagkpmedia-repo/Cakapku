import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: 'danger' | 'success' | 'info';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  variant = 'info'
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl border border-border overflow-hidden"
          >
            <div className="px-8 pt-8 pb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className={cn(
                  "text-xl font-extrabold tracking-tight",
                  variant === 'danger' ? "text-rose-600" : 
                  variant === 'success' ? "text-emerald-600" : "text-text-header"
                )}>
                  {title}
                </h3>
                <button 
                  onClick={onClose}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-text-muted transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {description && (
                <p className="text-sm text-text-muted font-medium leading-relaxed">
                  {description}
                </p>
              )}
            </div>
            
            <div className="px-8 py-4">
              {children}
            </div>
            
            <div className="px-8 py-6 bg-slate-50 flex items-center justify-end gap-3">
              {footer || (
                <Button onClick={onClose} variant="outline" className="rounded-xl px-6 font-bold uppercase tracking-widest text-[0.7rem]">
                  Tutup
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
