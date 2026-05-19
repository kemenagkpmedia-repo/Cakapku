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
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  
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
    fetchBawahanKinerja(filterMonth, filterYear);
  }, [fetchBawahanKinerja, filterMonth, filterYear]);

  // Processing for the list view
  const subordinates = useMemo(() => {
    return bawahanUsers.map(user => ({
      ...user,
      totalReports: user.records?.length || 0,
      latestReport: user.records?.[0]?.tanggal || 'Belum Ada',
      filteredRecords: user.records || []
    }));
  }, [bawahanUsers]);

  const selectedUser = useMemo(() => {
    if (!selectedUserId) return null;
    return subordinates.find(u => u.id === selectedUserId) || null;
  }, [subordinates, selectedUserId]);


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
                onClick={() => setSelectedUserId(null)}
                className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center text-text-muted hover:text-accent hover:border-accent/30 transition-all shadow-sm shrink-0"
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
          <Button
            variant="outline"
            onClick={() => fetchBawahanKinerja(filterMonth, filterYear)}
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
                  onClick={() => setSelectedUserId(item.id)}
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

            {/* Records List USING DATATABLE */}
            <DataTable
              columns={[
                {
                  header: 'Tanggal',
                  accessor: (item: any) => (
                    <div className="flex flex-col">
                      <span className="text-[0.7rem] font-black bg-slate-100 text-text-header border border-slate-200 px-2 py-1 rounded-lg tracking-widest uppercase text-center mb-1">
                        {item.tanggal}
                      </span>
                      <span className="text-[0.6rem] font-bold text-text-muted flex items-center gap-1 justify-center">
                        <Clock className="w-3 h-3 text-accent" /> {item.waktu || '---'}
                      </span>
                    </div>
                  ),
                  className: 'w-24 text-center'
                },
                {
                  header: 'Uraian Pekerjaan',
                  accessor: (item: any) => (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                        <p className="text-[0.65rem] text-accent font-black uppercase tracking-widest">
                          {item.perkin_name || item.iksk?.perkin?.nama_perkin || 'Sasaran Kegiatan'}
                        </p>
                      </div>
                      <h4 className="text-[0.9rem] font-extrabold text-text-header tracking-tight leading-relaxed">
                        {item.uraian_pekerjaan}
                      </h4>
                      <span className={cn(
                        "text-[0.6rem] font-black uppercase tracking-widest px-2 py-1 rounded-md border inline-block",
                        item.status_kehadiran?.includes('Hadir') 
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                          : "bg-amber-50 text-amber-600 border-amber-100"
                      )}>
                        {item.status_kehadiran}
                      </span>
                    </div>
                  )
                },
                {
                  header: 'Indikator Kinerja',
                  accessor: (item: any) => (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100/50 max-w-[280px]">
                       <p className="text-[0.75rem] font-semibold text-text-main leading-relaxed">
                         {item.iksk_name || item.iksk?.indikator || '-'}
                       </p>
                    </div>
                  )
                }
              ]}
              data={selectedUser.filteredRecords || []}
              isLoading={isLoading}
              searchPlaceholder="Cari uraian pekerjaan..."
              searchKey={(item) => `${item.uraian_pekerjaan} ${item.tanggal}`}
              emptyMessage="Tidak ada aktivitas yang tercatat."
            />
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
