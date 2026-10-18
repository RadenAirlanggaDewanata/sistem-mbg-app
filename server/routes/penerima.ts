import { Router } from 'express';
import { db } from '../db.js';
import { authenticateToken, requireRoles } from '../auth.js';

const router = Router();

// List Penerima Manfaat
router.get('/', authenticateToken, requireRoles('Administrator', 'Kepala SPPG'), (req, res) => {
  const { search, tipe, kategori, status } = req.query;

  let query = `
    SELECT 
      p.*,
      s.nama_sekolah,
      pos.nama_posyandu
    FROM penerima_manfaat p
    LEFT JOIN sekolah s ON p.id_sekolah = s.id_sekolah
    LEFT JOIN posyandu pos ON p.id_posyandu = pos.id_posyandu
    WHERE 1=1
  `;
  const params: any[] = [];

  if (search) {
    query += ' AND (p.nama_penerima LIKE ? OR s.nama_sekolah LIKE ? OR pos.nama_posyandu LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (tipe && tipe !== 'Semua') {
    query += ' AND p.tipe = ?';
    params.push(tipe);
  }

  if (kategori && kategori !== 'Semua') {
    query += ' AND p.kategori = ?';
    params.push(kategori);
  }

  if (status && status !== 'Semua') {
    query += ' AND p.status = ?';
    params.push(status);
  }

  query += ' ORDER BY p.id_penerima DESC';

  try {
    const list = db.prepare(query).all(...params);
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ message: 'Gagal mengambil data penerima manfaat: ' + error.message });
  }
});

// Create Penerima Manfaat (Administrator only)
router.post('/', authenticateToken, requireRoles('Administrator'), (req, res) => {
  const { tipe, id_sekolah, id_posyandu, nama_penerima, kategori, kelas_atau_usia, jenis_kelamin, alergi_pantangan, status } = req.body;

  if (!tipe || !nama_penerima || !kategori || !jenis_kelamin) {
    return res.status(400).json({ message: 'Tipe, nama penerima, kategori, dan jenis kelamin wajib diisi.' });
  }

  if (tipe === 'Sekolah' && !id_sekolah) {
    return res.status(400).json({ message: 'Sekolah asal wajib dipilih untuk penerima tipe Sekolah.' });
  }

  if (tipe === 'Posyandu' && !id_posyandu) {
    return res.status(400).json({ message: 'Posyandu asal wajib dipilih untuk penerima tipe Posyandu.' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO penerima_manfaat (tipe, id_sekolah, id_posyandu, nama_penerima, kategori, kelas_atau_usia, jenis_kelamin, alergi_pantangan, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      tipe,
      tipe === 'Sekolah' ? Number(id_sekolah) : null,
      tipe === 'Posyandu' ? Number(id_posyandu) : null,
      nama_penerima,
      kategori,
      kelas_atau_usia || '',
      jenis_kelamin,
      alergi_pantangan || 'Tidak Ada',
      status || 'Aktif'
    );

    const created = db.prepare(`
      SELECT p.*, s.nama_sekolah, pos.nama_posyandu
      FROM penerima_manfaat p
      LEFT JOIN sekolah s ON p.id_sekolah = s.id_sekolah
      LEFT JOIN posyandu pos ON p.id_posyandu = pos.id_posyandu
      WHERE p.id_penerima = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ message: 'Gagal menambahkan penerima manfaat: ' + error.message });
  }
});

// Update Penerima Manfaat (Administrator only)
router.put('/:id', authenticateToken, requireRoles('Administrator'), (req, res) => {
  const { id } = req.params;
  const { tipe, id_sekolah, id_posyandu, nama_penerima, kategori, kelas_atau_usia, jenis_kelamin, alergi_pantangan, status } = req.body;

  try {
    const stmt = db.prepare(`
      UPDATE penerima_manfaat
      SET tipe = ?, id_sekolah = ?, id_posyandu = ?, nama_penerima = ?, kategori = ?, kelas_atau_usia = ?, jenis_kelamin = ?, alergi_pantangan = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id_penerima = ?
    `);

    const result = stmt.run(
      tipe,
      tipe === 'Sekolah' ? Number(id_sekolah) : null,
      tipe === 'Posyandu' ? Number(id_posyandu) : null,
      nama_penerima,
      kategori,
      kelas_atau_usia || '',
      jenis_kelamin,
      alergi_pantangan || 'Tidak Ada',
      status || 'Aktif',
      id
    );

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Data penerima manfaat tidak ditemukan.' });
    }

    const updated = db.prepare(`
      SELECT p.*, s.nama_sekolah, pos.nama_posyandu
      FROM penerima_manfaat p
      LEFT JOIN sekolah s ON p.id_sekolah = s.id_sekolah
      LEFT JOIN posyandu pos ON p.id_posyandu = pos.id_posyandu
      WHERE p.id_penerima = ?
    `).get(id);

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: 'Gagal memperbarui penerima manfaat: ' + error.message });
  }
});

// Delete Penerima Manfaat (Administrator only)
router.delete('/:id', authenticateToken, requireRoles('Administrator'), (req, res) => {
  const { id } = req.params;

  try {
    const result = db.prepare('DELETE FROM penerima_manfaat WHERE id_penerima = ?').run(id);
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Data penerima manfaat tidak ditemukan.' });
    }
    res.json({ message: 'Data penerima manfaat berhasil dihapus.' });
  } catch (error: any) {
    res.status(500).json({ message: 'Gagal menghapus penerima manfaat: ' + error.message });
  }
});

export default router;
