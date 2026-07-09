import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { usePerkinStore } from '../../store/perkinStore';
import { Target, Plus, Pencil, Trash2, AlertCircle, RefreshCw, ChevronRight, FileText, ChevronDown } from 'lucide-react';
import { Select } from '../../components/ui/Select';
import { cn } from '../../utils/cn';

export const ManajemenSk: React.FC = () => {
  const { 
    perkins, 
    periods, 
    fetchPerkins, 
    fetchPeriodes, 
    isLoadingPerkins, 
    errorPerkins,
    addSasaranKegiatan,
    updateSasaranKegiatan,
    deleteSasaranKegiatan
  } = usePerkinStore();

  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSK, setEditingSK] = useState<{ id: number; nama_sasaran: string; id_perkin: number } | null>(null);
  const [newSK, setNewSK] = useState({ nama_sasaran: '', id_perkin: 0 });
  const [expandedPerkinIds, setExpandedPerkinIds] = useState<number[]>([]);

  useEffect(() => {
    fetchPeriodes();
    fetchPerkins();
  }, [fetchPeriodes, fetchPerkins]);

  // Default collapse: closed (empty array)
  // Biarkan default state close.

  const toggleExpandPerkin = (id: number) => {
    setExpandedPerkinIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const expandAll = () => setExpandedPerkinIds(filteredPerkins.map(p => p.id));
  const collapseAll = () => setExpandedPerkinIds([]);

  const activePeriods = periods.filter((p) => p.isActive ?? Boolean(p.status));
  
  const filteredPerkins = perkins.filter(p => 
    !selectedPeriodId || p.id_periode === Number(selectedPeriodId)
  );

  const handleSave = async () => {
    try {
      if (editingSK) {
        await updateSasaranKegiatan(editingSK.id, { nama_sasaran: newSK.nama_sasaran });
      } else {
        await addSasaranKegiatan(newSK);
      }
      setIsModalOpen(false);
      setEditingSK(null);
      setNewSK({ nama_sasaran: '', id_perkin: 0 });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan Sasaran Kegiatan.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus Sasaran Kegiatan ini? Indikator terkait akan ikut terhapus.')) return;
    try {
      await deleteSasaranKegiatan(id);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus data.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-text-header tracking-tight flex items-center gap-3">
            <Target className="w-8 h-8 text-accent" />
            Manajemen Sasaran Kegiatan (SK)
          </h1>
          <p className="text-sm text-text-muted mt-2 font-medium">Kelola daftar Sasaran Kegiatan yang terdaftar pada setiap Perjanjian Kinerja.</p>
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="w-64 space-y-1.5">
            <label className="text-[0.65rem] font-bold text-text-muted uppercase tracking-widest pl-1">Filter Periode</label>
            <Select
              placeholder="Semua Periode..."
              className="h-11 rounded-xl bg-white border-border shadow-sm text-[0.75rem] font-bold"
              value={selectedPeriodId}
              onChange={(e) => setSelectedPeriodId(e.target.value)}
              options={activePeriods.map((p) => ({ label: p.tahun || p.name || String(p.id), value: String(p.id) }))}
            />
          </div>
          <Button
            variant="outline"
            onClick={fetchPerkins}
            className="flex gap-2 rounded-xl px-4 h-11 font-bold uppercase tracking-widest text-[0.7rem] border-border hover:bg-slate-50 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {isLoadingPerkins ? (
        <div className="p-20 flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
          <p className="text-sm font-bold text-text-muted uppercase tracking-widest">Memuat Data SK...</p>
        </div>
      ) : filteredPerkins.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center border-dashed border-2 border-border rounded-[2.5rem] bg-white">
          <Target className="w-16 h-16 text-slate-200 mb-4" />
          <h3 className="text-xl font-bold text-text-header">Belum ada data Perkin</h3>
          <p className="text-text-muted mt-2">Silakan buat atau import Perkin terlebih dahulu.</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex justify-end gap-2 px-4">
            <Button
              variant="ghost"
              onClick={expandAll}
              className="text-[0.65rem] font-bold uppercase tracking-wider h-8 px-3 rounded-lg text-accent hover:bg-accent/5"
            >
              Expand All
            </Button>
            <Button
              variant="ghost"
              onClick={collapseAll}
              className="text-[0.65rem] font-bold uppercase tracking-wider h-8 px-3 rounded-lg text-text-muted hover:bg-slate-100"
            >
              Collapse All
            </Button>
          </div>

          {filteredPerkins.map((perkin) => {
            const isExpanded = expandedPerkinIds.includes(perkin.id);
            return (
              <div key={perkin.id} className="space-y-4 bg-slate-50/30 p-6 rounded-3xl border border-border/40">
                <div 
                  onClick={() => toggleExpandPerkin(perkin.id)}
                  className="flex items-center gap-3 px-4 cursor-pointer select-none group/hdr"
                >
                  <ChevronDown className={cn("w-5 h-5 text-text-muted transition-transform duration-300", isExpanded ? "transform rotate-0" : "transform -rotate-90")} />
                  <div className="p-2 bg-accent/10 rounded-lg group-hover/hdr:bg-accent/20 transition-colors">
                    <FileText className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-text-header tracking-tight group-hover/hdr:text-accent transition-colors">{perkin.nama_perkin}</h2>
                    <p className="text-xs text-text-muted font-bold uppercase tracking-widest">
                      {periods.find(p => p.id === perkin.id_periode)?.tahun} • {perkin.no_sk || 'No SK Belum Diatur'}
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    className="ml-auto rounded-lg h-9 text-[0.65rem] font-bold uppercase tracking-widest gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingSK(null);
                      setNewSK({ nama_sasaran: '', id_perkin: perkin.id });
                      setIsModalOpen(true);
                    }}
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah SK
                  </Button>
                </div>

                {isExpanded && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {(perkin.sasaran_kegiatans || []).map((sk) => (
                      <motion.div 
                        key={sk.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <Card className="rounded-2xl border-border hover:shadow-lg transition-all group overflow-hidden bg-white">
                          <CardContent className="p-5 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-border group-hover:bg-accent/5 group-hover:border-accent/20 transition-colors">
                              <Target className="w-5 h-5 text-slate-400 group-hover:text-accent transition-colors" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-text-header text-sm leading-relaxed mb-1">{sk.nama_sasaran}</h3>
                              <p className="text-[0.65rem] font-bold text-text-muted uppercase tracking-widest">
                                {sk.iksks?.length || 0} Indikator Kinerja
                              </p>
                            </div>
                            <div className="flex flex-col gap-2">
                              <button 
                                onClick={() => {
                                  setEditingSK(sk);
                                  setNewSK({ nama_sasaran: sk.nama_sasaran, id_perkin: sk.id_perkin });
                                  setIsModalOpen(true);
                                }}
                                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-accent transition-all"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(sk.id)}
                                className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                    {(perkin.sasaran_kegiatans || []).length === 0 && (
                      <div className="col-span-full py-8 px-6 bg-white rounded-2xl border border-dashed border-border text-center">
                        <p className="text-sm text-text-muted font-medium italic">Belum ada Sasaran Kegiatan untuk Perkin ini.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Add/Edit */}
      {ReactDOM.createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl border border-border overflow-hidden"
              >
                <div className="px-8 py-6 bg-slate-50 border-b border-border flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-extrabold text-text-header tracking-tight">
                      {editingSK ? 'Edit Sasaran Kegiatan' : 'Tambah Sasaran Kegiatan'}
                    </h3>
                    <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-1">
                      {perkins.find(p => p.id === newSK.id_perkin)?.nama_perkin}
                    </p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl hover:bg-white transition-colors">
                    <ChevronRight className="w-6 h-6 text-text-muted rotate-90" />
                  </button>
                </div>
                <div className="p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="text-[0.7rem] font-bold text-text-muted uppercase tracking-widest pl-1">Nama Sasaran Kegiatan</label>
                    <textarea 
                      className="w-full rounded-2xl border-border bg-slate-50 p-4 font-semibold text-sm focus:ring-accent focus:border-accent min-h-[120px]"
                      placeholder="Masukkan nama sasaran kegiatan..."
                      value={newSK.nama_sasaran}
                      onChange={(e) => setNewSK({...newSK, nama_sasaran: e.target.value})}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 rounded-2xl h-12 font-bold uppercase tracking-widest text-[0.75rem]" onClick={() => setIsModalOpen(false)}>Batal</Button>
                    <Button className="flex-1 rounded-2xl h-12 font-bold uppercase tracking-widest text-[0.75rem] shadow-lg shadow-accent/20" onClick={handleSave}>Simpan Data</Button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};
