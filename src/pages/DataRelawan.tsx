import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Relawan } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Users2,
  Search,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Phone,
  MapPin,
  X,
  Filter,
} from 'lucide-react';

export const DataRelawan: React.FC = () => {
  const { hasRole } = useAuth();
  const canEdit = hasRole('Administrator');

  const [relawanList, setRelawanList] = useState<Relawan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [posisiFilter, setPosisiFilter] = useState('Semua');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRelawan, setCurrentRelawan] = useState<Partial<Relawan> | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<Relawan | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchRelawan();
  }, [search, posisiFilter]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchRelawan = async () => {
    try {
      setLoading(true);
      const data = await api.relawan.getAll({
        search: search || undefined,
        posisi: posisiFilter !== 'Semua' ? posisiFilter : undefined,
      });
      setRelawanList(data);
    } catch (err: any) {
      showToast('error', err.message || 'Gagal mengambil data relawan.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setCurrentRelawan({
      nama_relawan: '',
      nik: '',
      no_telepon: '',
      alamat: '',
      tugas_posisi: 'Juru Masak',
      status: 'Aktif',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (r: Relawan) => {
    setCurrentRelawan(r);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRelawan) return;

    if (!currentRelawan.nama_relawan || !currentRelawan.tugas_posisi) {
      showToast('error', 'Nama relawan dan tugas posisi wajib diisi.');
      return;
    }

    try {
      setFormLoading(true);
      if (currentRelawan.id_relawan) {
        await api.relawan.update(currentRelawan.id_relawan, currentRelawan);
        showToast('success', 'Data relawan berhasil diperbarui.');
      } else {
        await api.relawan.create(currentRelawan);
        showToast('success', 'Relawan baru berhasil didaftarkan.');
      }
      setIsModalOpen(false);
      fetchRelawan();
    } catch (err: any) {
      showToast('error', err.message || 'Gagal menyimpan data relawan.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleteLoading(true);
      await api.relawan.delete(deleteTarget.id_relawan);
      showToast('success', `Data relawan ${deleteTarget.nama_relawan} berhasil dihapus.`);
      setDeleteTarget(null);
      fetchRelawan();
    } catch (err: any) {
      showToast('error', err.message || 'Gagal menghapus relawan.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const totalRelawan = relawanList.length;

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
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
              <Users2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Data Relawan SPPG</h2>
              <p className="text-xs text-slate-500">
                Pencatatan personel sukarelawan operasional Dapur Makan Bergizi Gratis Padasuka 2
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
            <span>Tambah Relawan</span>
          </button>
        )}
      </div>

      {/* Summary Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500">Total Personel</span>
          <div className="text-xl font-black text-slate-900">{totalRelawan} Relawan</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500">Tim Dapur & Masak</span>
          <div className="text-xl font-black text-amber-600">
            {relawanList.filter(r => r.tugas_posisi.includes('Masak') || r.tugas_posisi.includes('Dapur')).length} Personel
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500">Pengemasan & Distribusi</span>
          <div className="text-xl font-black text-blue-600">
            {relawanList.filter(r => r.tugas_posisi.includes('Pengemasan') || r.tugas_posisi.includes('Distribusi')).length} Personel
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500">QC & Kebersihan</span>
          <div className="text-xl font-black text-emerald-600">
            {relawanList.filter(r => r.tugas_posisi.includes('Quality') || r.tugas_posisi.includes('Kebersihan')).length} Personel
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama relawan, NIK, telepon, atau alamat..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={posisiFilter}
            onChange={e => setPosisiFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="Semua">Semua Posisi Penugasan</option>
            <option value="Koordinator Dapur">Koordinator Dapur</option>
            <option value="Juru Masak">Juru Masak</option>
            <option value="Petugas Pengemasan">Petugas Pengemasan</option>
            <option value="Tim Distribusi">Tim Distribusi</option>
            <option value="Quality Control">Quality Control</option>
            <option value="Petugas Kebersihan & Sanitasi">Petugas Kebersihan & Sanitasi</option>
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
                <th className="py-3 px-4">Nama Relawan & NIK</th>
                <th className="py-3 px-4">Tugas / Posisi</th>
                <th className="py-3 px-4">Kontak Telepon</th>
                <th className="py-3 px-4">Alamat Domisili</th>
                <th className="py-3 px-4 text-center">Status</th>
                {canEdit && <th className="py-3 px-4 text-center w-24">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={canEdit ? 7 : 6} className="py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <div>Memuat data relawan...</div>
                  </td>
                </tr>
              ) : relawanList.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 7 : 6} className="py-12 text-center text-slate-400">
                    Tidak ditemukan data relawan.
                  </td>
                </tr>
              ) : (
                relawanList.map((r, index) => (
                  <tr key={r.id_relawan} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-center font-medium text-slate-500">{index + 1}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{r.nama_relawan}</div>
                      <div className="text-[11px] text-slate-400">NIK: {r.nik || '-'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold ${
                          r.tugas_posisi.includes('Quality')
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : r.tugas_posisi.includes('Masak')
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : r.tugas_posisi.includes('Pengemasan')
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : r.tugas_posisi.includes('Distribusi')
                            ? 'bg-teal-50 text-teal-700 border border-teal-200'
                            : r.tugas_posisi.includes('Koordinator')
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {r.tugas_posisi}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div className="text-xs flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {r.no_telepon || '-'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={r.alamat}>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        {r.alamat || 'Kelurahan Padasuka'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          r.status === 'Aktif'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    {canEdit && (
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(r)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit Data"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(r)}
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
      {isModalOpen && currentRelawan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {currentRelawan.id_relawan ? 'Edit Data Relawan' : 'Daftarkan Relawan Baru'}
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
                  Nama Lengkap Relawan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama Lengkap dengan Gelar jika ada"
                  value={currentRelawan.nama_relawan || ''}
                  onChange={e =>
                    setCurrentRelawan({ ...currentRelawan, nama_relawan: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NIK (Nomor Induk Kependudukan)
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    placeholder="16 digit NIK"
                    value={currentRelawan.nik || ''}
                    onChange={e => setCurrentRelawan({ ...currentRelawan, nik: e.target.value })}
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
                    value={currentRelawan.no_telepon || ''}
                    onChange={e =>
                      setCurrentRelawan({ ...currentRelawan, no_telepon: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tugas / Posisi Penugasan <span className="text-rose-500">*</span>
                </label>
                <select
                  value={currentRelawan.tugas_posisi || 'Juru Masak'}
                  onChange={e =>
                    setCurrentRelawan({ ...currentRelawan, tugas_posisi: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Koordinator Dapur">Koordinator Dapur</option>
                  <option value="Juru Masak">Juru Masak</option>
                  <option value="Petugas Pengemasan">Petugas Pengemasan</option>
                  <option value="Tim Distribusi">Tim Distribusi</option>
                  <option value="Quality Control">Quality Control</option>
                  <option value="Petugas Kebersihan & Sanitasi">Petugas Kebersihan & Sanitasi</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat Domisili
                </label>
                <textarea
                  rows={2}
                  placeholder="Alamat di wilayah Kelurahan Padasuka"
                  value={currentRelawan.alamat || ''}
                  onChange={e => setCurrentRelawan({ ...currentRelawan, alamat: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status Relawan
                </label>
                <select
                  value={currentRelawan.status || 'Aktif'}
                  onChange={e =>
                    setCurrentRelawan({ ...currentRelawan, status: e.target.value as any })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
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
              Hapus Data Relawan?
            </h3>
            <p className="text-xs text-slate-600 text-center mt-2 leading-relaxed">
              Apakah Anda yakin ingin menghapus data <strong>{deleteTarget.nama_relawan}</strong>?
              Data relawan yang memiliki riwayat presensi/absensi akan dilindungi dari penghapusan
              oleh database.
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
