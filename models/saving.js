import mongoose from "../db.js";
import User from "./user.js";

const SavingSchema = new mongoose.Schema({
    typeOfSaves: { type: String, required: true },
    totalSaving: { type: Number },
    createdAt: { type: Date, default: Date.now },
    member_loan: { type: User, required: true },
});

const Saving = mongoose.model("Saving", SavingSchema);
export default Saving;