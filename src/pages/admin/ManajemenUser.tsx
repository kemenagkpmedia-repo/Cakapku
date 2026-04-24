import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { useUserStore } from '../../store/userStore';
import { useSatkerStore } from '../../store/satkerStore';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, FileUp, FileDown, Search, Edit3, Trash2, AlertTriangle, LogIn, Shield, Building2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Role } from '../../store/authStore';
import { cn } from '../../utils/cn';

export const ManajemenUser: React.FC = () => {
  const { users, isLoading, fetchUsers, addUser, addUsers, updateUser, deleteUser } = useUserStore();
  const { satkers, fetchSatkers } = useSatkerStore();
  const { logout, loginAs } = useAuthStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchUsers();
    fetchSatkers();
  }, [fetchUsers, fetchSatkers]);


  const [formData, setFormData] = useState({
    nama: '',
    username: '',
    password: '',
    email: '',
    role: '' as Role,
    id_satker: '',
    nip: '',
    jabatan: '',
    gol_ruang: '',
  });

  console.log(formData.role)

  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const filteredUsers = users.filter(u =>
    (u.nama || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.nip || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Reset ke halaman 1 setiap kali pencarian berubah
  const handleSearch = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Buat array nomor halaman yang ditampilkan (max 5 angka)
  const getPageNumbers = () => {
    const delta = 2;
    const range: number[] = [];
    for (
      let i = Math.max(1, currentPage - delta);
      i <= Math.min(totalPages, currentPage + delta);
      i++
    ) range.push(i);
    return range;
  };

  const resetForm = () => {
    setFormData({
      nama: '',
      username: '',
      password: '',
      email: '',
      role: 'user',
      id_satker: '',
      nip: '',
      jabatan: '',
      gol_ruang: '',
    });
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim() || !formData.nip.trim()) {
      alert('Nama dan NIP wajib diisi.');
      return;
    }
    try {
      await addUser({
        ...formData,
        // username default ke NIP jika kosong
        username: formData.username.trim() || formData.nip.trim(),
        // password default ke NIP jika kosong
        password: formData.password.trim() || formData.nip.trim(),
        id_satker: formData.id_satker ? Number(formData.id_satker) : undefined,
      });
      resetForm();
      setIsAddModalOpen(false);
    } catch (err: any) {
      const errors = err.response?.data?.errors;
      if (errors) {
        const msgs = Object.values(errors).flat().join('\n');
        alert('Validasi gagal:\n' + msgs);
      } else {
        alert(err.response?.data?.message || 'Gagal menambah user.');
      }
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !formData.nama.trim()) {
      alert('Nama wajib diisi.');
      return;
    }
    try {
      await updateUser(selectedUser.id, {
        nama: formData.nama,
        nip: formData.nip,
        role: formData.role,
        id_satker: formData.id_satker ? Number(formData.id_satker) : undefined,
        jabatan: formData.jabatan,
        gol_ruang: formData.gol_ruang,
      });
      resetForm();
      setSelectedUser(null);
      setIsEditModalOpen(false);
    } catch (err: any) {
      const errors = err.response?.data?.errors;
      if (errors) {
        const msgs = Object.values(errors).flat().join('\n');
        alert('Validasi gagal:\n' + msgs);
      } else {
        alert(err.response?.data?.message || 'Gagal mengubah user.');
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedUser) {
      await deleteUser(selectedUser.id);
      setSelectedUser(null);
      setIsDeleteModalOpen(false);
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      { Nama: 'Budi Santoso', Email: 'budi@example.com', Role: 'user', Satker_ID: 1, NIP: '199001012020011001', Jabatan: 'Analisis TI' },
      { Nama: 'Siti Aminah', Email: 'siti@example.com', Role: 'operator', Satker_ID: 2, NIP: '199505052021052002', Jabatan: 'Pranata Komputer' }
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template User');
    XLSX.writeFile(wb, 'Template_Import_User.xlsx');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      const newUsers = data.map((item: any) => ({
        name: item.Nama || item.name,
        email: item.Email || item.email,
        role: (item.Role || item.role || 'user').toLowerCase() as Role,
        id_satker: item.Satker_ID || item.id_satker ? Number(item.Satker_ID || item.id_satker) : undefined,
        nip: item.NIP || item.nip,
        jabatan: item.Jabatan || item.jabatan
      }));

      addUsers(newUsers as any);
      setIsImportModalOpen(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  const getSatkerName = (id?: number) => {
    return satkers.find(s => s.id === id)?.nama_satker || satkers.find(s => s.id === id)?.name || '-';
  };

  const handleLoginAs = (user: any) => {
    loginAs(user);

    // Redirect based on the impersonated user's role
    switch (user.role) {
      case 'admin': navigate('/admin/users'); break;
      case 'operator': navigate('/operator/periode'); break;
      case 'user': navigate('/user/kinerja'); break;
      case 'pimpinan': navigate('/pimpinan/dashboard'); break;
      default: navigate('/login');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-header tracking-tight">Manajemen User</h1>
          <p className="text-sm text-text-muted mt-2 font-medium">Kelola hak akses dan profil pegawai dalam sistem.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-wrap gap-3"
        >
          <Button
            variant="outline"
            onClick={downloadTemplate}
            className="rounded-xl h-10 px-4 font-bold uppercase tracking-widest text-[0.65rem] border-border text-text-main hover:bg-slate-50"
          >
            <FileDown className="w-4 h-4 mr-2" /> Template
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsImportModalOpen(true)}
            className="rounded-xl h-10 px-4 font-bold uppercase tracking-widest text-[0.65rem] border-border text-accent hover:bg-accent/5"
          >
            <FileUp className="w-4 h-4 mr-2" /> Import Excel
          </Button>
          <Button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="rounded-xl h-10 px-5 font-bold uppercase tracking-widest text-[0.65rem] shadow-lg shadow-accent/20"
          >
            <Plus className="w-4 h-4 mr-2" /> Tambah User
          </Button>
        </motion.div>
      </div>

      <Card className="rounded-[2rem] border-border shadow-sm overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="p-6 border-b border-border bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative group w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-accent transition-colors" />
              <Input
                placeholder="Cari nama, email, atau NIP..."
                className="pl-11 h-11 rounded-xl bg-white border-border shadow-none focus:ring-accent/10 transition-all font-medium py-0"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="text-[0.7rem] font-bold text-text-muted uppercase tracking-widest bg-white px-4 py-2 rounded-lg border border-border">
                Total: <span className="text-accent">{filteredUsers.length} Users</span>
              </div>
              <div className="text-[0.7rem] font-bold text-text-muted uppercase tracking-widest bg-white px-4 py-2 rounded-lg border border-border">
                Hal. <span className="text-accent">{currentPage}/{totalPages}</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-20 text-center flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-4 border-accent/20 border-t-accent rounded-full animate-spin mb-4" />
                <p className="text-sm font-bold text-text-muted uppercase tracking-widest">Memuat Data User...</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-border">
                    <th className="px-6 py-4 text-[0.7rem] font-black text-text-muted uppercase tracking-widest w-16 text-center">ID</th>
                    <th className="px-6 py-4 text-[0.7rem] font-black text-text-muted uppercase tracking-widest">Identitas Pegawai</th>
                    <th className="px-6 py-4 text-[0.7rem] font-black text-text-muted uppercase tracking-widest">Jabatan &amp; Gol. Ruang</th>
                    <th className="px-6 py-4 text-[0.7rem] font-black text-text-muted uppercase tracking-widest">Akses &amp; Satker</th>
                    <th className="px-6 py-4 text-[0.7rem] font-black text-text-muted uppercase tracking-widest text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-5 text-center text-sm font-black text-accent">{user.id}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-black text-sm shrink-0">
                            {(user.nama || user.name || '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-extrabold text-text-header tracking-tight">{user.nama || user.name}</div>
                            <div className="text-[0.75rem] text-text-muted font-medium mt-0.5">{user.email}</div>
                            <div className="text-[0.65rem] text-accent font-bold mt-1 uppercase tracking-wider">{user.nip || '— NIP Belum Diatur —'}</div>
                          </div>
                        </div>
                      </td>
                      {/* Jabatan & Gol. Ruang */}
                      <td className="px-6 py-5">
                        <div className="space-y-1.5">
                          <div className="text-[0.8125rem] font-bold text-text-main">
                            {user.jabatan || <span className="text-text-muted italic text-[0.75rem]">— Belum Diatur —</span>}
                          </div>
                          {user.gol_ruang ? (
                            <div className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-amber-50 border border-amber-100 text-amber-700 text-[0.65rem] font-black uppercase tracking-wider">
                              {user.gol_ruang}
                            </div>
                          ) : (
                            <div className="text-[0.65rem] text-text-muted font-medium italic">Gol. Belum Diatur</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-1.5">
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-accent/5 text-accent border border-accent/10">
                            <Shield className="w-3 h-3" />
                            <span className="text-[0.65rem] font-black uppercase tracking-wider">{user.role}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[0.8rem] font-semibold text-text-main">
                            <Building2 className="w-3.5 h-3.5 text-text-muted" />
                            {getSatkerName(user.id_satker)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-1.5 translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                          <button
                            onClick={() => handleLoginAs(user)}
                            title="Login As"
                            className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-colors border border-transparent hover:border-emerald-100"
                          >
                            <LogIn className="w-4.5 h-4.5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setFormData({
                                nama: user.nama || '',
                                username: '',
                                password: '',
                                email: user.email || '',
                                role: user.role,
                                id_satker: (user.id_satker ?? user.satker_id)?.toString() || '',
                                nip: user.nip || '',
                                jabatan: user.jabatan || '',
                                gol_ruang: user.gol_ruang || '',
                              });
                              setIsEditModalOpen(true);
                            }}
                            className="p-2 rounded-xl text-accent hover:bg-accent/10 transition-colors border border-transparent hover:border-accent/10"
                          >
                            <Edit3 className="w-4.5 h-4.5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-100"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {filteredUsers.length === 0 && (
            <div className="p-20 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-text-header uppercase tracking-widest text-xs">Pencarian Tidak Ditemukan</h3>
              <p className="text-[0.8rem] text-text-muted mt-2">Coba kata kunci lain atau periksa filter Anda</p>
            </div>
          )}

          {/* Pagination */}
          {filteredUsers.length > 0 && (
            <div className="px-6 py-5 border-t border-border bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Info */}
              <p className="text-[0.75rem] font-bold text-text-muted">
                Menampilkan{' '}
                <span className="text-text-header">{Math.min((currentPage - 1) * PAGE_SIZE + 1, filteredUsers.length)}</span>
                {' '}–{' '}
                <span className="text-text-header">{Math.min(currentPage * PAGE_SIZE, filteredUsers.length)}</span>
                {' '}dari{' '}
                <span className="text-accent font-black">{filteredUsers.length}</span> pegawai
              </p>

              {/* Tombol Navigasi */}
              <div className="flex items-center gap-1.5">
                {/* Prev */}
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-border bg-white text-text-muted font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:border-accent hover:text-accent hover:bg-accent/5 transition-all"
                >
                  ‹
                </button>

                {/* Halaman pertama + ellipsis */}
                {getPageNumbers()[0] > 1 && (
                  <>
                    <button onClick={() => setCurrentPage(1)} className="w-9 h-9 flex items-center justify-center rounded-xl border border-border bg-white text-text-muted text-sm font-bold hover:border-accent hover:text-accent hover:bg-accent/5 transition-all">1</button>
                    {getPageNumbers()[0] > 2 && <span className="w-9 h-9 flex items-center justify-center text-text-muted text-sm">…</span>}
                  </>
                )}

                {/* Nomor halaman */}
                {getPageNumbers().map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 flex items-center justify-center rounded-xl border text-sm font-bold transition-all ${page === currentPage
                      ? 'bg-accent border-accent text-white shadow-lg shadow-accent/25'
                      : 'border-border bg-white text-text-muted hover:border-accent hover:text-accent hover:bg-accent/5'
                      }`}
                  >
                    {page}
                  </button>
                ))}

                {/* Ellipsis + halaman terakhir */}
                {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
                  <>
                    {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 1 && <span className="w-9 h-9 flex items-center justify-center text-text-muted text-sm">…</span>}
                    <button onClick={() => setCurrentPage(totalPages)} className="w-9 h-9 flex items-center justify-center rounded-xl border border-border bg-white text-text-muted text-sm font-bold hover:border-accent hover:text-accent hover:bg-accent/5 transition-all">{totalPages}</button>
                  </>
                )}

                {/* Next */}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-border bg-white text-text-muted font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:border-accent hover:text-accent hover:bg-accent/5 transition-all"
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tambah Akun Pegawai"
      >
        <form onSubmit={handleAddSubmit} className="space-y-5 pt-4">
          {/* Row 1: Nama + NIP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nama Lengkap <span className="text-rose-500">*</span></Label>
              <Input placeholder="Nama lengkap pegawai..." value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} className="h-12 rounded-xl" autoFocus required />
            </div>
            <div className="space-y-2">
              <Label>NIP <span className="text-rose-500">*</span></Label>
              <Input placeholder="19XXXXXXXXXXXX" value={formData.nip} onChange={(e) => setFormData({ ...formData, nip: e.target.value })} className="h-12 rounded-xl" required />
            </div>
          </div>
          {/* Row 2: Username + Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Username <span className="text-text-muted text-[0.65rem]">(kosong = pakai NIP)</span></Label>
              <Input placeholder="Default: NIP" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Password <span className="text-text-muted text-[0.65rem]">(kosong = pakai NIP)</span></Label>
              <Input type="password" placeholder="Default: NIP" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="h-12 rounded-xl" />
            </div>
          </div>
          {/* Row 3: Email + Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="email@instansi.go.id" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Role Akses</Label>
              <Select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                options={[
                  { label: 'User', value: 'USER' },
                  { label: 'Operator', value: 'OPERATOR' },
                  { label: 'Pimpinan', value: 'PIMPINAN' },
                  { label: 'Admin', value: 'ADMIN' },
                ]}
                className="h-12"
              />
            </div>
          </div>
          {/* Row 4: Satker + Jabatan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Satker</Label>
              <Select
                value={formData.id_satker}
                onChange={(e) => setFormData({ ...formData, id_satker: e.target.value })}
                options={[
                  { label: '-- Pilih Satker --', value: '' },
                  ...satkers.map(s => ({ label: s.nama_satker || s.name || '', value: s.id.toString() }))
                ]}
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label>Jabatan</Label>
              <Input placeholder="Kepala Seksi / Staf..." value={formData.jabatan} onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })} className="h-12 rounded-xl" />
            </div>
          </div>
          {/* Row 5: Golongan Ruang */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Golongan Ruang</Label>
              <Select
                value={formData.gol_ruang}
                onChange={(e) => setFormData({ ...formData, gol_ruang: e.target.value })}
                options={[
                  { label: '-- Pilih Golongan --', value: '' },
                  { label: '── PNS Golongan II ──', value: '', disabled: true },
                  { label: 'II/a - Pengatur Muda', value: 'II/a' },
                  { label: 'II/b - Pengatur Muda Tk.I', value: 'II/b' },
                  { label: 'II/c - Pengatur', value: 'II/c' },
                  { label: 'II/d - Pengatur Tk.I', value: 'II/d' },
                  { label: '── PNS Golongan III ──', value: '', disabled: true },
                  { label: 'III/a - Penata Muda', value: 'III/a' },
                  { label: 'III/b - Penata Muda Tk.I', value: 'III/b' },
                  { label: 'III/c - Penata', value: 'III/c' },
                  { label: 'III/d - Penata Tk.I', value: 'III/d' },
                  { label: '── PNS Golongan IV ──', value: '', disabled: true },
                  { label: 'IV/a - Pembina', value: 'IV/a' },
                  { label: 'IV/b - Pembina Tk.I', value: 'IV/b' },
                  { label: 'IV/c - Pembina Utama Muda', value: 'IV/c' },
                  { label: 'IV/d - Pembina Utama Madya', value: 'IV/d' },
                  { label: '── PPPK ──', value: '', disabled: true },
                  { label: 'PPPK III', value: 'PPPK III' },
                  { label: 'PPPK V', value: 'PPPK V' },
                  { label: 'PPPK VII', value: 'PPPK VII' },
                  { label: 'PPPK IX', value: 'PPPK IX' },
                ]}
                className="h-12"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} className="flex-1 rounded-xl h-12 uppercase font-bold tracking-widest text-[0.7rem]">Batal</Button>
            <Button type="submit" className="flex-1 rounded-xl h-12 uppercase font-bold tracking-widest text-[0.7rem] shadow-lg shadow-accent/20">Simpan User</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profil Pegawai"
      >
        <form onSubmit={handleEditSubmit} className="space-y-5 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nama Lengkap <span className="text-rose-500">*</span></Label>
              <Input value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} className="h-12 rounded-xl" required />
            </div>
            <div className="space-y-2">
              <Label>NIP</Label>
              <Input value={formData.nip} onChange={(e) => setFormData({ ...formData, nip: e.target.value })} className="h-12 rounded-xl" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Role Akses</Label>
              <Select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                options={[
                  { label: 'User', value: 'USER' },
                  { label: 'Operator', value: 'OPERATOR' },
                  { label: 'Pimpinan', value: 'PIMPINAN' },
                  { label: 'Admin', value: 'ADMIN' },
                ]}
                className="h-12"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Satker</Label>
              <Select
                value={formData.id_satker}
                onChange={(e) => setFormData({ ...formData, id_satker: e.target.value })}
                options={[
                  { label: '-- Pilih Satker --', value: '' },
                  ...satkers.map(s => ({ label: s.nama_satker || s.name || '', value: s.id.toString() }))
                ]}
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label>Jabatan</Label>
              <Input value={formData.jabatan} onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })} className="h-12 rounded-xl" />
            </div>
          </div>
          {/* Golongan Ruang Edit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Golongan Ruang</Label>
              <Select
                value={formData.gol_ruang}
                onChange={(e) => setFormData({ ...formData, gol_ruang: e.target.value })}
                options={[
                  { label: '-- Pilih Golongan --', value: '' },
                  { label: '── PNS Golongan II ──', value: '', disabled: true },
                  { label: 'II/a - Pengatur Muda', value: 'II/a' },
                  { label: 'II/b - Pengatur Muda Tk.I', value: 'II/b' },
                  { label: 'II/c - Pengatur', value: 'II/c' },
                  { label: 'II/d - Pengatur Tk.I', value: 'II/d' },
                  { label: '── PNS Golongan III ──', value: '', disabled: true },
                  { label: 'III/a - Penata Muda', value: 'III/a' },
                  { label: 'III/b - Penata Muda Tk.I', value: 'III/b' },
                  { label: 'III/c - Penata', value: 'III/c' },
                  { label: 'III/d - Penata Tk.I', value: 'III/d' },
                  { label: '── PNS Golongan IV ──', value: '', disabled: true },
                  { label: 'IV/a - Pembina', value: 'IV/a' },
                  { label: 'IV/b - Pembina Tk.I', value: 'IV/b' },
                  { label: 'IV/c - Pembina Utama Muda', value: 'IV/c' },
                  { label: 'IV/d - Pembina Utama Madya', value: 'IV/d' },
                  { label: '── PPPK ──', value: '', disabled: true },
                  { label: 'PPPK III', value: 'PPPK III' },
                  { label: 'PPPK V', value: 'PPPK V' },
                  { label: 'PPPK VII', value: 'PPPK VII' },
                  { label: 'PPPK IX', value: 'PPPK IX' },
                ]}
                className="h-12"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} className="flex-1 rounded-xl h-12 uppercase font-bold tracking-widest text-[0.7rem]">Batal</Button>
            <Button type="submit" className="flex-1 rounded-xl h-12 uppercase font-bold tracking-widest text-[0.7rem] shadow-lg shadow-accent/20">Simpan Perubahan</Button>
          </div>
        </form>
      </Modal>

      {/* Import Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Data via Excel"
      >
        <div className="space-y-6 pt-4">
          <div className="p-6 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center bg-slate-50 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-accent animate-bounce-slow">
              <FileUp className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-text-header tracking-tight">Upload File Excel</p>
              <p className="text-xs text-text-muted mt-1 font-medium italic">Gunakan template yang telah disediakan</p>
            </div>
            <input
              type="file"
              accept=".xlsx, .xls"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImport}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 rounded-xl px-8 h-12 font-bold uppercase tracking-widest text-[0.7rem]"
            >
              Pilih File
            </Button>
          </div>

          <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0 border border-amber-200">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[0.7rem] font-black text-amber-800 uppercase tracking-[0.1em]">Peringatan</p>
              <p className="text-[0.8rem] text-amber-700/80 mt-1 font-medium leading-relaxed italic">Pastikan format kolom sesuai dengan template. Email harus unik. Satker_ID harus berupa angka yang valid.</p>
            </div>
          </div>

          <Button variant="outline" onClick={() => setIsImportModalOpen(false)} className="w-full rounded-xl h-12 uppercase font-bold tracking-widest text-[0.7rem]">Tutup</Button>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Konfirmasi Hapus"
        variant="danger"
        description={`Apakah Anda yakin ingin menghapus user "${selectedUser?.nama || selectedUser?.name}"? Seluruh data terkait akan terhapus secara permanen.`}
        footer={
          <div className="flex gap-3 w-full">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} className="flex-1 rounded-xl h-12 uppercase font-bold tracking-widest text-[0.7rem]">Batal</Button>
            <Button onClick={handleDeleteConfirm} className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-12 uppercase font-bold tracking-widest text-[0.7rem]">Hapus User</Button>
          </div>
        }
      >
        <div className="flex items-center justify-center p-6 bg-rose-50 rounded-2xl border border-rose-100 mb-2">
          <AlertTriangle className="w-12 h-12 text-rose-500" />
        </div>
      </Modal>
    </div>
  );
};
