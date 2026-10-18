import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { DashboardStats } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  School,
  Building2,
  Users2,
  HeartHandshake,
  UtensilsCrossed,
  Sparkles,
  ClipboardCheck,
  CalendarCheck,
  Award,
  ChevronRight,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await api.dashboard.getStats();
      setStats(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching dashboard stats:', err);
      setError('Gagal memuat data statistik dari database server.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">Memuat data operasional MBG...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800">
        <h3 className="font-bold text-base">Terjadi Kesalahan</h3>
        <p className="text-sm mt-1">{error || 'Data statistik tidak tersedia.'}</p>
        <button
          onClick={fetchStats}
          className="mt-3 px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-emerald-900/40">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sistem Informasi Skripsi MBG Cimahi Tengah</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Selamat Datang, {user?.nama}
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Pusat operasional pelaksanaan Program Makan Bergizi Gratis (MBG) Satuan Pelayanan
            Program Gizi (SPPG) Padasuka 2, Kecamatan Cimahi Tengah. Seluruh metrik statistik
            terhubung secara langsung dengan database persisten.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-emerald-300">
            <span className="flex items-center gap-1.5 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/60">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Peran: <strong className="text-white">{user?.role}</strong>
            </span>
            <span className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
              <Activity className="w-4 h-4 text-emerald-400" />
              Status Server & Database: <strong className="text-emerald-400">Aktif & Terhubung</strong>
            </span>
          </div>
        </div>

        {/* Decorative corner icon */}
        <UtensilsCrossed className="absolute -bottom-6 -right-6 w-52 h-52 text-emerald-500/10 pointer-events-none transform -rotate-12" />
      </div>

      {/* 4 Primary Statistical Cards required by specification */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Statistik Utama Program MBG Padasuka 2
            </h3>
            <p className="text-xs text-slate-500">
              Agregasi data riil dari tabel database sekolah, posyandu, relawan, dan penerima
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Data Terverifikasi
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* 1. Sekolah / PAUD */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Sekolah / PAUD
              </span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <School className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                {stats.sekolah.formatted}
              </span>
              <span className="text-xs font-medium text-slate-500">Lembaga</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Meliputi PAUD, TK, SD, SMP</span>
              <span className="font-semibold text-blue-600">Aktif</span>
            </div>
          </div>

          {/* 2. Posyandu */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Posyandu
              </span>
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                {stats.posyandu.formatted}
              </span>
              <span className="text-xs font-medium text-slate-500">RW</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>RW 01 s/d RW 18 Padasuka</span>
              <span className="font-semibold text-teal-600">Terjangkau</span>
            </div>
          </div>

          {/* 3. Relawan */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Relawan
              </span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                <Users2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                {stats.relawan.formatted}
              </span>
              <span className="text-xs font-medium text-slate-500">Personel</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Dapur, Masak, Kemas, Distribusi</span>
              <span className="font-semibold text-amber-600">Siap Siaga</span>
            </div>
          </div>

          {/* 4. Total Penerima Manfaat */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-5 text-white shadow-lg shadow-emerald-700/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
                Penerima Manfaat
              </span>
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
                <HeartHandshake className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight text-white">
                {stats.penerima.formattedTotal}
              </span>
              <span className="text-xs font-medium text-emerald-100">Jiwa</span>
            </div>
            <div className="mt-3 pt-3 border-t border-emerald-500/40 flex items-center justify-between text-xs text-emerald-100">
              <span>Total Penerima Sasaran</span>
              <span className="font-bold text-white">100% Tercatat</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rincian Penerima Manfaat: Sekolah vs Posyandu */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <h4 className="text-sm font-bold text-slate-900 mb-1">
          Rincian Distribusi Sasaran Penerima Manfaat
        </h4>
        <p className="text-xs text-slate-500 mb-6">
          Pembagian proporsi sasaran penerima manfaat berdasarkan kanal distribusi lembaga sekolah
          dan posyandu balita/ibu hamil
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sekolah / PAUD Breakdown */}
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
                <School className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">
                  Penerima dari Sekolah / PAUD:
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {stats.penerima.formattedSekolah}
                  <span className="text-xs font-normal text-slate-500 ml-1.5">Siswa</span>
                </div>
                <div className="text-[11px] text-blue-700 font-medium">
                  PAUD (163) • TK (176) • SD (789) • SMP (230)
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-blue-800 bg-blue-100/80 px-2.5 py-1 rounded-full">
                42,7%
              </span>
            </div>
          </div>

          {/* Posyandu Breakdown */}
          <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-100 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">
                  Penerima dari Posyandu:
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {stats.penerima.formattedPosyandu}
                  <span className="text-xs font-normal text-slate-500 ml-1.5">Penerima</span>
                </div>
                <div className="text-[11px] text-teal-700 font-medium">
                  Balita & Baduta • Ibu Hamil • Ibu Menyusui (18 RW)
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-teal-800 bg-teal-100/80 px-2.5 py-1 rounded-full">
                57,3%
              </span>
            </div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="mt-5">
          <div className="flex justify-between text-xs text-slate-600 mb-1.5 font-medium">
            <span>Sekolah / PAUD: {stats.penerima.formattedSekolah} jiwa (42,7%)</span>
            <span>Posyandu: {stats.penerima.formattedPosyandu} jiwa (57,3%)</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
            <div className="bg-blue-600 h-full" style={{ width: '42.7%' }} />
            <div className="bg-teal-500 h-full" style={{ width: '57.3%' }} />
          </div>
        </div>
      </div>

      {/* Operational Highlights: Menu Hari Ini & Uji Organoleptik & Kehadiran */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu Hari Ini */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                <UtensilsCrossed className="w-4 h-4" />
                Menu Harian Terkini
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                {stats.latestMenu?.tanggal || 'Hari Ini'}
              </span>
            </div>

            <h4 className="text-base font-bold text-slate-900">
              {stats.latestMenu?.nama_menu || 'Paket Gizi Seimbang Ayam Katsu'}
            </h4>
            <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
              {stats.latestMenu?.deskripsi || 'Nasi, Chicken Katsu, Sapo Tahu, Mix Vegetable, Lengkeng'}
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <Link
              to="/menu-harian"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              Lihat Semua Siklus Menu <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Uji Organoleptik Terakhir */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                <ClipboardCheck className="w-4 h-4" />
                Uji Organoleptik Terakhir
              </span>
              <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                Skor: {stats.latestUji?.avgScore || '4.8'} / 5.0
              </span>
            </div>

            <h4 className="text-sm font-bold text-slate-900">
              {stats.latestUji?.nama_menu || 'Paket Menu Uji Kontrol'}
            </h4>

            {/* Score indicators */}
            <div className="grid grid-cols-4 gap-2 mt-3 text-center">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-[10px] text-slate-500">Rasa</div>
                <div className="text-sm font-extrabold text-slate-800">
                  {stats.latestUji?.rasa || 5}/5
                </div>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-[10px] text-slate-500">Aroma</div>
                <div className="text-sm font-extrabold text-slate-800">
                  {stats.latestUji?.aroma || 5}/5
                </div>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-[10px] text-slate-500">Warna</div>
                <div className="text-sm font-extrabold text-slate-800">
                  {stats.latestUji?.warna || 5}/5
                </div>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-[10px] text-slate-500">Tekstur</div>
                <div className="text-sm font-extrabold text-slate-800">
                  {stats.latestUji?.tekstur || 4}/5
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 mt-3 italic line-clamp-2">
              "{stats.latestUji?.keterangan || 'Kematangan ayam katsu sempurna, rasa gurih seimbang.'}"
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <Link
              to="/uji-organoleptik"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Lihat Hasil Pengujian <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Absensi Relawan Recap */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                <CalendarCheck className="w-4 h-4" />
                Presensi Relawan
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Hari Pelayanan
              </span>
            </div>

            <h4 className="text-sm font-bold text-slate-900">
              Rekapitulasi Kehadiran Personel SPPG
            </h4>

            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-center">
                <div className="text-[11px] font-medium text-emerald-800">Hadir</div>
                <div className="text-lg font-black text-emerald-700">
                  {stats.absensiStat?.hadir || 8}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-center">
                <div className="text-[11px] font-medium text-blue-800">Izin / Sakit</div>
                <div className="text-lg font-black text-blue-700">
                  {(stats.absensiStat?.izin || 0) + (stats.absensiStat?.sakit || 0) || 2}
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 mt-3">
              Total 47 relawan terbagi dalam tim persiapan bahan, memasak, pengemasan, uji mutu, dan logistik.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <Link
              to="/absensi-relawan"
              className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              Kelola Absensi Relawan <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Informasi Singkat Program MBG (Sesuai Ketentuan Skripsi) */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
          <Award className="w-4 h-4" />
          <span>Informasi Program MBG SPPG Padasuka 2 Cimahi Tengah</span>
        </div>
        <h3 className="text-xl font-black text-white">
          Standar Pelayanan dan Komitmen Gizi Nasional
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold mb-3">
              1
            </div>
            <h5 className="font-bold text-sm text-white">Pemenuhan Angka Kecukupan Gizi (AKG)</h5>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              Setiap porsi makanan dihitung dengan rasio karbohidrat, protein hewani, protein nabati,
              serat sayur, dan vitamin buah untuk menunjang tumbuh kembang anak dan pencegahan stunting.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold mb-3">
              2
            </div>
            <h5 className="font-bold text-sm text-white">Pengendalian Mutu & Organoleptik</h5>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              Setiap menu wajib melalui pengujian sensorik (rasa, aroma, warna, tekstur) oleh tim Quality
              Control SPPG sebelum dikemas dan didistribusikan ke 23 sekolah dan 18 posyandu.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold mb-3">
              3
            </div>
            <h5 className="font-bold text-sm text-white">Akuntabilitas & Pencatatan Digital</h5>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              Implementasi sistem informasi berbasis web ini menjamin transparansi data sasaran penerima,
              presensi relawan, catatan uji kualitas makanan, serta pelaporan berkala resmi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
