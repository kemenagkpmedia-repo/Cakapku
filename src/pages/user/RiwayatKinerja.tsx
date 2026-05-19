import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useKinerjaStore } from '../../store/kinerjaStore';
import { CheckSquare, Clock, Trash2, Edit3, FileText, Plus, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { DataTable } from '../../components/ui/DataTable';
import { cn } from '../../utils/cn';

export const RiwayatKinerja: React.FC = () => {
  const { records, isLoading, error, fetchKinerja, deleteRecord, setEditingId } = useKinerjaStore();
  const navigate = useNavigate();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [filterMonth, setFilterMonth] = useState<string>(() => String(new Date().getMonth() + 1).padStart(2, '0'));
  const [filterYear, setFilterYear] = useState<string>(() => String(new Date().getFullYear()));

  const months = [
    { value: '01', label: 'Januari' },
    { value: '02', label: 'Februari' },
    { value: '03', label: 'Maret' },
    { value: '04', label: 'April' },
    { value: '05', label: 'Mei' },
    { value: '06', label: 'Juni' },
    { value: '07', label: 'Juli' },
    { value: '08', label: 'Agustus' },
    { value: '09', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' }
  ];

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    const result = [];
    for (let y = current - 4; y <= current + 1; y++) {
      result.push(String(y));
    }
    return result;
  }, []);

  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      if (!record.tanggal) return false;
      const [year, month] = record.tanggal.split('-');
      return year === filterYear && month === filterMonth;
    });
  }, [records, filterMonth, filterYear]);

  useEffect(() => {
    fetchKinerja();
  }, [fetchKinerja]);

  const handleEdit = (id: number) => {
    setEditingId(id);
    navigate('/user/kinerja');
  };

  const confirmDelete = (id: number) => {
    setRecordToDelete(id);
    setDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!recordToDelete) return;
    setIsDeleting(true);
    try {
      await deleteRecord(recordToDelete);
      setDeleteModalOpen(false);
      setRecordToDelete(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus laporan kinerja.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-2">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-header tracking-tight">Riwayat Kinerja</h1>
          <p className="text-sm text-text-muted mt-2 font-medium">Daftar lengkap aktivitas kerja yang telah Anda laporkan.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="flex justify-center sm:justify-end gap-3">
          <Button
            variant="outline"
            onClick={fetchKinerja}
            className="rounded-xl h-12 px-4 font-bold border-border"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => { setEditingId(null); navigate('/user/kinerja'); }}
            className="w-full sm:w-auto rounded-xl h-12 px-6 font-bold uppercase tracking-widest text-[0.7rem] shadow-lg shadow-accent/20 hover:shadow-xl transition-all"
          >
            <Plus className="w-4 h-4 mr-2" /> Tambah Kinerja
          </Button>
        </motion.div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
          <button onClick={fetchKinerja} className="ml-auto"><RefreshCw className="w-4 h-4" /></button>
        </div>
      )}

      {/* Month & Year Filter Toolbar */}
      <div className="bg-white p-5 border border-border rounded-3xl shadow-sm flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1 w-full space-y-1.5">
          <label className="text-[0.65rem] font-bold text-text-muted uppercase tracking-widest">Filter Bulan Laporan</label>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="w-full h-11 px-4 rounded-xl border border-border bg-white text-text-header font-semibold focus:outline-none focus:ring-2 focus:ring-accent/10 focus:border-accent transition-all text-sm"
          >
            {months.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 w-full space-y-1.5">
          <label className="text-[0.65rem] font-bold text-text-muted uppercase tracking-widest">Filter Tahun Laporan</label>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="w-full h-11 px-4 rounded-xl border border-border bg-white text-text-header font-semibold focus:outline-none focus:ring-2 focus:ring-accent/10 focus:border-accent transition-all text-sm"
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <DataTable
          columns={[
            {
              header: 'Tanggal',
              accessor: (item: any) => (
                <div className="flex flex-col">
                  <span className="text-[0.75rem] font-black text-text-header uppercase tracking-widest">{item.tanggal}</span>
                  {item.waktu && (
                    <span className="text-[0.6rem] font-bold text-text-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {item.waktu}
                    </span>
                  )}
                </div>
              ),
              className: 'w-32'
            },
            {
              header: 'Pekerjaan',
              accessor: (item: any) => (
                <div className="space-y-1">
                  <div className="font-extrabold text-text-header text-[0.9rem] tracking-tight leading-snug line-clamp-2">
                    {item.uraian_pekerjaan}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                    <p className="text-[0.65rem] text-accent font-bold uppercase tracking-widest truncate">
                      {item.perkin_name || item.iksk?.perkin?.nama_perkin || 'Perkin'}
                    </p>
                  </div>
                </div>
              )
            },
            {
              header: 'Indikator',
              accessor: (item: any) => (
                <p className="text-[0.7rem] text-text-muted font-medium line-clamp-2 max-w-[200px]">
                  {item.iksk_name || item.iksk?.indikator || ''}
                </p>
              )
            },
            {
              header: 'Kehadiran',
              accessor: (item: any) => (
                <span className={cn(
                  "text-[0.6rem] font-black uppercase tracking-widest px-2 py-1 rounded-md border inline-block whitespace-nowrap",
                  item.status_kehadiran?.includes('Hadir') 
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                    : "bg-amber-50 text-amber-600 border-amber-100"
                )}>
                  {item.status_kehadiran}
                </span>
              ),
              className: 'w-32 text-center'
            }
          ]}
          data={filteredRecords}
          isLoading={isLoading}
          searchPlaceholder="Cari riwayat pekerjaan..."
          searchKey={(item) => `${item.uraian_pekerjaan} ${item.tanggal}`}
          emptyMessage="Belum ada riwayat kinerja terinput."
          actions={(item) => (
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleEdit(item.id)}
                className="p-2 rounded-lg text-accent hover:bg-accent/10 transition-all"
                title="Edit"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => confirmDelete(item.id)}
                className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition-all"
                title="Hapus"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        />

        <div className="p-8 bg-surface border border-border rounded-3xl flex items-start gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-accent/5 flex items-center justify-center text-accent shrink-0 border border-accent/10">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-extrabold text-text-header tracking-tight">Informasi Pelaporan</p>
            <p className="text-[0.75rem] text-text-muted mt-2 font-medium leading-relaxed">
              Setiap laporan kinerja yang Anda kirimkan bersifat permanen namun dapat diubah selama belum divalidasi oleh Atasan Langsung. Pastikan data yang dimasukkan sesuai dengan output pekerjaan yang dihasilkan.
            </p>
          </div>
        </div>
      </div>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Konfirmasi Hapus"
        variant="danger"
        description="Apakah Anda yakin ingin menghapus data kinerja ini? Tindakan ini tidak dapat dibatalkan."
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)} className="rounded-xl px-6 font-bold uppercase tracking-widest text-[0.7rem]">Batal</Button>
            <Button onClick={executeDelete} disabled={isDeleting} className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl px-6 font-bold uppercase tracking-widest text-[0.7rem]">
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Hapus Sekarang'}
            </Button>
          </>
        }
      >
        <div className="flex items-center justify-center p-4 bg-rose-50 rounded-2xl border border-rose-100 mb-2">
          <AlertTriangle className="w-12 h-12 text-rose-500" />
        </div>
      </Modal>
    </div>
  );
};
