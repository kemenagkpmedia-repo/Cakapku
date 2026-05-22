import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore } from '../../store/authStore';
import { useSatkerStore } from '../../store/satkerStore';
import { useUserStore } from '../../store/userStore';
import api from '../../api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Label } from '../../components/ui/Label';
import { Input } from '../../components/ui/Input';
import {
  Printer,
  Calendar,
  Search,
  Settings,
  FileText,
  User,
  HelpCircle,
  Sliders,
  Check,
  Info,
  Download,
  Loader2,
  FileDown,
  Building,
  CheckSquare,
  Square
} from 'lucide-react';
import { cn } from '../../utils/cn';

export const ExportLaporan: React.FC = () => {
  const { user } = useAuthStore();
  const { satkers, fetchSatkers } = useSatkerStore();
  const { users, fetchUsers, isLoading: isUsersLoading } = useUserStore();

  // Fetch initial data
  useEffect(() => {
    fetchUsers();
    fetchSatkers();
  }, [fetchUsers, fetchSatkers]);

  // Current Satker Name
  const currentSatkerName = useMemo(() => {
    if (!user || satkers.length === 0) return '';
    const mySatker = satkers.find(s => s.id === user.id_satker || s.id === user.satker_id);
    return mySatker ? mySatker.nama_satker : '';
  }, [user, satkers]);

  // Filter only USER (Pegawai) role in same Satker
  const employees = useMemo(() => {
    return users.filter(u => {
      // Exclude Admin/Super Admin/Operator from list of printed logs if necessary
      const hasUserRole = u.assigned_roles?.includes('USER') || u.role === 'USER';
      const isSameSatker = u.id_satker === user?.id_satker || u.satker_id === user?.id_satker;
      return hasUserRole && isSameSatker;
    });
  }, [users, user]);

  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState<string>(String(new Date().getMonth() + 1).padStart(2, '0'));
  const [selectedYear, setSelectedYear] = useState<string>(String(currentYear));
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Print Config States
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [showSignature, setShowSignature] = useState<boolean>(true);

  // TTE Anchor States
  const [enableAnchorAtasan, setEnableAnchorAtasan] = useState<boolean>(false);
  const [anchorAtasanText, setAnchorAtasanText] = useState<string>('$ttd_atasan');
  const [enableAnchorPegawai, setEnableAnchorPegawai] = useState<boolean>(false);
  const [anchorPegawaiText, setAnchorPegawaiText] = useState<string>('$ttd_pegawai');

  // Signature Prefills
  const [customAtasanName, setCustomAtasanName] = useState<string>('');
  const [customAtasanNip, setCustomAtasanNip] = useState<string>('');

  // Auto-populate supervisor (atasan) details once satkers & users load
  useEffect(() => {
    if (user && satkers.length > 0 && users.length > 0) {
      const mySatker = satkers.find(s => s.id === user.satker_id || s.id === user.id_satker);
      const pimpinanId = mySatker?.id_pimpinan || mySatker?.pimpinan_id;
      if (pimpinanId) {
        const pimpinanUser = users.find(u => u.id === pimpinanId);
        if (pimpinanUser) {
          if (!customAtasanName) {
            setCustomAtasanName(pimpinanUser.nama || pimpinanUser.name || '');
          }
          if (!customAtasanNip) {
            setCustomAtasanNip(pimpinanUser.nip || '');
          }
        }
      }
    }
  }, [user, satkers, users, customAtasanName, customAtasanNip]);

  // Resolve signature date automatically
  const monthsIndo = [
    { label: 'Januari', value: '01' },
    { label: 'Februari', value: '02' },
    { label: 'Maret', value: '03' },
    { label: 'April', value: '04' },
    { label: 'Mei', value: '05' },
    { label: 'Juni', value: '06' },
    { label: 'Juli', value: '07' },
    { label: 'Agustus', value: '08' },
    { label: 'September', value: '09' },
    { label: 'Oktober', value: '10' },
    { label: 'November', value: '11' },
    { label: 'Desember', value: '12' }
  ];

  const years = useMemo(() => {
    const arr = [];
    for (let y = currentYear - 3; y <= currentYear + 1; y++) {
      arr.push(String(y));
    }
    return arr;
  }, [currentYear]);

  const selectedMonthLabel = useMemo(() => {
    return monthsIndo.find(m => m.value === selectedMonth)?.label || '';
  }, [selectedMonth]);

  const getLastDayOfMonth = (mStr: string, yStr: string) => {
    const m = parseInt(mStr, 10);
    const y = parseInt(yStr, 10);
    return new Date(y, m, 0).getDate();
  };

  const autoSignatureDate = useMemo(() => {
    const lastDay = getLastDayOfMonth(selectedMonth, selectedYear);
    return `Kulon Progo, ${lastDay} ${selectedMonthLabel} ${selectedYear}`;
  }, [selectedMonth, selectedYear, selectedMonthLabel]);

  const [customSignatureDate, setCustomSignatureDate] = useState<string>('');

  useEffect(() => {
    setCustomSignatureDate(autoSignatureDate);
  }, [autoSignatureDate]);

  // Columns Configuration
  const [showColumns, setShowColumns] = useState({
    status: true,
    perkin: true,
    iksk: true,
    volume: true,
    uraian: true
  });
  // Checked Employees States
  const [checkedIds, setCheckedIds] = useState<number[]>([]);

  // Search filter
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp =>
      (emp.nama || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (emp.nip || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [employees, searchQuery]);

  const handleToggleSelectAll = () => {
    if (checkedIds.length === filteredEmployees.length) {
      setCheckedIds([]);
    } else {
      setCheckedIds(filteredEmployees.map(e => e.id));
    }
  };

  const handleToggleSelectOne = (id: number) => {
    setCheckedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Bulk / Individual Print State
  const [activeDownloadIndex, setActiveDownloadIndex] = useState<number | null>(null);
  const [bulkDownloadStatus, setBulkDownloadStatus] = useState<string | null>(null);
  const [activeDownloadingEmp, setActiveDownloadingEmp] = useState<string>('');

  const downloadSinglePdf = async (emp: any) => {
    const response = await api.get('/kinerja-harian/export-pdf', {
      params: {
        user_id: emp.id,
        month: selectedMonth,
        year: selectedYear,
        pegawai_name: emp.nama || emp.name || '',
        pegawai_nip: emp.nip || '',
        pegawai_jabatan: emp.jabatan || 'PNS',
        atasan_name: customAtasanName,
        atasan_nip: customAtasanNip,
        signature_date: customSignatureDate,
        fontSize: fontSize,
        orientation: orientation,
        columns: JSON.stringify(showColumns),
        enable_anchor_atasan: enableAnchorAtasan,
        anchor_atasan_text: anchorAtasanText,
        enable_anchor_pegawai: enableAnchorPegawai,
        anchor_pegawai_text: anchorPegawaiText
      },
      responseType: 'blob'
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;

    const fileSafeName = (emp.nama || 'pegawai').replace(/\s+/g, '_');
    link.setAttribute('download', `LKB_${selectedMonth}_${selectedYear}_${fileSafeName}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  };

  const handleDownloadOne = async (emp: any) => {
    try {
      setBulkDownloadStatus(`Mengunduh LKB untuk ${emp.nama}...`);
      setActiveDownloadingEmp(emp.nama);
      await downloadSinglePdf(emp);
    } catch (err: any) {
      console.error(err);
      alert(`Gagal mengunduh PDF untuk ${emp.nama}`);
    } finally {
      setBulkDownloadStatus(null);
      setActiveDownloadingEmp('');
    }
  };

  const handleDownloadBulk = async () => {
    if (checkedIds.length === 0) return;
    
    setBulkDownloadStatus('Menghimpun LKB pegawai ke file ZIP...');
    setActiveDownloadingEmp(`Mengemas ${checkedIds.length} LKB Pegawai...`);
    setActiveDownloadIndex(null);
    
    try {
      const response = await api.post('/kinerja-harian/export-pdf-zip', {
        user_ids: checkedIds,
        month: selectedMonth,
        year: selectedYear,
        atasan_name: customAtasanName,
        atasan_nip: customAtasanNip,
        signature_date: customSignatureDate,
        fontSize: fontSize,
        orientation: orientation,
        columns: JSON.stringify(showColumns),
        enable_anchor_atasan: enableAnchorAtasan,
        anchor_atasan_text: anchorAtasanText,
        enable_anchor_pegawai: enableAnchorPegawai,
        anchor_pegawai_text: anchorPegawaiText
      }, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/zip' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      const zipFileName = `LKB_Massal_${selectedMonthLabel}_${selectedYear}.zip`;
      link.setAttribute('download', zipFileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
    } catch (err) {
      console.error(err);
      alert('Gagal mengunduh berkas ZIP LKB Massal. Pastikan koneksi aman.');
    } finally {
      setBulkDownloadStatus(null);
      setActiveDownloadingEmp('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 px-4">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-2 py-4">
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent shadow-md shadow-accent/5">
              <Printer className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-text-header tracking-tight">
                Ekspor LKB Pegawai
              </h1>
              <p className="text-sm text-text-muted mt-1 font-medium flex items-center gap-1">
                <Building className="w-4 h-4 text-text-muted/70" />
                Operator Satuan Kerja: <span className="font-extrabold text-accent">{currentSatkerName || '—'}</span>
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bulk Download Status Modal overlay */}
      <AnimatePresence>
        {bulkDownloadStatus && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl p-8 border border-border shadow-2xl max-w-sm w-full text-center space-y-6"
            >
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mx-auto animate-spin">
                <Loader2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="font-black text-text-header tracking-tight text-lg">Mengunduh Dokumen LKB</h3>
                {activeDownloadIndex !== null && (
                  <p className="text-xs font-black uppercase text-accent tracking-widest">
                    Proses: {activeDownloadIndex} dari {checkedIds.length} Pegawai
                  </p>
                )}
                <p className="text-sm font-bold text-text-main leading-relaxed">
                  {activeDownloadingEmp}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  {bulkDownloadStatus}
                </p>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                {activeDownloadIndex !== null && (
                  <div
                    className="bg-accent h-full transition-all duration-300"
                    style={{ width: `${(activeDownloadIndex / checkedIds.length) * 100}%` }}
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel: Configuration controls */}
        <div className="lg:col-span-4 space-y-6">
          {/* Section 1: Period filter (Standalone Selects at the top) */}
          <div className="relative z-20 bg-white border border-slate-200/50 p-6 rounded-3xl shadow-sm grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[0.65rem] font-bold text-text-muted uppercase tracking-wider pl-1">Bulan</Label>
              <Select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                options={monthsIndo}
                className="h-10 text-xs font-bold"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[0.65rem] font-bold text-text-muted uppercase tracking-wider pl-1">Tahun</Label>
              <Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                options={years.map(y => ({ label: y, value: y }))}
                className="h-10 text-xs font-bold"
              />
            </div>
          </div>


          {/* Section 3: Signature configurations */}
          <Card className="rounded-3xl border-border shadow-sm bg-white border border-slate-200/50">
            <CardHeader className="border-b border-border/50 px-6 py-4 bg-slate-50/50 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-extrabold flex items-center gap-2.5 text-text-header">
                <User className="w-4 h-4 text-accent" />
                Konfigurasi Tanda Tangan
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[0.65rem] font-bold text-text-muted uppercase tracking-wider pl-1">
                  Nama Atasan Langsung
                </Label>
                <Input
                  type="text"
                  placeholder="Nama atasan langsung..."
                  value={customAtasanName}
                  onChange={(e) => setCustomAtasanName(e.target.value)}
                  className="h-10 rounded-xl bg-slate-50 border-slate-200 font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[0.65rem] font-bold text-text-muted uppercase tracking-wider pl-1">
                  NIP Atasan Langsung
                </Label>
                <Input
                  type="text"
                  placeholder="NIP atasan..."
                  value={customAtasanNip}
                  onChange={(e) => setCustomAtasanNip(e.target.value)}
                  className="h-10 rounded-xl bg-slate-50 border-slate-200 font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[0.65rem] font-bold text-text-muted uppercase tracking-wider pl-1">
                  Tanggal Tanda Tangan LKB
                </Label>
                <Input
                  type="text"
                  value={customSignatureDate}
                  onChange={(e) => setCustomSignatureDate(e.target.value)}
                  className="h-10 rounded-xl bg-slate-50 border-slate-200 font-semibold"
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 4: TTE Anchor configurations */}
          <Card className="rounded-3xl border-border shadow-sm bg-white border border-slate-200/50">
            <CardHeader className="border-b border-border/50 px-6 py-4 bg-slate-50/50">
              <CardTitle className="text-sm font-extrabold flex items-center gap-2.5 text-text-header">
                <Sliders className="w-4 h-4 text-accent" />
                Tanda Tangan Elektronik (TTE)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              {/* TTE Atasan Toggle */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setEnableAnchorAtasan(!enableAnchorAtasan)}
                  className="flex items-center justify-between w-full py-1 text-left"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-text-header">Aktifkan Anchor Atasan</span>
                    <p className="text-[0.6rem] text-text-muted font-medium">Beri penanda teks untuk Privy/BSrE Atasan</p>
                  </div>
                  <div className={cn(
                    "w-11 h-6 rounded-full p-0.5 transition-all duration-300 relative",
                    enableAnchorAtasan ? "bg-accent" : "bg-slate-200"
                  )}>
                    <div className={cn(
                      "w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 absolute top-0.5",
                      enableAnchorAtasan ? "left-5.5" : "left-0.5"
                    )} />
                  </div>
                </button>

                {enableAnchorAtasan && (
                  <Input
                    type="text"
                    value={anchorAtasanText}
                    onChange={(e) => setAnchorAtasanText(e.target.value)}
                    className="h-9 rounded-xl bg-slate-50 border-slate-200 text-xs font-mono"
                  />
                )}
              </div>

              {/* TTE Pegawai Toggle */}
              <div className="space-y-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setEnableAnchorPegawai(!enableAnchorPegawai)}
                  className="flex items-center justify-between w-full py-1 text-left"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-text-header">Aktifkan Anchor Pegawai</span>
                    <p className="text-[0.6rem] text-text-muted font-medium">Beri penanda teks untuk Privy/BSrE Pegawai</p>
                  </div>
                  <div className={cn(
                    "w-11 h-6 rounded-full p-0.5 transition-all duration-300 relative",
                    enableAnchorPegawai ? "bg-accent" : "bg-slate-200"
                  )}>
                    <div className={cn(
                      "w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 absolute top-0.5",
                      enableAnchorPegawai ? "left-5.5" : "left-0.5"
                    )} />
                  </div>
                </button>

                {enableAnchorPegawai && (
                  <Input
                    type="text"
                    value={anchorPegawaiText}
                    onChange={(e) => setAnchorPegawaiText(e.target.value)}
                    className="h-9 rounded-xl bg-slate-50 border-slate-200 text-xs font-mono"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel: Employees list */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="rounded-[2rem] border-border shadow-sm overflow-hidden bg-white">
            <CardContent className="p-0">
              {/* Toolbar */}
              <div className="p-6 border-b border-border bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative group w-full md:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-accent transition-colors" />
                  <Input
                    placeholder="Cari nama atau NIP pegawai..."
                    className="pl-11 h-11 rounded-xl bg-white border-border shadow-none focus:ring-accent/10 transition-all font-medium py-0"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-[0.7rem] font-bold text-text-muted uppercase tracking-widest bg-white px-4 py-2 rounded-lg border border-border">
                    Total: <span className="text-accent">{filteredEmployees.length} Pegawai</span>
                  </div>
                  {checkedIds.length > 0 && (
                    <div className="text-[0.7rem] font-bold text-accent uppercase tracking-widest bg-accent/5 px-4 py-2 rounded-lg border border-accent/20">
                      Terpilih: <span>{checkedIds.length} Pegawai</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bulk action bar */}
              {checkedIds.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-6 py-4 bg-accent/5 border-b border-accent/10 flex items-center justify-between gap-4"
                >
                  <p className="text-[0.8rem] font-bold text-text-main">
                    Unduh LKB secara massal untuk <span className="text-accent font-extrabold">{checkedIds.length}</span> pegawai terpilih?
                  </p>
                  <Button
                    onClick={handleDownloadBulk}
                    className="h-10 rounded-xl px-5 font-black uppercase tracking-widest text-[0.65rem] shadow-lg shadow-accent/25 flex items-center gap-2"
                  >
                    <FileDown className="w-4 h-4" />
                    Unduh Massal ({checkedIds.length})
                  </Button>
                </motion.div>
              )}

              {/* Employees Table */}
              <div className="overflow-x-auto">
                {isUsersLoading ? (
                  <div className="p-20 text-center flex flex-col items-center justify-center">
                    <div className="w-10 h-10 border-4 border-accent/20 border-t-accent rounded-full animate-spin mb-4" />
                    <p className="text-sm font-bold text-text-muted uppercase tracking-widest">Memuat Data Pegawai...</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-border">
                        <th className="px-6 py-4 text-[0.7rem] font-black text-text-muted uppercase tracking-widest w-16 text-center">
                          <button
                            type="button"
                            onClick={handleToggleSelectAll}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-accent transition-colors mx-auto"
                          >
                            {checkedIds.length === filteredEmployees.length && filteredEmployees.length > 0 ? (
                              <CheckSquare className="w-5 h-5 text-accent" />
                            ) : (
                              <Square className="w-5 h-5 text-text-muted/65" />
                            )}
                          </button>
                        </th>
                        <th className="px-6 py-4 text-[0.7rem] font-black text-text-muted uppercase tracking-widest">Nama Pegawai &amp; NIP</th>
                        <th className="px-6 py-4 text-[0.7rem] font-black text-text-muted uppercase tracking-widest">Jabatan</th>
                        <th className="px-6 py-4 text-[0.7rem] font-black text-text-muted uppercase tracking-widest text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredEmployees.map((emp, index) => {
                        const isChecked = checkedIds.includes(emp.id);
                        return (
                          <tr
                            key={emp.id}
                            className={cn(
                              "hover:bg-slate-50/80 transition-colors group",
                              isChecked ? "bg-accent/[0.01]" : ""
                            )}
                          >
                            <td className="px-6 py-5 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleSelectOne(emp.id)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-accent transition-colors mx-auto"
                              >
                                {isChecked ? (
                                  <CheckSquare className="w-5 h-5 text-accent" />
                                ) : (
                                  <Square className="w-5 h-5 text-text-muted/50" />
                                )}
                              </button>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-text-header font-black text-sm shrink-0 border border-slate-200">
                                  {(emp.nama || emp.name || '?').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-extrabold text-text-header tracking-tight">{emp.nama || emp.name}</div>
                                  <div className="text-[0.65rem] text-accent font-bold mt-1 uppercase tracking-wider">{emp.nip || '— NIP Belum Diatur —'}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="text-[0.8125rem] font-bold text-text-main">
                                {emp.jabatan || <span className="text-text-muted italic text-[0.75rem]">— Staf —</span>}
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  variant="outline"
                                  onClick={() => handleDownloadOne(emp)}
                                  className="rounded-xl h-10 px-4 font-extrabold text-[0.65rem] uppercase tracking-widest border-border text-accent bg-white hover:bg-accent/5 hover:border-accent/30 transition-all flex items-center gap-1.5"
                                  title="Download LKB Pegawai"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Unduh PDF</span>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {filteredEmployees.length === 0 && !isUsersLoading && (
                <div className="p-20 text-center flex flex-col items-center justify-center bg-slate-50/50">
                  <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
                    <Search className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-text-header uppercase tracking-widest text-xs">Pegawai Tidak Ditemukan</h3>
                  <p className="text-[0.8rem] text-text-muted mt-2">Coba kata kunci lain atau periksa filter Anda</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
