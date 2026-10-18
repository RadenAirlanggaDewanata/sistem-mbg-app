import { Router } from 'express';
import { db } from '../db.js';
import { authenticateToken } from '../auth.js';

const router = Router();

router.get('/stats', authenticateToken, (req, res) => {
  try {
    // 1. Total Sekolah
    const sekolahStat = db.prepare("SELECT COUNT(*) as count FROM sekolah WHERE status = 'Aktif'").get() as { count: number };
    const totalSekolah = sekolahStat.count;

    // 2. Total Posyandu
    const posyanduStat = db.prepare("SELECT COUNT(*) as count FROM posyandu WHERE status = 'Aktif'").get() as { count: number };
    const totalPosyandu = posyanduStat.count;

    // 3. Total Relawan
    const relawanStat = db.prepare("SELECT COUNT(*) as count FROM relawan WHERE status = 'Aktif'").get() as { count: number };
    const totalRelawan = relawanStat.count;

    // 4. Penerima dari Sekolah
    const penerimaSekolahStat = db.prepare("SELECT COALESCE(SUM(jumlah_penerima), 0) as total FROM sekolah WHERE status = 'Aktif'").get() as { total: number };
    const penerimaSekolah = penerimaSekolahStat.total;

    // 5. Penerima dari Posyandu
    const penerimaPosyanduStat = db.prepare("SELECT COALESCE(SUM(jumlah_penerima), 0) as total FROM posyandu WHERE status = 'Aktif'").get() as { total: number };
    const penerimaPosyandu = penerimaPosyanduStat.total;

    // 6. Total Penerima Manfaat
    const totalPenerima = penerimaSekolah + penerimaPosyandu;

    // 7. Today's or latest menu
    const latestMenu = db.prepare('SELECT * FROM menu_harian ORDER BY tanggal DESC, id_menu DESC LIMIT 1').get();

    // 8. Latest Organoleptic evaluation
    const latestUji = db.prepare(`
      SELECT u.*, m.nama_menu 
      FROM uji_organoleptik u
      JOIN menu_harian m ON u.id_menu = m.id_menu
      ORDER BY u.tanggal DESC, u.id_uji DESC
      LIMIT 1
    `).get() as any;

    let avgOrganoleptik = null;
    if (latestUji) {
      avgOrganoleptik = ((latestUji.warna + latestUji.aroma + latestUji.rasa + latestUji.tekstur) / 4).toFixed(1);
    }

    // 9. Absensi statistics
    const absensiHariIni = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Hadir' THEN 1 ELSE 0 END) as hadir,
        SUM(CASE WHEN status = 'Izin' THEN 1 ELSE 0 END) as izin,
        SUM(CASE WHEN status = 'Sakit' THEN 1 ELSE 0 END) as sakit,
        SUM(CASE WHEN status = 'Alpa' THEN 1 ELSE 0 END) as alpa
      FROM absensi
      WHERE tanggal = date('now') OR tanggal = (SELECT MAX(tanggal) FROM absensi)
    `).get() as any;

    // 10. Jenjang distribution
    const jenjangDistribution = db.prepare(`
      SELECT jenjang, COUNT(*) as jumlah_lembaga, SUM(jumlah_penerima) as total_penerima
      FROM sekolah
      WHERE status = 'Aktif'
      GROUP BY jenjang
    `).all();

    // Formatter utility
    const formatNumber = (num: number) => new Intl.NumberFormat('id-ID').format(num);

    res.json({
      sekolah: {
        count: totalSekolah,
        formatted: formatNumber(totalSekolah),
      },
      posyandu: {
        count: totalPosyandu,
        formatted: formatNumber(totalPosyandu),
      },
      relawan: {
        count: totalRelawan,
        formatted: formatNumber(totalRelawan),
      },
      penerima: {
        total: totalPenerima,
        formattedTotal: formatNumber(totalPenerima),
        sekolah: penerimaSekolah,
        formattedSekolah: formatNumber(penerimaSekolah),
        posyandu: penerimaPosyandu,
        formattedPosyandu: formatNumber(penerimaPosyandu),
      },
      latestMenu,
      latestUji: latestUji ? { ...latestUji, avgScore: avgOrganoleptik } : null,
      absensiStat: absensiHariIni,
      jenjangDistribution,
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil statistik data dashboard.' });
  }
});

export default router;
