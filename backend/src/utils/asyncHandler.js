// Membungkus fungsi route async supaya error di dalamnya otomatis
// diteruskan ke error handler terpusat, tanpa perlu try/catch manual di tiap route.
// Kalau ada error di dalam fungsi async (misal query Prisma gagal), 
// .catch(next) menangkapnya dan mengirim ke middleware error terpusat

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;