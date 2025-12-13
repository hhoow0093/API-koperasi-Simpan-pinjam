import mongoose from "../db.js";
import User from "./user.js";

const savingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  type: { type: String, required: true }, // "Pokok", "Wajib", etc.
  amount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  BuktiImagePembayaranDalamSimpananId: {
      type: mongoose.Schema.Types.ObjectId,
  }
});

const Saving = mongoose.model("Saving", savingSchema);
export default Saving;