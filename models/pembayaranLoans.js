import mongoose from "../db.js";

const PembayaranloanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
    },
    loanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Loan",
        required: true
    },
    createdAt: { type: Date, default: Date.now },
    BuktiImagePembayaranDalamPinjamanId: {
          type: mongoose.Schema.Types.ObjectId,
    }
});

const PembayaranLoan = mongoose.model("PembayaranLoan", PembayaranloanSchema);
export default PembayaranLoan;