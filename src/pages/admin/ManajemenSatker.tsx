import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Modal } from '../../components/ui/Modal';
import { useSatkerStore } from '../../store/satkerStore';
import { useUserStore } from '../../store/userStore';
import { Building2, Plus, Edit3, Trash2, Search, AlertTriangle, User, Loader2, RefreshCw } from 'lucide-react';
import { Select } from '../../components/ui/Select';

export const ManajemenSatker: React.FC = () => {
  const { satkers, isLoading, error, fetchSatkers, addSatker, updateSatker, deleteSatker } = useSatkerStore();
  const { fetchUsersByRole } = useUserStore();
  const [pimpinanUsers, setPimpinanUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSatker, setSelectedSatker] = useState<any | null>(null);
  const [satkerName, setSatkerName] = useState('');
  const [pimpinanId, setPimpinanId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSatkers();
    fetchUsersByRole('PIMPINAN').then(setPimpinanUsers).catch(() => setPimpinanUsers([]));
  }, [fetchSatkers, fetchUsersByRole]);

  const filteredSatkers = satkers.filter((s) =>
    (s.nama_satker || s.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!satkerName.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await addSatker(satkerName.trim(), pimpinanId ? parseInt(pimpinanId) : undefined);
      setSatkerName('');
      setPimpinanId('');
      setIsAddModalOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menambah satker.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSatker || !satkerName.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await updateSatker(selectedSatker.id, satkerName.trim(), pimpinanId ? parseInt(pimpinanId) : undefined);
      setSatkerName('');
      setPimpinanId('');
      setSelectedSatker(null);
      setIsEditModalOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengubah satker.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSatker || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await deleteSatker(selectedSatker.id);
      setSelectedSatker(null);
      setIsDeleteModalOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus satker.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-2">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-header tracking-tight">Manajemen Satker</h1>
          <p className="text-sm text-text-muted mt-2 font-medium">Kelola daftar Satuan Kerja (Satker) dalam sistem.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="flex gap-3">
          <Button
            variant="outline"
            onClick={fetchSatkers}
            className="rounded-xl h-12 px-4 font-bold uppercase tracking-widest text-[0.7rem] shadow-sm border-border"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => { setSatkerName(''); setPimpinanId(''); setIsAddModalOpen(true); }}
            className="w-full sm:w-auto rounded-xl h-12 px-6 font-bold uppercase tracking-widest text-[0.7rem] shadow-lg shadow-accent/20"
          >
            <Plus className="w-4 h-4 mr-2" /> Tambah Satker
          </Button>
        </motion.div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <div className="relative group max-w-md mx-auto sm:mx-0 px-2">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-accent transition-colors" />
        <Input
          placeholder="Cari Satker..."
          className="pl-12 h-12 rounded-2xl bg-white border-border shadow-sm focus:ring-accent/10 transition-all font-medium py-0"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="p-20 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
          <p className="text-sm font-bold text-text-muted uppercase tracking-widest">Memuat Data Satker...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-2">
          {filteredSatkers.map((satker, index) => (
            <motion.div key={satker.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
              <Card className="rounded-2xl border-border shadow-sm hover:shadow-elegant transition-all duration-300 group overflow-hidden bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-text-header tracking-tight">{satker.nama_satker || satker.name}</h3>
                        <div className="flex flex-col gap-0.5 mt-0.5">
                          <p className="text-[0.65rem] text-text-muted font-bold uppercase tracking-widest">ID: {satker.id}</p>
                          <div className="flex items-center gap-1.5 text-[0.65rem] text-accent font-bold uppercase tracking-widest">
                            <User className="w-3 h-3" />
                            <span>
                              Pimpinan: {pimpinanUsers.find((u) => u.id === (satker.id_pimpinan ?? satker.pimpinan_id))?.nama || 'Belum Ditentukan'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setSelectedSatker(satker); setSatkerName(satker.nama_satker || satker.name || ''); setPimpinanId((satker.id_pimpinan ?? satker.pimpinan_id)?.toString() || ''); setIsEditModalOpen(true); }}
                        className="p-2 rounded-lg text-accent hover:bg-accent/10 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setSelectedSatker(satker); setIsDeleteModalOpen(true); }}
                        className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {filteredSatkers.length === 0 && !isLoading && (
            <div className="col-span-2 p-12 text-center bg-slate-50/50 border border-dashed border-border rounded-3xl">
              <p className="text-text-muted font-medium">
                {searchQuery ? 'Tidak ada satker yang cocok dengan pencarian.' : 'Belum ada satker. Klik "Tambah Satker" untuk memulai.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Tambah Satuan Kerja">
        <form onSubmit={handleAddSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="add-name">Nama Satker</Label>
            <Input id="add-name" placeholder="Masukkan nama satker..." value={satkerName} onChange={(e) => setSatkerName(e.target.value)} className="h-12 rounded-xl" autoFocus />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-pimpinan">Pimpinan Satker</Label>
            <Select
              id="add-pimpinan"
              value={pimpinanId}
              onChange={(e) => setPimpinanId(e.target.value)}
              className="h-12 rounded-xl"
              options={[
                { label: 'Tanpa Pimpinan', value: '' },
                ...pimpinanUsers.map((u) => ({ label: u.nama || String(u.id), value: u.id.toString() })),
              ]}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} className="flex-1 rounded-xl h-12 uppercase font-bold tracking-widest text-[0.7rem]">Batal</Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1 rounded-xl h-12 uppercase font-bold tracking-widest text-[0.7rem]">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Simpan'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Satuan Kerja">
        <form onSubmit={handleEditSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nama Satker</Label>
            <Input id="edit-name" placeholder="Masukkan nama satker..." value={satkerName} onChange={(e) => setSatkerName(e.target.value)} className="h-12 rounded-xl" autoFocus />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-pimpinan">Pimpinan Satker</Label>
            <Select
              id="edit-pimpinan"
              value={pimpinanId}
              onChange={(e) => setPimpinanId(e.target.value)}
              className="h-12 rounded-xl"
              options={[
                { label: 'Tanpa Pimpinan', value: '' },
                ...pimpinanUsers.map((u) => ({ label: u.nama || String(u.id), value: u.id.toString() })),
              ]}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} className="flex-1 rounded-xl h-12 uppercase font-bold tracking-widest text-[0.7rem]">Batal</Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1 rounded-xl h-12 uppercase font-bold tracking-widest text-[0.7rem]">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Konfirmasi Hapus"
        variant="danger"
        description={`Apakah Anda yakin ingin menghapus Satker "${selectedSatker?.nama_satker || selectedSatker?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        footer={
          <div className="flex gap-3 w-full">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} className="flex-1 rounded-xl h-12 uppercase font-bold tracking-widest text-[0.7rem]">Batal</Button>
            <Button onClick={handleDeleteConfirm} disabled={isSubmitting} className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-12 uppercase font-bold tracking-widest text-[0.7rem]">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Hapus Sekarang'}
            </Button>
          </div>
        }
      >
        <div className="flex items-center justify-center p-6 bg-rose-50 rounded-2xl border border-rose-100 mb-2">
          <AlertTriangle className="w-12 h-12 text-rose-500" />
        </div>
      </Modal>
    </div>
  );
};
