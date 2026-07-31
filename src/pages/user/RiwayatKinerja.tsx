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

  useEffect(() => {
    fetchKinerja(filterMonth, filterYear);
  }, [fetchKinerja, filterMonth, filterYear]);

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
    <div className="w-full pb-12 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="text-center sm:text-left">
          <h1 className="text-xl sm:text-2xl font-semibold text-text-header tracking-tight">Riwayat Kinerja</h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">Daftar lengkap aktivitas kerja yang telah Anda laporkan.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="flex justify-center sm:justify-end gap-2.5">
          <Button
            variant="outline"
            onClick={() => fetchKinerja(filterMonth, filterYear)}
            className="rounded-xl h-11 px-4 font-medium border-border"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => { setEditingId(null); navigate('/user/kinerja'); }}
            className="w-full sm:w-auto rounded-xl h-11 px-5 font-semibold text-xs tracking-wide shadow-lg shadow-accent/10 hover:shadow-xl transition-all"
          >
            <Plus className="w-4.5 h-4.5 mr-1.5" /> Tambah Kinerja
          </Button>
        </motion.div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
          <button onClick={() => fetchKinerja(filterMonth, filterYear)} className="ml-auto"><RefreshCw className="w-4 h-4" /></button>
        </div>
      )}

      {/* Month & Year Filter Toolbar */}
      <div className="bg-white p-4 sm:p-5 border border-border rounded-2xl shadow-sm flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1 w-full space-y-1">
          <label className="text-xs font-medium text-text-muted">Filter Bulan Laporan</label>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="w-full h-11 px-4 rounded-xl border border-border bg-white text-text-header font-medium focus:outline-none focus:ring-2 focus:ring-accent/10 focus:border-accent transition-all text-sm"
          >
            {months.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 w-full space-y-1">
          <label className="text-xs font-medium text-text-muted">Filter Tahun Laporan</label>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="w-full h-11 px-4 rounded-xl border border-border bg-white text-text-header font-medium focus:outline-none focus:ring-2 focus:ring-accent/10 focus:border-accent transition-all text-sm"
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
                <span className="text-xs text-text-muted font-medium whitespace-nowrap">{item.tanggal}</span>
              ),
              className: 'w-28'
            },

            {
              header: 'Uraian Pekerjaan',
              accessor: (item: any) => (
                <div className="text-sm font-medium text-text-header leading-relaxed break-words">
                  {item.uraian_pekerjaan}
                </div>
              ),
              className: 'min-w-[180px]'
            },
            {
              header: 'Indikator (IKSK)',
              accessor: (item: any) => (
                <div className="text-xs text-text-muted leading-relaxed line-clamp-2" title={item.iksk_name || item.iksk?.indikator}>
                  {item.iksk_name || item.iksk?.indikator || '-'}
                </div>
              ),
              className: 'hidden lg:table-cell w-1/4'
            },
            {
              header: 'Kehadiran',
              accessor: (item: any) => (
                <span className={cn(
                  "text-[0.7rem] font-medium px-2.5 py-0.5 rounded-full border inline-block whitespace-nowrap",
                  item.status_kehadiran?.includes('Hadir') 
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                    : "bg-amber-50 text-amber-600 border-amber-100"
                )}>
                  {item.status_kehadiran}
                </span>
              ),
              className: 'w-28 text-center hidden sm:table-cell'
            }
          ]}
          data={records}
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

        <div className="p-6 bg-surface border border-border rounded-2xl flex items-start gap-4 shadow-sm">
          <div className="w-9 h-9 rounded-full bg-accent/5 flex items-center justify-center text-accent shrink-0 border border-accent/10">
            <FileText className="w-4.5 h-4.5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-header tracking-tight">Informasi Pelaporan</p>
            <p className="text-xs text-text-muted mt-1.5 leading-relaxed">
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
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)} className="rounded-xl px-5 font-semibold text-xs tracking-wide">Batal</Button>
            <Button onClick={executeDelete} disabled={isDeleting} className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl px-5 font-semibold text-xs tracking-wide">
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Hapus Sekarang'}
            </Button>
          </>
        }
      >
        <div className="flex items-center justify-center p-4 bg-rose-50 rounded-xl border border-rose-100 mb-2">
          <AlertTriangle className="w-10 h-10 text-rose-500" />
        </div>
      </Modal>
    </div>
  );
};
