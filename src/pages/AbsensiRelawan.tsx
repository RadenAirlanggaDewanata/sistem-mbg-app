import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Absensi, Relawan } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  CalendarCheck,
  Search,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Filter,
  Check,
  LogOut as LogOutIcon,
  X,
} from 'lucide-react';

export const AbsensiRelawan: React.FC = () => {
  const { user, hasRole } = useAuth();
  const isAdmin = hasRole('Administrator');
  const isRelawan = user?.role === 'Relawan';

  // For Admin / Kepala SPPG: List of all attendance
  const [absensiList, setAbsensiList] = useState<Absensi[]>([]);
  const [relawanOptions, setRelawanOptions] = useState<Relawan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [tanggalAwal, setTanggalAwal] = useState('');
  const [tanggalAkhir, setTanggalAkhir] = useState('');

  // For Relawan role: Own attendance history & today's checkin/out status
  const [myHistory, setMyHistory] = useState<Absensi[]>([]);
  const [todayRecord, setTodayRecord] = useState<Absensi | null>(null);
  const [selfLoading, setSelfLoading] = useState(false);

  // Admin Modal Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAbsensi, setCurrentAbsensi] = useState<Partial<Absensi> | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<Absensi | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (isRelawan) {
      fetchMyHistory();
    } else {
      fetchAdminAbsensi();
      api.relawan.getAll().then(setRelawanOptions).catch(() => {});
    }
  }, [search, statusFilter, tanggalAwal, tanggalAkhir, user?.role]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchAdminAbsensi = async () => {
    try {
      setLoading(true);
      const data = await api.absensi.getAll({
        search: search || undefined,
        status: statusFilter !== 'Semua' ? statusFilter : undefined,
        tanggal_awal: tanggalAwal || undefined,
        tanggal_akhir: tanggalAkhir || undefined,
      });
      setAbsensiList(data);
    } catch (err: any) {
      showToast('error', err.message || 'Gagal memuat absensi.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyHistory = async () => {
    try {
      setLoading(true);
      const data = await api.absensi.getMyHistory();
      setMyHistory(data.history);
      setTodayRecord(data.todayRecord);
    } catch (err: any) {
      showToast('error', err.message || 'Gagal memuat riwayat presensi.');
    } finally {
      setLoading(false);
    }
  };

  // Relawan Check-in Action
  const handleCheckin = async (status: string = 'Hadir') => {
    try {
      setSelfLoading(true);
      const res = await api.absensi.checkin({
        id_relawan: user?.id_relawan || 1,
        status,
        keterangan: status === 'Hadir' ? 'Presensi mandiri relawan SPPG' : `Izin: ${status}`,
      });
      showToast('success', res.message || 'Presensi masuk berhasil dicatat.');
      fetchMyHistory();
    } catch (err: any) {
      showToast('error', err.message || 'Gagal melakukan absensi masuk.');
    } finally {
      setSelfLoading(false);
    }
  };

  // Relawan Check-out Action
  const handleCheckout = async () => {
    try {
      setSelfLoading(true);
      const res = await api.absensi.checkout({
        id_absensi: todayRecord?.id_absensi,
        id_relawan: user?.id_relawan || 1,
      });
      showToast('success', res.message || 'Waktu kepulangan berhasil dicatat.');
      fetchMyHistory();
    } catch (err: any) {
      showToast('error', err.message || 'Gagal mencatat waktu kepulangan.');
    } finally {
      setSelfLoading(false);
    }
  };

  // Admin Modal handlers
  const handleOpenAdd = () => {
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().split(' ')[0];
    setCurrentAbsensi({
      id_relawan: relawanOptions[0]?.id_relawan || 1,
      tanggal: today,
      waktu_masuk: nowTime,
      waktu_pulang: '-',
      status: 'Hadir',
      keterangan: 'Tugas operasional harian SPPG',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (a: Absensi) => {
    setCurrentAbsensi(a);
    setIsModalOpen(true);
  };

  const handleSaveAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAbsensi) return;

    if (!currentAbsensi.id_relawan || !currentAbsensi.tanggal || !currentAbsensi.status) {
      showToast('error', 'Relawan, tanggal, dan status wajib diisi.');
      return;
    }

    try {
      setFormLoading(true);
      if (currentAbsensi.id_absensi) {
        await api.absensi.adminUpdate(currentAbsensi.id_absensi, currentAbsensi);
        showToast('success', 'Data absensi berhasil diperbarui.');
      } else {
        await api.absensi.adminCreate(currentAbsensi);
        showToast('success', 'Catatan absensi baru berhasil ditambahkan.');
      }
      setIsModalOpen(false);
      fetchAdminAbsensi();
    } catch (err: any) {
      showToast('error', err.message || 'Gagal menyimpan absensi.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!deleteTarget) return;

    try {
      setDeleteLoading(true);
      await api.absensi.adminDelete(deleteTarget.id_absensi);
      showToast('success', 'Catatan absensi berhasil dihapus.');
      setDeleteTarget(null);
      fetchAdminAbsensi();
    } catch (err: any) {
      showToast('error', err.message || 'Gagal menghapus absensi.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Hadir':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Izin':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Sakit':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Alpa':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const formatTanggalIndo = (tglString: string) => {
    try {
      const date = new Date(tglString);
      return date.toLocaleDateString('id-ID', {
        weekday: 'short',
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

      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Absensi Relawan</h2>
              <p className="text-xs text-slate-500">
                Pencatatan presensi kehadiran, waktu masuk, dan waktu pulang personel operasional SPPG
              </p>
            </div>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Input Presensi Manual</span>
          </button>
        )}
      </div>

      {/* SPECIAL INTERFACE FOR ROLE: RELAWAN (Absensi Mandiri) */}
      {isRelawan && (
        <div className="bg-gradient-to-br from-slate-900 to-amber-950 rounded-3xl p-6 sm:p-8 text-white border border-amber-900/40 shadow-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-amber-300 bg-amber-950/80 border border-amber-800/80 mb-2">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Panel Presensi Mandiri Petugas Relawan</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Halo, {user?.nama}
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                Silakan lakukan pencatatan waktu masuk saat tiba di Dapur SPPG Padasuka 2 dan catat
                waktu kepulangan setelah menyelesaikan tugas pelayanan gizi harian.
              </p>
            </div>

            {/* Checkin / Checkout Action Buttons */}
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              {!todayRecord ? (
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <button
                    onClick={() => handleCheckin('Hadir')}
                    disabled={selfLoading}
                    className="flex-1 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>Catat Masuk (Hadir)</span>
                  </button>
                  <button
                    onClick={() => handleCheckin('Izin')}
                    disabled={selfLoading}
                    className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <span>Izin</span>
                  </button>
                  <button
                    onClick={() => handleCheckin('Sakit')}
                    disabled={selfLoading}
                    className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <span>Sakit</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2 w-full text-center sm:text-left">
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-bold text-emerald-300">
                      Telah Tercatat Masuk: {todayRecord.waktu_masuk} ({todayRecord.status})
                    </span>
                  </div>

                  {todayRecord.waktu_pulang && todayRecord.waktu_pulang !== '-' ? (
                    <div className="text-xs text-slate-300">
                      Waktu Kepulangan:{' '}
                      <strong className="text-white">{todayRecord.waktu_pulang}</strong> (Selesai Tugas)
                    </div>
                  ) : (
                    <button
                      onClick={handleCheckout}
                      disabled={selfLoading}
                      className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-amber-900/40 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                    >
                      <LogOutIcon className="w-4 h-4" />
                      <span>Catat Waktu Pulang</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FOR RELAWAN: View own attendance history */}
      {isRelawan ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900">
              Riwayat Presensi Pribadi ({user?.nama})
            </h4>
            <span className="text-xs font-medium text-slate-500">
              Total Hadir: {myHistory.filter(h => h.status === 'Hadir').length} Hari
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4 text-center">Waktu Masuk</th>
                  <th className="py-3 px-4 text-center">Waktu Pulang</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      Belum ada riwayat presensi tercatat untuk akun Anda.
                    </td>
                  </tr>
                ) : (
                  myHistory.map((h, idx) => (
                    <tr key={h.id_absensi} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 text-center font-medium text-slate-500">{idx + 1}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {formatTanggalIndo(h.tanggal)}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-medium text-slate-700">
                        {h.waktu_masuk || '-'}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-medium text-slate-700">
                        {h.waktu_pulang || '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(
                            h.status
                          )}`}
                        >
                          {h.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{h.keterangan || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* FOR ADMIN & KEPALA SPPG: Full Management Table */
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama relawan, NIK, atau keterangan..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Semua">Semua Status</option>
                  <option value="Hadir">Hadir</option>
                  <option value="Izin">Izin</option>
                  <option value="Sakit">Sakit</option>
                  <option value="Alpa">Alpa</option>
                </select>
              </div>

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

              {(search || statusFilter !== 'Semua' || tanggalAwal || tanggalAkhir) && (
                <button
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('Semua');
                    setTanggalAwal('');
                    setTanggalAkhir('');
                  }}
                  className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Table Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                    <th className="py-3.5 px-4 w-12 text-center">No</th>
                    <th className="py-3.5 px-4 w-36">Tanggal</th>
                    <th className="py-3.5 px-4">Nama Relawan & Posisi</th>
                    <th className="py-3.5 px-4 text-center w-28">Waktu Masuk</th>
                    <th className="py-3.5 px-4 text-center w-28">Waktu Pulang</th>
                    <th className="py-3.5 px-4 text-center w-24">Status</th>
                    <th className="py-3.5 px-4">Keterangan</th>
                    {isAdmin && <th className="py-3.5 px-4 text-center w-24">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={isAdmin ? 8 : 7} className="py-12 text-center text-slate-400">
                        <div className="inline-block w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2" />
                        <div>Memuat data presensi relawan...</div>
                      </td>
                    </tr>
                  ) : absensiList.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 8 : 7} className="py-12 text-center text-slate-400">
                        Tidak ditemukan catatan absensi.
                      </td>
                    </tr>
                  ) : (
                    absensiList.map((a, index) => (
                      <tr key={a.id_absensi} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 text-center font-medium text-slate-500">{index + 1}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{formatTanggalIndo(a.tanggal)}</div>
                          <div className="text-[11px] font-mono text-slate-400">{a.tanggal}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {a.nama_relawan}
                          </div>
                          <div className="text-[11px] text-amber-700 font-medium">
                            {a.tugas_posisi || 'Personel SPPG'}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-700">
                          {a.waktu_masuk || '-'}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-700">
                          {a.waktu_pulang || '-'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(
                              a.status
                            )}`}
                          >
                            {a.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={a.keterangan}>
                          {a.keterangan || '-'}
                        </td>
                        {isAdmin && (
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleOpenEdit(a)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="Edit Absensi"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteTarget(a)}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="Hapus Absensi"
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
        </div>
      )}

      {/* Admin Modal Add/Edit */}
      {isModalOpen && currentAbsensi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {currentAbsensi.id_absensi ? 'Edit Catatan Presensi' : 'Input Presensi Relawan'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdmin} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih Relawan <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={currentAbsensi.id_relawan || ''}
                  onChange={e =>
                    setCurrentAbsensi({ ...currentAbsensi, id_relawan: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {relawanOptions.map(r => (
                    <option key={r.id_relawan} value={r.id_relawan}>
                      {r.nama_relawan} ({r.tugas_posisi})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Presensi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={currentAbsensi.tanggal || ''}
                    onChange={e =>
                      setCurrentAbsensi({ ...currentAbsensi, tanggal: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status Kehadiran <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={currentAbsensi.status || 'Hadir'}
                    onChange={e =>
                      setCurrentAbsensi({ ...currentAbsensi, status: e.target.value as any })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Hadir">Hadir</option>
                    <option value="Izin">Izin</option>
                    <option value="Sakit">Sakit</option>
                    <option value="Alpa">Alpa</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Waktu Masuk
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 06:15:00"
                    value={currentAbsensi.waktu_masuk || ''}
                    onChange={e =>
                      setCurrentAbsensi({ ...currentAbsensi, waktu_masuk: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Waktu Pulang
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 13:45:00 atau -"
                    value={currentAbsensi.waktu_pulang || ''}
                    onChange={e =>
                      setCurrentAbsensi({ ...currentAbsensi, waktu_pulang: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan Kegiatan
                </label>
                <textarea
                  rows={2}
                  placeholder="Keterangan tugas, izin, atau keterangan medis"
                  value={currentAbsensi.keterangan || ''}
                  onChange={e =>
                    setCurrentAbsensi({ ...currentAbsensi, keterangan: e.target.value })
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
                  {formLoading ? 'Menyimpan...' : 'Simpan Presensi'}
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
              Hapus Catatan Presensi?
            </h3>
            <p className="text-xs text-slate-600 text-center mt-2 leading-relaxed">
              Apakah Anda yakin ingin menghapus catatan presensi untuk{' '}
              <strong>{deleteTarget.nama_relawan}</strong> pada tanggal {deleteTarget.tanggal}?
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
                onClick={handleDeleteAdmin}
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
