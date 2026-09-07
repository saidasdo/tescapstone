# Backend — Web-AR Virtual Try-On Batik (Museum Batik Yogyakarta)

Backend REST API untuk sistem Web-AR Virtual Try-On Batik. Menyediakan katalog motif
batik, rekomendasi berdasarkan Personal Color Analysis, dan status perangkat (sensor).

## Daftar Isi
- [Tech Stack](#tech-stack)
- [Struktur Folder](#struktur-folder)
- [Instalasi & Menjalankan](#instalasi--menjalankan)
- [Environment Variables](#environment-variables)
- [Skema Database](#skema-database)
- [Dokumentasi API](#dokumentasi-api)
- [Testing](#testing)
- [Belum Selesai / TODO](#belum-selesai--todo)
- [Catatan Integrasi dengan Modul Lain](#catatan-integrasi-dengan-modul-lain)

---

## Tech Stack

| Komponen | Teknologi |
|---|---|
| Runtime | Node.js (ES Modules) |
| Framework | Express 4 |
| ORM | Prisma 6.19.3 |
| Database | SQLite |
| Lainnya | cors, dotenv, nodemon (dev) |

## Struktur Folder

```
backend/
├── prisma/
│   ├── schema.prisma       - Definisi tabel Batik & TryOnSession
│   ├── seed.js              - Data awal 6 motif batik
│   └── migrations/          - Riwayat perubahan skema
├── public/
│   ├── images/               - Gambar 2D motif
│   └── models/                - Model 3D file .glb
├── src/
│   ├── server.js              - Entry point
│   ├── lib/
│   │   └── prisma.js           - Instance PrismaClient (dipakai ulang di seluruh app)
│   ├── routes/
│   │   ├── batik.routes.js     - /api/batik/*
│   │   └── device.routes.js    - /api/device/*
│   ├── middleware/
│   │   └── errorHandler.js      - 404 handler + error handler terpusat
│   └── utils/
│       └── asyncHandler.js       - Wrapper untuk route async, menghindari try/catch berulang
├── docs/
│   └── TESTING_CHECKLIST.md
├── .env                          - tidak di-commit
├── .env.example
└── package.json
```

## Instalasi & Menjalankan

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Server berjalan di `http://localhost:4000`. Cek dengan membuka `http://localhost:4000/health`.

**Catatan Prisma:** pastikan `generator client` di `schema.prisma` TIDAK punya baris
`output`, supaya Prisma Client ter-generate ke `node_modules/@prisma/client` (default
lama), bukan `src/generated/prisma` (default baru versi 6.7+, yang butuh driver adapter
tambahan — sengaja dihindari untuk kesederhanaan).

## Environment Variables

File `.env` (contoh lihat `.env.example`):

```
PORT=4000
DATABASE_URL="file:./dev.db"
```

## Skema Database

### Tabel `Batik`
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | String (PK) | slug unik, contoh `"parang"` |
| `name` | String | Nama motif |
| `tone` | String? | Label singkat untuk UI |
| `hue` | String? | Class gradient Tailwind untuk UI |
| `colorCategory` | String | `spring` \| `summer` \| `autumn` \| `winter` |
| `history` | String | Teks sejarah motif |
| `philosophy` | String? | Makna/filosofi motif |
| `origin` | String? | Asal daerah |
| `imageUrl` | String | Path gambar 2D — **wajib** |
| `model3dUrl` | String? | Path file `.glb` — **opsional**, sistem tetap jalan tanpanya |
| `createdAt` / `updatedAt` | DateTime | Otomatis |

### Tabel `TryOnSession`
Log percobaan pengunjung, untuk keperluan laporan evaluasi capstone.
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | Int (PK, autoincrement) | |
| `detectedSeason` | String? | Hasil Personal Color Analysis |
| `confidence` | Float? | Confidence hasil analisis |
| `selectedBatikId` | String? | Relasi ke `Batik`, `onDelete: SetNull` |
| `createdAt` | DateTime | Otomatis |

> ⚠️ Tabel ini baru berupa skema — logika pencatatannya **belum dibangun**. Lihat bagian TODO.

## Dokumentasi API

### `GET /health`
Cek server hidup.
```json
{ "status": "ok", "message": "Backend Batik AR berjalan dengan baik", "timestamp": "..." }
```

### `GET /api/batik`
Daftar semua motif batik.
```json
[
  { "id": "parang", "name": "Parang", "colorCategory": "winter", "imageUrl": "/images/...", ... },
  ...
]
```

### `GET /api/batik/:id`
Detail satu motif. `404` jika tidak ditemukan.
```json
{ "id": "parang", "name": "Parang", "history": "...", "philosophy": "...", ... }
```

### `GET /api/batik/recommend?season=winter`
Rekomendasi motif berdasar kategori warna (dari hasil Personal Color Analysis).
`season` diterima case-insensitive, harus salah satu dari `spring|summer|autumn|winter`.
`400` jika kosong atau tidak valid.
```json
{ "season": "winter", "count": 2, "recommendations": [ { "id": "parang", ... }, { "id": "lasem", ... } ] }
```

### `POST /api/device/status`
Menerima update status perangkat (rencana: dari Arduino via backend, bukan langsung dari
device). Body: `{ "status": "idle" | "active" }`. `400` jika tidak valid.
```json
{ "status": "active", "updatedAt": "2026-..." }
```

### `GET /api/device/status`
Baca status perangkat terkini (disimpan di memori server, reset ke `"idle"` saat restart).

### Error & 404
Semua route tak dikenal → `404` JSON konsisten: `{ "error": "Route GET /xxx tidak ditemukan." }`
Error internal → `500` (atau kode lain) JSON: `{ "error": "pesan error" }`

## Testing

Lihat `docs/TESTING_CHECKLIST.md` untuk checklist pengujian end-to-end lengkap
(backend, database, static file, API, device status, error handling, integrasi frontend,
graceful failure, Personal Color Analysis).

## Belum Selesai / TODO

- [ ] **Integrasi Serial Arduino Uno** — endpoint `/api/device/status` sudah siap, tapi
      logika membaca port Serial (baud 9600, pesan `"ACTIVE"`/`"IDLE"` dari sensor GP2Y)
      **belum dibangun**. Menunggu kode dari rekan hardware.
- [ ] **Pencatatan `TryOnSession`** — tabel sudah ada di skema, tapi backend belum pernah
      menulis (insert) baris apa pun ke tabel ini. Perlu diputuskan: dicatat otomatis
      setiap kali `startColorAnalysis` sukses? Setiap kali motif dipilih?
- [ ] **3 dari 6 motif belum punya gambar 2D asli** — Kawung, Lasem, Buketan masih pakai
      `placeholder-batik.svg`. Menunggu aset dari tim desain/AR.
- [ ] **Model `.glb`** — field `model3dUrl` sudah siap (nullable), tapi belum ada
      file `.glb` di `public/models/`. Bukan dependency wajib, tapi kalau tersedia
      tinggal `UPDATE` database, tidak perlu ubah skema. 
      a. imageUrl dari public/images, misal /images/parang.jpg
      b. model3dUrl dari public/models, misal /models/parang.glb
- [ ] **Deployment/auto-start** — belum ada mekanisme menjalankan backend otomatis saat
      komputer museum dinyalakan. Menunggu keputusan jenis perangkat museum.
- [ ] **Build production frontend** — sudah pernah smoke-test (`npm run build` berhasil),
      tapi belum jadi build final untuk deployment.

## Catatan Integrasi dengan Modul Lain

- **Modul AI (`ar-batik-app/face-analysis/api/`)** — servis terpisah (FastAPI + PyTorch +
  `pyfacer`). Wajib Python 3.10 atau lebih baru (terverifikasi jalan di Python 3.11
  lewat virtual environment terpisah; gagal total di Python 3.8 karena sintaks tipe data
  `X | Y` yang dipakai `pyfacer`). Backend Node tidak mem-proxy service ini — frontend
  memanggilnya langsung.
- **Frontend (`ar-batik-app/src/App.jsx`)** — data motif diambil lewat `fetch()` ke
  `GET /api/batik` saat mount (bukan lagi hardcoded). Field `imageUrl` dari backend harus
  digabung jadi URL absolut (`${VITE_API_URL}${imageUrl}`) di sisi frontend sebelum dipakai
  di tag `<img>`, karena backend dan frontend berjalan di origin/port berbeda.
- **Hardware (Arduino Uno + sensor GP2Y)** — terhubung via kabel USB (Serial), bukan
  WiFi/HTTP langsung. Kontrak yang disepakati: `Serial.println("ACTIVE")` /
  `Serial.println("IDLE")`, baud rate 9600.