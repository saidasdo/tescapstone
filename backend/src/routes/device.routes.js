import { Router } from "express";

const router = Router();

// Validasi status cuma menerima "idle" atau "active"
// untuk mencegah mikon (atau siapa pun) mengirim nilai sembarangan yang bisa membingungkan frontend
const VALID_STATUSES = ["idle", "active"];

// Status disimpan di memori server (bukan database) --> karena
// ini status "saat ini juga", bukan data historis. Kalau server di-restart,
// status akan reset ke "idle" 
let deviceState = {
  status: "idle",
  updatedAt: new Date().toISOString(),
};

// POST /api/device/status --> dipanggil ESP32 setiap kali sensor berubah status
router.post("/status", (req, res) => {
  const { status } = req.body;

  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: `Field 'status' wajib diisi salah satu dari: ${VALID_STATUSES.join(", ")}`,
    });
  }

//   deviceState adalah variabel biasa di memori, bukan tabel database
  deviceState = {
    status,
    updatedAt: new Date().toISOString(),
  };

  console.log(` Device status diperbarui: ${status}`);
  res.json(deviceState);
});

// GET /api/device/status --> dipanggil frontend berkala (polling) untuk tahu status terkini
router.get("/status", (req, res) => {
  res.json(deviceState);
});

export default router;