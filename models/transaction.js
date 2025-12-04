// models/Transaction.js
import mongoose from "../db.js";

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  tanggal: { type: String, required: true }, // "13 Okt 2025"
  jumlah: { type: Number, required: true },
  keterangan: { type: String, required: true },
  tipe: {
    type: String,
    enum: ["SIMPANAN_MASUK", "SIMPANAN_KELUAR", "PENGAJUAN_PINJAMAN", "BAYAR_ANGSURAN", "BAYAR_DENDA"],
    required: true
  },
  //ref ke savings
  referenceId: { type: mongoose.Schema.Types.ObjectId }
}, {
  timestamps: true
});

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;