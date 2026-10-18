# Cara Menjalankan Sistem MBG

## 1. Persyaratan
Sebelum menjalankan aplikasi, pastikan komputer Anda sudah memiliki:
- Node.js (versi terbaru/recommended)
- npm atau pnpm
- Git (opsional, untuk clone repo)

## 2. Buka folder proyek
Buka terminal di folder project:

```bash
cd "c:\Users\Airlangga Dewanata\project mbg\sistem-mbg-main"
```

## 3. Install dependensi
Jalankan perintah berikut:

```bash
npm install
```

Jika Anda ingin menggunakan pnpm:

```bash
pnpm install
```

## 4. Jalankan aplikasi
Untuk menjalankan sistem lengkap (frontend + backend), gunakan:

```bash
npm run dev
```

Perintah ini akan menjalankan:
- Backend Express di port 5001
- Frontend React/Vite di port 5173

## 5. Akses aplikasi
Setelah aplikasi berhasil dijalankan, buka browser dan masukkan:

- Frontend: http://localhost:5173
- Backend API: http://localhost:5001/api

## 6. Login demo
Akun demo yang tersedia:

| Role | Username | Password |
| --- | --- | --- |
| Administrator | admin | admin 123 |
| Kepala SPPG | kepala | kepala 123 |
| Relawan | relawan01 | relawan 123 |

Catatan: password admin dan kepala ada spasi sebelum angka, jadi penulisan harus tepat.

## 7. Jika ingin menjalankan bagian tertentu saja
### Backend saja
```bash
npm run server
```

### Frontend saja
```bash
npm run client
```

## 8. Build untuk produksi
```bash
npm run build
```

## 9. Preview hasil build
```bash
npm run preview
```

## 10. Troubleshooting
- Jika error modul tidak ditemukan, jalankan ulang `npm install`
- Jika port sudah dipakai, cek apakah aplikasi lain sedang berjalan di 5173 atau 5001
- Jika belum bisa login, pastikan username dan password ditulis sesuai dengan akun demo

## 11. Ringkasan singkat
Perintah utama yang paling sering dipakai:

```bash
npm install
npm run dev
```

Jika proses berjalan dengan baik, sistem siap digunakan di browser.
