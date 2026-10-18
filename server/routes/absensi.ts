import { Router } from 'express';
import { db } from '../db.js';
import { authenticateToken, requireRoles, AuthenticatedRequest } from '../auth.js';

const router = Router();

// List all Absensi (Administrator & Kepala SPPG)
router.get('/', authenticateToken, requireRoles('Administrator', 'Kepala SPPG'), (req, res) => {
  const { search, tanggal_awal, tanggal_akhir, status, id_relawan } = req.query;

  let query = `
    SELECT 
      a.*,
      r.nama_relawan,
      r.nik,
      r.tugas_posisi,
      r.no_telepon
    FROM absensi a
    JOIN relawan r ON a.id_relawan = r.id_relawan
    WHERE 1=1
  `;
  const params: any[] = [];

  if (search) {
    query += ' AND (r.nama_relawan LIKE ? OR r.nik LIKE ? OR a.keterangan LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (id_relawan) {
    query += ' AND a.id_relawan = ?';
    params.push(id_relawan);
  }

  if (status && status !== 'Semua') {
    query += ' AND a.status = ?';
    params.push(status);
  }

  if (tanggal_awal) {
    query += ' AND a.tanggal >= ?';
    params.push(tanggal_awal);
  }

  if (tanggal_akhir) {
    query += ' AND a.tanggal <= ?';
    params.push(tanggal_akhir);
  }

  query += ' ORDER BY a.tanggal DESC, a.waktu_masuk DESC, a.id_absensi DESC';

  try {
    const list = db.prepare(query).all(...params);
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ message: 'Gagal mengambil data absensi: ' + error.message });
  }
});

// Relawan views own attendance history
router.get('/my-history', authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Silakan masuk ke sistem.' });
  }

  try {
    // Find linked relawan
    let relawanId = req.user.id_relawan;
    if (!relawanId) {
      const relawanRow = db.prepare('SELECT id_relawan FROM relawan WHERE id_user = ?').get(req.user.id) as any;
      if (relawanRow) {
        relawanId = relawanRow.id_relawan;
      }
    }

    if (!relawanId) {
      // Default to 1 for demonstration if not linked
      relawanId = 1;
    }

    const list = db.prepare(`
      SELECT 
        a.*,
        r.nama_relawan,
        r.tugas_posisi
      FROM absensi a
      JOIN relawan r ON a.id_relawan = r.id_relawan
      WHERE a.id_relawan = ?
      ORDER BY a.tanggal DESC, a.id_absensi DESC
    `).all(relawanId);

    // Also get today's record if any
    const today = new Date().toISOString().split('T')[0];
    const todayRecord = db.prepare('SELECT * FROM absensi WHERE id_relawan = ? AND tanggal = ?').get(relawanId, today);

    res.json({
      history: list,
      todayRecord: todayRecord || null,
      relawanId,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Gagal mengambil riwayat absensi: ' + error.message });
  }
});

