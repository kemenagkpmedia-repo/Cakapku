import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck, Info } from 'lucide-react';
import { useAuthStore, Role } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import api from '../../api/axios';
import { Card, CardContent } from '../../components/ui/Card';


export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await api.post('/login', {
        username: data.username,
        password: data.password
      });

      const { user, token } = response.data;
      
      // Normalisasi role ke lowercase agar sesuai dengan ProtectedRoute dan logic aplikasi
      const role = user.role.toLowerCase() as Role;
      const normalizedUser = { ...user, role };
      
      login(normalizedUser, token);
      
      setIsLoading(false);
      
      // Redirect berdasarkan role yang sudah dinormalisasi
      switch (role) {
        case 'admin': navigate('/admin/users'); break;
        case 'operator': navigate('/operator/perkin'); break;
        case 'user': navigate('/user/kinerja'); break;
        case 'pimpinan': navigate('/pimpinan/dashboard'); break;
        default: navigate('/user/kinerja');
      }
    } catch (error: any) {
      setIsLoading(false);
      console.error('Login failed:', error);
      alert(error.response?.data?.message || 'Login gagal. Silakan periksa kembali kredensial Anda.');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6, 
        ease: "easeOut",
        staggerChildren: 0.1 
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-accent/5 blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[440px] relative z-10"
      >
        <div className="flex flex-col items-center mb-10 text-center">
          <motion.div 
            variants={itemVariants}
            className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center shadow-xl shadow-accent/20 mb-6 group hover:rotate-3 transition-transform"
          >
            <ShieldCheck className="w-8 h-8 text-white" />
          </motion.div>
          <motion.h1 
            variants={itemVariants}
            className="text-4xl font-black text-text-header tracking-tight"
          >
            CAKAP<span className="text-accent">KU</span>
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            className="text-sm font-bold text-text-muted mt-2 uppercase tracking-[0.2em]"
          >
            Sistem Kinerja Terintegrasi
          </motion.p>
        </div>

        <Card className="border-border shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-xl">
          <CardContent className="p-8 sm:p-12">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="username" className="text-[0.7rem] font-black text-text-muted uppercase tracking-widest ml-1">Username / Email / NIP</Label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Username, Email atau NIP"
                    className="pl-11 h-14 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-accent/10 focus:bg-white transition-all font-semibold"
                    {...register('username', { 
                      required: 'Username/Email/NIP wajib diisi'
                    })}
                  />
                </div>
                {errors.username && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-[0.7rem] text-rose-500 font-bold mt-1 ml-1 flex items-center gap-1.5"
                  >
                    <Info className="w-3 h-3" /> {errors.username.message as string}
                  </motion.p>
                )}
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <Label htmlFor="password" className="text-[0.7rem] font-black text-text-muted uppercase tracking-widest">Password</Label>
                  <a href="#" className="text-[0.7rem] font-black text-accent uppercase tracking-widest hover:underline transition-all">Lupa?</a>
                </div>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pl-11 pr-12 h-14 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-accent/10 focus:bg-white transition-all font-semibold"
                    {...register('password', { required: 'Password wajib diisi' })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-accent transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-[0.7rem] text-rose-500 font-bold mt-1 ml-1 flex items-center gap-1.5"
                  >
                    <Info className="w-3 h-3" /> {errors.password.message as string}
                  </motion.p>
                )}
              </motion.div>

              <motion.div variants={itemVariants} className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[0.8rem] shadow-xl shadow-accent/20 hover:shadow-accent/40 active:scale-[0.98] transition-all group overflow-hidden relative" 
                  disabled={isLoading}
                >
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <motion.div 
                        key="loading"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center justify-center gap-3"
                      >
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>Otentikasi...</span>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="ready"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center justify-center gap-2"
                      >
                        Masuk Ke Dashboard
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            </form>

            <motion.div variants={itemVariants} className="mt-10 pt-8 border-t border-slate-100">
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-3 py-3 px-4 bg-slate-50 rounded-2xl w-full border border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
                    <Info className="w-4 h-4" />
                  </div>
                  <p className="text-[0.65rem] font-bold text-text-muted italic leading-relaxed">
                    Gunakan kredensial yang terdaftar <br/> 
                    <span className="text-accent">Username, Email, atau NIP</span>
                  </p>
                </div>
                <p className="text-[0.7rem] font-bold text-text-muted/60 uppercase tracking-widest">
                  Kantor Kemenag Kulon Progo © 2024
                </p>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
