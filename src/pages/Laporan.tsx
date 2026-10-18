import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FileBarChart,
  Printer,
  Search,
} from 'lucide-react';

export const Laporan: React.FC = () => {
  const { user } = useAuth();

  const [jenisLaporan, setJenisLaporan] = useState<
    'penerima-manfaat' | 'absensi-relawan' | 'menu-harian' | 'uji-organoleptik'
  >('penerima-manfaat');

  const [tanggalAwal, setTanggalAwal] = useState('');
  const [tanggalAkhir, setTanggalAkhir] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [printDate, setPrintDate] = useState<string>('');

  useEffect(() => {
    handleLoadReport();
  }, []);

  const handleLoadReport = async () => {
    setLoading(true);
    setPrintDate(
      new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' WIB'
    );

    try {
      let data: any = null;
      if (jenisLaporan === 'penerima-manfaat') {
        data = await api.laporan.getPenerima();
      } else if (jenisLaporan === 'absensi-relawan') {
        data = await api.laporan.getAbsensi({
          tanggal_awal: tanggalAwal || undefined,
          tanggal_akhir: tanggalAkhir || undefined,
        });
      } else if (jenisLaporan === 'menu-harian') {
        data = await api.laporan.getMenu({
          tanggal_awal: tanggalAwal || undefined,
          tanggal_akhir: tanggalAkhir || undefined,
        });
      } else if (jenisLaporan === 'uji-organoleptik') {
        data = await api.laporan.getOrganoleptik({
          tanggal_awal: tanggalAwal || undefined,
          tanggal_akhir: tanggalAkhir || undefined,
        });
      }
      setReportData(data);
    } catch (err: any) {
      console.error('Error generating report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
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
      {/* Configuration & Filter Bar (Hidden when printing) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <FileBarChart className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Laporan & Cetak Dokumen</h2>
              <p className="text-xs text-slate-500">
                Pusat generasi laporan resmi operasional SPPG Padasuka 2 Cimahi Tengah
              </p>
            </div>
          </div>

          <button
            onClick={handlePrint}
            disabled={!reportData || loading}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md shadow-slate-900/20 transition cursor-pointer disabled:opacity-50"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Cetak Laporan</span>
          </button>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Jenis Laporan <span className="text-rose-500">*</span>
            </label>
            <select
              value={jenisLaporan}
              onChange={e => setJenisLaporan(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500"
            >
              <option value="penerima-manfaat">1. Laporan Penerima Manfaat</option>
              <option value="absensi-relawan">2. Laporan Absensi Relawan</option>
              <option value="menu-harian">3. Laporan Menu Harian</option>
              <option value="uji-organoleptik">4. Laporan Uji Organoleptik</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Periode Dari Tanggal
            </label>
            <input
              type="date"
              value={tanggalAwal}
              onChange={e => setTanggalAwal(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Periode Sampai Tanggal
            </label>
            <input
              type="date"
              value={tanggalAkhir}
              onChange={e => setTanggalAkhir(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleLoadReport}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'Memproses...' : 'Tampilkan Laporan'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* REPORT PRINTABLE SHEET CONTAINER (Clean Layout for Printing)   */}
      {/* ============================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-sm print:border-none print:shadow-none print:p-0">
        {/* Official Kop Surat Header */}
        <div className="border-b-4 border-double border-slate-900 pb-4 text-center">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-600">
            Pemerintah Kota Cimahi • Satuan Pelayanan Program Gizi (SPPG)
          </div>
          <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Sistem Informasi Pelaksanaan Program Makan Bergizi Gratis (MBG)
          </h1>
          <h2 className="text-sm sm:text-base font-extrabold text-emerald-800">
            SPPG Padasuka 2 Cimahi Tengah
          </h2>
          <div className="text-[11px] text-slate-500 mt-1">
            Sekretariat & Dapur Pelayanan: Jl. Padasuka Mandiri No. 12, Kel. Padasuka, Kec. Cimahi
            Tengah, Kota Cimahi, Jawa Barat 40526
          </div>
        </div>

        {/* Report Metadata */}
        <div className="mt-6 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-slate-600 gap-2 border-b border-slate-200 pb-3">
          <div>
            <div className="text-base font-black text-slate-900 uppercase">
              {reportData?.title || 'Laporan Resmi Pelaksanaan Program MBG'}
            </div>
            <div className="text-slate-500 mt-0.5">
              Periode:{' '}
              <strong className="text-slate-800">
                {tanggalAwal && tanggalAkhir
                  ? `${formatTanggalIndo(tanggalAwal)} s/d ${formatTanggalIndo(tanggalAkhir)}`
                  : 'Keseluruhan Data Terdaftar (Tahun Ajaran 2026)'}
              </strong>
            </div>
          </div>

          <div className="sm:text-right text-[11px]">
            <div>
              Tanggal Cetak: <strong className="text-slate-800">{printDate}</strong>
            </div>
            <div>
              Dicetak Oleh:{' '}
              <strong className="text-slate-800">
                {user?.nama} ({user?.role})
              </strong>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 1. LAPORAN PENERIMA MANFAAT                                     */}
        {/* ============================================================== */}
        {jenisLaporan === 'penerima-manfaat' && reportData && (
          <div className="space-y-6">
            {/* Summary Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200">
                <span className="text-[11px] font-semibold text-blue-700">Penerima Sekolah</span>
                <div className="text-xl font-black text-slate-900 mt-1">
                  {new Intl.NumberFormat('id-ID').format(reportData.summary.totalPenerimaSekolah)} Jiwa
                </div>
                <div className="text-[11px] text-slate-500">
                  {reportData.summary.totalSekolahLembaga} Lembaga Sekolah
                </div>
              </div>

              <div className="p-3.5 bg-teal-50/60 rounded-xl border border-teal-200">
                <span className="text-[11px] font-semibold text-teal-700">Penerima Posyandu</span>
                <div className="text-xl font-black text-slate-900 mt-1">
                  {new Intl.NumberFormat('id-ID').format(reportData.summary.totalPenerimaPosyandu)} Jiwa
                </div>
                <div className="text-[11px] text-slate-500">
                  {reportData.summary.totalPosyanduLembaga} Posyandu RW
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-300 col-span-2 sm:col-span-1">
                <span className="text-[11px] font-semibold text-emerald-800">Grand Total Penerima</span>
                <div className="text-xl font-black text-emerald-700 mt-1">
                  {new Intl.NumberFormat('id-ID').format(reportData.summary.grandTotalPenerima)} Jiwa
                </div>
                <div className="text-[11px] text-emerald-700 font-medium">100% Terverifikasi</div>
              </div>
            </div>

            {/* Rekap Sekolah */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                A. Rincian Distribusi Lembaga Sekolah & PAUD (23 Lembaga)
              </h4>
              <table className="w-full text-left border-collapse text-xs border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold">
                    <th className="py-2 px-3 w-10 text-center border-r border-slate-300">No</th>
                    <th className="py-2 px-3 border-r border-slate-300">Nama Sekolah</th>
                    <th className="py-2 px-3 border-r border-slate-300">Jenjang</th>
                    <th className="py-2 px-3 border-r border-slate-300">Alamat</th>
                    <th className="py-2 px-3 text-right">Jumlah Siswa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {reportData.breakdownSekolah.map((s: any, idx: number) => (
                    <tr key={idx}>
                      <td className="py-1.5 px-3 text-center border-r border-slate-200">{idx + 1}</td>
                      <td className="py-1.5 px-3 font-semibold text-slate-900 border-r border-slate-200">
                        {s.instansi}
                      </td>
                      <td className="py-1.5 px-3 border-r border-slate-200">{s.jenjang}</td>
                      <td className="py-1.5 px-3 border-r border-slate-200 text-slate-600">{s.alamat}</td>
                      <td className="py-1.5 px-3 text-right font-bold text-slate-800">
                        {new Intl.NumberFormat('id-ID').format(s.jumlah_penerima)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold border-t-2 border-slate-300">
                    <td colSpan={4} className="py-2 px-3 text-right border-r border-slate-300">
                      Total Penerima Sekolah / PAUD:
                    </td>
                    <td className="py-2 px-3 text-right text-blue-700">
                      {new Intl.NumberFormat('id-ID').format(reportData.summary.totalPenerimaSekolah)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Rekap Posyandu */}
            <div className="pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                B. Rincian Distribusi Posyandu Balita & Ibu Hamil (18 RW Padasuka)
              </h4>
              <table className="w-full text-left border-collapse text-xs border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold">
                    <th className="py-2 px-3 w-10 text-center border-r border-slate-300">No</th>
                    <th className="py-2 px-3 border-r border-slate-300">Nama Posyandu</th>
                    <th className="py-2 px-3 border-r border-slate-300">Wilayah</th>
                    <th className="py-2 px-3 border-r border-slate-300">Ketua Posyandu</th>
                    <th className="py-2 px-3 text-right">Jumlah Penerima</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {reportData.breakdownPosyandu.map((p: any, idx: number) => (
                    <tr key={idx}>
                      <td className="py-1.5 px-3 text-center border-r border-slate-200">{idx + 1}</td>
                      <td className="py-1.5 px-3 font-semibold text-slate-900 border-r border-slate-200">
                        {p.instansi}
                      </td>
                      <td className="py-1.5 px-3 border-r border-slate-200">{p.rw}</td>
                      <td className="py-1.5 px-3 border-r border-slate-200 text-slate-600">{p.ketua_posyandu}</td>
                      <td className="py-1.5 px-3 text-right font-bold text-slate-800">
                        {new Intl.NumberFormat('id-ID').format(p.jumlah_penerima)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold border-t-2 border-slate-300">
                    <td colSpan={4} className="py-2 px-3 text-right border-r border-slate-300">
                      Total Penerima Posyandu:
                    </td>
                    <td className="py-2 px-3 text-right text-teal-700">
                      {new Intl.NumberFormat('id-ID').format(reportData.summary.totalPenerimaPosyandu)}
                    </td>
                  </tr>
                  <tr className="bg-emerald-50 font-black border-t border-slate-400">
                    <td colSpan={4} className="py-2.5 px-3 text-right border-r border-slate-300 text-emerald-900">
                      TOTAL KESELURUHAN PENERIMA MANFAAT MBG (SEKOLAH + POSYANDU):
                    </td>
                    <td className="py-2.5 px-3 text-right text-emerald-800 text-sm">
                      {new Intl.NumberFormat('id-ID').format(reportData.summary.grandTotalPenerima)} Jiwa
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 2. LAPORAN ABSENSI RELAWAN                                      */}
        {/* ============================================================== */}
        {jenisLaporan === 'absensi-relawan' && reportData && (
          <div className="space-y-4">
            <div className="grid grid-cols-5 gap-2 text-center text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-slate-500 font-medium">Total Catatan</span>
                <div className="text-lg font-bold text-slate-900">{reportData.summary.total}</div>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <span className="text-emerald-700 font-medium">Hadir</span>
                <div className="text-lg font-bold text-emerald-800">{reportData.summary.hadir}</div>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <span className="text-blue-700 font-medium">Izin</span>
                <div className="text-lg font-bold text-blue-800">{reportData.summary.izin}</div>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <span className="text-amber-700 font-medium">Sakit</span>
                <div className="text-lg font-bold text-amber-800">{reportData.summary.sakit}</div>
              </div>
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                <span className="text-rose-700 font-medium">Alpa</span>
                <div className="text-lg font-bold text-rose-800">{reportData.summary.alpa}</div>
              </div>
            </div>

            <table className="w-full text-left border-collapse text-xs border border-slate-300">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold">
                  <th className="py-2 px-3 w-10 text-center border-r border-slate-300">No</th>
                  <th className="py-2 px-3 w-28 border-r border-slate-300">Tanggal</th>
                  <th className="py-2 px-3 border-r border-slate-300">Nama Relawan</th>
                  <th className="py-2 px-3 border-r border-slate-300">Posisi Penugasan</th>
                  <th className="py-2 px-3 text-center border-r border-slate-300">Masuk</th>
                  <th className="py-2 px-3 text-center border-r border-slate-300">Pulang</th>
                  <th className="py-2 px-3 text-center border-r border-slate-300">Status</th>
                  <th className="py-2 px-3">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {reportData.data.map((r: any, idx: number) => (
                  <tr key={idx}>
                    <td className="py-1.5 px-3 text-center border-r border-slate-200">{idx + 1}</td>
                    <td className="py-1.5 px-3 border-r border-slate-200 font-medium">{r.tanggal}</td>
                    <td className="py-1.5 px-3 border-r border-slate-200 font-bold text-slate-900">{r.nama_relawan}</td>
                    <td className="py-1.5 px-3 border-r border-slate-200">{r.tugas_posisi}</td>
                    <td className="py-1.5 px-3 text-center border-r border-slate-200 font-mono">{r.waktu_masuk}</td>
                    <td className="py-1.5 px-3 text-center border-r border-slate-200 font-mono">{r.waktu_pulang}</td>
                    <td className="py-1.5 px-3 text-center border-r border-slate-200 font-bold">{r.status}</td>
                    <td className="py-1.5 px-3 text-slate-600">{r.keterangan || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ============================================================== */}
        {/* 3. LAPORAN MENU HARIAN                                          */}
        {/* ============================================================== */}
        {jenisLaporan === 'menu-harian' && reportData && (
          <div className="space-y-4">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 font-medium">
              Total Siklus Paket Menu Tercatat: <strong>{reportData.totalMenu} Menu</strong>
            </div>

            <table className="w-full text-left border-collapse text-xs border border-slate-300">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold">
                  <th className="py-2 px-3 w-10 text-center border-r border-slate-300">No</th>
                  <th className="py-2 px-3 w-32 border-r border-slate-300">Tanggal</th>
                  <th className="py-2 px-3 border-r border-slate-300">Nama Menu Gizi</th>
                  <th className="py-2 px-3 border-r border-slate-300">Susunan Komponen Bahan & Lauk</th>
                  <th className="py-2 px-3 text-center">Rata-rata Skor Uji</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {reportData.data.map((m: any, idx: number) => (
                  <tr key={idx}>
                    <td className="py-2 px-3 text-center border-r border-slate-200">{idx + 1}</td>
                    <td className="py-2 px-3 border-r border-slate-200 font-medium">{formatTanggalIndo(m.tanggal)}</td>
                    <td className="py-2 px-3 border-r border-slate-200 font-bold text-slate-900">{m.nama_menu}</td>
                    <td className="py-2 px-3 border-r border-slate-200 text-slate-700 leading-relaxed">{m.deskripsi}</td>
                    <td className="py-2 px-3 text-center font-bold text-indigo-700">
                      {m.avg_skor ? `${m.avg_skor} / 5.0` : 'Belum Diuji'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ============================================================== */}
        {/* 4. LAPORAN UJI ORGANOLEPTIK                                     */}
        {/* ============================================================== */}
        {jenisLaporan === 'uji-organoleptik' && reportData && (
          <div className="space-y-4">
            <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200 text-xs flex justify-between items-center text-indigo-900 font-medium">
              <span>Total Pengujian Mutu: <strong>{reportData.summary.totalUji} Sampel</strong></span>
              <span>Skor Mutu Rata-rata: <strong>{reportData.summary.rataRataKeseluruhan} / 5.0</strong></span>
              <span className="font-bold text-emerald-700">{reportData.summary.statusKelayakan}</span>
            </div>

            <table className="w-full text-left border-collapse text-xs border border-slate-300">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold">
                  <th className="py-2 px-3 w-10 text-center border-r border-slate-300">No</th>
                  <th className="py-2 px-3 w-28 border-r border-slate-300">Tanggal</th>
                  <th className="py-2 px-3 border-r border-slate-300">Menu Yang Diuji</th>
                  <th className="py-2 px-2 text-center border-r border-slate-300">Rasa</th>
                  <th className="py-2 px-2 text-center border-r border-slate-300">Aroma</th>
                  <th className="py-2 px-2 text-center border-r border-slate-300">Warna</th>
                  <th className="py-2 px-2 text-center border-r border-slate-300">Tekstur</th>
                  <th className="py-2 px-3 border-r border-slate-300 text-center">Rerata</th>
                  <th className="py-2 px-3">Keterangan Catatan Mutu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {reportData.data.map((u: any, idx: number) => (
                  <tr key={idx}>
                    <td className="py-1.5 px-3 text-center border-r border-slate-200">{idx + 1}</td>
                    <td className="py-1.5 px-3 border-r border-slate-200 font-medium">{u.tanggal}</td>
                    <td className="py-1.5 px-3 border-r border-slate-200 font-bold text-slate-900">{u.nama_menu}</td>
                    <td className="py-1.5 px-2 text-center border-r border-slate-200 font-bold">{u.rasa}</td>
                    <td className="py-1.5 px-2 text-center border-r border-slate-200 font-bold">{u.aroma}</td>
                    <td className="py-1.5 px-2 text-center border-r border-slate-200 font-bold">{u.warna}</td>
                    <td className="py-1.5 px-2 text-center border-r border-slate-200 font-bold">{u.tekstur}</td>
                    <td className="py-1.5 px-3 text-center border-r border-slate-200 font-black text-indigo-700">
                      {u.skor_rata_rata}
                    </td>
                    <td className="py-1.5 px-3 text-slate-600 italic">{u.keterangan || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Official Signatures Footer for Printout */}
        <div className="mt-12 pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-center text-slate-800">
          <div>
            <div>Mengetahui,</div>
            <div className="font-bold text-slate-900">Kepala SPPG Padasuka 2 Cimahi Tengah</div>
            <div className="h-20" />
            <div className="font-bold underline text-slate-900">Dr. Hj. Ratna Juwita, M.Pd</div>
            <div className="text-[11px] text-slate-500">NIP. 19740512 200212 2 003</div>
          </div>

          <div>
            <div>Cimahi, {printDate.split(',')[1]?.trim() || '2026'}</div>
            <div className="font-bold text-slate-900">Petugas Penanggung Jawab Laporan</div>
            <div className="h-20" />
            <div className="font-bold underline text-slate-900">
              {user?.nama || 'Drs. H. Hendra Setiawan, M.Si'}
            </div>
            <div className="text-[11px] text-slate-500">{user?.role || 'Administrator SPPG'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
