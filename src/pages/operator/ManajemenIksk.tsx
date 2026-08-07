import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { usePerkinStore } from '../../store/perkinStore';
import { Activity, Plus, Pencil, Trash2, RefreshCw, ChevronRight, Target, Info, ChevronDown, FileText } from 'lucide-react';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { cn } from '../../utils/cn';

export const ManajemenIksk: React.FC = () => {
  const { 
    perkins, 
    fetchPerkins, 
    fetchPeriodes, 
    periods,
    isLoadingPerkins,
    addIksk,
    updateIksk,
    deleteIksk
  } = usePerkinStore();

  const [selectedSKId, setSelectedSKId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIKSK, setEditingIKSK] = useState<{ id: number; indikator: string; target_vol: string; target_satuan: string; id_sasaran_kegiatan: number } | null>(null);
  const [newIKSK, setNewIKSK] = useState({ 
    indikator: '', 
    target_vol: '', 
    target_satuan: '', 
    id_sasaran_kegiatan: 0 
  });
  const [expandedSKIds, setExpandedSKIds] = useState<number[]>([]);
  const [expandedPerkinIds, setExpandedPerkinIds] = useState<number[]>([]);

  useEffect(() => {
    fetchPeriodes();
    fetchPerkins();
  }, [fetchPeriodes, fetchPerkins]);

  const allSKs = perkins.flatMap(p => p.sasaran_kegiatans || []);
  
  // Filter perkins that contain matching sasaran_kegiatans
  const filteredPerkins = perkins
    .map(p => ({
      ...p,
      sasaran_kegiatans: (p.sasaran_kegiatans || []).filter(
        sk => !selectedSKId || sk.id === Number(selectedSKId)
      )
    }))
    .filter(p => p.sasaran_kegiatans.length > 0);

  const toggleExpandSK = (id: number) => {
    setExpandedSKIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleExpandPerkin = (id: number) => {
    setExpandedPerkinIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const expandAll = () => {
    setExpandedPerkinIds(filteredPerkins.map(p => p.id));
    setExpandedSKIds(filteredPerkins.flatMap(p => p.sasaran_kegiatans.map(sk => sk.id)));
  };

  const collapseAll = () => {
    setExpandedPerkinIds([]);
    setExpandedSKIds([]);
  };

  const handleSave = async () => {
    try {
      if (editingIKSK) {
        await updateIksk(editingIKSK.id, { 
          indikator: newIKSK.indikator,
          target_vol: newIKSK.target_vol,
          target_satuan: newIKSK.target_satuan
        });
      } else {
        await addIksk(newIKSK);
      }
      setIsModalOpen(false);
      setEditingIKSK(null);
      setNewIKSK({ indikator: '', target_vol: '', target_satuan: '', id_sasaran_kegiatan: 0 });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan Indikator Kinerja.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus Indikator Kinerja ini?')) return;
    try {
      await deleteIksk(id);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus data.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-text-header tracking-tight flex items-center gap-3">
            <Activity className="w-8 h-8 text-accent" />
            Manajemen Indikator Kinerja (IKSK)
          </h1>
          <p className="text-sm text-text-muted mt-2 font-medium">Kelola indikator dan target capaian untuk setiap Sasaran Kegiatan.</p>
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="w-80 space-y-1.5">
            <label className="text-[0.65rem] font-bold text-text-muted uppercase tracking-widest pl-1">Pilih Sasaran Kegiatan (SK)</label>
            <Select
              placeholder="Semua Sasaran Kegiatan..."
              className="h-11 rounded-xl bg-white border-border shadow-sm text-[0.75rem] font-bold"
              value={selectedSKId}
              onChange={(e) => setSelectedSKId(e.target.value)}
              options={allSKs.map((sk) => ({ label: sk.nama_sasaran, value: String(sk.id) }))}
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
          <p className="text-sm font-bold text-text-muted uppercase tracking-widest">Memuat Data IKSK...</p>
        </div>
      ) : filteredPerkins.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center border-dashed border-2 border-border rounded-[2.5rem] bg-white">
          <Activity className="w-16 h-16 text-slate-200 mb-4" />
          <h3 className="text-xl font-bold text-text-header">Belum ada Sasaran Kegiatan</h3>
          <p className="text-text-muted mt-2">Silakan buat atau import SK terlebih dahulu.</p>
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
            const isPerkinExpanded = expandedPerkinIds.includes(perkin.id);
            return (
              <div key={perkin.id} className="space-y-4 bg-white p-6 rounded-[2rem] border border-border shadow-sm">
                <div 
                  onClick={() => toggleExpandPerkin(perkin.id)}
                  className="flex items-center gap-3 cursor-pointer select-none group/perkin"
                >
                  <ChevronDown className={cn("w-5 h-5 text-text-muted transition-transform duration-300", isPerkinExpanded ? "transform rotate-0" : "transform -rotate-90")} />
                  <div className="p-2 bg-accent/10 rounded-lg group-hover/perkin:bg-accent/20 transition-colors">
                    <FileText className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-extrabold text-text-header tracking-tight group-hover/perkin:text-accent transition-colors">{perkin.nama_perkin}</h2>
                    <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-0.5">
                      {periods.find(p => p.id === perkin.id_periode)?.tahun} • {perkin.no_sk || 'No SK Belum Diatur'}
                    </p>
                  </div>
                </div>

                {isPerkinExpanded && (
                  <div className="pl-6 space-y-6 pt-2 border-l-2 border-slate-100 ml-5 animate-in fade-in duration-300">
                    {perkin.sasaran_kegiatans.map((sk) => {
                      const isExpanded = expandedSKIds.includes(sk.id);
                      return (
                        <div key={sk.id} className="space-y-4 bg-slate-50/40 p-5 rounded-3xl border border-border/40">
                          <div 
                            onClick={() => toggleExpandSK(sk.id)}
                            className="flex items-center gap-3 px-4 cursor-pointer select-none group/hdr"
                          >
                            <ChevronDown className={cn("w-5 h-5 text-text-muted transition-transform duration-300", isExpanded ? "transform rotate-0" : "transform -rotate-90")} />
                            <div className="p-2 bg-accent/10 rounded-lg group-hover/hdr:bg-accent/20 transition-colors">
                              <Target className="w-5 h-5 text-accent" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-md font-bold text-text-header tracking-tight group-hover/hdr:text-accent transition-colors">{sk.nama_sasaran}</h3>
                            </div>
                            <Button 
                              size="sm" 
                              className="rounded-lg h-9 text-[0.65rem] font-bold uppercase tracking-widest gap-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingIKSK(null);
                                setNewIKSK({ indikator: '', target_vol: '', target_satuan: '', id_sasaran_kegiatan: sk.id });
                                setIsModalOpen(true);
                              }}
                            >
                              <Plus className="w-3.5 h-3.5" /> Tambah IKSK
                            </Button>
                          </div>

                          {isExpanded && (
                            <div className="bg-white rounded-[2rem] border border-border shadow-sm overflow-hidden animate-in fade-in duration-300">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="bg-slate-50 border-b border-border">
                                    <th className="py-4 px-8 text-left text-[0.65rem] font-bold text-text-muted uppercase tracking-widest w-12">No</th>
                                    <th className="py-4 px-6 text-left text-[0.65rem] font-bold text-text-muted uppercase tracking-widest">Indikator Kinerja</th>
                                    <th className="py-4 px-6 text-center text-[0.65rem] font-bold text-text-muted uppercase tracking-widest w-32">Target</th>
                                    <th className="py-4 px-6 text-center text-[0.65rem] font-bold text-text-muted uppercase tracking-widest w-32">Satuan</th>
                                    <th className="py-4 px-6 text-right text-[0.65rem] font-bold text-text-muted uppercase tracking-widest w-24">Aksi</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-border/40">
                                  {(sk.iksks || []).map((iksk, idx) => (
                                    <tr key={iksk.id} className="hover:bg-slate-50/30 transition-colors group/row">
                                      <td className="py-4 px-8 text-text-muted/60 font-black text-xs">{idx + 1}</td>
                                      <td className="py-4 px-6 font-semibold text-text-main leading-relaxed">{iksk.indikator}</td>
                                      <td className="py-4 px-6 text-center font-extrabold text-text-header group-hover/row:text-accent transition-colors">{iksk.target_vol}</td>
                                      <td className="py-4 px-6 text-center">
                                        <span className="px-3 py-1 bg-slate-100 rounded-lg text-text-muted font-bold text-[0.65rem] uppercase tracking-widest group-hover/row:bg-accent/10 group-hover/row:text-accent transition-all">
                                          {iksk.target_satuan}
                                        </span>
                                      </td>
                                      <td className="py-4 px-6 text-right">
                                        <div className="flex justify-end gap-1">
                                          <button 
                                            onClick={() => {
                                              setEditingIKSK(iksk as any);
                                              setNewIKSK({ 
                                                indikator: iksk.indikator, 
                                                target_vol: iksk.target_vol || '', 
                                                target_satuan: iksk.target_satuan || '', 
                                                id_sasaran_kegiatan: sk.id 
                                              });
                                              setIsModalOpen(true);
                                            }}
                                            className="p-2 rounded-lg text-slate-300 hover:text-accent hover:bg-accent/5 transition-all"
                                          >
                                            <Pencil className="w-3.5 h-3.5" />
                                          </button>
                                          <button 
                                            onClick={() => handleDelete(iksk.id)}
                                            className="p-2 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                  {(sk.iksks || []).length === 0 && (
                                    <tr>
                                      <td colSpan={5} className="py-8 text-center text-sm text-text-muted italic">Belum ada indikator yang ditambahkan.</td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      );
                    })}
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
                className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl border border-border overflow-hidden"
              >
                <div className="px-8 py-6 bg-slate-50 border-b border-border flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-extrabold text-text-header tracking-tight">
                      {editingIKSK ? 'Edit Indikator Kinerja' : 'Tambah Indikator Kinerja'}
                    </h3>
                    <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-1">
                      {allSKs.find(sk => sk.id === newIKSK.id_sasaran_kegiatan)?.nama_sasaran}
                    </p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl hover:bg-white transition-colors">
                    <ChevronRight className="w-6 h-6 text-text-muted rotate-90" />
                  </button>
                </div>
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[0.7rem] font-bold text-text-muted uppercase tracking-widest pl-1">Indikator Kinerja (IKSK)</label>
                  <textarea 
                    className="w-full rounded-2xl border-border bg-slate-50 p-4 font-semibold text-sm focus:ring-accent focus:border-accent min-h-[100px]"
                    placeholder="Masukkan nama indikator kinerja..."
                    value={newIKSK.indikator}
                    onChange={(e) => setNewIKSK({...newIKSK, indikator: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[0.7rem] font-bold text-text-muted uppercase tracking-widest pl-1">Target Volume</label>
                    <Input 
                      className="rounded-2xl border-border bg-slate-50 h-12 font-bold px-4"
                      placeholder="Contoh: 100"
                      value={newIKSK.target_vol}
                      onChange={(e) => setNewIKSK({...newIKSK, target_vol: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[0.7rem] font-bold text-text-muted uppercase tracking-widest pl-1">Satuan</label>
                    <Input 
                      className="rounded-2xl border-border bg-slate-50 h-12 font-bold px-4"
                      placeholder="Contoh: %, Dokumen, Laporan"
                      value={newIKSK.target_satuan}
                      onChange={(e) => setNewIKSK({...newIKSK, target_satuan: e.target.value})}
                    />
                  </div>
                </div>
                <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 flex items-start gap-3">
                  <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <p className="text-[0.75rem] text-text-muted font-medium leading-relaxed">
                    Pastikan indikator yang dimasukkan terukur dan memiliki target yang jelas untuk memudahkan evaluasi kinerja di akhir periode.
                  </p>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="flex-1 rounded-2xl h-12 font-bold uppercase tracking-widest text-[0.75rem]" onClick={() => setIsModalOpen(false)}>Batal</Button>
                  <Button className="flex-1 rounded-2xl h-12 font-bold uppercase tracking-widest text-[0.75rem] shadow-lg shadow-accent/20" onClick={handleSave}>Simpan Indikator</Button>
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
