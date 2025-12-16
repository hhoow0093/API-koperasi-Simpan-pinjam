import mongoose from "../db.js";

const loanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  jumlah: { type: Number, required: true }, // total loan amount
  tenor: { type: Number, required: true },  // in months
  status: {
    type: String,
    enum: ["Proses", "Disetujui", "Ditolak", "Lunas"],
    default: "Proses"
  },
  // For active loan calculation
  bunga: { type: Number, default: 0 }, // monthly interest
  totalCicilanPerBulan: { type: Number },
  sisaAngsuran: { type: Number },
  totalAngsuran: { type: Number },
  approvedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  dendaKeterlembatan: { type: Number, default: 0 },
  rejectionReason: { type: String }
  
});

const Loans = mongoose.model("Loan", loanSchema);
export default Loans;