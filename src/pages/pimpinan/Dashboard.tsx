import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { BarChart3, CheckSquare, Users, Building } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useKinerjaStore } from '../../store/kinerjaStore';
import { useUserStore } from '../../store/userStore';
import { useSatkerStore } from '../../store/satkerStore';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export const Dashboard: React.FC = () => {
  const { records } = useKinerjaStore();
  const { users } = useUserStore();
  const { satkers } = useSatkerStore();

  // Dynamic Attendance Stats
  const attendanceStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = records.filter(r => r.tanggal === today);
    
    // Group records by user first to get one attendance status per user today
    const userAttendanceMap = new Map<string, string>();
    todayRecords.forEach(r => {
      const uName = r.userName || 'Anonymous';
      const status = r.status_kehadiran || 'Hadir di Kantor';
      // If multiple records for one user, we just take the first one's attendance status for simplicity
      if (!userAttendanceMap.has(uName)) {
        userAttendanceMap.set(uName, status);
      }
    });

    const counts: Record<string, number> = {
      'Hadir di Kantor': 0,
      'Work From Home / Work From Anywhere': 0,
      'Dinas Luar': 0,
      'Cuti': 0,
      'Lainnya': 0
    };

    userAttendanceMap.forEach(status => {
      if (status === 'Hadir di Kantor') counts['Hadir di Kantor']++;
      else if (status.includes('Work From Home')) counts['Work From Home / Work From Anywhere']++;
      else if (status === 'Dinas Luar') counts['Dinas Luar']++;
      else if (status.includes('Cuti')) counts['Cuti']++;
      else counts['Lainnya']++;
    });

    const total = Array.from(userAttendanceMap.values()).length || 1; // avoid div by zero

    return {
      labels: Object.keys(counts),
      data: Object.values(counts).map(v => Math.round((v / total) * 100)),
      rawCounts: counts,
      totalUsersReported: Array.from(userAttendanceMap.values()).length
    };
  }, [records]);

  const attendanceStatusData = {
    labels: attendanceStats.labels,
    datasets: [
      {
        data: attendanceStats.data,
        backgroundColor: [
          '#10b981',
          '#3b82f6',
          '#f59e0b',
          '#ef4444',
          '#94a3b8',
        ],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-header tracking-tight">Executive Dashboard</h1>
          <p className="text-sm text-text-muted mt-2 font-medium italic">Overview performa Satuan Kerja di lingkungan Kantor Kemenag Kulon Progo.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 sm:flex-none rounded-xl border-border px-4 py-2.5 text-[0.65rem] font-bold uppercase tracking-widest bg-white/50 backdrop-blur-sm">Download PDF</Button>
          <Button className="flex-1 sm:flex-none rounded-xl bg-accent hover:bg-accent-hover text-white px-4 py-2.5 text-[0.65rem] font-bold uppercase tracking-widest shadow-lg shadow-accent/20 border-accent border">Sync Data</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Aktivitas', value: records.length.toString(), trend: '↑ Today', sub: 'Input Kinerja', icon: BarChart3, color: 'text-accent' },
          { label: 'Rata-rata IKSK', value: '94.2%', trend: 'Excellent', sub: 'Target Satker', icon: CheckSquare, color: 'text-success' },
          { label: 'Pegawai Melapor', value: `${attendanceStats.totalUsersReported}/${users.length}`, trend: 'Active', sub: 'Hari Ini', icon: Users, color: 'text-amber-500' },
          { label: 'Satker Terpantau', value: satkers.length.toString(), trend: 'Global', sub: 'Unit Kerja', icon: Building, color: 'text-slate-600' }
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
              <div className={`p-2 rounded-lg bg-slate-50 border border-border group-hover:border-accent group-hover:bg-accent/5 transition-colors`}>
                <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-4 relative z-10">
              <span className="text-3xl font-extrabold text-text-header tracking-tight">{item.value}</span>
              <span className={`text-[0.7rem] font-extrabold ${item.trend.includes('↑') || item.trend === 'Excellent' || item.trend === 'Active' ? 'text-success' : 'text-accent'}`}>{item.trend}</span>
            </div>
            <div className="text-[0.65rem] text-text-muted mt-2 font-medium opacity-60 italic">{item.sub}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Attendance Chart */}
        <Card className="col-span-12 lg:col-span-12 rounded-3xl border-border shadow-elegant overflow-hidden">
          <CardHeader className="bg-surface border-b border-border/50 px-8 py-6">
            <CardTitle className="text-base font-extrabold tracking-tight">Status Kehadiran Pegawai Hari Ini</CardTitle>
            <p className="text-[0.65rem] text-text-muted font-bold uppercase tracking-widest mt-1">Berdasarkan Laporan Kinerja Harian</p>
          </CardHeader>
          <CardContent className="p-8 flex flex-col sm:flex-row items-center justify-around gap-8">
            <div className="w-[240px] h-[240px] relative">
              <Pie 
                data={attendanceStatusData} 
                options={{ 
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } }
                }} 
              />
            </div>
            <div className="flex-1 max-w-md w-full space-y-4">
              {attendanceStats.labels.map((label, idx) => (
                <div key={label} className="flex justify-between items-center group cursor-default">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full transition-transform duration-300 group-hover:scale-125" style={{ backgroundColor: attendanceStatusData.datasets[0].backgroundColor[idx] }} />
                    <span className="text-[0.8125rem] font-bold text-text-main opacity-80 group-hover:opacity-100 truncate max-w-[200px]">{label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-text-header">{attendanceStats.data[idx]}%</span>
                    <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full" style={{ width: `${attendanceStats.data[idx]}%`, backgroundColor: attendanceStatusData.datasets[0].backgroundColor[idx]?.toString() }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

       <div className="grid grid-cols-12 gap-8">
        <Card className="col-span-12 rounded-3xl border-border shadow-elegant overflow-hidden">
          <CardHeader className="bg-surface border-b border-border/50 px-8 py-6">
            <CardTitle className="text-base font-extrabold text-text-header">Log Aktivitas Terbaru</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              {records.slice(0, 10).map((record, i) => (
                <div key={record.id} className="flex gap-4 group">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-border flex items-center justify-center text-text-header font-black text-xs group-hover:bg-accent group-hover:text-white transition-all shadow-sm">
                      {(record.userName || 'U').charAt(0)}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-extrabold text-text-header tracking-tight truncate">{record.userName || 'Anonymous'}</p>
                      <span className="text-[0.65rem] font-bold text-text-muted mt-0.5">{record.waktu}</span>
                    </div>
                    <p className="text-xs text-text-muted font-medium mt-1 truncate">{record.iksk_name}</p>
                    <div className="mt-2 text-[0.65rem] font-black uppercase tracking-wider text-accent inline-block px-2 py-0.5 rounded-md bg-accent/5 border border-accent/10 italic">
                      {record.status_kehadiran || 'Hadir'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 flex justify-center">
              <Button variant="outline" className="rounded-xl h-11 px-10 text-[0.65rem] font-black tracking-widest uppercase border-border">Lihat Seluruh Log Aktivitas</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

