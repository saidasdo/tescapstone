import { Router } from "express";
import prisma from "../lib/prisma.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

const VALID_SEASONS = ["spring", "summer", "autumn", "winter"];

// GET /api/batik — daftar semua motif batik
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const batikList = await prisma.batik.findMany({
      orderBy: { createdAt: "asc" },
    });
    res.json(batikList);
  })
);

// GET /api/batik/recommend?season=Winter — rekomendasi berdasar Personal Color
// PENTING: route ini harus didefinisikan SEBELUM "/:id",
// kalau tidak, Express akan menganggap "recommend" sebagai nilai :id
router.get(
  "/recommend",
  asyncHandler(async (req, res) => {
    const season = (req.query.season || "").toLowerCase();

    if (!season) {
      return res.status(400).json({
        error: "Query parameter 'season' wajib diisi.",
        contoh: "/api/batik/recommend?season=winter",
      });
    }

    if (!VALID_SEASONS.includes(season)) {
      return res.status(400).json({
        error: `Season '${season}' tidak valid.`,
        validSeasons: VALID_SEASONS,
      });
    }

    const recommendations = await prisma.batik.findMany({
      where: { colorCategory: season },
      orderBy: { createdAt: "asc" },
    });
    res.json({
      season,
      count: recommendations.length,
      recommendations,
    });
  })
);

// GET /api/batik/:id — detail satu motif
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const batik = await prisma.batik.findUnique({
      where: { id: req.params.id },
    });

    if (!batik) {
      return res.status(404).json({ error: `Motif '${req.params.id}' tidak ditemukan.` });
    }

    res.json(batik);
  })
);

export default router;