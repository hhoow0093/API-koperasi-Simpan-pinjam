import mongoose from "../db.js";

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  tanggal: { type: String, required: true }, // e.g., "13 Okt 2025"
  jumlah: { type: Number, required: true },
  keterangan: { type: String, required: true },
  tipe: {
    type: String,
    enum: ["SIMPANAN_MASUK", "SIMPANAN_KELUAR", "BAYAR_ANGSURAN", "BAYAR_DENDA"],
    required: true
  }
}, {
  timestamps: true
});

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;