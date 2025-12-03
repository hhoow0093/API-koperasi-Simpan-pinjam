import mongoose from "../db.js";
import User from "./user.js";

const SavingSchema = new mongoose.Schema({
    typeOfSaves: { type: String, required: true },
    totalSaving: { type: Number },
    createdAt: { type: Date, default: Date.now },
    member_saving: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "User",
    },
});

const Saving = mongoose.model("Saving", SavingSchema);
export default Saving;