import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Select } from '../../components/ui/Select';
import { usePerkinStore } from '../../store/perkinStore';
import { useAuthStore } from '../../store/authStore';
import { useKinerjaStore } from '../../store/kinerjaStore';
import { Modal } from '../../components/ui/Modal';
import { AlertCircle, CheckCircle, Edit3, FileText, PartyPopper, Loader2 } from 'lucide-react';

export const InputKinerja: React.FC = () => {
  const { perkins, iksks, fetchPerkins, fetchPeriodes, fetchIksks, getFilteredPerkins } = usePerkinStore();
  const { user } = useAuthStore();
  const { addRecord, updateRecord, setEditingId, editingId, fetchKinerja, records } = useKinerjaStore();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm();
  const [ikskOptions, setIkskOptions] = useState<{ id: number; indikator: string; target_vol?: string; target_satuan?: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  // Load data dari API saat mount
  useEffect(() => {
    fetchPerkins();
    fetchPeriodes();
    fetchIksks();
    fetchKinerja();
  }, [fetchPerkins, fetchPeriodes, fetchIksks, fetchKinerja]);

  // Filter perkins berdasarkan satker user dan periode aktif
  const filteredPerkins = (getFilteredPerkins() || []).filter((p) => {
    const userSatkerId = user?.id_satker || user?.satker_id;
    return p.satker_ids && userSatkerId ? p.satker_ids.includes(Number(userSatkerId)) : false;
  });

  const selectedPerkinId = watch('perkin_id');

  // Dependent dropdown: IKSK berdasarkan perkin yang dipilih
  useEffect(() => {
    if (selectedPerkinId) {
      const perkin = filteredPerkins.find((p) => String(p.id) === String(selectedPerkinId));
      const perkinIksks = perkin?.iksk || perkin?.iksks || [];
      setIkskOptions(perkinIksks as any);
    } else {
      setIkskOptions([]);
    }
  }, [selectedPerkinId, perkins]);

  const selectedIkskId = watch('iksk_id');

  // Auto-fill volume dan satuan dari IKSK yang dipilih
  useEffect(() => {
    if (selectedIkskId && ikskOptions.length > 0) {
      const selectedIksk = ikskOptions.find((i) => String(i.id) === String(selectedIkskId));
      if (selectedIksk && !editingId) {
        setValue('volume', selectedIksk.target_vol || '');
        setValue('satuan', selectedIksk.target_satuan || '');
      }
    }
  }, [selectedIkskId, ikskOptions, setValue, editingId]);

  // Isi form saat edit
  useEffect(() => {
    if (editingId) {
      const record = records.find((r) => r.id === editingId);
      if (record) {
        setValue('tanggal', record.tanggal);
        setValue('perkin_id', record.perkin_id || record.iksk?.perkin?.id);
        setValue('status_kehadiran', record.status_kehadiran);
        setValue('uraian_pekerjaan', record.uraian_pekerjaan);
        setTimeout(() => {
          setValue('iksk_id', record.id_iksk || record.iksk_id);
          setValue('volume', record.volume || record.iksk?.target_vol);
          setValue('satuan', record.satuan || record.iksk?.target_satuan);
        }, 100);
      }
    }
  }, [editingId, records, setValue]);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const payload = {
        tanggal: data.tanggal,
        id_iksk: Number(data.iksk_id),
        uraian_pekerjaan: data.uraian_pekerjaan,
        status_kehadiran: data.status_kehadiran,
      };

      if (editingId) {
        await updateRecord(editingId, {
          uraian_pekerjaan: payload.uraian_pekerjaan,
          status_kehadiran: payload.status_kehadiran,
        });
        setEditingId(null);
      } else {
        await addRecord(payload);
      }

      setSuccessModalOpen(true);
      reset();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan laporan kinerja.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (filteredPerkins.length === 0 && perkins.length > 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] p-8 text-center bg-white rounded-3xl border border-dashed border-border shadow-sm">
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-rose-100 animate-pulse">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-extrabold text-text-header tracking-tight">Perkin Belum Tersedia</h2>
        <p className="text-text-muted mt-3 max-w-md font-medium text-[0.9375rem] leading-relaxed">
          Sistem mendeteksi bahwa belum ada <span className="text-accent font-bold">Perjanjian Kinerja Aktif</span> yang di-plotting untuk Satuan Kerja Anda. Hal ini bisa terjadi jika periode belum dibuat atau dinonaktifkan oleh Operator.
        </p>
        <Button variant="outline" className="mt-8 rounded-xl px-8 h-12 font-bold uppercase tracking-widest text-[0.7rem] border-border hover:bg-slate-50">Hubungi Administrator</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-12">
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-center">
          <h1 className="text-3xl font-extrabold text-text-header tracking-tight">Catat Aktivitas</h1>
          <p className="text-sm text-text-muted mt-2 font-medium">Laporkan kinerja harian Anda secara akurat dan tepat waktu.</p>
        </motion.div>

        <Card className="rounded-[2rem] border-border shadow-blue overflow-hidden bg-white">
          <CardHeader className="bg-surface border-b border-border px-6 sm:px-10 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <CardTitle className="text-lg font-extrabold flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent animate-pulse-slow flex items-center justify-center text-white shrink-0">
                  <Edit3 className="w-5 h-5" />
                </div>
                {editingId ? 'Edit Laporan Kinerja' : 'Form Laporan Harian'}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 sm:p-10">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label htmlFor="tanggal" className="text-[0.7rem] font-bold text-text-muted uppercase tracking-widest pl-1">Tanggal Aktivitas</Label>
                  <Input
                    id="tanggal"
                    type="date"
                    className="h-14 rounded-2xl bg-slate-50 border-border font-semibold focus:ring-accent/20 focus:bg-white transition-all shadow-sm"
                    {...register('tanggal', { required: 'Tanggal wajib diisi' })}
                  />
                  {errors.tanggal && <p className="text-[0.7rem] text-rose-500 font-bold mt-2 flex items-center gap-1.5 pl-1"><AlertCircle className="w-4 h-4" /> {errors.tanggal.message as string}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status_kehadiran" className="text-[0.7rem] font-bold text-text-muted uppercase tracking-widest pl-1">Status Kehadiran</Label>
                  <Select
                    id="status_kehadiran"
                    placeholder="Pilih status..."
                    options={[
                      { label: 'Hadir di Kantor', value: 'Hadir di Kantor' },
                      { label: 'Dinas Luar', value: 'Dinas Luar' },
                      { label: 'Work From Home / Work From Anywhere', value: 'Work From Home / Work From Anywhere' },
                      { label: 'Cuti Tahunan', value: 'Cuti Tahunan' },
                      { label: 'Cuti Alasan Penting', value: 'Cuti Alasan Penting' },
                      { label: 'Cuti Sakit', value: 'Cuti Sakit' },
                      { label: 'Cuti Bersalin', value: 'Cuti Bersalin' },
                      { label: 'Cuti Besar', value: 'Cuti Besar' },
                      { label: 'Cuti Bersama', value: 'Cuti Bersama' },
                      { label: 'Tugas Belajar', value: 'Tugas Belajar' },
                    ]}
                    className="h-14 rounded-2xl bg-slate-50 font-semibold shadow-sm"
                    {...register('status_kehadiran', { required: 'Status wajib dipilih' })}
                  />
                  {errors.status_kehadiran && <p className="text-[0.7rem] text-rose-500 font-bold mt-2 flex items-center gap-1.5 pl-1"><AlertCircle className="w-4 h-4" /> {errors.status_kehadiran.message as string}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="perkin_id" className="text-[0.7rem] font-bold text-text-muted uppercase tracking-widest pl-1">Sasaran Kegiatan (SK) / Perjanjian Kinerja (Perkin)</Label>
                <Select
                  id="perkin_id"
                  placeholder="Klik untuk memilih Sasaran Kegiatan (SK)..."
                  options={filteredPerkins.map((p) => ({ label: p.nama_perkin || p.name || '', value: p.id }))}
                  className="h-14 rounded-2xl bg-slate-50 font-semibold shadow-sm"
                  {...register('perkin_id', { required: 'Sasaran Kegiatan wajib dipilih' })}
                />
                {errors.perkin_id && <p className="text-[0.7rem] text-rose-500 font-bold mt-2 flex items-center gap-1.5 pl-1"><AlertCircle className="w-4 h-4" /> {errors.perkin_id.message as string}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="iksk_id" className="text-[0.7rem] font-bold text-text-muted uppercase tracking-widest pl-1">Indikator Kinerja (IKSK) dari SK Terpilih</Label>
                <Select
                  id="iksk_id"
                  placeholder={selectedPerkinId ? 'Pilih Indikator Kinerja (IKSK) yang dilakukan...' : 'Silakan pilih Sasaran Kegiatan (SK) terlebih dahulu'}
                  options={ikskOptions.map((i) => ({ label: i.indikator || (i as any).name || '', value: i.id }))}
                  disabled={!selectedPerkinId || ikskOptions.length === 0}
                  className="h-14 rounded-2xl bg-slate-50 font-semibold shadow-sm"
                  {...register('iksk_id', { required: 'Indikator Kinerja (IKSK) wajib dipilih' })}
                />
                {errors.iksk_id && <p className="text-[0.7rem] text-rose-500 font-bold mt-2 flex items-center gap-1.5 pl-1"><AlertCircle className="w-4 h-4" /> {errors.iksk_id.message as string}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label htmlFor="volume" className="text-[0.7rem] font-bold text-text-muted uppercase tracking-widest pl-1">Volume Capaian (Auto)</Label>
                  <Input id="volume" type="text" placeholder="Auto-fill dari IKSK..." disabled className="h-14 rounded-2xl bg-slate-100 border-border font-semibold text-slate-500 cursor-not-allowed shadow-none" {...register('volume')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="satuan" className="text-[0.7rem] font-bold text-text-muted uppercase tracking-widest pl-1">Satuan (Auto)</Label>
                  <Input id="satuan" placeholder="Auto-fill dari IKSK..." disabled className="h-14 rounded-2xl bg-slate-100 border-border font-semibold text-slate-500 cursor-not-allowed shadow-none" {...register('satuan')} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="uraian_pekerjaan" className="text-[0.7rem] font-bold text-text-muted uppercase tracking-widest pl-1">Uraian Detail Pekerjaan</Label>
                <textarea
                  id="uraian_pekerjaan"
                  className="w-full px-6 py-4 border border-border rounded-[1.5rem] text-[0.9375rem] font-semibold bg-slate-50 placeholder:text-text-muted/50 focus:outline-none focus:border-accent focus:bg-white focus:ring-4 focus:ring-accent/5 transition-all min-h-[160px] shadow-inner"
                  placeholder="Sebutkan langkah-langkah teknis dan output yang Anda kerjakan hari ini..."
                  {...register('uraian_pekerjaan', { required: 'Uraian pekerjaan wajib diisi' })}
                />
                {errors.uraian_pekerjaan && <p className="text-[0.7rem] text-rose-500 font-bold mt-2 flex items-center gap-1.5 pl-1"><AlertCircle className="w-4 h-4" /> {errors.uraian_pekerjaan.message as string}</p>}
              </div>

              <div className="pt-6 flex flex-col sm:flex-row gap-4">
                <Button
                  type="submit"
                  className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-[0.8rem] shadow-xl shadow-accent/20 hover:shadow-accent/40 hover:-translate-y-1 transition-all duration-300"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-3"><Loader2 className="w-5 h-5 animate-spin" /> Memproses Data...</div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      {editingId ? 'Perbarui Laporan' : 'Kirim Laporan Kinerja'}
                    </div>
                  )}
                </Button>
                {editingId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setEditingId(null); reset(); }}
                    className="h-14 rounded-2xl border-border px-8 text-[0.8rem] font-bold uppercase tracking-widest text-text-muted hover:bg-slate-50 transition-all"
                  >
                    Batal
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="p-6 sm:p-8 bg-surface border border-border rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-text-header tracking-tight">Butuh melihat riwayat?</p>
              <p className="text-[0.7rem] text-text-muted font-bold uppercase tracking-widest mt-0.5">Semua laporan Anda tersimpan dengan aman</p>
            </div>
          </div>
          <Button variant="outline" className="w-full sm:w-auto rounded-xl h-10 px-5 text-[0.65rem] font-black uppercase tracking-widest border-border hover:bg-white" onClick={() => navigate('/user/riwayat')}>
            Buka Riwayat
          </Button>
        </div>
      </div>

      <Modal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        title="Berhasil Tersimpan!"
        variant="success"
        description="Laporan kinerja harian Anda telah berhasil dicatat ke dalam sistem. Terima kasih atas dedikasi Anda!"
        footer={
          <div className="flex gap-3 w-full">
            <Button variant="outline" onClick={() => setSuccessModalOpen(false)} className="flex-1 rounded-xl px-6 font-bold uppercase tracking-widest text-[0.7rem]">Input Baru</Button>
            <Button onClick={() => { setSuccessModalOpen(false); navigate('/user/riwayat'); }} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 font-bold uppercase tracking-widest text-[0.7rem]">Lihat Riwayat</Button>
          </div>
        }
      >
        <div className="flex items-center justify-center p-6 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 mb-2">
          <motion.div initial={{ scale: 0.5, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', damping: 10 }}>
            <PartyPopper className="w-20 h-20 text-emerald-500" />
          </motion.div>
        </div>
      </Modal>
    </div>
  );
};
