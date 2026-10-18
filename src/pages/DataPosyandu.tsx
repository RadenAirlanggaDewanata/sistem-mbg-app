import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Posyandu } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Search,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Phone,
  User,
  X,
} from 'lucide-react';

export const DataPosyandu: React.FC = () => {
  const { hasRole } = useAuth();
  const canEdit = hasRole('Administrator');

  const [posyanduList, setPosyanduList] = useState<Posyandu[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPosyandu, setCurrentPosyandu] = useState<Partial<Posyandu> | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<Posyandu | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchPosyandu();
  }, [search]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchPosyandu = async () => {
    try {
      setLoading(true);
      const data = await api.posyandu.getAll({
        search: search || undefined,
      });
      setPosyanduList(data);
    } catch (err: any) {
      showToast('error', err.message || 'Gagal mengambil data posyandu.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setCurrentPosyandu({
      nama_posyandu: '',
      rw: 'RW 01',
      kelurahan: 'Padasuka',
      ketua_posyandu: '',
      no_telepon: '',
      jumlah_penerima: 0,
      status: 'Aktif',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Posyandu) => {
    setCurrentPosyandu(p);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPosyandu) return;

    if (!currentPosyandu.nama_posyandu || !currentPosyandu.rw || !currentPosyandu.ketua_posyandu) {
      showToast('error', 'Nama posyandu, RW, dan nama ketua posyandu wajib diisi.');
      return;
    }

    try {
      setFormLoading(true);
      if (currentPosyandu.id_posyandu) {
        await api.posyandu.update(currentPosyandu.id_posyandu, currentPosyandu);
        showToast('success', 'Data posyandu berhasil diperbarui.');
      } else {
        await api.posyandu.create(currentPosyandu);
        showToast('success', 'Posyandu baru berhasil ditambahkan.');
      }
      setIsModalOpen(false);
      fetchPosyandu();
    } catch (err: any) {
      showToast('error', err.message || 'Gagal menyimpan data posyandu.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleteLoading(true);
      await api.posyandu.delete(deleteTarget.id_posyandu);
      showToast('success', `Data ${deleteTarget.nama_posyandu} berhasil dihapus.`);
      setDeleteTarget(null);
      fetchPosyandu();
    } catch (err: any) {
      showToast('error', err.message || 'Gagal menghapus data posyandu.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const totalPosyandu = posyanduList.length;
  const totalPenerima = posyanduList.reduce((acc, curr) => acc + (curr.jumlah_penerima || 0), 0);

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
            <div className="p-2 bg-teal-50 text-teal-600 rounded-xl border border-teal-100">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Data Posyandu</h2>
              <p className="text-xs text-slate-500">
                Pencatatan pos pelayanan terpadu untuk balita dan ibu hamil se-Kelurahan Padasuka
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
            <span>Tambah Posyandu</span>
          </button>
        )}
      </div>

      {/* Summary Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500">Total Posyandu</span>
          <div className="text-xl font-black text-slate-900">{totalPosyandu} Posyandu</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500">Total Penerima Posyandu</span>
          <div className="text-xl font-black text-teal-600">
            {new Intl.NumberFormat('id-ID').format(totalPenerima)} Jiwa
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500">Cakupan Wilayah</span>
          <div className="text-xl font-black text-slate-800">18 Rukun Warga</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500">Kelurahan</span>
          <div className="text-xl font-black text-emerald-600">Padasuka</div>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari posyandu berdasarkan nama, RW, atau nama ketua posyandu..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Nama Posyandu</th>
                <th className="py-3 px-4">Wilayah / RW</th>
                <th className="py-3 px-4">Ketua Posyandu</th>
                <th className="py-3 px-4">Kontak Telepon</th>
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
                    <div>Memuat data posyandu...</div>
                  </td>
                </tr>
              ) : posyanduList.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 8 : 7} className="py-12 text-center text-slate-400">
                    Tidak ditemukan data posyandu yang cocok.
                  </td>
                </tr>
              ) : (
                posyanduList.map((p, index) => (
                  <tr key={p.id_posyandu} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-center font-medium text-slate-500">{index + 1}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{p.nama_posyandu}</div>
                      <div className="text-[11px] text-slate-400">Kel. {p.kelurahan}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                        {p.rw}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <div className="font-medium flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        {p.ketua_posyandu}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div className="text-xs flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {p.no_telepon || '-'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 font-bold border border-teal-100">
                        {new Intl.NumberFormat('id-ID').format(p.jumlah_penerima)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          p.status === 'Aktif'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    {canEdit && (
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit Data"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(p)}
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
      {isModalOpen && currentPosyandu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {currentPosyandu.id_posyandu ? 'Edit Data Posyandu' : 'Tambah Posyandu Baru'}
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
                  Nama Posyandu <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Posyandu Melati RW 01"
                  value={currentPosyandu.nama_posyandu || ''}
                  onChange={e =>
                    setCurrentPosyandu({ ...currentPosyandu, nama_posyandu: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Wilayah RW <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: RW 01"
                    value={currentPosyandu.rw || ''}
                    onChange={e => setCurrentPosyandu({ ...currentPosyandu, rw: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kelurahan
                  </label>
                  <input
                    type="text"
                    value={currentPosyandu.kelurahan || 'Padasuka'}
                    onChange={e =>
                      setCurrentPosyandu({ ...currentPosyandu, kelurahan: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ketua Posyandu <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Ketua Posyandu"
                    value={currentPosyandu.ketua_posyandu || ''}
                    onChange={e =>
                      setCurrentPosyandu({ ...currentPosyandu, ketua_posyandu: e.target.value })
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
                    placeholder="0813xxxxxxx"
                    value={currentPosyandu.no_telepon || ''}
                    onChange={e =>
                      setCurrentPosyandu({ ...currentPosyandu, no_telepon: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jumlah Penerima (Balita & Ibu)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={currentPosyandu.jumlah_penerima || 0}
                    onChange={e =>
                      setCurrentPosyandu({
                        ...currentPosyandu,
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
                    value={currentPosyandu.status || 'Aktif'}
                    onChange={e =>
                      setCurrentPosyandu({ ...currentPosyandu, status: e.target.value as any })
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
              Hapus Data Posyandu?
            </h3>
            <p className="text-xs text-slate-600 text-center mt-2 leading-relaxed">
              Apakah Anda yakin ingin menghapus <strong>{deleteTarget.nama_posyandu}</strong>? Data
              yang masih memiliki relasi dengan penerima manfaat akan dilindungi oleh integritas sistem.
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
