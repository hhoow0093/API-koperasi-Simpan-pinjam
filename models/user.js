import mongoose from "../db.js";

const userSchema = new mongoose.Schema({
  name: { type: String },
  age: Number,
  email: { type: String, unique: true, required: true },
  createdAt: { type: Date, default: Date.now },
  role: { type: String, default: "user" },
  password: { type: String, required: true },
  gender: { type: String },
  date_birth: { type: Date },
  member_status: { type: Boolean, default: true },
  profile_image: { type: String, default: null },
});

const User = mongoose.model("User", userSchema);

export default User;
