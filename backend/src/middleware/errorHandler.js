// Dipanggil kalau request menuju route yang tidak terdaftar sama sekali
export const notFoundHandler = (req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} tidak ditemukan.` });
};

// Middleware error terakhir —> menangkap semua error yang diteruskan lewat next(error)
// ! PENTING: harus punya 4 parameter (err, req, res, next) supaya Express mengenalinya
// sebagai error handler, walaupun "next" tidak dipakai di dalamnya.
export const errorHandler = (err, req, res, next) => {
  console.error("❌ Error tertangkap:", err);
  res.status(err.status || 500).json({
    error: err.message || "Terjadi kesalahan pada server.",
  });
};