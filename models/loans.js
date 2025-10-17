import mongoose from "../db.js";
import User from "./user.js";

const LoanSchema = new mongoose.Schema({
    typeOfLoans: { type: String, required: true },
    totalOfLoans: { type: Number },
    createdAt: { type: Date, default: Date.now },
    member_loan: { type: User, required: true },
    fine: { type: Number },
    interest: {type: Number}
});

const Loan = mongoose.model("Loan", LoanSchema);
export default Loan;