// Check-in (Melakukan absensi / catat waktu masuk)
router.post('/checkin', authenticateToken, (req: AuthenticatedRequest, res) => {
  const { id_relawan, status, keterangan } = req.body;
  const targetRelawanId = req.user?.role === 'Relawan' ? (req.user.id_relawan || 1) : Number(id_relawan);

  if (!targetRelawanId) {
    return res.status(400).json({ message: 'Relawan tidak valid.' });
  }

  const now = new Date();
  const tanggal = now.toISOString().split('T')[0];
  const waktuMasuk = now.toTimeString().split(' ')[0]; // HH:MM:SS

  try {
    // Check if already checked in today
    const existing = db.prepare('SELECT * FROM absensi WHERE id_relawan = ? AND tanggal = ?').get(targetRelawanId, tanggal) as any;
    if (existing) {
      return res.status(400).json({ message: 'Anda sudah melakukan absensi masuk untuk hari ini.' });
    }

    const stmt = db.prepare(`
      INSERT INTO absensi (id_relawan, tanggal, waktu_masuk, waktu_pulang, status, keterangan)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      targetRelawanId,
      tanggal,
      status === 'Hadir' ? waktuMasuk : '-',
      '-',
      status || 'Hadir',
      keterangan || (status === 'Hadir' ? 'Hadir tepat waktu di SPPG' : status)
    );

    const created = db.prepare(`
      SELECT a.*, r.nama_relawan, r.tugas_posisi
      FROM absensi a
      JOIN relawan r ON a.id_relawan = r.id_relawan
      WHERE a.id_absensi = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({ message: 'Absensi masuk berhasil dicatat.', data: created });
  } catch (error: any) {
    res.status(500).json({ message: 'Gagal mencatat absensi: ' + error.message });
  }
});

// Check-out (Catat waktu pulang)
router.post('/checkout', authenticateToken, (req: AuthenticatedRequest, res) => {
  const { id_absensi } = req.body;
  const now = new Date();
  const waktuPulang = now.toTimeString().split(' ')[0];

  try {
    let absensiRecord: any = null;

    if (id_absensi) {
      absensiRecord = db.prepare('SELECT * FROM absensi WHERE id_absensi = ?').get(id_absensi);
    } else {
      const today = now.toISOString().split('T')[0];
      const targetRelawanId = req.user?.role === 'Relawan' ? (req.user.id_relawan || 1) : req.body.id_relawan;
      absensiRecord = db.prepare('SELECT * FROM absensi WHERE id_relawan = ? AND tanggal = ?').get(targetRelawanId, today);
    }

    if (!absensiRecord) {
      return res.status(404).json({ message: 'Data absensi hari ini tidak ditemukan. Silakan catat waktu masuk terlebih dahulu.' });
    }

    if (absensiRecord.waktu_pulang && absensiRecord.waktu_pulang !== '-') {
      return res.status(400).json({ message: 'Waktu pulang sudah dicatat sebelumnya.' });
    }

    db.prepare(`
      UPDATE absensi
      SET waktu_pulang = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id_absensi = ?
    `).run(waktuPulang, absensiRecord.id_absensi);

    const updated = db.prepare(`
      SELECT a.*, r.nama_relawan, r.tugas_posisi
      FROM absensi a
      JOIN relawan r ON a.id_relawan = r.id_relawan
      WHERE a.id_absensi = ?
    `).get(absensiRecord.id_absensi);

    res.json({ message: 'Absensi pulang berhasil dicatat.', data: updated });
  } catch (error: any) {
    res.status(500).json({ message: 'Gagal mencatat waktu pulang: ' + error.message });
  }
});

// Admin Manual Create Absensi
router.post('/admin-create', authenticateToken, requireRoles('Administrator'), (req, res) => {
  const { id_relawan, tanggal, waktu_masuk, waktu_pulang, status, keterangan } = req.body;

  if (!id_relawan || !tanggal || !status) {
    return res.status(400).json({ message: 'Relawan, tanggal, dan status kehadiran wajib diisi.' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO absensi (id_relawan, tanggal, waktu_masuk, waktu_pulang, status, keterangan)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      Number(id_relawan),
      tanggal,
      waktu_masuk || '-',
      waktu_pulang || '-',
      status,
      keterangan || ''
    );

    const created = db.prepare(`
      SELECT a.*, r.nama_relawan, r.tugas_posisi
      FROM absensi a
      JOIN relawan r ON a.id_relawan = r.id_relawan
      WHERE a.id_absensi = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ message: 'Gagal menambahkan absensi: ' + error.message });
  }
});

// Admin Update Absensi
router.put('/:id', authenticateToken, requireRoles('Administrator'), (req, res) => {
  const { id } = req.params;
  const { id_relawan, tanggal, waktu_masuk, waktu_pulang, status, keterangan } = req.body;

  try {
    const stmt = db.prepare(`
      UPDATE absensi
      SET id_relawan = ?, tanggal = ?, waktu_masuk = ?, waktu_pulang = ?, status = ?, keterangan = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id_absensi = ?
    `);

    const result = stmt.run(
      Number(id_relawan),
      tanggal,
      waktu_masuk || '-',
      waktu_pulang || '-',
      status,
      keterangan || '',
      id
    );

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Data absensi tidak ditemukan.' });
    }

    const updated = db.prepare(`
      SELECT a.*, r.nama_relawan, r.tugas_posisi
      FROM absensi a
      JOIN relawan r ON a.id_relawan = r.id_relawan
      WHERE a.id_absensi = ?
    `).get(id);

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: 'Gagal memperbarui absensi: ' + error.message });
  }
});

// Admin Delete Absensi
router.delete('/:id', authenticateToken, requireRoles('Administrator'), (req, res) => {
  const { id } = req.params;

  try {
    const result = db.prepare('DELETE FROM absensi WHERE id_absensi = ?').run(id);
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Data absensi tidak ditemukan.' });
    }
    res.json({ message: 'Data absensi berhasil dihapus.' });
  } catch (error: any) {
    res.status(500).json({ message: 'Gagal menghapus absensi: ' + error.message });
  }
});

export default router;
