import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { usePerkinStore, Period } from '../../store/perkinStore';
import { Calendar, Plus, Trash2, Power, PowerOff, CheckCircle, AlertCircle } from 'lucide-react';

export const ManajemenPeriode: React.FC = () => {
    const { periods, addPeriod, togglePeriodStatus, deletePeriod } = usePerkinStore();
    const [newPeriodName, setNewPeriodName] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    const handleAddPeriod = () => {
        if (!newPeriodName.trim()) return;

        const newPeriod: Period = {
            id: 'p-' + Date.now(),
            name: newPeriodName,
            isActive: true,
            createdAt: new Date().toISOString()
        };

        addPeriod(newPeriod);
        setNewPeriodName('');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
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
                            <label className="text-[0.7rem] font-bold text-text-muted uppercase tracking-widest pl-1">Nama Periode Baru</label>
                            <Input
                                placeholder="Contoh: Periode Semester 2 - 2026"
                                value={newPeriodName}
                                onChange={(e) => setNewPeriodName(e.target.value)}
                                className="h-14 rounded-2xl bg-slate-50 border-border font-semibold focus:ring-accent/20 focus:bg-white transition-all shadow-sm"
                            />
                        </div>
                        <Button
                            onClick={handleAddPeriod}
                            disabled={!newPeriodName.trim()}
                            className="h-14 rounded-2xl px-8 font-bold uppercase tracking-widest text-[0.75rem] shadow-lg shadow-accent/25 hover:shadow-xl hover:-translate-y-1 transition-all"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah Periode
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

            <div className="space-y-4">
                <h2 className="text-xs font-bold text-text-muted uppercase tracking-[0.15em] px-2 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    Daftar Periode Tersedia
                </h2>

                {periods.length === 0 ? (
                    <div className="p-12 text-center bg-slate-50/50 border border-dashed border-border rounded-3xl">
                        <p className="text-text-muted font-medium">Belum ada periode yang dibuat.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {periods.map((period) => (
                            <Card key={period.id} className="rounded-2xl border-border shadow-sm hover:shadow-md transition-all overflow-hidden bg-white group">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${period.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                                {period.isActive ? <Power className="w-6 h-6" /> : <PowerOff className="w-6 h-6" />}
                                            </div>
                                            <div>
                                                <h3 className={`font-extrabold tracking-tight ${period.isActive ? 'text-text-header' : 'text-text-muted'}`}>
                                                    {period.name}
                                                </h3>
                                                <p className="text-[0.65rem] font-bold text-text-muted uppercase tracking-widest mt-1">
                                                    Dibuat pada: {new Date(period.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => togglePeriodStatus(period.id)}
                                                className={`rounded-xl px-4 h-10 font-bold uppercase tracking-widest text-[0.65rem] border-border transition-all ${period.isActive ? 'hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200' : 'hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200'}`}
                                            >
                                                {period.isActive ? 'Non-aktifkan' : 'Aktifkan'}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    if(confirm('Hapus periode ini? Semua data Perkin terkait juga akan terpengaruh.')) {
                                                        deletePeriod(period.id);
                                                    }
                                                }}
                                                className="rounded-xl px-4 h-10 font-bold uppercase tracking-widest text-[0.65rem] border-rose-100 text-rose-500 hover:bg-rose-50 transition-all"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                                {!period.isActive && (
                                    <div className="bg-amber-50/50 px-6 py-2 border-t border-amber-100 flex items-center gap-2">
                                        <AlertCircle className="w-3 h-3 text-amber-500" />
                                        <span className="text-[0.6rem] font-bold text-amber-600 uppercase tracking-widest">Periode ini tidak aktif. Perkin terkait tidak akan muncul bagi User.</span>
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
