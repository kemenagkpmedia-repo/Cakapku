import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useKinerjaStore } from '../../store/kinerjaStore';
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
  Eye,
  User,
  HelpCircle,
  Check,
  LayoutTemplate,
  Info,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { cn } from '../../utils/cn';

export const ExportLKB: React.FC = () => {
  const { records, fetchKinerja, isLoading: isRecordsLoading } = useKinerjaStore();
  const { user } = useAuthStore();
  const { satkers, fetchSatkers } = useSatkerStore();
  const { users, fetchUsers } = useUserStore();

  // Data load on mount to ensure records are always populated
  useEffect(() => {
    fetchKinerja();
    fetchSatkers();
    fetchUsers();
  }, [fetchKinerja, fetchSatkers, fetchUsers]);

  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState<string>(String(new Date().getMonth() + 1).padStart(2, '0'));
  const [selectedYear, setSelectedYear] = useState<string>(String(currentYear));

  // Print Config States
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [showSignature, setShowSignature] = useState<boolean>(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  // TTE Anchor States
  const [enableAnchorAtasan, setEnableAnchorAtasan] = useState<boolean>(false);
  const [anchorAtasanText, setAnchorAtasanText] = useState<string>('$ttd_atasan');
  const [enableAnchorPegawai, setEnableAnchorPegawai] = useState<boolean>(false);
  const [anchorPegawaiText, setAnchorPegawaiText] = useState<string>('$ttd_pegawai');

  // Supervisor and Employee details for signature autofill
  const [customAtasanName, setCustomAtasanName] = useState<string>('');
  const [customAtasanNip, setCustomAtasanNip] = useState<string>('');
  const [customPegawaiName, setCustomPegawaiName] = useState<string>(user?.nama || user?.name || '');
  const [customPegawaiNip, setCustomPegawaiNip] = useState<string>(user?.nip || '');
  const [customPegawaiJabatan, setCustomPegawaiJabatan] = useState<string>(user?.jabatan || '');

  // Auto-populate supervisor (atasan) details once loaded
  useEffect(() => {
    if (user) {
      if (user.atasan_user) {
        if (!customAtasanName) {
          setCustomAtasanName(user.atasan_user.nama || user.atasan_user.name || '');
        }
        if (!customAtasanNip) {
          setCustomAtasanNip(user.atasan_user.nip || '');
        }
      }
    }
  }, [user, customAtasanName, customAtasanNip]);

  // Dynamic column visibility toggles
  const [showColumns, setShowColumns] = useState({
    status: true,
    perkin: true,
    iksk: true,
    volume: true,
    uraian: true
  });

  // UI zoom state for A4 live preview (does not affect print output)
  const [zoomScale, setZoomScale] = useState<number>(0.95);

  const months = [
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
    { label: 'Desember', value: '12' },
  ];

  const years = Array.from({ length: 5 }, (_, i) => ({
    label: String(currentYear - i),
    value: String(currentYear - i),
  }));

  const satker = satkers.find(s => s.id === user?.satker_id || s.id === user?.id_satker);
  const selectedMonthName = months.find(m => m.value === selectedMonth)?.label || '';

  // Auto-calculated Signature Date based on selected month/year
  const autoSignatureDate = useMemo(() => {
    if (!selectedMonth || !selectedYear) return '';
    const yearNum = parseInt(selectedYear);
    const monthNum = parseInt(selectedMonth);
    const lastDay = new Date(yearNum, monthNum, 0).getDate();
    return `Kulon Progo, ${lastDay} ${selectedMonthName} ${selectedYear}`;
  }, [selectedMonth, selectedYear, selectedMonthName]);

  const [customSignatureDate, setCustomSignatureDate] = useState<string>('');

  useEffect(() => {
    setCustomSignatureDate(autoSignatureDate);
  }, [autoSignatureDate]);

  const filteredRecords = useMemo(() => {
    return records
      .filter(record => {
        if (!record.tanggal) return false;
        const [year, month] = record.tanggal.split('-');
        return year === selectedYear && month === selectedMonth;
      })
      .sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());
  }, [records, selectedMonth, selectedYear]);

  const handlePrint = async () => {
    setIsGeneratingPdf(true);

    try {
      const response = await api.get('/kinerja-harian/export-pdf', {
        params: {
          month: selectedMonth,
          year: selectedYear,
          pegawai_name: customPegawaiName,
          pegawai_nip: customPegawaiNip,
          pegawai_jabatan: customPegawaiJabatan,
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

      // Create a local URL representing the PDF binary blob
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = downloadUrl;

      const fileName = `LKB_${selectedMonthName}_${selectedYear}_${customPegawaiName.replace(/\s+/g, '_')}.pdf`;
      link.setAttribute('download', fileName);

      document.body.appendChild(link);
      link.click();

      // Clean up DOM and URL resource
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

    } catch (error) {
      console.error('Direct PDF Download failed, falling back to window.print():', error);
      alert('Gagal mengunduh PDF dari server. Membuka dialog pratinjau cetak peramban...');
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Pre-calculated visible column count for table colspan
  const visibleColumnsCount = useMemo(() => {
    let count = 3; // basic columns: No, Tanggal, Satuan
    if (showColumns.status) count++;
    if (showColumns.perkin) count++;
    if (showColumns.iksk) count++;
    if (showColumns.volume) count++;
    if (showColumns.uraian) count++;
    return count;
  }, [showColumns]);

  return (
    <div className="max-w-[1600px] mx-auto pb-24 space-y-8 px-4 sm:px-6">
      {/* Dynamic Theme & Font Injection for Printing (Aggressive Resets) */}
      <style>{`
        @media print {
          /* Force page size and orientation */
          @page {
            size: A4 ${orientation};
            margin: 12mm 10mm;
          }

          /* Hide UI Chrome completely */
          nav, aside, header, .no-print, .print\\:hidden, [class*="Sidebar"], [class*="Header"], .mobile-backdrop {
            display: none !important;
          }

          /* Reset all potential flex/grid layouts from ancestor components */
          html, body {
            background: white !important;
            color: #1e293b !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          #root, .app-container, main, div, section, article {
            margin: 0 !important;
            padding: 0 !important;
            position: relative !important;
            overflow: visible !important;
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            box-shadow: none !important;
            border: none !important;
            transform: none !important;
            transition: none !important;
            opacity: 1 !important;
          }

          .lkb-print-area {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            overflow: visible !important;
          }

          /* Elegant document header adjustments for print */
          .report-header-logo {
            width: 50px !important;
            height: 50px !important;
          }

          /* Optimized printed table sizes */
          table {
            width: 100% !important;
            table-layout: auto !important;
            border-collapse: collapse !important;
            font-size: ${fontSize === 'small' ? '7.5pt' : fontSize === 'medium' ? '9pt' : '11pt'} !important;
            line-height: 1.3 !important;
          }

          th {
            background-color: #f1f5f9 !important;
            color: #0f172a !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
            font-size: ${fontSize === 'small' ? '7.5pt' : fontSize === 'medium' ? '8.5pt' : '10pt'} !important;
            padding: 6px 4px !important;
            border: 1px solid #cbd5e1 !important;
          }

          td {
            padding: 6px 6px !important;
            border: 1px solid #cbd5e1 !important;
            word-wrap: break-word !important;
            white-space: normal !important;
          }

          tr {
            page-break-inside: avoid !important;
            page-break-after: auto !important;
          }

          thead {
            display: table-header-group !important;
          }

          /* Dynamic column hides during print */
          ${!showColumns.status ? '.col-status { display: none !important; }' : ''}
          ${!showColumns.perkin ? '.col-perkin { display: none !important; }' : ''}
          ${!showColumns.iksk ? '.col-iksk { display: none !important; }' : ''}
          ${!showColumns.volume ? '.col-volume { display: none !important; }' : ''}
          ${!showColumns.uraian ? '.col-uraian { display: none !important; }' : ''}
          
          /* Forced multi-page breaks for signatures if required */
          .signature-block {
            page-break-inside: avoid !important;
            margin-top: 30px !important;
          }
        }
      `}</style>

      {/* Header Panel - Sleek and modern info card */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-2 py-4">
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent shadow-md shadow-accent/5">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-text-header tracking-tight">
                Workspace LKB & Export PDF
              </h1>
              <p className="text-sm text-text-muted mt-1 font-medium">
                Sesuaikan tampilan, ukuran huruf, kolom tabel, dan buat PDF yang pas dan rapi.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Dual-Column Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Column: Premium Settings Control Sidebar */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-4 no-print">

          {/* Section 1: Period filter (Standalone Selects at the top) */}
          <div className="relative z-20 bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-border shadow-elegant grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[0.65rem] font-bold text-text-muted uppercase tracking-wider pl-1">Bulan</Label>
              <Select
                id="month-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                options={months}
                className="h-11 rounded-xl bg-slate-50 font-semibold border-slate-200"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[0.65rem] font-bold text-text-muted uppercase tracking-wider pl-1">Tahun</Label>
              <Select
                id="year-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                options={years}
                className="h-11 rounded-xl bg-slate-50 font-semibold border-slate-200"
              />
            </div>
          </div>


          {/* Section 3: Supervisor & Signature Customizer */}
          <Card className="rounded-3xl border-border shadow-elegant overflow-hidden bg-white/90 backdrop-blur-xl">
            <CardHeader className="border-b border-border/50 px-6 py-4 bg-slate-50/50">
              <CardTitle className="text-sm font-extrabold flex items-center gap-2.5 text-text-header">
                <User className="w-4 h-4 text-accent" />
                Data Penandatangan
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">

              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <Label htmlFor="toggle-signature" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Tampilkan Tanda Tangan
                </Label>
                <input
                  type="checkbox"
                  id="toggle-signature"
                  checked={showSignature}
                  onChange={(e) => setShowSignature(e.target.checked)}
                  className="w-4 h-4 rounded text-accent focus:ring-accent accent-accent cursor-pointer"
                />
              </div>

              {showSignature && (
                <div className="space-y-4 pt-1">
                  {/* Supervisor Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="atasan-name" className="text-[0.65rem] font-bold text-text-muted uppercase tracking-wider pl-1">
                      Nama Atasan Langsung
                    </Label>
                    <Input
                      id="atasan-name"
                      type="text"
                      placeholder="Masukkan nama atasan langsung..."
                      value={customAtasanName}
                      onChange={(e) => setCustomAtasanName(e.target.value)}
                      className="h-10 rounded-xl bg-slate-50 border-slate-200 font-semibold"
                    />
                  </div>

                  {/* Supervisor NIP */}
                  <div className="space-y-1.5">
                    <Label htmlFor="atasan-nip" className="text-[0.65rem] font-bold text-text-muted uppercase tracking-wider pl-1">
                      NIP Atasan Langsung
                    </Label>
                    <Input
                      id="atasan-nip"
                      type="text"
                      placeholder="198001012010011001..."
                      value={customAtasanNip}
                      onChange={(e) => setCustomAtasanNip(e.target.value)}
                      className="h-10 rounded-xl bg-slate-50 border-slate-200 font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                    {/* Pegawai Name */}
                    <div className="space-y-1.5">
                      <Label htmlFor="pegawai-name" className="text-[0.65rem] font-bold text-text-muted uppercase tracking-wider pl-1">
                        Nama Pegawai
                      </Label>
                      <Input
                        id="pegawai-name"
                        type="text"
                        value={customPegawaiName}
                        onChange={(e) => setCustomPegawaiName(e.target.value)}
                        className="h-10 rounded-xl bg-slate-50 border-slate-200 font-semibold text-xs"
                      />
                    </div>

                    {/* Pegawai NIP */}
                    <div className="space-y-1.5">
                      <Label htmlFor="pegawai-nip" className="text-[0.65rem] font-bold text-text-muted uppercase tracking-wider pl-1">
                        NIP Pegawai
                      </Label>
                      <Input
                        id="pegawai-nip"
                        type="text"
                        value={customPegawaiNip}
                        onChange={(e) => setCustomPegawaiNip(e.target.value)}
                        className="h-10 rounded-xl bg-slate-50 border-slate-200 font-semibold text-xs"
                      />
                    </div>
                  </div>

                  {/* Pegawai Jabatan */}
                  <div className="space-y-1.5">
                    <Label htmlFor="pegawai-jabatan" className="text-[0.65rem] font-bold text-text-muted uppercase tracking-wider pl-1">
                      Jabatan Pegawai
                    </Label>
                    <Input
                      id="pegawai-jabatan"
                      type="text"
                      value={customPegawaiJabatan}
                      onChange={(e) => setCustomPegawaiJabatan(e.target.value)}
                      className="h-10 rounded-xl bg-slate-50 border-slate-200 font-semibold text-xs"
                    />
                  </div>

                  {/* Custom Signature Date */}
                  <div className="space-y-1.5">
                    <Label htmlFor="signature-date" className="text-[0.65rem] font-bold text-text-muted uppercase tracking-wider pl-1">
                      Tanggal Tanda Tangan
                    </Label>
                    <Input
                      id="signature-date"
                      type="text"
                      value={customSignatureDate}
                      onChange={(e) => setCustomSignatureDate(e.target.value)}
                      className="h-10 rounded-xl bg-slate-50 border-slate-200 font-semibold"
                    />
                  </div>
                </div>
              )}

            </CardContent>
          </Card>

          {/* Section 4: PDF Print Guide */}
          <Card className="rounded-3xl border-border bg-slate-50/80 shadow-sm border border-slate-200/50">
            <CardContent className="p-5 flex gap-3.5 items-start">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0 border border-accent/10">
                <Info className="w-4 h-4" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-text-header tracking-tight">Petunjuk Penyimpanan PDF</h4>
                <p className="text-[0.7rem] text-text-muted leading-relaxed">
                  Pada dialog printer peramban Anda, pastikan untuk:
                </p>
                <ul className="list-disc list-inside text-[0.65rem] text-text-muted font-medium space-y-1 pl-1">
                  <li>Pilih tujuan: <span className="font-bold text-text-header">Simpan Sebagai PDF / Save as PDF</span></li>
                  <li>Sesuaikan orientasi dengan pilihan kontrol</li>
                  <li>Aktifkan opsi <span className="font-bold text-text-header">Grafik Latar Belakang (Background Graphics)</span></li>
                  <li>Matikan opsi <span className="font-bold text-text-header">Header & Footer</span></li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Main Action Button */}
          <Button
            onClick={handlePrint}
            disabled={filteredRecords.length === 0 || isGeneratingPdf}
            className="w-full h-14 rounded-2xl bg-accent hover:bg-accent-hover text-white font-black uppercase tracking-widest text-[0.8rem] shadow-xl shadow-accent/20 border-accent border-2 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5"
          >
            {isGeneratingPdf ? (
              <>
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                Mengunduh PDF...
              </>
            ) : (
              <>
                <Printer className="w-5 h-5" /> Cetak LKB ke PDF
              </>
            )}
          </Button>

        </div>

        {/* Right Column: Live Document Canvas Workspace */}
        <div className="lg:col-span-8 space-y-4">

          {/* Zoom and Canvas Header controller */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-white px-6 py-3.5 rounded-3xl border border-border shadow-sm no-print gap-3">
            <div className="flex items-center gap-2">
              <LayoutTemplate className="w-4 h-4 text-accent" />
              <span className="text-xs font-extrabold text-text-header">
                Interactive Canvas Preview
              </span>
            </div>

            {/* Zoom slider control */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <span className="text-[0.65rem] font-bold text-text-muted uppercase tracking-wider shrink-0">
                Skala Preview: {Math.round(zoomScale * 100)}%
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setZoomScale(prev => Math.max(0.6, prev - 0.05))}
                  className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200"
                >
                  <Minimize2 className="w-3.5 h-3.5 text-slate-500" />
                </button>
                <input
                  type="range"
                  min="0.6"
                  max="1.2"
                  step="0.05"
                  value={zoomScale}
                  onChange={(e) => setZoomScale(parseFloat(e.target.value))}
                  className="w-24 accent-accent cursor-pointer h-1.5 rounded-lg bg-slate-200"
                />
                <button
                  onClick={() => setZoomScale(prev => Math.min(1.2, prev + 0.05))}
                  className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Preview canvas shell */}
          <div className="w-full bg-slate-900/5 rounded-[2.5rem] p-4 md:p-8 border-2 border-dashed border-slate-300/60 shadow-inner min-h-[900px] flex justify-center items-start overflow-auto">

            {filteredRecords.length > 0 ? (

              /* simulated paper canvas sheet */
              <div
                style={{
                  transform: `scale(${zoomScale})`,
                  transformOrigin: 'top center'
                }}
                className={cn(
                  "bg-white shadow-2xl p-8 md:p-12 transition-all duration-300 relative text-slate-800 shrink-0 border border-slate-200 lkb-print-area",
                  orientation === 'landscape'
                    ? "w-[1090px] min-h-[770px]"
                    : "w-[790px] min-h-[1110px]"
                )}
              >

                {/* Print Sheet Header */}
                <div className="flex items-center gap-5 border-b-2 border-slate-800 pb-5 mb-6">
                  <img
                    src="https://dki.kemenag.go.id/storage/files/logo-kemenag-png-1png.png"
                    alt="Logo Kemenag"
                    className="w-14 h-14 object-contain report-header-logo shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1">
                    <h2 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight leading-snug">
                      LAPORAN KINERJA BULANAN (LKB) PEGAWAI
                    </h2>
                    <p className="text-xs md:text-sm font-extrabold text-slate-600 tracking-wide uppercase mt-0.5">
                      BULAN {selectedMonthName} TAHUN {selectedYear}
                    </p>
                  </div>
                </div>

                {/* Personal Information Blocks */}
                <div className="grid grid-cols-[110px_10px_1fr] gap-y-1.5 text-xs font-semibold text-slate-800 mb-6 max-w-2xl border bg-slate-50/50 p-4 rounded-xl border-slate-200">
                  <span className="text-slate-500 font-medium">Nama Pegawai</span>
                  <span>:</span>
                  <span className="text-slate-900 font-bold">{customPegawaiName || '-'}</span>

                  <span className="text-slate-500 font-medium">NIP</span>
                  <span>:</span>
                  <span className="text-slate-900">{customPegawaiNip || '-'}</span>

                  <span className="text-slate-500 font-medium">Jabatan</span>
                  <span>:</span>
                  <span className="text-slate-850 font-bold">{customPegawaiJabatan || '-'}</span>

                  <span className="text-slate-500 font-medium">Unit Kerja</span>
                  <span>:</span>
                  <span className="text-slate-850">{satker?.name || '-'}</span>
                </div>

                {/* Main Print Table Container */}
                <div className="w-full overflow-x-auto">
                  <table className="w-full border-collapse border border-slate-400">
                    <thead>
                      <tr className="bg-slate-100/80 font-bold border-b border-slate-400 text-slate-900">
                        <th className="border border-slate-400 p-2.5 text-center w-10">No</th>
                        <th className="border border-slate-400 p-2.5 text-center w-28">Tanggal</th>
                        {showColumns.status && (
                          <th className="border border-slate-400 p-2.5 text-center w-24 col-status">Status</th>
                        )}
                        {showColumns.perkin && (
                          <th className="border border-slate-400 p-2.5 text-center w-36 col-perkin">SK / Perkin</th>
                        )}
                        {showColumns.iksk && (
                          <th className="border border-slate-400 p-2.5 text-center w-40 col-iksk">Indikator Kinerja</th>
                        )}
                        {showColumns.volume && (
                          <th className="border border-slate-400 p-2.5 text-center w-14 col-volume">Vol</th>
                        )}
                        <th className="border border-slate-400 p-2.5 text-center w-16">Satuan</th>
                        {showColumns.uraian && (
                          <th className="border border-slate-400 p-2.5 text-center min-w-[280px] col-uraian">Uraian Kegiatan</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecords.map((record, index) => {
                        return (
                          <tr key={record.id} className="hover:bg-slate-50/50 transition-colors text-slate-800">
                            <td className="border border-slate-400 p-2.5 text-center font-bold text-slate-500">{index + 1}</td>
                            <td className="border border-slate-400 p-2.5 text-center whitespace-nowrap font-semibold text-slate-700">
                              {record.tanggal.split('-').reverse().join('-')}
                            </td>
                            {showColumns.status && (
                              <td className="border border-slate-400 p-2.5 text-center text-slate-700 font-medium col-status">
                                {record.status_kehadiran}
                              </td>
                            )}
                            {showColumns.perkin && (
                              <td className="border border-slate-400 p-2.5 font-semibold text-slate-900 leading-normal col-perkin">
                                {record.perkin_name}
                              </td>
                            )}
                            {showColumns.iksk && (
                              <td className="border border-slate-400 p-2.5 font-medium text-slate-700 leading-normal col-iksk">
                                {record.iksk_name}
                              </td>
                            )}
                            {showColumns.volume && (
                              <td className="border border-slate-400 p-2.5 text-center font-extrabold text-slate-900 col-volume">
                                {record.volume}
                              </td>
                            )}
                            <td className="border border-slate-400 p-2.5 text-center font-semibold text-slate-600">{record.satuan}</td>
                            {showColumns.uraian && (
                              <td className="border border-slate-400 p-2.5 leading-relaxed text-slate-700 font-medium col-uraian">
                                1. {record.uraian_pekerjaan}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Interactive Dynamic Signature Block */}
                {showSignature && (
                  <div className="grid grid-cols-2 gap-20 mt-16 text-center font-bold text-slate-800 text-xs md:text-sm signature-block">
                    <div>
                      <p>Mengetahui,</p>
                      <p>Atasan Langsung</p>
                      <div className="h-24 flex items-end justify-center relative">
                        {enableAnchorAtasan && (
                          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none text-[0.65rem] text-slate-800">
                            {anchorAtasanText}
                          </span>
                        )}
                        {/* Placeholder signature area */}
                        <div className="w-40 border-b border-dashed border-slate-300/40 no-print" />
                      </div>
                      <p className="text-slate-900">
                        {customAtasanName ? `( ${customAtasanName} )` : '( ........................................ )'}
                      </p>
                      <p className="text-[0.65rem] md:text-xs font-semibold text-slate-600 mt-1">
                        {customAtasanNip ? `NIP. ${customAtasanNip}` : 'NIP. ........................................'}
                      </p>
                    </div>
                    <div>
                      <p>{customSignatureDate || 'Kulon Progo, ........................................'}</p>
                      <p>{customPegawaiJabatan || 'Pegawai Negeri Sipil'},</p>
                      <div className="h-24 flex items-end justify-center relative">
                        {enableAnchorPegawai && (
                          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none text-[0.65rem] text-slate-800">
                            {anchorPegawaiText}
                          </span>
                        )}
                        {/* Placeholder signature area */}
                        <div className="w-40 border-b border-dashed border-slate-300/40 no-print" />
                      </div>
                      <p className="text-slate-900">
                        ( {customPegawaiName || '........................................'} )
                      </p>
                      <p className="text-[0.65rem] md:text-xs font-semibold text-slate-600 mt-1">
                        NIP. {customPegawaiNip || '........................................'}
                      </p>
                    </div>
                  </div>
                )}

              </div>
            ) : (
              /* Simulated empty sheet view */
              <div className="bg-white shadow-2xl p-12 w-[790px] min-h-[500px] flex flex-col items-center justify-center text-center border border-slate-200">
                <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-6 text-slate-400">
                  {isRecordsLoading ? (
                    <div className="w-8 h-8 border-3 border-accent/20 border-t-accent rounded-full animate-spin" />
                  ) : (
                    <Search className="w-10 h-10 text-slate-400" />
                  )}
                </div>
                <h3 className="text-lg font-extrabold text-slate-800">
                  {isRecordsLoading ? 'Memuat Laporan Kinerja...' : 'Data Tidak Ditemukan'}
                </h3>
                <p className="text-xs text-slate-500 mt-2 max-w-sm font-semibold leading-relaxed">
                  {isRecordsLoading
                    ? 'Sistem sedang mengambil riwayat kinerja Anda dari basis data. Silakan tunggu sebentar...'
                    : `Tidak ada laporan kinerja yang tercatat pada bulan ${selectedMonthName} ${selectedYear}. Silakan pilih periode lain atau isi kinerja harian Anda.`}
                </p>
              </div>

            )}
          </div>

          {/* Anchor TTE Settings (Below Preview) */}
          <Card className="rounded-3xl border-border shadow-sm overflow-hidden bg-white mt-6 no-print">
            <CardHeader className="border-b border-border/50 px-6 py-4 bg-slate-50/50">
              <CardTitle className="text-sm font-extrabold flex items-center gap-2.5 text-text-header">
                <Settings className="w-4 h-4 text-accent" />
                Pengaturan Anchor TTE (Tanda Tangan Elektronik)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Atasan Anchor */}
                <div className="space-y-3 p-4 rounded-2xl border border-slate-100 bg-slate-50/30">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="toggle-anchor-atasan" className="text-xs font-bold text-slate-700 cursor-pointer">
                      Anchor TTE Atasan
                    </Label>
                    <input
                      type="checkbox"
                      id="toggle-anchor-atasan"
                      checked={enableAnchorAtasan}
                      onChange={(e) => setEnableAnchorAtasan(e.target.checked)}
                      className="w-4 h-4 rounded text-accent focus:ring-accent accent-accent cursor-pointer"
                    />
                  </div>
                  {enableAnchorAtasan && (
                    <Input
                      type="text"
                      value={anchorAtasanText}
                      onChange={(e) => setAnchorAtasanText(e.target.value)}
                      placeholder="Contoh: $ttd_atasan"
                      className="h-10 rounded-xl bg-white border-slate-200 text-xs font-semibold"
                    />
                  )}
                </div>

                {/* Pegawai Anchor */}
                <div className="space-y-3 p-4 rounded-2xl border border-slate-100 bg-slate-50/30">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="toggle-anchor-pegawai" className="text-xs font-bold text-slate-700 cursor-pointer">
                      Anchor TTE Pegawai
                    </Label>
                    <input
                      type="checkbox"
                      id="toggle-anchor-pegawai"
                      checked={enableAnchorPegawai}
                      onChange={(e) => setEnableAnchorPegawai(e.target.checked)}
                      className="w-4 h-4 rounded text-accent focus:ring-accent accent-accent cursor-pointer"
                    />
                  </div>
                  {enableAnchorPegawai && (
                    <Input
                      type="text"
                      value={anchorPegawaiText}
                      onChange={(e) => setAnchorPegawaiText(e.target.value)}
                      placeholder="Contoh: $ttd_pegawai"
                      className="h-10 rounded-xl bg-white border-slate-200 text-xs font-semibold"
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

      </div>

    </div>
  );
};
