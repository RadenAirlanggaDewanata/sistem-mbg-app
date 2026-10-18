import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { UjiOrganoleptik as IUjiOrganoleptik, MenuHarian } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  ClipboardCheck,
  Search,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Calendar,
  X,
  Award,
  UtensilsCrossed,
} from 'lucide-react';

export const UjiOrganoleptik: React.FC = () => {
  const { hasRole } = useAuth();
  const canEdit = hasRole('Administrator');

  const [ujiList, setUjiList] = useState<IUjiOrganoleptik[]>([]);
  const [menuOptions, setMenuOptions] = useState<MenuHarian[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tanggalAwal, setTanggalAwal] = useState('');
  const [tanggalAkhir, setTanggalAkhir] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUji, setCurrentUji] = useState<Partial<IUjiOrganoleptik> | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<IUjiOrganoleptik | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchUjiList();
  }, [search, tanggalAwal, tanggalAkhir]);

  useEffect(() => {
    // Load Menu Harian for dropdown
    api.menu.getAll().then(setMenuOptions).catch(() => {});
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchUjiList = async () => {
    try {
      setLoading(true);
      const data = await api.organoleptik.getAll({
        search: search || undefined,
        tanggal_awal: tanggalAwal || undefined,
        tanggal_akhir: tanggalAkhir || undefined,
      });
      setUjiList(data);
    } catch (err: any) {
      showToast('error', err.message || 'Gagal mengambil data uji organoleptik.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    const today = new Date().toISOString().split('T')[0];
    setCurrentUji({
      id_menu: menuOptions[0]?.id_menu || 0,
      tanggal: today,
      rasa: 5,
      aroma: 5,
      warna: 5,
      tekstur: 5,
      keterangan: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u: IUjiOrganoleptik) => {
    setCurrentUji(u);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUji) return;

    if (!currentUji.id_menu || !currentUji.tanggal) {
      showToast('error', 'Silakan pilih menu harian dan tentukan tanggal pengujian.');
      return;
    }

    try {
      setFormLoading(true);
      if (currentUji.id_uji) {
        await api.organoleptik.update(currentUji.id_uji, currentUji);
        showToast('success', 'Penilaian uji organoleptik berhasil diperbarui.');
      } else {
        await api.organoleptik.create(currentUji);
        showToast('success', 'Hasil uji organoleptik baru berhasil disimpan.');
      }
      setIsModalOpen(false);
      fetchUjiList();
    } catch (err: any) {
      showToast('error', err.message || 'Gagal menyimpan uji organoleptik.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleteLoading(true);
      await api.organoleptik.delete(deleteTarget.id_uji);
      showToast('success', 'Data uji organoleptik berhasil dihapus.');
      setDeleteTarget(null);
      fetchUjiList();
    } catch (err: any) {
      showToast('error', err.message || 'Gagal menghapus uji organoleptik.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getSkalaLabel = (score: number) => {
    switch (score) {
      case 5:
        return { text: 'Sangat Baik', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 4:
        return { text: 'Baik', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 3:
        return { text: 'Cukup', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 2:
        return { text: 'Kurang', color: 'bg-orange-50 text-orange-700 border-orange-200' };
      case 1:
        return { text: 'Tidak Baik', color: 'bg-rose-50 text-rose-700 border-rose-200' };
      default:
        return { text: String(score), color: 'bg-slate-50 text-slate-700 border-slate-200' };
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
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Uji Organoleptik</h2>
              <p className="text-xs text-slate-500">
                Pencatatan penilaian kualitas sensorik makanan: Rasa, Aroma, Warna, dan Tekstur
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
            <span>Tambah Penilaian Uji</span>
          </button>
        )}
      </div>

      {/* Standard Indicators Legend */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-sm border border-indigo-900/40">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-4 h-4" />
            <span>Standar Skala Penilaian Uji Organoleptik (1 - 5)</span>
          </div>
          <span className="text-[11px] text-slate-400">Parameter Uji Resmi BGN</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
          <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700 text-center">
            <span className="font-extrabold text-emerald-400">Skala 5:</span> Sangat Baik
          </div>
          <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700 text-center">
            <span className="font-extrabold text-blue-400">Skala 4:</span> Baik
          </div>
          <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700 text-center">
            <span className="font-extrabold text-amber-400">Skala 3:</span> Cukup
          </div>
          <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700 text-center">
            <span className="font-extrabold text-orange-400">Skala 2:</span> Kurang
          </div>
          <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700 text-center">
            <span className="font-extrabold text-rose-400">Skala 1:</span> Tidak Baik
          </div>
        </div>
      </div>

      {/* Search & Date Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama menu atau catatan pengujian..."
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

      {/* Table Card as specified in prompt: No, Tanggal, Menu, Rasa, Aroma, Warna, Tekstur, Keterangan, Aksi */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                <th className="py-3.5 px-3 w-12 text-center">No</th>
                <th className="py-3.5 px-3 w-36">Tanggal</th>
                <th className="py-3.5 px-3">Menu</th>
                <th className="py-3.5 px-2 text-center w-20">Rasa</th>
                <th className="py-3.5 px-2 text-center w-20">Aroma</th>
                <th className="py-3.5 px-2 text-center w-20">Warna</th>
                <th className="py-3.5 px-2 text-center w-20">Tekstur</th>
                <th className="py-3.5 px-3">Keterangan</th>
                <th className="py-3.5 px-2 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <div>Memuat data penilaian uji organoleptik...</div>
                  </td>
                </tr>
              ) : ujiList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Belum ada data uji organoleptik.
                  </td>
                </tr>
              ) : (
                ujiList.map((u, index) => {
                  const avg = ((u.rasa + u.aroma + u.warna + u.tekstur) / 4).toFixed(1);
                  return (
                    <tr key={u.id_uji} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-3 text-center font-medium text-slate-500">{index + 1}</td>
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-900">{formatTanggalIndo(u.tanggal)}</div>
                        <div className="text-[11px] font-mono text-slate-400">{u.tanggal}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{u.nama_menu}</span>
                        </div>
                        {u.deskripsi_menu && (
                          <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                            {u.deskripsi_menu}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-2 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold border ${getSkalaLabel(u.rasa).color}`}>
                          {u.rasa}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold border ${getSkalaLabel(u.aroma).color}`}>
                          {u.aroma}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold border ${getSkalaLabel(u.warna).color}`}>
                          {u.warna}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold border ${getSkalaLabel(u.tekstur).color}`}>
                          {u.tekstur}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 max-w-xs text-xs">
                        <div className="font-medium text-slate-800 line-clamp-2 leading-relaxed">
                          {u.keterangan || '-'}
                        </div>
                        <div className="text-[11px] text-indigo-700 font-semibold mt-1">
                          Rata-rata: {avg} / 5.0
                        </div>
                      </td>
                      <td className="py-3.5 px-2 text-center">
                        {canEdit ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(u)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Edit Uji"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(u)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Hapus Uji"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">View Only</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit (Form as specified: Tanggal, Menu, Rasa, Aroma, Warna, Tekstur, Keterangan) */}
      {isModalOpen && currentUji && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {currentUji.id_uji ? 'Edit Penilaian Uji Organoleptik' : 'Input Hasil Uji Organoleptik'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Pengujian <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={currentUji.tanggal || ''}
                  onChange={e => setCurrentUji({ ...currentUji, tanggal: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Menu Harian Yang Diuji <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={currentUji.id_menu || ''}
                  onChange={e => setCurrentUji({ ...currentUji, id_menu: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Pilih Dari Menu Harian --</option>
                  {menuOptions.map(m => (
                    <option key={m.id_menu} value={m.id_menu}>
                      [{m.tanggal}] {m.nama_menu}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-slate-400">
                  Data menu diambil langsung dari master Menu Harian.
                </span>
              </div>

              {/* 4 Organoleptic Indicators with 1-5 scale */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-800">
                  Nilai Indikator Sensorik (Skala 1 s/d 5)
                </div>

                {/* Rasa */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>1. Rasa Makanan</span>
                    <span className="text-indigo-600 font-bold">
                      {currentUji.rasa} - {getSkalaLabel(currentUji.rasa || 5).text}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={currentUji.rasa || 5}
                    onChange={e => setCurrentUji({ ...currentUji, rasa: Number(e.target.value) })}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                {/* Aroma */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>2. Aroma Makanan</span>
                    <span className="text-indigo-600 font-bold">
                      {currentUji.aroma} - {getSkalaLabel(currentUji.aroma || 5).text}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={currentUji.aroma || 5}
                    onChange={e => setCurrentUji({ ...currentUji, aroma: Number(e.target.value) })}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                {/* Warna */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>3. Warna / Penampilan Visual</span>
                    <span className="text-indigo-600 font-bold">
                      {currentUji.warna} - {getSkalaLabel(currentUji.warna || 5).text}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={currentUji.warna || 5}
                    onChange={e => setCurrentUji({ ...currentUji, warna: Number(e.target.value) })}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                {/* Tekstur */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>4. Tekstur / Kematangan Makanan</span>
                    <span className="text-indigo-600 font-bold">
                      {currentUji.tekstur} - {getSkalaLabel(currentUji.tekstur || 5).text}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={currentUji.tekstur || 5}
                    onChange={e =>
                      setCurrentUji({ ...currentUji, tekstur: Number(e.target.value) })
                    }
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan Pengujian Mutu
                </label>
                <textarea
                  rows={3}
                  placeholder="Contoh: Aroma kaldu sedap, sayuran segar tidak lembek, katsu renyah dan gurih, sangat layak konsumsi."
                  value={currentUji.keterangan || ''}
                  onChange={e => setCurrentUji({ ...currentUji, keterangan: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
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
                  {formLoading ? 'Menyimpan...' : 'Simpan Penilaian'}
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
              Hapus Data Uji Organoleptik?
            </h3>
            <p className="text-xs text-slate-600 text-center mt-2 leading-relaxed">
              Apakah Anda yakin ingin menghapus catatan uji untuk menu{' '}
              <strong>{deleteTarget.nama_menu}</strong> pada tanggal {deleteTarget.tanggal}?
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
