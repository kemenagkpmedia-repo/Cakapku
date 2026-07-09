import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { usePerkinStore } from '../../store/perkinStore';
import { useSatkerStore } from '../../store/satkerStore';
import { useAuthStore } from '../../store/authStore';
import { Building, Check, Save, AlertCircle, ChevronRight, CheckCircle2, Loader2, Lock, ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

export const ManajemenPerkinSatker: React.FC = () => {
  const { perkins, isLoadingPerkins, fetchPerkins, assignSatker } = usePerkinStore();
  const { satkers, isLoading: isLoadingSatkers, fetchSatkers } = useSatkerStore();
  const { user } = useAuthStore();
  const [selectedPerkinId, setSelectedPerkinId] = useState<number | null>(null);
  const [tempSatkerIds, setTempSatkerIds] = useState<number[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [collapsedSatkerIds, setCollapsedSatkerIds] = useState<number[]>([]);

  useEffect(() => {
    fetchPerkins();
    fetchSatkers();
  }, [fetchPerkins, fetchSatkers]);

  // Helper to find all descendants of a satker recursively
  const getDescendants = (parentId: number, list: any[]): number[] => {
    let ids: number[] = [parentId];
    const children = list.filter(s => s.parent_id === parentId);
    for (const child of children) {
      ids = [...ids, ...getDescendants(child.id, list)];
    }
    return ids;
  };

  const manageableSatkerIds = useMemo(() => {
    if (!user) return [];
    if (user.role === 'SUPER ADMIN' || user.role === 'ADMIN') {
      return satkers.map(s => s.id);
    }
    const userSatkerId = user.id_satker ?? user.satker_id;
    if (!userSatkerId) return [];
    return getDescendants(userSatkerId, satkers);
  }, [user, satkers]);

  const handleSelectPerkin = (id: number) => {
    setSelectedPerkinId(id);
    const perkin = perkins.find((p) => p.id === id);
    setTempSatkerIds(perkin?.satker_ids || []);
  };

  const toggleSatker = (satkerId: number) => {
    if (!manageableSatkerIds.includes(satkerId)) {
      alert("Anda tidak memiliki hak akses untuk memetakan Perkin ke Satker ini.");
      return;
    }
    setTempSatkerIds((prev) =>
      prev.includes(satkerId) ? prev.filter((id) => id !== satkerId) : [...prev, satkerId]
    );
  };

  const handleSave = async () => {
    if (selectedPerkinId === null || isSaving) return;
    setIsSaving(true);
    try {
      await assignSatker(selectedPerkinId, tempSatkerIds);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan plotting Satker.');
    } finally {
      setIsSaving(false);
    }
  };

  const isLoading = isLoadingPerkins || isLoadingSatkers;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] gap-4">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
        <p className="text-sm font-bold text-text-muted uppercase tracking-widest">Memuat Data...</p>
      </div>
    );
  }

  if (perkins.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] p-8 text-center bg-white rounded-3xl border border-dashed border-border shadow-sm">
        <div className="w-20 h-20 bg-blue-50 text-accent rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-blue-100">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-extrabold text-text-header tracking-tight">Belum Ada Data Perkin</h2>
        <p className="text-text-muted mt-3 max-w-md font-medium text-[0.9375rem] leading-relaxed">
          Sistem belum menemukan data Perjanjian Kinerja. Silakan impor data Perkin terlebih dahulu di menu{' '}
          <span className="text-accent font-bold">Manajemen Perkin</span> sebelum melakukan plotting ke Satker.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-text-header tracking-tight">Manajemen Perkin Satker</h1>
        <p className="text-sm text-text-muted mt-2 font-medium">Lakukan plotting and penugasan Sasaran Kegiatan (Perkin) ke masing-masing Satuan Kerja.</p>
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
                  'p-5 rounded-2xl border cursor-pointer transition-all duration-300 group relative overflow-hidden',
                  selectedPerkinId === perkin.id
                    ? 'border-accent bg-blue-50/50 shadow-md ring-1 ring-accent/20'
                    : 'border-border bg-white hover:border-accent/40 hover:shadow-lg hover:-translate-y-0.5'
                )}
              >
                <div className="flex justify-between items-start gap-4 relative z-10">
                  <div className="flex-1">
                    <span className={cn('text-sm font-bold leading-relaxed tracking-tight block transition-colors', selectedPerkinId === perkin.id ? 'text-accent' : 'text-text-main group-hover:text-text-header')}>
                      {perkin.nama_perkin || perkin.name}
                    </span>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="w-4 h-4 rounded bg-slate-100 flex items-center justify-center">
                        <Building className="w-2.5 h-2.5 text-text-muted" />
                      </div>
                      <span className="text-[0.65rem] font-bold text-text-muted">
                        {perkin.satker_ids?.length || 0} Satker Terpilih
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
                {selectedPerkinId === perkin.id && <div className="absolute top-0 left-0 w-1 h-full bg-accent" />}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Satker Plotting */}
        <div className="col-span-12 lg:col-span-7">
          {selectedPerkinId ? (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
              <Card className="rounded-3xl border-border shadow-elegant overflow-hidden">
                <CardHeader className="bg-surface border-b border-border px-8 py-6">
                  <CardTitle className="text-base font-extrabold flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-accent text-white flex items-center justify-center shadow-lg shadow-accent/20">
                      <Check className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-[0.65rem] text-text-muted uppercase tracking-widest font-bold mb-1">Konfigurasi Plotting</span>
                      <span className="text-text-header line-clamp-1 tracking-tight">
                        {perkins.find((p) => p.id === selectedPerkinId)?.nama_perkin || perkins.find((p) => p.id === selectedPerkinId)?.name}
                      </span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-8 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <p className="text-[0.8125rem] text-text-muted font-medium leading-relaxed italic">
                      Aktifkan kotak centang di bawah untuk memberikan akses atau menugaskan Sasaran Kegiatan ini ke Satuan Kerja yang relevan.
                    </p>
                  </div>

                  {satkers.length === 0 ? (
                    <div className="p-8 text-center text-text-muted font-medium">
                      Belum ada data Satker. Tambahkan Satker di menu Manajemen Satker.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {(() => {
                        // Helper to build a flat list in hierarchical order
                        const buildHierarchy = (items: typeof satkers, parentId: number | null | undefined = null): typeof satkers => {
                          let result: typeof satkers = [];
                          const children = items.filter(item => (item.parent_id === parentId || (!parentId && !item.parent_id)));
                          
                          // Sort children by name
                          children.sort((a, b) => a.nama_satker.localeCompare(b.nama_satker));
                          
                          for (const child of children) {
                            result.push(child);
                            // Only recurse if it has child items to prevent infinite loop
                            const subChildren = buildHierarchy(items, child.id);
                            result = [...result, ...subChildren];
                          }
                          return result;
                        };

                        const sortedSatkers = buildHierarchy(satkers, null);

                        // If buildHierarchy returns empty due to some parent_id mismatches, fall back to default satkers
                        const listToRender = sortedSatkers.length > 0 ? sortedSatkers : satkers;

                        const hasChildren = (satkerId: number) => {
                          return satkers.some(s => s.parent_id === satkerId);
                        };

                        const isSatkerVisible = (satker: any) => {
                          let current = satker;
                          while (current.parent_id) {
                            if (collapsedSatkerIds.includes(current.parent_id)) {
                              return false;
                            }
                            const parent = satkers.find(s => s.id === current.parent_id);
                            if (!parent) break;
                            current = parent;
                          }
                          return true;
                        };

                        const toggleCollapseSatker = (satkerId: number, e: React.MouseEvent) => {
                          e.stopPropagation();
                          setCollapsedSatkerIds(prev =>
                            prev.includes(satkerId) ? prev.filter(id => id !== satkerId) : [...prev, satkerId]
                          );
                        };

                        return listToRender.map((satker) => {
                          if (!isSatkerVisible(satker)) return null;

                          const isSelected = tempSatkerIds.includes(satker.id);
                          const isManageable = manageableSatkerIds.includes(satker.id);
                          const indent = (satker.level ?? 0) * 24; // 24px indent per level

                          return (
                            <div
                              key={satker.id}
                              style={{ marginLeft: `${indent}px` }}
                              onClick={() => isManageable && toggleSatker(satker.id)}
                              className={cn(
                                'flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 group',
                                isManageable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50 bg-slate-50/70',
                                isSelected
                                  ? 'border-accent bg-accent/5 ring-1 ring-accent/10 shadow-sm'
                                  : 'border-border bg-white text-text-main',
                                isManageable && !isSelected && 'hover:border-accent/30 hover:bg-slate-50'
                              )}
                            >
                              <div className="flex items-center gap-4">
                                {hasChildren(satker.id) ? (
                                  <button
                                    onClick={(e) => toggleCollapseSatker(satker.id, e)}
                                    className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                                  >
                                    <ChevronDown className={cn("w-4 h-4 text-text-muted transition-transform duration-200", collapsedSatkerIds.includes(satker.id) ? "transform -rotate-90" : "transform rotate-0")} />
                                  </button>
                                ) : (
                                  <div className="w-7 h-7" />
                                )}
                                <div className={cn(
                                  'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500', 
                                  isSelected 
                                    ? 'bg-accent text-white rotate-6 scale-110 shadow-lg shadow-accent/20' 
                                    : 'bg-slate-50 text-text-muted group-hover:bg-white border border-transparent group-hover:border-border'
                                )}>
                                  {isManageable ? <Building className="w-4 h-4" /> : <Lock className="w-4 h-4 text-text-muted/65" />}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className={cn('text-sm font-bold tracking-tight', isSelected ? 'text-accent' : 'text-text-main')}>
                                      {satker.nama_satker || satker.name}
                                    </span>
                                    <span className={`text-[0.55rem] px-1.5 py-0.5 rounded font-black uppercase tracking-wider ${
                                      satker.level === 0 ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                                      satker.level === 1 ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                      'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                    }`}>
                                      Lvl {satker.level ?? 0}
                                    </span>
                                    {!isManageable && (
                                      <span className="text-[0.6rem] font-bold text-rose-500 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                        Read Only
                                      </span>
                                    )}
                                  </div>
                                  {satker.parent && (
                                    <span className="text-[0.65rem] text-text-muted">
                                      Parent: {satker.parent.nama_satker || satker.parent.name}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {isSelected && <CheckCircle2 className="w-5 h-5 text-accent animate-in zoom-in-50 duration-300" />}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  )}

                  <div className="mt-12 pt-8 border-t border-border flex justify-end">
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="rounded-2xl flex gap-2 font-bold uppercase tracking-widest text-[0.7rem] px-10 h-12 shadow-lg shadow-accent/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >
                      {isSaving ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
                      ) : (
                        <><Save className="w-4 h-4" /> Simpan Plotting Satker</>
                      )}
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
