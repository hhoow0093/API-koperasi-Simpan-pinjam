// routes/pinjaman.js
import express from "express";
import Loan from "../models/loans.js";

const router = express.Router();

router.post("/apply", async (req, res) => {
  try {
    const { userId, jumlah, tenor } = req.body;
    const loan = new Loan({ userId, jumlah, tenor });
    await loan.save();
    res.status(201).json({ message: "Pengajuan pinjaman berhasil", user_id: userId });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Gagal mengajukan pinjaman" });
  }
});


export default router;