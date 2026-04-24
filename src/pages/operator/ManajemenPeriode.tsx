import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { usePerkinStore } from '../../store/perkinStore';
import { Calendar, Plus, Trash2, Power, PowerOff, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

export const ManajemenPeriode: React.FC = () => {
  const { periods, isLoadingPeriodes, errorPeriodes, fetchPeriodes, addPeriode, updatePeriode, deletePeriode } = usePerkinStore();
  const [newPeriodName, setNewPeriodName] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPeriodes();
  }, [fetchPeriodes]);

  const handleAddPeriod = async () => {
    if (!newPeriodName.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await addPeriode(newPeriodName.trim(), true);
      setNewPeriodName('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menambah periode.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id: number, currentStatus: boolean) => {
    try {
      await updatePeriode(id, { status: !currentStatus });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengubah status periode.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus periode ini? Semua data Perkin terkait juga akan terpengaruh.')) return;
    try {
      await deletePeriode(id);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus periode.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-text-header tracking-tight">Manajemen Periode Perkin</h1>
        <p className="text-sm text-text-muted mt-2 font-medium">Kelola periode aktif untuk pelaporan kinerja pegawai.</p>
      </div>

      <Card className="rounded-3xl border-border shadow-elegant overflow-hidden bg-white">
        <CardContent className="p-8">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-[0.7rem] font-bold text-text-muted uppercase tracking-widest pl-1">Nama / Tahun Periode Baru</label>
              <Input
                placeholder="Contoh: 2026"
                value={newPeriodName}
                onChange={(e) => setNewPeriodName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddPeriod()}
                className="h-14 rounded-2xl bg-slate-50 border-border font-semibold focus:ring-accent/20 focus:bg-white transition-all shadow-sm"
              />
            </div>
            <Button
              onClick={handleAddPeriod}
              disabled={!newPeriodName.trim() || isSubmitting}
              className="h-14 rounded-2xl px-8 font-bold uppercase tracking-widest text-[0.75rem] shadow-lg shadow-accent/25 hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Menyimpan...
                </div>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Periode
                </>
              )}
            </Button>
          </div>

          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="bg-emerald-50 text-emerald-600 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 border border-emerald-100 overflow-hidden"
              >
                <CheckCircle className="w-4 h-4" /> Periode berhasil ditambahkan!
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {errorPeriodes && (
        <div className="bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {errorPeriodes}
          <button onClick={fetchPeriodes} className="ml-auto text-rose-500 hover:text-rose-700">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xs font-bold text-text-muted uppercase tracking-[0.15em] px-2 flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5" />
          Daftar Periode Tersedia
        </h2>

        {isLoadingPeriodes ? (
          <div className="p-16 flex flex-col items-center justify-center gap-4">
            <div className="w-8 h-8 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
            <p className="text-sm font-bold text-text-muted uppercase tracking-widest">Memuat Periode...</p>
          </div>
        ) : periods.length === 0 ? (
          <div className="p-12 text-center bg-slate-50/50 border border-dashed border-border rounded-3xl">
            <p className="text-text-muted font-medium">Belum ada periode yang dibuat.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {periods.map((period) => {
              const isActive = period.isActive ?? Boolean(period.status);
              return (
                <Card key={period.id} className="rounded-2xl border-border shadow-sm hover:shadow-md transition-all overflow-hidden bg-white group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                          {isActive ? <Power className="w-6 h-6" /> : <PowerOff className="w-6 h-6" />}
                        </div>
                        <div>
                          <h3 className={`font-extrabold tracking-tight ${isActive ? 'text-text-header' : 'text-text-muted'}`}>
                            {period.tahun || period.name}
                          </h3>
                          <p className="text-[0.65rem] font-bold text-text-muted uppercase tracking-widest mt-1">
                            ID: {period.id}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggle(period.id, isActive)}
                          className={`rounded-xl px-4 h-10 font-bold uppercase tracking-widest text-[0.65rem] border-border transition-all ${isActive ? 'hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200' : 'hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200'}`}
                        >
                          {isActive ? 'Non-aktifkan' : 'Aktifkan'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(period.id)}
                          className="rounded-xl px-4 h-10 font-bold uppercase tracking-widest text-[0.65rem] border-rose-100 text-rose-500 hover:bg-rose-50 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  {!isActive && (
                    <div className="bg-amber-50/50 px-6 py-2 border-t border-amber-100 flex items-center gap-2">
                      <AlertCircle className="w-3 h-3 text-amber-500" />
                      <span className="text-[0.6rem] font-bold text-amber-600 uppercase tracking-widest">Periode ini tidak aktif. Perkin terkait tidak akan muncul bagi User.</span>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
