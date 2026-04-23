import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { usePerkinStore, Perkin, IKSK, Period } from '../../store/perkinStore';
import { FileSpreadsheet, Upload, Download, Trash2, CheckCircle, AlertCircle, Info, Calendar } from 'lucide-react';
import { Select } from '../../components/ui/Select';

export const ManajemenPerkin: React.FC = () => {
  const { perkins, setPerkins, clearPerkins, periods } = usePerkinStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showImportSuccess, setShowImportSuccess] = useState(false);
  const [importCount, setImportCount] = useState(0);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');
  const [errorPeriod, setErrorPeriod] = useState(false);

  const activePeriods = periods.filter(p => p.isActive);

  const downloadTemplate = () => {
    const templateData = [
      {
        'No': 1,
        'Sasaran Kegiatan (SK)': 'Meningkatnya jaminan beragama, toleransi, dan cinta kemanusiaan umat beragama (SK.1)',
        'Indikator Kinerja (IKSK)': 'Persentase KUA yang menyelenggarakan EWS (IKSK.1)',
        'Target Vol': 91,
        'Target Satuan': '%'
      },
      {
        'No': '',
        'Sasaran Kegiatan (SK)': '',
        'Indikator Kinerja (IKSK)': 'Persentase peningkatan dialog kerukunan yang difasilitasi untuk merumuskan rekomendasi EWS (IKSK.2)',
        'Target Vol': 50,
        'Target Satuan': '%'
      },
      {
        'No': 2,
        'Sasaran Kegiatan (SK)': 'Meningkatnya kualitas layanan keagamaan yang profesional, inklusif, dan berdampak (SK.2)',
        'Indikator Kinerja (IKSK)': 'Persentase penyuluh agama yang memperoleh Nilai Kinerja berkategori baik (IKSK.1)',
        'Target Vol': 85.88,
        'Target Satuan': '%'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template Perkin");
    XLSX.writeFile(wb, "Template_Perkin_IKSK.xlsx");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedPeriodId) {
       setErrorPeriod(true);
       setTimeout(() => setErrorPeriod(false), 3000);
       return;
    }
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      processImportedData(data);
    };
    reader.readAsBinaryString(file);
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processImportedData = (data: any[]) => {
    const newPerkins: Perkin[] = [];
    let currentPerkin: Perkin | null = null;

    data.forEach((row: any, index: number) => {
      const skName = row['Sasaran Kegiatan (SK)'];
      const ikskName = row['Indikator Kinerja (IKSK)'];
      const vol = row['Target Vol'];
      const satuan = row['Target Satuan'];

      if (skName) {
        // New Perkin
        currentPerkin = {
          id: Date.now() + index,
          name: skName,
          period_id: selectedPeriodId,
          iksk: []
        };
        newPerkins.push(currentPerkin);
      }

      if (currentPerkin && ikskName) {
        const iksk: IKSK = {
          id: Date.now() + index + 1000,
          name: ikskName,
          target_vol: vol,
          target_satuan: satuan
        };
        currentPerkin.iksk.push(iksk);
      }
    });

    setPerkins(newPerkins);
    setImportCount(newPerkins.length);
    setShowImportSuccess(true);
    setTimeout(() => setShowImportSuccess(false), 4000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-text-header tracking-tight">Manajemen Perkin & IKSK</h1>
          <p className="text-sm text-text-muted mt-2 font-medium">Impor dan kelola data Sasaran Kegiatan (Perkin) melalui file Excel.</p>
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="w-64 space-y-1.5">
             <label className="text-[0.65rem] font-bold text-text-muted uppercase tracking-widest pl-1">Pilih Periode Aktif</label>
             <Select 
                placeholder="Pilih Periode..." 
                className="h-11 rounded-xl bg-white border-border shadow-sm text-[0.75rem] font-bold"
                value={selectedPeriodId}
                onChange={(e) => setSelectedPeriodId(e.target.value)}
                options={activePeriods.map(p => ({ label: p.name, value: p.id }))}
             />
          </div>
          <Button 
            variant="outline" 
            onClick={downloadTemplate} 
            className="flex gap-2 rounded-xl px-5 h-11 h-11 font-bold uppercase tracking-widest text-[0.7rem] border-border hover:bg-slate-50 transition-all hover:shadow-md"
          >
            <Download className="w-4 h-4" />
            Download Template
          </Button>
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            className="flex gap-2 rounded-xl px-6 h-11 font-bold uppercase tracking-widest text-[0.75rem] shadow-lg shadow-accent/25 hover:shadow-xl hover:-translate-y-1 transition-all"
          >
            <Upload className="w-4 h-4" />
            Import Excel
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".xlsx, .xls"
            className="hidden"
          />
        </div>
      </div>

      {errorPeriod && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-rose-50 border border-rose-100 text-rose-800 p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold shadow-sm"
        >
          <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-rose-600" />
          </div>
          Silakan pilih Periode Perkin terlebih dahulu sebelum mengunggah file!
        </motion.div>
      )}

      {activePeriods.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-amber-50 border border-amber-100 text-amber-800 p-6 rounded-[2rem] flex flex-col items-center text-center gap-4 shadow-sm"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h4 className="font-extrabold tracking-tight">Tidak Ada Periode Aktif</h4>
            <p className="text-sm font-medium text-amber-900/60 mt-1">Anda tidak dapat menginput Perkin karena belum ada Periode yang dibuat atau statusnya sedang Non-aktif.</p>
          </div>
          <Button onClick={() => window.location.href='/operator/periode'} className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl px-6 h-10 text-[0.7rem] font-bold uppercase tracking-widest">
             Masuk Manajemen Periode
          </Button>
        </motion.div>
      )}

      {perkins.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex flex-col items-center justify-center p-16 text-center border-dashed border-2 border-border rounded-[2.5rem] bg-white shadow-sm group">
            <div className="w-24 h-24 rounded-3xl bg-slate-50 flex items-center justify-center mb-8 border border-border group-hover:bg-accent/5 group-hover:border-accent/40 group-hover:scale-110 transition-all duration-500">
              <FileSpreadsheet className="w-12 h-12 text-slate-300 group-hover:text-accent group-hover:rotate-6 transition-all" />
            </div>
            <h3 className="text-2xl font-extrabold text-text-header tracking-tight">Belum Ada Data Perkin</h3>
            <p className="text-text-muted mt-3 max-w-sm font-medium leading-relaxed">
              Silakan unduh template excel di atas, lengkapi data Sasaran Kegiatan dan Indikator Kinerja, lalu unggah kembali ke dashboard ini.
            </p>
            <div className="mt-10 p-5 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex items-start gap-3 max-w-md text-left">
              <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <p className="text-[0.8rem] text-text-muted font-medium">Format excel harus sesuai dengan template agar sistem dapat memetakan data IKSK ke dalam Sasaran Kegiatan yang tepat.</p>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center px-4">
            <p className="text-xs font-bold text-text-muted uppercase tracking-[0.15em]">Menampilkan <span className="text-text-header font-extrabold">{perkins.length}</span> Sasaran Kegiatan</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearPerkins} 
              className="flex gap-2 rounded-xl text-rose-600 border-rose-100 hover:bg-rose-50 hover:border-rose-200 font-bold uppercase tracking-widest text-[0.65rem] transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Reset Data
            </Button>
          </div>
          
          <div className="space-y-6">
            {perkins.map((perkin, i) => (
              <motion.div
                key={perkin.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="rounded-3xl border-border shadow-elegant overflow-hidden group">
                  <CardHeader className="bg-slate-50 border-b border-border/60 px-8 py-5 group-hover:bg-white transition-colors duration-300">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-extrabold text-accent flex items-center gap-2 tracking-tight">
                        <div className="w-1.5 h-6 bg-accent rounded-full opacity-50" />
                        {perkin.name}
                        </CardTitle>
                        <div className="px-3 py-1 bg-accent/10 border border-accent/20 rounded-lg">
                            <span className="text-[0.6rem] font-black text-accent uppercase tracking-widest">
                                {periods.find(p => p.id === perkin.period_id)?.name || 'Tanpa Periode'}
                            </span>
                        </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-[0.875rem]">
                        <thead>
                          <tr className="bg-white">
                            <th className="text-left py-4 px-8 border-b border-border/40 text-[0.65rem] font-bold text-text-muted uppercase tracking-widest w-16">No</th>
                            <th className="text-left py-4 px-4 border-b border-border/40 text-[0.65rem] font-bold text-text-muted uppercase tracking-widest">Indikator Kinerja (IKSK)</th>
                            <th className="text-center py-4 px-8 border-b border-border/40 text-[0.65rem] font-bold text-text-muted uppercase tracking-widest w-28">Target Vol</th>
                            <th className="text-center py-4 px-8 border-b border-border/40 text-[0.65rem] font-bold text-text-muted uppercase tracking-widest w-28">Satuan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20">
                          {perkin.iksk.map((iksk, idx) => (
                            <tr key={iksk.id} className="hover:bg-slate-50/50 transition-colors group/row">
                              <td className="py-4 px-8 text-center text-[0.8rem] font-extrabold text-text-muted/60">{idx + 1}</td>
                              <td className="py-4 px-4 font-semibold text-text-main tracking-tight leading-relaxed">{iksk.name}</td>
                              <td className="py-4 px-8 text-center text-[0.9375rem] font-extrabold text-text-header group-hover/row:text-accent transition-colors">{iksk.target_vol}</td>
                              <td className="py-4 px-8 text-center"><span className="px-2.5 py-1 rounded-lg bg-slate-100 text-text-muted font-extrabold text-[0.65rem] uppercase tracking-widest group-hover/row:bg-accent/10 group-hover/row:text-accent transition-all">{iksk.target_satuan}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          
          <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 flex items-start gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-200">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h4 className="text-[0.9375rem] font-extrabold text-emerald-900 tracking-tight">Konfigurasi Data Valid</h4>
              <p className="text-[0.8125rem] text-emerald-700/80 mt-1 font-medium leading-relaxed">
                Data Sasaran Kegiatan dan IKSK telah berhasil dipetakan. Pegawai di Satuan Kerja yang diizinkan sekarang sudah dapat melakukan pelaporan kinerja harian berdasarkan data di atas secara real-time.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
