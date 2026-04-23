import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useKinerjaStore } from '../../store/kinerjaStore';
import { CheckSquare, Clock, Trash2, Edit3, FileText, Plus, AlertTriangle } from 'lucide-react';

export const RiwayatKinerja: React.FC = () => {
  const { records, deleteRecord, setEditingId } = useKinerjaStore();
  const navigate = useNavigate();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  const handleEdit = (id: string) => {
    setEditingId(id);
    navigate('/user/kinerja');
  };

  const confirmDelete = (id: string) => {
    setRecordToDelete(id);
    setDeleteModalOpen(true);
  };

  const executeDelete = () => {
    if (recordToDelete) {
      deleteRecord(recordToDelete);
      setDeleteModalOpen(false);
      setRecordToDelete(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-2">
        <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.4 }}
           className="text-center sm:text-left"
        >
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-header tracking-tight">Riwayat Kinerja</h1>
          <p className="text-sm text-text-muted mt-2 font-medium">Daftar lengkap aktivitas kerja yang telah Anda laporkan.</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex justify-center sm:justify-end"
        >
          <Button 
            onClick={() => {
              setEditingId(null);
              navigate('/user/kinerja');
            }}
            className="w-full sm:w-auto rounded-xl h-12 px-6 font-bold uppercase tracking-widest text-[0.7rem] shadow-lg shadow-accent/20 hover:shadow-xl transition-all"
          >
            <Plus className="w-4 h-4 mr-2" /> Tambah Kinerja
          </Button>
        </motion.div>
      </div>

      <div className="space-y-4">
        {records.length === 0 ? (
          <div className="p-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-border flex flex-col items-center justify-center shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300">
              <Plus className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-extrabold text-text-header">Belum Ada Riwayat</h3>
            <p className="text-sm text-text-muted mt-2 max-w-xs font-medium">
              Anda belum mencatatkan aktivitas kinerja apapun. Mulai hari ini dengan melaporkan progres kerja Anda.
            </p>
          </div>
        ) : (
          records.map((record, index) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="rounded-2xl border-border shadow-elegant overflow-hidden group hover:border-accent/40 transition-all duration-300 bg-white">
                <CardContent className="p-0">
                  <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8">
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-border flex items-center justify-center shrink-0 group-hover:bg-accent/5 group-hover:border-accent/20 transition-colors self-start">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                        <CheckSquare className="w-5 h-5" />
                      </div>
                    </div>
                    
                    <div className="flex-1 space-y-5">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="space-y-1">
                          <h4 className="font-extrabold text-text-header text-[1.125rem] tracking-tight leading-snug">
                            {record.uraian_pekerjaan}
                          </h4>
                          <div className="flex items-center gap-2 mt-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                             <p className="text-[0.7rem] text-accent font-bold uppercase tracking-widest">
                               {record.perkin_name}
                             </p>
                          </div>
                        </div>
                        <div className="flex shrink-0">
                          <span className="text-[0.65rem] sm:text-[0.7rem] px-3 sm:px-4 py-1.5 rounded-full bg-slate-100 text-text-header border border-slate-200 font-extrabold uppercase tracking-widest shadow-sm">
                            {record.tanggal}
                          </span>
                        </div>
                      </div>
                      
                      <div className="bg-slate-50/50 rounded-2xl p-4 sm:p-6 border border-slate-100">
                        <p className="text-[0.875rem] sm:text-[0.9375rem] text-text-main font-medium leading-relaxed italic opacity-80">
                          "{record.uraian_pekerjaan}"
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6 pt-2">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 text-[0.8rem] text-text-muted font-bold">
                          <span className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/50">
                            <Clock className="w-4 h-4 text-accent" /> 
                            {record.waktu}
                          </span>
                          <span className="flex items-center gap-2.5 px-2">
                            <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${['Hadir di Kantor', 'Dinas Luar', 'Work From Home / Work From Anywhere'].includes(record.status_kehadiran) ? 'bg-emerald-500' : 'bg-rose-500'}`} /> 
                            {record.status_kehadiran}
                          </span>
                          <span className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/50">
                            <span className="text-accent">Vol:</span> {record.volume} {record.satuan}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 border-t sm:border-t-0 pt-4 sm:pt-0">
                          <button 
                            onClick={() => handleEdit(record.id)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-[0.75rem] font-bold text-accent px-4 py-2.5 hover:bg-accent/10 rounded-xl transition-all border border-transparent hover:border-accent/20"
                          >
                            <Edit3 className="w-4 h-4" /> EDIT
                          </button>
                          <button 
                            onClick={() => confirmDelete(record.id)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-[0.75rem] font-bold text-rose-500 px-4 py-2.5 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-200"
                          >
                            <Trash2 className="w-4 h-4" /> HAPUS
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}

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
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)} className="rounded-xl px-6 font-bold uppercase tracking-widest text-[0.7rem]">
              Batal
            </Button>
            <Button onClick={executeDelete} className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl px-6 font-bold uppercase tracking-widest text-[0.7rem]">
              Hapus Sekarang
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
