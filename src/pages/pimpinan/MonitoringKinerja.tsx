import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useKinerjaStore } from '../../store/kinerjaStore';
import { Users, Clock, FileText, AlertTriangle, Loader2, RefreshCw, Search, ArrowLeft, User, ChevronRight, Eye } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { DataTable } from '../../components/ui/DataTable';

export const MonitoringKinerja: React.FC = () => {
  const { bawahanUsers, isLoading, error, fetchBawahanKinerja } = useKinerjaStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  useEffect(() => {
    fetchBawahanKinerja();
  }, [fetchBawahanKinerja]);

  // Processing for the list view
  const subordinates = useMemo(() => {
    return bawahanUsers.map(user => ({
      ...user,
      latestReport: user.records?.[0]?.tanggal || 'Belum Ada'
    }));
  }, [bawahanUsers]);

  // Search logic for the detail view only (DataTable handles search for the list view)
  const filteredRecords = selectedUser 
    ? selectedUser.records.filter((r: any) => 
        r.uraian_pekerjaan.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const columns = [
    {
      header: 'No.',
      accessor: (_item: any, index: number) => <span className="font-black text-accent">{index}</span>,
      className: 'w-16 text-center'
    },
    {
      header: 'Nama Pegawai',
      accessor: (item: any) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-text-header tracking-tight">{item.nama}</div>
            <div className="text-[0.65rem] text-text-muted font-bold uppercase tracking-widest">{item.nip || 'NIP -'}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Jabatan',
      accessor: (item: any) => (
        <span className="text-[0.75rem] font-bold text-text-main uppercase tracking-wide">
          {item.jabatan || 'Pegawai'}
        </span>
      )
    },
    {
      header: 'Total Laporan',
      accessor: (item: any) => (
        <div className="flex flex-col">
          <span className="text-lg font-black text-text-header">{item.totalReports}</span>
          <span className="text-[0.6rem] font-bold text-text-muted uppercase tracking-widest">LKH Terinput</span>
        </div>
      ),
      className: 'text-center'
    },
    {
      header: 'Update Terakhir',
      accessor: (item: any) => (
        <div className="flex items-center gap-2 text-[0.75rem] font-extrabold text-text-header">
          <Clock className="w-3.5 h-3.5 text-accent" />
          {item.latestReport}
        </div>
      )
    }
  ];

  if (isLoading && bawahanUsers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] p-8 text-center">
        <div className="w-16 h-16 bg-accent/10 text-accent rounded-2xl flex items-center justify-center mb-4 animate-pulse">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <p className="text-sm font-bold text-text-muted uppercase tracking-widest animate-pulse">Memuat Data Bawahan...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12 space-y-8 px-4">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex items-center gap-3 mb-2">
             {selectedUser && (
               <button 
                onClick={() => { setSelectedUser(null); setSearchTerm(''); }}
                className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center text-text-muted hover:text-accent hover:border-accent/30 transition-all shadow-sm"
               >
                 <ArrowLeft className="w-5 h-5" />
               </button>
             )}
             <h1 className="text-2xl sm:text-3xl font-extrabold text-text-header tracking-tight">
               {selectedUser ? 'Detail Kinerja Pegawai' : 'Monitoring Kinerja Bawahan'}
             </h1>
          </div>
          <p className="text-sm text-text-muted font-medium">
            {selectedUser 
              ? `Menampilkan riwayat aktivitas untuk ${selectedUser.nama}` 
              : 'Daftar personil dan ringkasan pelaporan kinerja di unit kerja Anda.'}
          </p>
        </motion.div>

        <div className="flex items-center gap-3">
          {/* Detail View Search (Visible only when a user is selected) */}
          {selectedUser && (
            <div className="relative group min-w-[280px]">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-colors">
                <Search className="w-4 h-4" />
              </div>
              <Input
                placeholder="Cari uraian pekerjaan..."
                className="pl-11 h-12 rounded-xl bg-white border-border shadow-sm focus:ring-accent/10 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
          <Button
            variant="outline"
            onClick={fetchBawahanKinerja}
            className="rounded-xl h-12 w-12 p-0 font-bold border-border bg-white"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {!selectedUser ? (
          /* VIEW 1: SUBORDINATE LIST USING DATATABLE */
          <motion.div 
            key="list"
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
          >
            <DataTable
              columns={columns}
              data={subordinates}
              isLoading={isLoading}
              searchPlaceholder="Cari nama atau NIP pegawai..."
              searchKey={(item) => `${item.nama} ${item.nip}`}
              emptyMessage="Pegawai tidak ditemukan di Satker ini."
              actions={(item) => (
                <button
                  onClick={() => { setSelectedUser(item); setSearchTerm(''); }}
                  className="p-2.5 rounded-xl text-accent hover:bg-accent/10 transition-all border border-transparent hover:border-accent/10 flex items-center gap-2 font-bold uppercase tracking-widest text-[0.65rem]"
                  title="Lihat Detail Kinerja"
                >
                  <Eye className="w-4 h-4" />
                  <span>Detail</span>
                </button>
              )}
            />
          </motion.div>
        ) : (
          /* VIEW 2: ACTIVITY DETAIL */
          <motion.div 
            key="detail"
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* User Profile Header in Detail View */}
            <div className="bg-white rounded-3xl border border-border p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center text-white shadow-lg shadow-accent/20">
                <User className="w-8 h-8" />
              </div>
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-xl font-black text-text-header tracking-tight">{selectedUser.nama}</h2>
                <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-2">
                  <span className="text-[0.7rem] font-bold text-text-muted uppercase tracking-widest border border-slate-100 px-3 py-1 rounded-full bg-slate-50">{selectedUser.nip}</span>
                  <span className="text-[0.7rem] font-bold text-accent uppercase tracking-widest border border-accent/10 px-3 py-1 rounded-full bg-accent/5">{selectedUser.jabatan || 'PEGAWAI'}</span>
                </div>
              </div>
              <div className="flex flex-row sm:flex-col items-center sm:items-end gap-1">
                <span className="text-[0.6rem] font-black text-text-muted uppercase tracking-widest">Produktivitas</span>
                <span className="text-xl font-black text-text-header">{selectedUser.totalReports} <span className="text-xs font-bold text-text-muted uppercase tracking-widest ml-1">LKH</span></span>
              </div>
            </div>

            {/* Records List */}
            <div className="space-y-4">
              {filteredRecords.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-[2.5rem] border border-border flex flex-col items-center justify-center shadow-sm">
                   <FileText className="w-12 h-12 text-slate-100 mb-4" />
                   <p className="text-text-muted font-bold uppercase tracking-widest text-xs">Tidak ada aktivitas yang sesuai</p>
                </div>
              ) : (
                filteredRecords.map((record: any, idx: number) => (
                  <motion.div 
                    key={record.id} 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="rounded-2xl border-border shadow-sm hover:shadow-elegant transition-all duration-300 bg-white">
                      <CardContent className="p-6 md:p-8">
                        <div className="flex flex-col md:flex-row gap-6">
                          <div className="shrink-0 flex md:flex-col items-center md:items-start gap-2">
                            <span className="text-[0.7rem] font-black bg-slate-100 text-text-header border border-slate-200 px-3 py-1.5 rounded-lg tracking-widest uppercase">
                              {record.tanggal}
                            </span>
                            <span className="text-[0.65rem] font-bold text-text-muted px-2 flex items-center gap-1.5">
                              <Clock className="w-3 h-3 text-accent" /> {record.waktu || '---'}
                            </span>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                              <p className="text-[0.7rem] text-accent font-black uppercase tracking-widest">
                                {record.perkin_name || record.iksk?.perkin?.nama_perkin || 'Sasaran Kegiatan'}
                              </p>
                            </div>
                            
                            <h4 className="text-[1rem] font-extrabold text-text-header tracking-tight leading-relaxed">
                              {record.uraian_pekerjaan}
                            </h4>
                            
                            <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100/50">
                               <p className="text-xs text-text-muted font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                 <FileText className="w-3 h-3" /> Indikator Kinerja
                               </p>
                               <p className="text-[0.8rem] font-semibold text-text-main leading-relaxed">
                                 {record.iksk_name || record.iksk?.indikator || '-'}
                               </p>
                            </div>

                            <div className="mt-5 flex items-center gap-3">
                              <span className={cn(
                                "text-[0.65rem] font-black uppercase tracking-widest px-3 py-1.5 rounded-md border",
                                record.status_kehadiran?.includes('Hadir') 
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                                  : "bg-amber-50 text-amber-600 border-amber-100"
                              )}>
                                {record.status_kehadiran}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper function for class merging
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
