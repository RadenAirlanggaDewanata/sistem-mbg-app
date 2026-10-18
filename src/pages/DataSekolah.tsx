import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Sekolah } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  School,
  Search,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Phone,
  User,
  MapPin,
  X,
  Filter,
} from 'lucide-react';

export const DataSekolah: React.FC = () => {
  const { hasRole } = useAuth();
  const canEdit = hasRole('Administrator');

  const [sekolahList, setSekolahList] = useState<Sekolah[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [jenjangFilter, setJenjangFilter] = useState('Semua');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSekolah, setCurrentSekolah] = useState<Partial<Sekolah> | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<Sekolah | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchSekolah();
  }, [search, jenjangFilter]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchSekolah = async () => {
    try {
      setLoading(true);
      const data = await api.sekolah.getAll({
        search: search || undefined,
        jenjang: jenjangFilter !== 'Semua' ? jenjangFilter : undefined,
      });
      setSekolahList(data);
    } catch (err: any) {
      showToast('error', err.message || 'Gagal mengambil data sekolah.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setCurrentSekolah({
      nama_sekolah: '',
      npsn: '',
      jenjang: 'SD',
      alamat: '',
      nama_kontak: '',
      no_telepon: '',
      jumlah_penerima: 0,
      status: 'Aktif',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (s: Sekolah) => {
    setCurrentSekolah(s);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSekolah) return;

    if (!currentSekolah.nama_sekolah || !currentSekolah.jenjang || !currentSekolah.alamat) {
      showToast('error', 'Nama sekolah, jenjang, dan alamat wajib diisi.');
      return;
    }

    try {
      setFormLoading(true);
      if (currentSekolah.id_sekolah) {
        await api.sekolah.update(currentSekolah.id_sekolah, currentSekolah);
        showToast('success', 'Data sekolah berhasil diperbarui.');
      } else {
        await api.sekolah.create(currentSekolah);
        showToast('success', 'Sekolah baru berhasil ditambahkan.');
      }
      setIsModalOpen(false);
      fetchSekolah();
    } catch (err: any) {
      showToast('error', err.message || 'Gagal menyimpan data sekolah.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleteLoading(true);
      await api.sekolah.delete(deleteTarget.id_sekolah);
      showToast('success', `Data ${deleteTarget.nama_sekolah} berhasil dihapus.`);
      setDeleteTarget(null);
      fetchSekolah();
    } catch (err: any) {
      showToast('error', err.message || 'Gagal menghapus data sekolah.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Aggregated totals
  const totalLembaga = sekolahList.length;
  const totalPenerima = sekolahList.reduce((acc, curr) => acc + (curr.jumlah_penerima || 0), 0);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <School className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Data Sekolah & PAUD</h2>
              <p className="text-xs text-slate-500">
                Pengelolaan data sekolah penerima program Makan Bergizi Gratis di Cimahi Tengah
              </p>
            </div>
          </div>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Sekolah</span>
          </button>
        )}
      </div>

      {/* Summary Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500">Total Lembaga</span>
          <div className="text-xl font-black text-slate-900">{totalLembaga}</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500">Total Siswa Penerima</span>
          <div className="text-xl font-black text-blue-600">
            {new Intl.NumberFormat('id-ID').format(totalPenerima)}
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500">PAUD / TK</span>
          <div className="text-xl font-black text-emerald-600">
            {sekolahList.filter(s => s.jenjang === 'PAUD' || s.jenjang === 'TK').length} Lembaga
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500">SD & SMP</span>
          <div className="text-xl font-black text-indigo-600">
            {sekolahList.filter(s => s.jenjang === 'SD' || s.jenjang === 'SMP').length} Lembaga
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama sekolah, NPSN, atau alamat..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={jenjangFilter}
            onChange={e => setJenjangFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="Semua">Semua Jenjang</option>
            <option value="PAUD">PAUD</option>
            <option value="TK">TK</option>
            <option value="SD">SD</option>
            <option value="SMP">SMP</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Nama Sekolah & NPSN</th>
                <th className="py-3 px-4">Jenjang</th>
                <th className="py-3 px-4">Alamat</th>
                <th className="py-3 px-4">Kontak / Personel</th>
                <th className="py-3 px-4 text-center">Jml Penerima</th>
                <th className="py-3 px-4 text-center">Status</th>
                {canEdit && <th className="py-3 px-4 text-center w-24">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={canEdit ? 8 : 7} className="py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <div>Memuat data sekolah...</div>
                  </td>
                </tr>
              ) : sekolahList.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 8 : 7} className="py-12 text-center text-slate-400">
                    Tidak ditemukan data sekolah yang sesuai dengan pencarian.
                  </td>
                </tr>
              ) : (
                sekolahList.map((s, index) => (
                  <tr key={s.id_sekolah} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-center font-medium text-slate-500">{index + 1}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{s.nama_sekolah}</div>
                      <div className="text-[11px] text-slate-400">NPSN: {s.npsn || '-'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold ${
                          s.jenjang === 'SD'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : s.jenjang === 'SMP'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : s.jenjang === 'TK'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {s.jenjang}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={s.alamat}>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        {s.alamat}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div className="font-medium text-slate-800 flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        {s.nama_kontak || '-'}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {s.no_telepon || '-'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-100">
                        {new Intl.NumberFormat('id-ID').format(s.jumlah_penerima)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          s.status === 'Aktif'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    {canEdit && (
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(s)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit Data"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(s)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Hapus Data"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit */}
      {isModalOpen && currentSekolah && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {currentSekolah.id_sekolah ? 'Edit Data Sekolah' : 'Tambah Sekolah Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Sekolah <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: SDN Padasuka Mandiri 1"
                  value={currentSekolah.nama_sekolah || ''}
                  onChange={e =>
                    setCurrentSekolah({ ...currentSekolah, nama_sekolah: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NPSN
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 20224101"
                    value={currentSekolah.npsn || ''}
                    onChange={e => setCurrentSekolah({ ...currentSekolah, npsn: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jenjang <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={currentSekolah.jenjang || 'SD'}
                    onChange={e =>
                      setCurrentSekolah({ ...currentSekolah, jenjang: e.target.value as any })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="PAUD">PAUD</option>
                    <option value="TK">TK</option>
                    <option value="SD">SD</option>
                    <option value="SMP">SMP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat Lengkap <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Jl. Padasuka No. 15, Cimahi Tengah"
                  value={currentSekolah.alamat || ''}
                  onChange={e => setCurrentSekolah({ ...currentSekolah, alamat: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kontak / Kepala Sekolah
                  </label>
                  <input
                    type="text"
                    placeholder="Nama PIC / Kepsek"
                    value={currentSekolah.nama_kontak || ''}
                    onChange={e =>
                      setCurrentSekolah({ ...currentSekolah, nama_kontak: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    No. Telepon / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="0812xxxxxxx"
                    value={currentSekolah.no_telepon || ''}
                    onChange={e =>
                      setCurrentSekolah({ ...currentSekolah, no_telepon: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jumlah Penerima Sasaran
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={currentSekolah.jumlah_penerima || 0}
                    onChange={e =>
                      setCurrentSekolah({
                        ...currentSekolah,
                        jumlah_penerima: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status Layanan
                  </label>
                  <select
                    value={currentSekolah.status || 'Aktif'}
                    onChange={e =>
                      setCurrentSekolah({ ...currentSekolah, status: e.target.value as any })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/20 disabled:opacity-50"
                >
                  {formLoading ? 'Menyimpan...' : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150">
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-4 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 text-center">
              Hapus Data Sekolah?
            </h3>
            <p className="text-xs text-slate-600 text-center mt-2 leading-relaxed">
              Apakah Anda yakin ingin menghapus <strong>{deleteTarget.nama_sekolah}</strong>? Data
              yang masih memiliki relasi dengan penerima manfaat akan diproteksi oleh sistem.
            </p>

            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md shadow-rose-600/20 disabled:opacity-50"
              >
                {deleteLoading ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
