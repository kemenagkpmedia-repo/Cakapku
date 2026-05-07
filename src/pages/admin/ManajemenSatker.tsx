import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Modal } from '../../components/ui/Modal';
import { DataTable } from '../../components/ui/DataTable';
import { useSatkerStore } from '../../store/satkerStore';
import { useUserStore } from '../../store/userStore';
import { Building2, Plus, Edit3, Trash2, AlertTriangle, User, Loader2, RefreshCw } from 'lucide-react';
import { Select } from '../../components/ui/Select';

export const ManajemenSatker: React.FC = () => {
  const { satkers, isLoading, error, fetchSatkers, addSatker, updateSatker, deleteSatker } = useSatkerStore();
  const { fetchUsersByRole } = useUserStore();
  const [pimpinanUsers, setPimpinanUsers] = useState<any[]>([]);
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

  const columns = [
    {
      header: 'No.',
      accessor: (_item: any, index: number) => <span className="font-black text-accent">{index}</span>,
      className: 'w-16 text-center'
    },
    {
      header: 'Satuan Kerja',
      accessor: (item: any) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-text-header tracking-tight">{item.nama_satker || item.name}</span>
        </div>
      )
    },
    {
      header: 'Pimpinan',
      accessor: (item: any) => {
        const pimpinan = pimpinanUsers.find((u) => u.id === (item.id_pimpinan ?? item.pimpinan_id));
        return (
          <div className="flex items-center gap-2 text-[0.8rem] font-semibold text-text-main">
            <User className="w-3.5 h-3.5 text-text-muted" />
            <span>{pimpinan?.nama || <span className="text-text-muted italic">Belum Ditentukan</span>}</span>
          </div>
        );
      }
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-header tracking-tight">Manajemen Satker</h1>
          <p className="text-sm text-text-muted mt-2 font-medium">Kelola daftar Satuan Kerja (Satker) dalam sistem.</p>
        </motion.div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={fetchSatkers}
            className="rounded-xl h-12 w-12 p-0 font-bold border-border bg-white"
            title="Refresh"
          >
            <RefreshCw className={isLoading ? 'animate-spin' : ''} />
          </Button>
          <Button
            onClick={() => { setSatkerName(''); setPimpinanId(''); setIsAddModalOpen(true); }}
            className="rounded-xl h-12 px-6 font-bold uppercase tracking-widest text-[0.7rem] shadow-lg shadow-accent/20"
          >
            <Plus className="w-4 h-4 mr-2" /> Tambah Satker
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <DataTable
        columns={columns}
        data={satkers}
        isLoading={isLoading}
        searchPlaceholder="Cari Satker berdasarkan nama..."
        searchKey={(item) => item.nama_satker || item.name || ''}
        emptyMessage="Data Satker tidak ditemukan."
        actions={(satker) => (
          <>
            <button
              onClick={() => { 
                setSelectedSatker(satker); 
                setSatkerName(satker.nama_satker || satker.name || ''); 
                setPimpinanId((satker.id_pimpinan ?? satker.pimpinan_id)?.toString() || ''); 
                setIsEditModalOpen(true); 
              }}
              className="p-2.5 rounded-xl text-accent hover:bg-accent/10 transition-all border border-transparent hover:border-accent/10"
              title="Edit Satker"
            >
              <Edit3 className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={() => { setSelectedSatker(satker); setIsDeleteModalOpen(true); }}
              className="p-2.5 rounded-xl text-rose-500 hover:bg-rose-50 transition-all border border-transparent hover:border-rose-100"
              title="Hapus Satker"
            >
              <Trash2 className="w-4.5 h-4.5" />
            </button>
          </>
        )}
      />

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
