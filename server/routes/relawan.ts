import { Router } from 'express';
import { db } from '../db.js';
import { authenticateToken, requireRoles } from '../auth.js';

const router = Router();

// List Relawan (Administrator, Kepala SPPG, Relawan)
router.get('/', authenticateToken, (req, res) => {
  const { search, posisi, status } = req.query;
  let query = 'SELECT * FROM relawan WHERE 1=1';
  const params: any[] = [];

  if (search) {
    query += ' AND (nama_relawan LIKE ? OR nik LIKE ? OR no_telepon LIKE ? OR alamat LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (posisi && posisi !== 'Semua') {
    query += ' AND tugas_posisi = ?';
    params.push(posisi);
  }

  if (status && status !== 'Semua') {
    query += ' AND status = ?';
    params.push(status);
  }

  query += ' ORDER BY id_relawan ASC';

  try {
    const list = db.prepare(query).all(...params);
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data relawan.' });
  }
});

// Create Relawan (Administrator only)
router.post('/', authenticateToken, requireRoles('Administrator'), (req, res) => {
  const { nama_relawan, nik, no_telepon, alamat, tugas_posisi, status, id_user } = req.body;

  if (!nama_relawan || !tugas_posisi) {
    return res.status(400).json({ message: 'Nama relawan dan tugas posisi wajib diisi.' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO relawan (nama_relawan, nik, no_telepon, alamat, tugas_posisi, status, id_user)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      nama_relawan,
      nik || '',
      no_telepon || '',
      alamat || '',
      tugas_posisi,
      status || 'Aktif',
      id_user || null
    );

    const created = db.prepare('SELECT * FROM relawan WHERE id_relawan = ?').get(result.lastInsertRowid);
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ message: 'Gagal menambahkan relawan: ' + error.message });
  }
});

// Update Relawan (Administrator only)
router.put('/:id', authenticateToken, requireRoles('Administrator'), (req, res) => {
  const { id } = req.params;
  const { nama_relawan, nik, no_telepon, alamat, tugas_posisi, status, id_user } = req.body;

  try {
    const stmt = db.prepare(`
      UPDATE relawan
      SET nama_relawan = ?, nik = ?, no_telepon = ?, alamat = ?, tugas_posisi = ?, status = ?, id_user = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id_relawan = ?
    `);

    const result = stmt.run(
      nama_relawan,
      nik || '',
      no_telepon || '',
      alamat || '',
      tugas_posisi,
      status || 'Aktif',
      id_user || null,
      id
    );

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Data relawan tidak ditemukan.' });
    }

    const updated = db.prepare('SELECT * FROM relawan WHERE id_relawan = ?').get(id);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: 'Gagal memperbarui relawan: ' + error.message });
  }
});

// Delete Relawan (Administrator only) - with relation guard to Absensi
router.delete('/:id', authenticateToken, requireRoles('Administrator'), (req, res) => {
  const { id } = req.params;

  try {
    // Check relation with absensi
    const relatedCount = db.prepare('SELECT COUNT(*) as count FROM absensi WHERE id_relawan = ?').get(id) as { count: number };
    if (relatedCount && relatedCount.count > 0) {
      return res.status(400).json({
        message: `Data relawan tidak dapat dihapus karena memiliki ${relatedCount.count} riwayat absensi.`,
      });
    }

    const result = db.prepare('DELETE FROM relawan WHERE id_relawan = ?').run(id);
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Data relawan tidak ditemukan.' });
    }

    res.json({ message: 'Data relawan berhasil dihapus.' });
  } catch (error: any) {
    res.status(500).json({ message: 'Gagal menghapus relawan: ' + error.message });
  }
});

export default router;
