import React, { useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, CheckSquare, Users, Building, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useKinerjaStore } from '../../store/kinerjaStore';
import { useUserStore } from '../../store/userStore';
import { useSatkerStore } from '../../store/satkerStore';
import { dashboardService } from '../../api/services/dashboardService';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { records, isLoading: isLoadingKinerja, fetchKinerja } = useKinerjaStore();
  const { users, fetchUsers } = useUserStore();
  const { satkers, fetchSatkers } = useSatkerStore();
  const [bawahanData, setBawahanData] = React.useState<any[]>([]);
  const [isLoadingBawahan, setIsLoadingBawahan] = React.useState(false);
  const [errorBawahan, setErrorBawahan] = React.useState<string | null>(null);

  useEffect(() => {
    fetchKinerja();
    fetchUsers();
    fetchSatkers();
    loadBawahan();
  }, [fetchKinerja, fetchUsers, fetchSatkers]);

  const loadBawahan = async () => {
    setIsLoadingBawahan(true);
    setErrorBawahan(null);
    try {
      const res = await dashboardService.getBawahan();
      setBawahanData(res.data?.data || res.data || []);
    } catch (err: any) {
      setErrorBawahan(err.response?.data?.message || 'Gagal memuat data bawahan.');
    } finally {
      setIsLoadingBawahan(false);
    }
  };

  // Ambil log aktivitas terbaru dari seluruh bawahan
  const recentSubordinateLogs = useMemo(() => {
    const logs: any[] = [];
    bawahanData.forEach((bawahan) => {
      const userName = bawahan.nama || bawahan.user?.nama || 'Anonymous';
      const userAvatar = userName.charAt(0).toUpperCase();
      (bawahan.kinerja_harians || []).forEach((lh: any) => {
        logs.push({
          id: lh.id,
          userName: userName,
          userAvatar: userAvatar,
          tanggal: lh.tanggal,
          waktu: lh.created_at
            ? new Date(lh.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
            : '',
          timestamp: lh.created_at ? new Date(lh.created_at).getTime() : 0,
          ikskName: lh.iksk?.indikator || lh.iksk_name || '-',
          uraianPekerjaan: lh.uraian_pekerjaan,
          statusKehadiran: lh.status_kehadiran || 'Hadir',
        });
      });
    });

    return logs
      .sort((a, b) => b.timestamp - a.timestamp || new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
      .slice(0, 10);
  }, [bawahanData]);

  // Hitung total laporan dari seluruh bawahan
  const totalLaporanBawahan = useMemo(() => {
    return bawahanData.reduce((sum, b) => sum + (Number(b.total_kinerja) || 0), 0);
  }, [bawahanData]);

  const isLoading = isLoadingKinerja || isLoadingBawahan;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-header tracking-tight">Executive Dashboard</h1>
          <p className="text-sm text-text-muted mt-2 font-medium italic">Overview performa Satuan Kerja di lingkungan Kantor Kemenag Kulon Progo.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={loadBawahan} className="flex-1 sm:flex-none rounded-xl bg-accent hover:bg-accent-hover text-white px-4 py-2.5 text-[0.65rem] font-bold uppercase tracking-widest shadow-lg shadow-accent/20 border-accent border flex items-center gap-2">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingBawahan ? 'animate-spin' : ''}`} /> Sync Data
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Pegawai Bawahan', value: bawahanData.length.toString(), trend: 'Aktif', sub: 'Personil Terpantau', icon: Users, color: 'text-success' },
          { label: 'Total Laporan Kinerja', value: totalLaporanBawahan.toString(), trend: 'Akumulasi', sub: 'Laporan Masuk', icon: BarChart3, color: 'text-accent' },
          { label: 'Satker Terpantau', value: satkers.length.toString(), trend: 'Global', sub: 'Unit Kerja Terintegrasi', icon: Building, color: 'text-slate-600' },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel rounded-2xl p-6 flex flex-col shadow-elegant hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="flex justify-between items-start relative z-10">
              <span className="text-[0.65rem] text-text-muted uppercase tracking-[0.2em] font-bold">{item.label}</span>
              <div className="p-2 rounded-lg bg-slate-50 border border-border group-hover:border-accent group-hover:bg-accent/5 transition-colors">
                <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-4 relative z-10">
              <span className="text-3xl font-extrabold text-text-header tracking-tight">{item.value}</span>
              <span className="text-[0.7rem] font-extrabold text-success">{item.trend}</span>
            </div>
            <div className="text-[0.65rem] text-text-muted mt-2 font-medium opacity-60 italic">{item.sub}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Data Bawahan */}
        <Card className="col-span-12 rounded-3xl border-border shadow-elegant overflow-hidden">
          <CardHeader className="bg-surface border-b border-border/50 px-8 py-6 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-extrabold tracking-tight">Kinerja Bawahan</CardTitle>
              <p className="text-[0.65rem] text-text-muted font-bold uppercase tracking-widest mt-1">Daftar Kontribusi Laporan Kinerja Pegawai Bawahan</p>
            </div>
            {isLoadingBawahan && <Loader2 className="w-5 h-5 text-accent animate-spin" />}
          </CardHeader>
          <CardContent className="p-6">
            {errorBawahan ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                <AlertCircle className="w-8 h-8 text-rose-400" />
                <p className="text-sm text-text-muted font-medium">{errorBawahan}</p>
                <Button variant="outline" onClick={loadBawahan} className="rounded-xl px-4 h-9 text-[0.65rem] font-bold uppercase tracking-widest">Coba Lagi</Button>
              </div>
            ) : bawahanData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                <Users className="w-8 h-8 text-slate-300" />
                <p className="text-sm text-text-muted font-medium italic">Belum ada data kinerja bawahan.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[400px] overflow-y-auto pr-1">
                {bawahanData.map((bawahan: any, i: number) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="flex gap-4 p-4 rounded-2xl border border-slate-100 hover:border-accent/20 bg-slate-50/30 hover:bg-accent/[0.01] transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-border flex items-center justify-center text-text-header font-black text-xs group-hover:bg-accent group-hover:text-white transition-all shadow-sm">
                      {(bawahan?.nama || bawahan?.user?.nama || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-extrabold text-text-header tracking-tight truncate">{bawahan?.nama || bawahan?.user?.nama || 'Pegawai'}</p>
                      <p className="text-xs text-text-muted font-medium mt-0.5 truncate">{bawahan?.jabatan || bawahan?.user?.jabatan || 'Pegawai'}</p>
                      <div className="mt-2 text-[0.65rem] font-black uppercase tracking-wider text-accent inline-block px-2 py-0.5 rounded-md bg-accent/5 border border-accent/10">
                        {bawahan?.total_kinerja ?? '-'} Laporan
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Log Aktivitas */}
      <div className="grid grid-cols-12 gap-8">
        <Card className="col-span-12 rounded-3xl border-border shadow-elegant overflow-hidden">
          <CardHeader className="bg-surface border-b border-border/50 px-8 py-6">
            <CardTitle className="text-base font-extrabold text-text-header">Log Aktivitas Terbaru</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {isLoadingBawahan ? (
              <div className="p-10 flex justify-center"><Loader2 className="w-6 h-6 text-accent animate-spin" /></div>
            ) : recentSubordinateLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                <Users className="w-8 h-8 text-slate-300" />
                <p className="text-sm text-text-muted font-medium italic">Belum ada aktivitas terbaru dari bawahan.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                {recentSubordinateLogs.map((log) => (
                  <div key={log.id} className="flex gap-4 group">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-border flex items-center justify-center text-text-header font-black text-xs group-hover:bg-accent group-hover:text-white transition-all shadow-sm">
                        {log.userAvatar}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-extrabold text-text-header tracking-tight truncate">{log.userName}</p>
                        <span className="text-[0.65rem] font-bold text-text-muted mt-0.5">{log.waktu || log.tanggal}</span>
                      </div>
                      <p className="text-xs text-text-muted font-medium mt-1 truncate" title={log.uraianPekerjaan}>{log.uraianPekerjaan || log.ikskName}</p>
                      <div className="mt-2 text-[0.65rem] font-black uppercase tracking-wider text-accent inline-block px-2 py-0.5 rounded-md bg-accent/5 border border-accent/10 italic">
                        {log.statusKehadiran}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-10 flex justify-center">
              <Button variant="outline" onClick={() => navigate('/pimpinan/monitoring')} className="rounded-xl h-11 px-10 text-[0.65rem] font-black tracking-widest uppercase border-border">Lihat Seluruh Log Aktivitas</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
