export type Role = 'Administrator' | 'Kepala SPPG' | 'Relawan';

export interface User {
  id: number;
  nama: string;
  username: string;
  role: Role;
  no_telepon?: string;
  alamat?: string;
  status: 'Aktif' | 'Nonaktif';
  id_relawan?: number | null;
}

export interface Sekolah {
  id_sekolah: number;
  nama_sekolah: string;
  npsn?: string;
  jenjang: 'PAUD' | 'TK' | 'SD' | 'SMP';
  alamat: string;
  nama_kontak?: string;
  no_telepon?: string;
  jumlah_penerima: number;
  status: 'Aktif' | 'Nonaktif';
  created_at?: string;
  updated_at?: string;
}

export interface Posyandu {
  id_posyandu: number;
  nama_posyandu: string;
  rw: string;
  kelurahan: string;
  ketua_posyandu: string;
  no_telepon?: string;
  jumlah_penerima: number;
  status: 'Aktif' | 'Nonaktif';
  created_at?: string;
  updated_at?: string;
}

export interface Relawan {
  id_relawan: number;
  id_user?: number | null;
  nama_relawan: string;
  nik?: string;
  no_telepon?: string;
  alamat?: string;
  tugas_posisi: string;
  status: 'Aktif' | 'Nonaktif';
  created_at?: string;
  updated_at?: string;
}

export interface PenerimaManfaat {
  id_penerima: number;
  tipe: 'Sekolah' | 'Posyandu';
  id_sekolah?: number | null;
  id_posyandu?: number | null;
  nama_sekolah?: string;
  nama_posyandu?: string;
  nama_penerima: string;
  kategori: string;
  kelas_atau_usia?: string;
  jenis_kelamin: 'L' | 'P';
  alergi_pantangan?: string;
  status: 'Aktif' | 'Nonaktif';
  created_at?: string;
  updated_at?: string;
}

export interface MenuHarian {
  id_menu: number;
  tanggal: string;
  nama_menu: string;
  deskripsi: string;
  created_at?: string;
  updated_at?: string;
  uji_organoleptik?: UjiOrganoleptik[];
}

export interface UjiOrganoleptik {
  id_uji: number;
  id_menu: number;
  nama_menu?: string;
  deskripsi_menu?: string;
  tanggal: string;
  warna: number; // 1 - 5
  aroma: number; // 1 - 5
  rasa: number; // 1 - 5
  tekstur: number; // 1 - 5
  keterangan?: string;
  skor_rata_rata?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Absensi {
  id_absensi: number;
  id_relawan: number;
  nama_relawan?: string;
  nik?: string;
  tugas_posisi?: string;
  no_telepon?: string;
  tanggal: string;
  waktu_masuk?: string;
  waktu_pulang?: string;
  status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa';
  keterangan?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DashboardStats {
  sekolah: {
    count: number;
    formatted: string;
  };
  posyandu: {
    count: number;
    formatted: string;
  };
  relawan: {
    count: number;
    formatted: string;
  };
  penerima: {
    total: number;
    formattedTotal: string;
    sekolah: number;
    formattedSekolah: string;
    posyandu: number;
    formattedPosyandu: string;
  };
  latestMenu?: MenuHarian | null;
  latestUji?: (UjiOrganoleptik & { avgScore: string }) | null;
  absensiStat?: {
    total: number;
    hadir: number;
    izin: number;
    sakit: number;
    alpa: number;
  };
  jenjangDistribution?: Array<{
    jenjang: string;
    jumlah_lembaga: number;
    total_penerima: number;
  }>;
}
