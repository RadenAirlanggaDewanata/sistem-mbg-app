const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data?.message || data?.error || `Permintaan gagal dengan status ${res.status}`;
    throw new Error(errorMsg);
  }
  return data as T;
}

export const api = {
  // 1. Auth
  auth: {
    login: async (credentials: { username: string; password: string }) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      return handleResponse<{ token: string; user: any; message: string }>(res);
    },
    getMe: async () => {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse<any>(res);
    },
    logout: async () => {
      const res = await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { ...getAuthHeader() },
      });
      return handleResponse<any>(res);
    },
  },

  // 2. Dashboard
  dashboard: {
    getStats: async () => {
      const res = await fetch(`${API_BASE}/dashboard/stats`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse<any>(res);
    },
  },

  // 3. Sekolah
  sekolah: {
    getAll: async (params?: { search?: string; jenjang?: string; status?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.search) searchParams.set('search', params.search);
      if (params?.jenjang) searchParams.set('jenjang', params.jenjang);
      if (params?.status) searchParams.set('status', params.status);

      const res = await fetch(`${API_BASE}/sekolah?${searchParams.toString()}`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse<any[]>(res);
    },
    create: async (data: any) => {
      const res = await fetch(`${API_BASE}/sekolah`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data),
      });
      return handleResponse<any>(res);
    },
    update: async (id: number, data: any) => {
      const res = await fetch(`${API_BASE}/sekolah/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data),
      });
      return handleResponse<any>(res);
    },
    delete: async (id: number) => {
      const res = await fetch(`${API_BASE}/sekolah/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      });
      return handleResponse<any>(res);
    },
  },

  // 4. Posyandu
  posyandu: {
    getAll: async (params?: { search?: string; status?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.search) searchParams.set('search', params.search);
      if (params?.status) searchParams.set('status', params.status);

      const res = await fetch(`${API_BASE}/posyandu?${searchParams.toString()}`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse<any[]>(res);
    },
    create: async (data: any) => {
      const res = await fetch(`${API_BASE}/posyandu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data),
      });
      return handleResponse<any>(res);
    },
    update: async (id: number, data: any) => {
      const res = await fetch(`${API_BASE}/posyandu/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data),
      });
      return handleResponse<any>(res);
    },
    delete: async (id: number) => {
      const res = await fetch(`${API_BASE}/posyandu/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      });
      return handleResponse<any>(res);
    },
  },

  // 5. Relawan
  relawan: {
    getAll: async (params?: { search?: string; posisi?: string; status?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.search) searchParams.set('search', params.search);
      if (params?.posisi) searchParams.set('posisi', params.posisi);
      if (params?.status) searchParams.set('status', params.status);

      const res = await fetch(`${API_BASE}/relawan?${searchParams.toString()}`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse<any[]>(res);
    },
    create: async (data: any) => {
      const res = await fetch(`${API_BASE}/relawan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data),
      });
      return handleResponse<any>(res);
    },
    update: async (id: number, data: any) => {
      const res = await fetch(`${API_BASE}/relawan/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data),
      });
      return handleResponse<any>(res);
    },
    delete: async (id: number) => {
      const res = await fetch(`${API_BASE}/relawan/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      });
      return handleResponse<any>(res);
    },
  },

  // 6. Penerima Manfaat
  penerima: {
    getAll: async (params?: { search?: string; tipe?: string; kategori?: string; status?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.search) searchParams.set('search', params.search);
      if (params?.tipe) searchParams.set('tipe', params.tipe);
      if (params?.kategori) searchParams.set('kategori', params.kategori);
      if (params?.status) searchParams.set('status', params.status);

      const res = await fetch(`${API_BASE}/penerima?${searchParams.toString()}`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse<any[]>(res);
    },
    create: async (data: any) => {
      const res = await fetch(`${API_BASE}/penerima`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data),
      });
      return handleResponse<any>(res);
    },
    update: async (id: number, data: any) => {
      const res = await fetch(`${API_BASE}/penerima/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data),
      });
      return handleResponse<any>(res);
    },
    delete: async (id: number) => {
      const res = await fetch(`${API_BASE}/penerima/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      });
      return handleResponse<any>(res);
    },
  },

  // 7. Menu Harian
  menu: {
    getAll: async (params?: { search?: string; tanggal_awal?: string; tanggal_akhir?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.search) searchParams.set('search', params.search);
      if (params?.tanggal_awal) searchParams.set('tanggal_awal', params.tanggal_awal);
      if (params?.tanggal_akhir) searchParams.set('tanggal_akhir', params.tanggal_akhir);

      const res = await fetch(`${API_BASE}/menu?${searchParams.toString()}`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse<any[]>(res);
    },
    getById: async (id: number) => {
      const res = await fetch(`${API_BASE}/menu/${id}`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse<any>(res);
    },
    create: async (data: any) => {
      const res = await fetch(`${API_BASE}/menu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data),
      });
      return handleResponse<any>(res);
    },
    update: async (id: number, data: any) => {
      const res = await fetch(`${API_BASE}/menu/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data),
      });
      return handleResponse<any>(res);
    },
    delete: async (id: number) => {
      const res = await fetch(`${API_BASE}/menu/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      });
      return handleResponse<any>(res);
    },
  },

  // 8. Uji Organoleptik
  organoleptik: {
    getAll: async (params?: { search?: string; tanggal_awal?: string; tanggal_akhir?: string; id_menu?: number }) => {
      const searchParams = new URLSearchParams();
      if (params?.search) searchParams.set('search', params.search);
      if (params?.tanggal_awal) searchParams.set('tanggal_awal', params.tanggal_awal);
      if (params?.tanggal_akhir) searchParams.set('tanggal_akhir', params.tanggal_akhir);
      if (params?.id_menu) searchParams.set('id_menu', String(params.id_menu));

      const res = await fetch(`${API_BASE}/organoleptik?${searchParams.toString()}`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse<any[]>(res);
    },
    create: async (data: any) => {
      const res = await fetch(`${API_BASE}/organoleptik`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data),
      });
      return handleResponse<any>(res);
    },
    update: async (id: number, data: any) => {
      const res = await fetch(`${API_BASE}/organoleptik/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data),
      });
      return handleResponse<any>(res);
    },
    delete: async (id: number) => {
      const res = await fetch(`${API_BASE}/organoleptik/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      });
      return handleResponse<any>(res);
    },
  },

  // 9. Absensi
  absensi: {
    getAll: async (params?: { search?: string; tanggal_awal?: string; tanggal_akhir?: string; status?: string; id_relawan?: number }) => {
      const searchParams = new URLSearchParams();
      if (params?.search) searchParams.set('search', params.search);
      if (params?.tanggal_awal) searchParams.set('tanggal_awal', params.tanggal_awal);
      if (params?.tanggal_akhir) searchParams.set('tanggal_akhir', params.tanggal_akhir);
      if (params?.status) searchParams.set('status', params.status);
      if (params?.id_relawan) searchParams.set('id_relawan', String(params.id_relawan));

      const res = await fetch(`${API_BASE}/absensi?${searchParams.toString()}`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse<any[]>(res);
    },
    getMyHistory: async () => {
      const res = await fetch(`${API_BASE}/absensi/my-history`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse<{ history: any[]; todayRecord: any; relawanId: number }>(res);
    },
    checkin: async (data: { id_relawan?: number; status?: string; keterangan?: string }) => {
      const res = await fetch(`${API_BASE}/absensi/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data),
      });
      return handleResponse<any>(res);
    },
    checkout: async (data: { id_absensi?: number; id_relawan?: number }) => {
      const res = await fetch(`${API_BASE}/absensi/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data),
      });
      return handleResponse<any>(res);
    },
    adminCreate: async (data: any) => {
      const res = await fetch(`${API_BASE}/absensi/admin-create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data),
      });
      return handleResponse<any>(res);
    },
    adminUpdate: async (id: number, data: any) => {
      const res = await fetch(`${API_BASE}/absensi/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data),
      });
      return handleResponse<any>(res);
    },
    adminDelete: async (id: number) => {
      const res = await fetch(`${API_BASE}/absensi/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      });
      return handleResponse<any>(res);
    },
  },

  // 10. Laporan
  laporan: {
    getPenerima: async (params?: { tipe?: string; kategori?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.tipe) searchParams.set('tipe', params.tipe);
      if (params?.kategori) searchParams.set('kategori', params.kategori);

      const res = await fetch(`${API_BASE}/laporan/penerima-manfaat?${searchParams.toString()}`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse<any>(res);
    },
    getAbsensi: async (params?: { tanggal_awal?: string; tanggal_akhir?: string; status?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.tanggal_awal) searchParams.set('tanggal_awal', params.tanggal_awal);
      if (params?.tanggal_akhir) searchParams.set('tanggal_akhir', params.tanggal_akhir);
      if (params?.status) searchParams.set('status', params.status);

      const res = await fetch(`${API_BASE}/laporan/absensi-relawan?${searchParams.toString()}`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse<any>(res);
    },
    getMenu: async (params?: { tanggal_awal?: string; tanggal_akhir?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.tanggal_awal) searchParams.set('tanggal_awal', params.tanggal_awal);
      if (params?.tanggal_akhir) searchParams.set('tanggal_akhir', params.tanggal_akhir);

      const res = await fetch(`${API_BASE}/laporan/menu-harian?${searchParams.toString()}`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse<any>(res);
    },
    getOrganoleptik: async (params?: { tanggal_awal?: string; tanggal_akhir?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.tanggal_awal) searchParams.set('tanggal_awal', params.tanggal_awal);
      if (params?.tanggal_akhir) searchParams.set('tanggal_akhir', params.tanggal_akhir);

      const res = await fetch(`${API_BASE}/laporan/uji-organoleptik?${searchParams.toString()}`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse<any>(res);
    },
  },
};
