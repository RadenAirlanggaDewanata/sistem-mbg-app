import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { MenuHarian as IMenuHarian, UjiOrganoleptik } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  UtensilsCrossed,
  Search,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Eye,
  X,
  ClipboardCheck,
} from 'lucide-react';

export const MenuHarian: React.FC = () => {
  const { hasRole } = useAuth();
  const canEdit = hasRole('Administrator');

  const [menuList, setMenuList] = useState<IMenuHarian[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tanggalAwal, setTanggalAwal] = useState('');
  const [tanggalAkhir, setTanggalAkhir] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMenu, setCurrentMenu] = useState<Partial<IMenuHarian> | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Detail Modal
  const [detailMenu, setDetailMenu] = useState<IMenuHarian | null>(null);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<IMenuHarian | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchMenus();
  }, [search, tanggalAwal, tanggalAkhir]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const data = await api.menu.getAll({
        search: search || undefined,
        tanggal_awal: tanggalAwal || undefined,
        tanggal_akhir: tanggalAkhir || undefined,
      });
      setMenuList(data);
    } catch (err: any) {
      showToast('error', err.message || 'Gagal mengambil data menu harian.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    const today = new Date().toISOString().split('T')[0];
    setCurrentMenu({
      tanggal: today,
      nama_menu: '',
      deskripsi: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: IMenuHarian) => {
    setCurrentMenu(m);
    setIsModalOpen(true);
  };

  const handleOpenDetail = async (m: IMenuHarian) => {
    try {
      const detailed = await api.menu.getById(m.id_menu);
      setDetailMenu(detailed);
    } catch (err) {
      setDetailMenu(m);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMenu) return;

    if (!currentMenu.tanggal || !currentMenu.nama_menu || !currentMenu.deskripsi) {
      showToast('error', 'Tanggal, nama menu, dan deskripsi/keterangan wajib diisi.');
      return;
    }

    try {
      setFormLoading(true);
      if (currentMenu.id_menu) {
        await api.menu.update(currentMenu.id_menu, currentMenu);
        showToast('success', 'Menu harian berhasil diperbarui.');
      } else {
        await api.menu.create(currentMenu);
        showToast('success', 'Menu harian baru berhasil ditambahkan.');
      }
      setIsModalOpen(false);
      fetchMenus();
    } catch (err: any) {
      showToast('error', err.message || 'Gagal menyimpan menu.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleteLoading(true);
      await api.menu.delete(deleteTarget.id_menu);
      showToast('success', `Menu ${deleteTarget.nama_menu} berhasil dihapus.`);
      setDeleteTarget(null);
      fetchMenus();
    } catch (err: any) {
      // Handles relation guard: "Menu ini tidak dapat dihapus karena sudah memiliki data penilaian Uji Organoleptik."
      showToast('error', err.message || 'Gagal menghapus menu.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatTanggalIndo = (tglString: string) => {
    try {
      const date = new Date(tglString);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return tglString;
    }
  };

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
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Menu Harian</h2>
              <p className="text-xs text-slate-500">
                Perencanaan siklus paket gizi seimbang harian yang siap diuji secara organoleptik
              </p>
            </div>
          </div>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Menu Harian</span>
          </button>
        )}
      </div>

      {/* Search & Date Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama menu atau komponen gizi..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Dari:</span>
            <input
              type="date"
              value={tanggalAwal}
              onChange={e => setTanggalAwal(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span>Sampai:</span>
            <input
              type="date"
              value={tanggalAkhir}
              onChange={e => setTanggalAkhir(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {(tanggalAwal || tanggalAkhir || search) && (
            <button
              onClick={() => {
                setTanggalAwal('');
                setTanggalAkhir('');
                setSearch('');
              }}
              className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Table Card as specified in prompt: No, Tanggal, Nama Menu, Keterangan, Aksi */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4 w-40">Tanggal</th>
                <th className="py-3.5 px-4 w-64">Nama Menu</th>
                <th className="py-3.5 px-4">Keterangan</th>
                <th className="py-3.5 px-4 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <div>Memuat siklus menu harian...</div>
                  </td>
                </tr>
              ) : menuList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Belum ada data menu harian untuk kriteria pencarian ini.
                  </td>
                </tr>
              ) : (
                menuList.map((m, index) => (
                  <tr key={m.id_menu} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-center font-medium text-slate-500">{index + 1}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{formatTanggalIndo(m.tanggal)}</div>
                      <div className="text-[11px] font-mono text-slate-400">{m.tanggal}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-emerald-800">{m.nama_menu}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 leading-relaxed">
                      {m.deskripsi}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenDetail(m)}
                          className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg transition"
                          title="Lihat Detail & Uji Terkait"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canEdit && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(m)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Edit Menu"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(m)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Hapus Menu"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {detailMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Rincian Menu Harian</h3>
              </div>
              <button
                onClick={() => setDetailMenu(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                  Tanggal Sajian
                </span>
                <div className="text-sm font-extrabold text-slate-900">
                  {formatTanggalIndo(detailMenu.tanggal)}
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500">Nama Paket Menu:</span>
                <div className="text-base font-bold text-slate-900 mt-0.5">{detailMenu.nama_menu}</div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500">Rincian Komponen Bahan & Lauk:</span>
                <div className="text-xs sm:text-sm text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200 mt-1 leading-relaxed">
                  {detailMenu.deskripsi}
                </div>
              </div>

              {/* Uji Organoleptik connection info */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <ClipboardCheck className="w-4 h-4 text-indigo-600" />
                    Penilaian Uji Organoleptik Terkait
                  </span>
                </div>

                {detailMenu.uji_organoleptik && detailMenu.uji_organoleptik.length > 0 ? (
                  <div className="space-y-2">
                    {detailMenu.uji_organoleptik.map((u: UjiOrganoleptik) => (
                      <div
                        key={u.id_uji}
                        className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs"
                      >
                        <div className="flex justify-between items-center mb-1 font-semibold text-indigo-900">
                          <span>Tanggal Uji: {u.tanggal}</span>
                          <span className="bg-indigo-100 px-2 py-0.5 rounded text-[11px]">
                            Rasa: {u.rasa} • Aroma: {u.aroma} • Warna: {u.warna} • Tekstur: {u.tekstur}
                          </span>
                        </div>
                        <p className="text-slate-600 italic">"{u.keterangan || 'Lulus standar uji'}"</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    Belum ada penilaian uji organoleptik yang dicatat untuk menu ini.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-right">
              <button
                onClick={() => setDetailMenu(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add / Edit */}
      {isModalOpen && currentMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {currentMenu.id_menu ? 'Edit Menu Harian' : 'Tambah Menu Harian Baru'}
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
                  Tanggal Pelaksanaan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={currentMenu.tanggal || ''}
                  onChange={e => setCurrentMenu({ ...currentMenu, tanggal: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Menu <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Paket Gizi Seimbang Ayam Katsu"
                  value={currentMenu.nama_menu || ''}
                  onChange={e => setCurrentMenu({ ...currentMenu, nama_menu: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan / Komponen Menu <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Contoh: Nasi, Chicken Katsu, Sapo Tahu, Mix Vegetable, Lengkeng"
                  value={currentMenu.deskripsi || ''}
                  onChange={e => setCurrentMenu({ ...currentMenu, deskripsi: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
                <span className="text-[11px] text-slate-400">
                  Tuliskan susunan lengkap lauk pauk, sayur, karbohidrat, dan buah.
                </span>
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
                  {formLoading ? 'Menyimpan...' : 'Simpan Menu'}
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
              Hapus Menu Harian?
            </h3>
            <p className="text-xs text-slate-600 text-center mt-2 leading-relaxed">
              Apakah Anda yakin ingin menghapus menu <strong>{deleteTarget.nama_menu}</strong> ({deleteTarget.tanggal})?
              Data menu yang sudah memiliki keterikatan dengan hasil Uji Organoleptik tidak dapat dihapus sembarangan.
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
