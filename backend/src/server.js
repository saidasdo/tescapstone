import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import batikRoutes from "./routes/batik.routes.js";
import deviceRoutes from "./routes/device.routes.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use("/images", express.static(path.join(__dirname, "../public/images")));
app.use("/models", express.static(path.join(__dirname, "../public/models")));

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Backend Batik AR berjalan dengan baik",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/batik", batikRoutes);
app.use("/api/device", deviceRoutes);

// PENTING: kedua middleware ini harus di posisi PALING BAWAH, setelah semua route terdaftar
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅ Backend berjalan di http://localhost:${PORT}`);
  console.log(`   Coba buka: http://localhost:${PORT}/health`);
  console.log(`   Katalog batik: http://localhost:${PORT}/api/batik`);
  console.log(`   Device status: http://localhost:${PORT}/api/device/status`);
});