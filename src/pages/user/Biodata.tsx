import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Select } from '../../components/ui/Select';
import { useAuthStore, User } from '../../store/authStore';
import { useSatkerStore } from '../../store/satkerStore';
import { User as UserIcon, Mail, Contact, Briefcase, MapPin, Phone, Save, CheckCircle } from 'lucide-react';

export const Biodata: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const { satkers } = useSatkerStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<Partial<User>>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      nip: user?.nip || '',
      jabatan: user?.jabatan || '',
      pangkat: user?.pangkat || '',
      golongan: user?.golongan || '',
      phone: user?.phone || '',
      address: user?.address || '',
      satker_id: user?.satker_id,
    }
  });

  const onSubmit = (data: Partial<User>) => {
    updateUser(data);
    setIsEditing(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const satkerName = satkers.find(s => s.id === user?.satker_id)?.name || 'Tidak Diketahui';

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-text-header tracking-tight">Biodata Diri</h1>
          <p className="text-sm text-text-muted mt-2 font-medium">Kelola informasi profil dan data kepegawaian Anda di sini.</p>
        </div>
        {!isEditing && (
          <Button 
            onClick={() => setIsEditing(true)} 
            variant="outline" 
            className="rounded-xl border-border hover:bg-black/[0.02] font-bold text-xs uppercase tracking-widest h-11 px-6 transition-all duration-300 hover:shadow-md active:scale-95"
          >
            Edit Profil
          </Button>
        )}
      </div>

      {showSuccess && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold shadow-sm"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          Biodata Anda telah berhasil diperbarui!
        </motion.div>
      )}

      <div className="grid grid-cols-12 gap-8 items-start">
        {/* Profile Summary */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <Card className="rounded-3xl border-border shadow-elegant overflow-hidden group">
            <CardContent className="pt-10 pb-8 flex flex-col items-center text-center px-6">
              <div className="relative mb-6">
                <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center text-white text-4xl font-extrabold shadow-2xl shadow-accent/30 border-4 border-white transform transition-transform duration-500 group-hover:rotate-3 group-hover:scale-105">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-white border border-border shadow-lg flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-accent" />
                </div>
              </div>
              <h2 className="text-xl font-extrabold text-text-header tracking-tight">{user?.name}</h2>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/5 text-accent text-[0.65rem] font-bold uppercase tracking-widest mt-2 border border-accent/10">
                {user?.role}
              </div>
              
              <div className="mt-8 pt-8 border-t border-border w-full space-y-4">
                <div className="flex items-center gap-3 text-[0.8125rem] text-text-main font-semibold group/item cursor-default justify-center">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-border group-hover/item:border-accent group-hover/item:bg-accent/5 transition-colors">
                    <Mail className="w-3.5 h-3.5 text-text-muted" />
                  </div>
                  <span className="truncate">{user?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-[0.8125rem] text-text-main font-semibold group/item cursor-default justify-center">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-border group-hover/item:border-accent group-hover/item:bg-accent/5 transition-colors">
                    <Briefcase className="w-3.5 h-3.5 text-text-muted" />
                  </div>
                  <span className="truncate">{satkerName}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="p-6 bg-accent/5 rounded-3xl border border-accent/10">
            <h4 className="text-xs font-bold text-accent uppercase tracking-widest mb-3">Keamanan Akun</h4>
            <p className="text-[0.7rem] text-text-muted leading-relaxed font-medium">Data Anda dilindungi oleh enkripsi standar Industri. Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        {/* Details Form/View */}
        <Card className="col-span-12 lg:col-span-8 rounded-3xl border-border shadow-elegant overflow-hidden">
          <CardHeader className="border-b border-border px-8 py-6 bg-surface">
            <CardTitle className="text-base font-extrabold flex items-center gap-2.5">
              <Contact className="w-5 h-5 text-accent" />
              Informasi Kepegawaian & Kontak
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* NIP */}
                <div className="space-y-2">
                  <Label className="text-[0.7rem] font-bold text-text-muted uppercase tracking-widest">Nomor Induk Pegawai (NIP)</Label>
                  {isEditing ? (
                    <Input {...register('nip')} className="h-12 rounded-xl bg-slate-50 border-border focus:bg-white focus:ring-accent/20 transition-all font-semibold" placeholder="Masukkan NIP..." />
                  ) : (
                    <p className="text-[0.9375rem] font-bold text-text-header py-3 px-4 bg-slate-50 border border-slate-100 rounded-xl">
                      {user?.nip || <span className="text-text-muted/40 italic font-normal text-sm">Belum diatur</span>}
                    </p>
                  )}
                </div>

                {/* Jabatan */}
                <div className="space-y-2">
                  <Label className="text-[0.7rem] font-bold text-text-muted uppercase tracking-widest">Jabatan</Label>
                  {isEditing ? (
                    <Input {...register('jabatan')} className="h-12 rounded-xl bg-slate-50 border-border focus:bg-white focus:ring-accent/20 transition-all font-semibold" placeholder="Masukkan Jabatan..." />
                  ) : (
                    <p className="text-[0.9375rem] font-bold text-text-header py-3 px-4 bg-slate-50 border border-slate-100 rounded-xl">
                      {user?.jabatan || <span className="text-text-muted/40 italic font-normal text-sm">Belum diatur</span>}
                    </p>
                  )}
                </div>

                {/* Pangkat */}
                <div className="space-y-2">
                  <Label className="text-[0.7rem] font-bold text-text-muted uppercase tracking-widest">Pangkat</Label>
                  {isEditing ? (
                    <Input {...register('pangkat')} className="h-12 rounded-xl bg-slate-50 border-border focus:bg-white focus:ring-accent/20 transition-all font-semibold" placeholder="Contoh: Penata" />
                  ) : (
                    <p className="text-[0.9375rem] font-bold text-text-header py-3 px-4 bg-slate-50 border border-slate-100 rounded-xl">
                      {user?.pangkat || <span className="text-text-muted/40 italic font-normal text-sm">Belum diatur</span>}
                    </p>
                  )}
                </div>

                {/* Golongan */}
                <div className="space-y-2">
                  <Label className="text-[0.7rem] font-bold text-text-muted uppercase tracking-widest">Golongan</Label>
                  {isEditing ? (
                    <Select 
                      options={[
                        { label: 'III/a', value: 'III/a' },
                        { label: 'III/b', value: 'III/b' },
                        { label: 'III/c', value: 'III/c' },
                        { label: 'III/d', value: 'III/d' },
                        { label: 'IV/a', value: 'IV/a' },
                        { label: 'IV/b', value: 'IV/b' },
                      ]}
                      {...register('golongan')}
                      className="h-12 rounded-xl font-semibold"
                    />
                  ) : (
                    <p className="text-[0.9375rem] font-bold text-text-header py-3 px-4 bg-slate-50 border border-slate-100 rounded-xl">
                      {user?.golongan || <span className="text-text-muted/40 italic font-normal text-sm">Belum diatur</span>}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label className="text-[0.7rem] font-bold text-text-muted uppercase tracking-widest">No. Telepon Aktif</Label>
                  {isEditing ? (
                    <Input {...register('phone')} className="h-12 rounded-xl bg-slate-50 border-border focus:bg-white focus:ring-accent/20 transition-all font-semibold" placeholder="0812..." />
                  ) : (
                    <p className="text-[0.9375rem] font-bold text-text-header py-3 px-4 bg-slate-50 border border-slate-100 rounded-xl">
                      {user?.phone || <span className="text-text-muted/40 italic font-normal text-sm">Belum diatur</span>}
                    </p>
                  )}
                </div>

                {/* Satker (Read Only) */}
                <div className="space-y-2">
                  <Label className="text-[0.7rem] font-bold text-text-muted uppercase tracking-widest">Satuan Kerja</Label>
                  <p className="text-[0.9375rem] font-semibold text-text-muted py-3 px-4 bg-slate-100 border border-border rounded-xl italic">
                    {satkerName}
                  </p>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label className="text-[0.7rem] font-bold text-text-muted uppercase tracking-widest">Alamat Lengkap Domisili</Label>
                {isEditing ? (
                  <textarea
                    {...register('address')}
                    className="w-full px-4 py-3 border border-border rounded-xl text-[0.875rem] font-semibold bg-slate-50 placeholder:text-text-muted focus:outline-none focus:border-accent focus:bg-white transition-all min-h-[100px] shadow-inner"
                    placeholder="Masukkan alamat lengkap sesuai KTP/Domisili..."
                  />
                ) : (
                  <p className="text-[0.9375rem] font-bold text-text-header py-4 px-4 bg-slate-50 border border-slate-100 rounded-xl min-h-[80px] leading-relaxed">
                    {user?.address || <span className="text-text-muted/40 italic font-normal text-sm">Belum diatur</span>}
                  </p>
                )}
              </div>

              {isEditing && (
                <div className="flex justify-end gap-4 pt-8 border-t border-border">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setIsEditing(false)}
                    className="rounded-xl font-bold text-xs uppercase tracking-widest text-text-muted hover:bg-slate-100 px-6 h-11 transition-all"
                  >
                    Batalkan
                  </Button>
                  <Button 
                    type="submit" 
                    className="rounded-xl flex gap-2 font-bold text-xs uppercase tracking-widest h-11 px-8 shadow-lg shadow-accent/25 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    <Save className="w-4 h-4" />
                    Simpan Profil
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
