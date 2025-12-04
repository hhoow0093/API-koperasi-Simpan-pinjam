// routes/simpanan.js
import express from "express";
import Saving from "../models/saving.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { userId, type, amount } = req.body;
    const saving = new Saving({ userId, type, amount });
    await saving.save();
    res.status(201).json({ message: "Simpanan berhasil ditambahkan", user_id: userId });
  } catch (err) {
    console.error("Error creating simpanan:", err);
    res.status(400).json({ message: "Gagal menambahkan simpanan", error: err.message });
  }
});

// Optionally add GET route for /user/:userId
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const savings = await Saving.find({ userId });
    const totalSaldo = savings.reduce((sum, s) => sum + (s.amount || 0), 0);
    // You can also transform to TransaksiSimpanan format if needed
    res.json({ totalSaldo, riwayatTransaksi: savings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil data simpanan" });
  }
});

export default router;