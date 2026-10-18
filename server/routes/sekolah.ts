import { Router } from 'express';
import { db } from '../db.js';
import { authenticateToken, requireRoles } from '../auth.js';

const router = Router();

// List Sekolah (Administrator & Kepala SPPG)
router.get('/', authenticateToken, requireRoles('Administrator', 'Kepala SPPG'), (req, res) => {
  const { search, jenjang, status } = req.query;
  let query = 'SELECT * FROM sekolah WHERE 1=1';
  const params: any[] = [];

  if (search) {
    query += ' AND (nama_sekolah LIKE ? OR npsn LIKE ? OR alamat LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (jenjang && jenjang !== 'Semua') {
    query += ' AND jenjang = ?';
    params.push(jenjang);
  }

  if (status && status !== 'Semua') {
    query += ' AND status = ?';
    params.push(status);
  }

  query += ' ORDER BY id_sekolah ASC';

  try {
    const list = db.prepare(query).all(...params);
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data sekolah.' });
  }
});

// Create Sekolah (Administrator only)
router.post('/', authenticateToken, requireRoles('Administrator'), (req, res) => {
  const { nama_sekolah, npsn, jenjang, alamat, nama_kontak, no_telepon, jumlah_penerima, status } = req.body;

  if (!nama_sekolah || !jenjang || !alamat) {
    return res.status(400).json({ message: 'Nama sekolah, jenjang, dan alamat wajib diisi.' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO sekolah (nama_sekolah, npsn, jenjang, alamat, nama_kontak, no_telepon, jumlah_penerima, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      nama_sekolah,
      npsn || '',
      jenjang,
      alamat,
      nama_kontak || '',
      no_telepon || '',
      Number(jumlah_penerima) || 0,
      status || 'Aktif'
    );

    const created = db.prepare('SELECT * FROM sekolah WHERE id_sekolah = ?').get(result.lastInsertRowid);
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ message: 'Gagal menambahkan sekolah: ' + error.message });
  }
});

// Update Sekolah (Administrator only)
router.put('/:id', authenticateToken, requireRoles('Administrator'), (req, res) => {
  const { id } = req.params;
  const { nama_sekolah, npsn, jenjang, alamat, nama_kontak, no_telepon, jumlah_penerima, status } = req.body;

  try {
    const stmt = db.prepare(`
      UPDATE sekolah
      SET nama_sekolah = ?, npsn = ?, jenjang = ?, alamat = ?, nama_kontak = ?, no_telepon = ?, jumlah_penerima = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id_sekolah = ?
    `);

    const result = stmt.run(
      nama_sekolah,
      npsn || '',
      jenjang,
      alamat,
      nama_kontak || '',
      no_telepon || '',
      Number(jumlah_penerima) || 0,
      status || 'Aktif',
      id
    );

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Data sekolah tidak ditemukan.' });
    }

    const updated = db.prepare('SELECT * FROM sekolah WHERE id_sekolah = ?').get(id);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: 'Gagal memperbarui sekolah: ' + error.message });
  }
});

// Delete Sekolah (Administrator only) - with relation guard
router.delete('/:id', authenticateToken, requireRoles('Administrator'), (req, res) => {
  const { id } = req.params;

  try {
    // Check relation
    const relatedCount = db.prepare('SELECT COUNT(*) as count FROM penerima_manfaat WHERE id_sekolah = ?').get(id) as { count: number };
    if (relatedCount && relatedCount.count > 0) {
      return res.status(400).json({
        message: `Sekolah tidak dapat dihapus karena masih memiliki ${relatedCount.count} data Penerima Manfaat yang terhubung.`,
      });
    }

    const result = db.prepare('DELETE FROM sekolah WHERE id_sekolah = ?').run(id);
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Data sekolah tidak ditemukan.' });
    }

    res.json({ message: 'Data sekolah berhasil dihapus.' });
  } catch (error: any) {
    res.status(500).json({ message: 'Gagal menghapus sekolah: ' + error.message });
  }
});

export default router;
