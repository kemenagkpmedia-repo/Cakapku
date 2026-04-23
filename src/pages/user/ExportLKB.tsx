import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { useKinerjaStore } from '../../store/kinerjaStore';
import { useAuthStore } from '../../store/authStore';
import { useSatkerStore } from '../../store/satkerStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Label } from '../../components/ui/Label';
import { Printer, FileDown, Calendar, Search } from 'lucide-react';
import { cn } from '../../utils/cn';

export const ExportLKB: React.FC = () => {
  const { records } = useKinerjaStore();
  const { user } = useAuthStore();
  const { satkers } = useSatkerStore();
  
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState<string>(String(new Date().getMonth() + 1).padStart(2, '0'));
  const [selectedYear, setSelectedYear] = useState<string>(String(currentYear));

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

  const satker = satkers.find(s => s.id === user?.satker_id);

  const filteredRecords = useMemo(() => {
    return records
      .filter(record => {
        const [year, month] = record.tanggal.split('-');
        return year === selectedYear && month === selectedMonth;
      })
      .sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());
  }, [records, selectedMonth, selectedYear]);

  const handlePrint = () => {
    window.print();
  };

  const selectedMonthName = months.find(m => m.value === selectedMonth)?.label || '';

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-8">
      {/* Search Filter - Hidden on Print */}
      <Card className="print:hidden rounded-3xl border-border shadow-elegant overflow-hidden bg-white/80 backdrop-blur-md">
        <CardHeader className="border-b border-border/50 px-8 py-6">
          <CardTitle className="text-lg font-extrabold flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
              <Calendar className="w-5 h-5" />
            </div>
            Filter Laporan Kinerja Bulanan
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div className="space-y-2">
              <Label className="text-[0.7rem] font-bold text-text-muted uppercase tracking-widest pl-1">Pilih Bulan</Label>
              <Select 
                id="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                options={months}
                className="h-12 rounded-xl bg-slate-50 font-semibold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[0.7rem] font-bold text-text-muted uppercase tracking-widest pl-1">Pilih Tahun</Label>
              <Select 
                id="year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                options={years}
                className="h-12 rounded-xl bg-slate-50 font-semibold"
              />
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={handlePrint}
                disabled={filteredRecords.length === 0}
                className="flex-1 h-12 rounded-xl bg-accent hover:bg-accent-hover text-white font-bold uppercase tracking-widest text-[0.7rem] shadow-lg shadow-accent/20 border-accent border"
              >
                <Printer className="w-4 h-4 mr-2" /> Cetak LKB
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      {filteredRecords.length > 0 ? (
        <Card className="rounded-3xl border-border shadow-elegant overflow-hidden bg-white min-h-[800px]">
          <CardContent className="p-8 pt-12 md:p-12 lkb-print-area overflow-x-auto">
            {/* Report Header */}
            <div className="flex flex-col gap-6 mb-8">
              <div className="flex items-center gap-4">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Logo_Kementerian_Agama.svg/1200px-Logo_Kementerian_Agama.svg.png" alt="Logo Kemenag" className="w-12 h-12 object-contain" referrerPolicy="no-referrer" />
                <h2 className="text-xl md:text-2xl font-bold border-l-2 border-slate-200 pl-4">
                  Laporan Kinerja Bulanan (LKB) Pegawai {selectedMonthName} {selectedYear}
                </h2>
              </div>
              
              <div className="grid grid-cols-[100px_1fr] gap-x-4 gap-y-2 text-sm font-semibold text-text-header">
                <span className="text-text-muted">Nama</span>
                <span>: {user?.name?.toUpperCase()}</span>
                <span className="text-text-muted">NIP</span>
                <span>: {user?.nip || '-'}</span>
                <span className="text-text-muted">Jabatan</span>
                <span>: {user?.jabatan || '-'}</span>
                <span className="text-text-muted">Unit Kerja</span>
                <span>: {satker?.name || '-'}</span>
              </div>
            </div>

            {/* Report Table */}
            <div className="w-full">
              <table className="w-full border-collapse border border-slate-300 text-[0.75rem] md:text-[0.8125rem]">
                <thead>
                  <tr className="bg-slate-100 uppercase tracking-tight font-bold">
                    <th className="border border-slate-300 p-2 text-center w-10">No</th>
                    <th className="border border-slate-300 p-2 text-center w-28">Tanggal</th>
                    <th className="border border-slate-300 p-2 text-center w-24">Status</th>
                    <th className="border border-slate-300 p-2 text-center w-12">SK</th>
                    <th className="border border-slate-300 p-2 text-center">Indikator Kinerja</th>
                    <th className="border border-slate-300 p-2 text-center w-16">Volume</th>
                    <th className="border border-slate-300 p-2 text-center w-16">Satuan</th>
                    <th className="border border-slate-300 p-2 text-center min-w-[300px]">Uraian Kegiatan</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record, index) => {
                     return (
                      <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                        <td className="border border-slate-300 p-3 text-center font-medium text-slate-500">{index + 1}</td>
                        <td className="border border-slate-300 p-3 text-center whitespace-nowrap font-medium text-slate-600">
                          {record.tanggal.split('-').reverse().join('-')}
                        </td>
                        <td className="border border-slate-300 p-3 text-center text-slate-600 font-medium">
                          {record.status_kehadiran}
                        </td>
                        <td className="border border-slate-300 p-3 font-semibold text-accent leading-relaxed text-[0.75rem]">
                          {record.perkin_name}
                        </td>
                        <td className="border border-slate-300 p-3 font-medium text-slate-700 leading-relaxed text-[0.75rem]">
                          {record.iksk_name}
                        </td>
                        <td className="border border-slate-300 p-3 text-center font-bold text-slate-900">{record.volume}</td>
                        <td className="border border-slate-300 p-3 text-center font-medium opacity-80">{record.satuan}</td>
                        <td className="border border-slate-300 p-3 leading-relaxed text-slate-600 text-[0.7rem]">
                          Kegiatan Kerja Tanggal {record.tanggal.split('-').reverse().join('-')} : 1. {record.uraian_pekerjaan}
                        </td>
                      </tr>
                     );
                  })}
                </tbody>
              </table>
            </div>

            {/* Signature Area - Print Only */}
            <div className="hidden print:grid grid-cols-2 gap-20 mt-20 text-center font-bold">
              <div>
                <p>Mengetahui,</p>
                <p>Atasan Langsung</p>
                <div className="h-24" />
                <p>( ........................................ )</p>
                <p className="text-xs font-medium">NIP. ........................................</p>
              </div>
              <div>
                <p>Kulon Progo, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p>Pegawai Negeri Sipil,</p>
                <div className="h-24" />
                <p>{user?.name?.toUpperCase()}</p>
                <p className="text-xs font-medium text-text-muted mt-1">NIP. {user?.nip || '........................................'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white/40 backdrop-blur-sm rounded-[3rem] border-2 border-dashed border-border text-center px-4">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-slate-400">
            <Search className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-extrabold text-text-header">Data tidak ditemukan</h3>
          <p className="text-sm text-text-muted mt-2 max-w-xs font-medium">
            Tidak ada laporan kinerja yang tercatat pada <span className="text-accent font-bold">{selectedMonthName} {selectedYear}</span>. Silakan periksa kembali filter Anda atau mulai input kinerja harian.
          </p>
          <Button 
            variant="outline" 
            className="mt-8 rounded-xl border-border px-8"
            onClick={() => {
              // Reset to current month if possible
              setSelectedMonth(String(new Date().getMonth() + 1).padStart(2, '0'));
              setSelectedYear(String(new Date().getFullYear()));
            }}
          >
            Reset Filter
          </Button>
        </div>
      )}

      {/* Global CSS for printing */}
      <style>{`
        @media print {
          nav, aside, header, .print\\:hidden {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
          }
          .lkb-print-area {
            border: none !important;
            box-shadow: none !important;
            padding: 20mm !important;
          }
          .Card {
            border: none !important;
            box-shadow: none !important;
          }
          table {
            font-size: 10pt !important;
          }
        }
      `}</style>
    </div>
  );
};
