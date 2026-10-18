import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { PenerimaManfaat, Sekolah, Posyandu } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  HeartHandshake,
  Search,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  School,
  Building2,
  X,
  Filter,
  AlertTriangle,
} from 'lucide-react';

export const DataPenerima: React.FC = () => {
  const { hasRole } = useAuth();
  const canEdit = hasRole('Administrator');

  const [penerimaList, setPenerimaList] = useState<PenerimaManfaat[]>([]);
  const [sekolahOptions, setSekolahOptions] = useState<Sekolah[]>([]);
  const [posyanduOptions, setPosyanduOptions] = useState<Posyandu[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tipeFilter, setTipeFilter] = useState('Semua');
  const [kategoriFilter, setKategoriFilter] = useState('Semua');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPenerima, setCurrentPenerima] = useState<Partial<PenerimaManfaat> | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<PenerimaManfaat | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchPenerima();
  }, [search, tipeFilter, kategoriFilter]);

  useEffect(() => {
    // Load options for dropdowns
    api.sekolah.getAll().then(setSekolahOptions).catch(() => {});
    api.posyandu.getAll().then(setPosyanduOptions).catch(() => {});
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchPenerima = async () => {
    try {
      setLoading(true);
      const data = await api.penerima.getAll({
        search: search || undefined,
        tipe: tipeFilter !== 'Semua' ? tipeFilter : undefined,
        kategori: kategoriFilter !== 'Semua' ? kategoriFilter : undefined,
      });
      setPenerimaList(data);
    } catch (err: any) {
      showToast('error', err.message || 'Gagal mengambil data penerima manfaat.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setCurrentPenerima({
      tipe: 'Sekolah',
      id_sekolah: sekolahOptions[0]?.id_sekolah || null,
      id_posyandu: null,
      nama_penerima: '',
      kategori: 'Siswa SD',
      kelas_atau_usia: '',
      jenis_kelamin: 'L',
      alergi_pantangan: 'Tidak Ada',
      status: 'Aktif',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: PenerimaManfaat) => {
    setCurrentPenerima(p);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPenerima) return;

    if (!currentPenerima.nama_penerima || !currentPenerima.kategori) {
      showToast('error', 'Nama penerima dan kategori wajib diisi.');
      return;
    }

    try {
      setFormLoading(true);
      if (currentPenerima.id_penerima) {
        await api.penerima.update(currentPenerima.id_penerima, currentPenerima);
        showToast('success', 'Data penerima manfaat berhasil diperbarui.');
      } else {
        await api.penerima.create(currentPenerima);
        showToast('success', 'Penerima manfaat baru berhasil ditambahkan.');
      }
      setIsModalOpen(false);
      fetchPenerima();
    } catch (err: any) {
      showToast('error', err.message || 'Gagal menyimpan data penerima manfaat.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleteLoading(true);
      await api.penerima.delete(deleteTarget.id_penerima);
      showToast('success', `Data penerima ${deleteTarget.nama_penerima} berhasil dihapus.`);
      setDeleteTarget(null);
      fetchPenerima();
    } catch (err: any) {
      showToast('error', err.message || 'Gagal menghapus penerima.');
    } finally {
      setDeleteLoading(false);
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
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Data Penerima Manfaat</h2>
              <p className="text-xs text-slate-500">
                Pencatatan data individu penerima manfaat (Siswa Sekolah, Balita, Ibu Hamil & Menyusui)
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
            <span>Tambah Penerima</span>
          </button>
        )}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama penerima atau lembaga asal..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={tipeFilter}
              onChange={e => setTipeFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Semua">Semua Kanal Tipe</option>
              <option value="Sekolah">Sekolah / PAUD</option>
              <option value="Posyandu">Posyandu</option>
            </select>
          </div>

          <select
            value={kategoriFilter}
            onChange={e => setKategoriFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="Semua">Semua Kategori</option>
            <option value="Siswa PAUD/TK">Siswa PAUD/TK</option>
            <option value="Siswa SD">Siswa SD</option>
            <option value="Siswa SMP">Siswa SMP</option>
            <option value="Balita">Balita</option>
            <option value="Ibu Hamil">Ibu Hamil</option>
            <option value="Ibu Menyusui">Ibu Menyusui</option>
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
                <th className="py-3 px-4">Nama Penerima</th>
                <th className="py-3 px-4">Kanal / Lembaga Terdaftar</th>
                <th className="py-3 px-4">Kategori Sasaran</th>
                <th className="py-3 px-4">Kelas / Usia</th>
                <th className="py-3 px-4 text-center">L/P</th>
                <th className="py-3 px-4">Catatan Alergi</th>
                <th className="py-3 px-4 text-center">Status</th>
                {canEdit && <th className="py-3 px-4 text-center w-24">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={canEdit ? 9 : 8} className="py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <div>Memuat data penerima manfaat...</div>
                  </td>
                </tr>
              ) : penerimaList.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 9 : 8} className="py-12 text-center text-slate-400">
                    Tidak ditemukan data penerima manfaat.
                  </td>
                </tr>
              ) : (
                penerimaList.map((p, index) => (
                  <tr key={p.id_penerima} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-center font-medium text-slate-500">{index + 1}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{p.nama_penerima}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        {p.tipe === 'Sekolah' ? (
                          <School className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        ) : (
                          <Building2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        )}
                        <span className="font-medium text-slate-800">
                          {p.nama_sekolah || p.nama_posyandu || '-'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 ml-5">Kanal: {p.tipe}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold ${
                          p.kategori.includes('Siswa')
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : p.kategori.includes('Balita')
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {p.kategori}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{p.kelas_atau_usia || '-'}</td>
                    <td className="py-3 px-4 text-center font-bold text-slate-700">
                      {p.jenis_kelamin}
                    </td>
                    <td className="py-3 px-4">
                      {p.alergi_pantangan && p.alergi_pantangan !== 'Tidak Ada' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          {p.alergi_pantangan}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">Tidak Ada</span>
                      )}
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
      {isModalOpen && currentPenerima && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {currentPenerima.id_penerima ? 'Edit Penerima Manfaat' : 'Tambah Penerima Manfaat'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kanal Asal Distribusi <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={currentPenerima.tipe || 'Sekolah'}
                    onChange={e =>
                      setCurrentPenerima({
                        ...currentPenerima,
                        tipe: e.target.value as any,
                        kategori: e.target.value === 'Sekolah' ? 'Siswa SD' : 'Balita',
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Sekolah">Sekolah / PAUD</option>
                    <option value="Posyandu">Posyandu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lembaga Terdaftar <span className="text-rose-500">*</span>
                  </label>
                  {currentPenerima.tipe === 'Sekolah' ? (
                    <select
                      value={currentPenerima.id_sekolah || ''}
                      onChange={e =>
                        setCurrentPenerima({
                          ...currentPenerima,
                          id_sekolah: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">-- Pilih Sekolah --</option>
                      {sekolahOptions.map(s => (
                        <option key={s.id_sekolah} value={s.id_sekolah}>
                          {s.nama_sekolah} ({s.jenjang})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <select
                      value={currentPenerima.id_posyandu || ''}
                      onChange={e =>
                        setCurrentPenerima({
                          ...currentPenerima,
                          id_posyandu: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">-- Pilih Posyandu --</option>
                      {posyanduOptions.map(pos => (
                        <option key={pos.id_posyandu} value={pos.id_posyandu}>
                          {pos.nama_posyandu} ({pos.rw})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Penerima Manfaat <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Muhammad Rizky Pratama / Ny. Siti Rohmah"
                  value={currentPenerima.nama_penerima || ''}
                  onChange={e =>
                    setCurrentPenerima({ ...currentPenerima, nama_penerima: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kategori Sasaran <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={currentPenerima.kategori || 'Siswa SD'}
                    onChange={e =>
                      setCurrentPenerima({ ...currentPenerima, kategori: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {currentPenerima.tipe === 'Sekolah' ? (
                      <>
                        <option value="Siswa PAUD/TK">Siswa PAUD/TK</option>
                        <option value="Siswa SD">Siswa SD</option>
                        <option value="Siswa SMP">Siswa SMP</option>
                      </>
                    ) : (
                      <>
                        <option value="Balita">Balita</option>
                        <option value="Ibu Hamil">Ibu Hamil</option>
                        <option value="Ibu Menyusui">Ibu Menyusui</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kelas atau Usia
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Kelas 4B / 2 Tahun 4 Bulan"
                    value={currentPenerima.kelas_atau_usia || ''}
                    onChange={e =>
                      setCurrentPenerima({ ...currentPenerima, kelas_atau_usia: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={currentPenerima.jenis_kelamin || 'L'}
                    onChange={e =>
                      setCurrentPenerima({
                        ...currentPenerima,
                        jenis_kelamin: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status Aktif
                  </label>
                  <select
                    value={currentPenerima.status || 'Aktif'}
                    onChange={e =>
                      setCurrentPenerima({ ...currentPenerima, status: e.target.value as any })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Alergi / Pantangan Makanan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Alergi Kacang, Alergi Seafood, atau Tidak Ada"
                  value={currentPenerima.alergi_pantangan || ''}
                  onChange={e =>
                    setCurrentPenerima({ ...currentPenerima, alergi_pantangan: e.target.value })
                  }
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
              Hapus Data Penerima Manfaat?
            </h3>
            <p className="text-xs text-slate-600 text-center mt-2 leading-relaxed">
              Apakah Anda yakin ingin menghapus data penerima <strong>{deleteTarget.nama_penerima}</strong>?
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
