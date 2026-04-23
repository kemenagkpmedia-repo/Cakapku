import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { usePerkinStore } from '../../store/perkinStore';
import { useSatkerStore } from '../../store/satkerStore';
import { Building, Check, Save, AlertCircle, ChevronRight, CheckCircle2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export const ManajemenPerkinSatker: React.FC = () => {
  const { perkins, setPerkins } = usePerkinStore();
  const { satkers } = useSatkerStore();
  const [selectedPerkinId, setSelectedPerkinId] = useState<string | number | null>(null);
  const [tempSatkerIds, setTempSatkerIds] = useState<number[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSelectPerkin = (id: string | number) => {
    setSelectedPerkinId(id);
    const perkin = perkins.find(p => p.id === id);
    setTempSatkerIds(perkin?.satker_ids || []);
  };

  const toggleSatker = (satkerId: number) => {
    setTempSatkerIds(prev => 
      prev.includes(satkerId) 
        ? prev.filter(id => id !== satkerId) 
        : [...prev, satkerId]
    );
  };

  const handleSave = () => {
    if (selectedPerkinId === null) return;

    const updatedPerkins = perkins.map(p => 
      p.id === selectedPerkinId 
        ? { ...p, satker_ids: tempSatkerIds } 
        : p
    );

    setPerkins(updatedPerkins);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  if (perkins.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] p-8 text-center bg-white rounded-3xl border border-dashed border-border shadow-sm">
        <div className="w-20 h-20 bg-blue-50 text-accent rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-blue-100">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-extrabold text-text-header tracking-tight">Belum Ada Data Perkin</h2>
        <p className="text-text-muted mt-3 max-w-md font-medium text-[0.9375rem] leading-relaxed">
          Sistem belum menemukan data Perjanjian Kinerja. Silakan impor data Perkin terlebih dahulu di menu <span className="text-accent font-bold">Manajemen Perkin</span> sebelum melakukan plotting ke Satker.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-text-header tracking-tight">Manajemen Perkin Satker</h1>
        <p className="text-sm text-text-muted mt-2 font-medium">Lakukan plotting dan penugasan Sasaran Kegiatan (Perkin) ke masing-masing Satuan Kerja.</p>
      </div>
      
      {showSuccess && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold shadow-sm"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          Plotting data Sasaran Kegiatan ke Satker berhasil disimpan!
        </motion.div>
      )}

      <div className="grid grid-cols-12 gap-8 items-start">
        {/* Perkin List */}
        <div className="col-span-12 lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[0.7rem] font-bold text-text-muted uppercase tracking-[0.2em]">Pilih Sasaran Kegiatan</h3>
            <span className="text-[0.65rem] font-bold text-accent">{perkins.length} Total</span>
          </div>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {perkins.map((perkin, i) => (
              <motion.div
                key={perkin.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleSelectPerkin(perkin.id)}
                className={cn(
                  "p-5 rounded-2xl border cursor-pointer transition-all duration-300 group relative overflow-hidden",
                  selectedPerkinId === perkin.id
                    ? "border-accent bg-blue-50/50 shadow-md ring-1 ring-accent/20"
                    : "border-border bg-white hover:border-accent/40 hover:shadow-lg hover:-translate-y-0.5"
                )}
              >
                <div className="flex justify-between items-start gap-4 relative z-10">
                  <div className="flex-1">
                    <span className={cn(
                      "text-sm font-bold leading-relaxed tracking-tight block transition-colors",
                      selectedPerkinId === perkin.id ? "text-accent" : "text-text-main group-hover:text-text-header"
                    )}>
                      {perkin.name}
                    </span>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="w-4 h-4 rounded bg-slate-100 flex items-center justify-center">
                        <Building className="w-2.5 h-2.5 text-text-muted" />
                      </div>
                      <span className="text-[0.65rem] font-bold text-text-muted">Target: 
                        <span className="text-text-main ml-1 uppercase">Satuan Kerja Terpilih</span>
                      </span>
                    </div>
                  </div>
                  {perkin.satker_ids && perkin.satker_ids.length > 0 && (
                    <span className="shrink-0 bg-accent text-white text-[0.6rem] font-extrabold px-2 py-0.5 rounded-lg border border-accent-hover shadow-sm uppercase tracking-tighter">
                      {perkin.satker_ids.length} Satker
                    </span>
                  )}
                  {selectedPerkinId === perkin.id && (
                    <ChevronRight className="w-4 h-4 text-accent shrink-0 mt-1 animate-bounce-x" />
                  )}
                </div>
                {selectedPerkinId === perkin.id && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Satker Plotting */}
        <div className="col-span-12 lg:col-span-7">
          {selectedPerkinId ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="rounded-3xl border-border shadow-elegant overflow-hidden">
                <CardHeader className="bg-surface border-b border-border px-8 py-6">
                  <CardTitle className="text-base font-extrabold flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-accent text-white flex items-center justify-center shadow-lg shadow-accent/20">
                      <Check className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-[0.65rem] text-text-muted uppercase tracking-widest font-bold mb-1">Konfigurasi Plotting</span>
                      <span className="text-text-header line-clamp-1 tracking-tight">
                        {perkins.find(p => p.id === selectedPerkinId)?.name}
                      </span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-8 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <p className="text-[0.8125rem] text-text-muted font-medium leading-relaxed italic">Aktifkan kotak centang di bawah untuk memberikan akses atau menugaskan Sasaran Kegiatan ini ke Satuan Kerja (Unit) yang relevan.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {satkers.map((satker) => {
                      const isSelected = tempSatkerIds.includes(satker.id);
                      return (
                        <div
                          key={satker.id}
                          onClick={() => toggleSatker(satker.id)}
                          className={cn(
                            "flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all duration-300 group",
                            isSelected
                              ? "border-accent bg-accent/5 ring-1 ring-accent/10"
                              : "border-border bg-white text-text-main hover:border-accent/30 hover:bg-slate-50"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500",
                              isSelected ? "bg-accent text-white rotate-6 scale-110 shadow-lg shadow-accent/20" : "bg-slate-50 text-text-muted group-hover:bg-white border border-transparent group-hover:border-border"
                            )}>
                              <Building className="w-4 h-4" />
                            </div>
                            <span className={cn("text-sm font-bold tracking-tight", isSelected ? "text-accent" : "text-text-main")}>{satker.name}</span>
                          </div>
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-accent animate-in zoom-in-50 duration-300" />}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-12 pt-8 border-t border-border flex justify-end">
                    <Button 
                      onClick={handleSave} 
                      className="rounded-2xl flex gap-2 font-bold uppercase tracking-widest text-[0.7rem] px-10 h-12 shadow-lg shadow-accent/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >
                      <Save className="w-4 h-4" />
                      Simpan Plotting Satker
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="h-[400px] flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border rounded-3xl bg-slate-50/50">
              <div className="w-16 h-16 rounded-2xl bg-white border border-border shadow-sm flex items-center justify-center mb-6 text-slate-300">
                <Building className="w-8 h-8 opacity-40" />
              </div>
              <h3 className="text-base font-extrabold text-text-muted tracking-tight">Kesiapan Plotting</h3>
              <p className="text-xs font-bold text-text-muted/60 mt-2 uppercase tracking-widest max-w-[240px]">Pilih Sasaran Kegiatan di panel kiri untuk mulai mengelola unit Satker.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
