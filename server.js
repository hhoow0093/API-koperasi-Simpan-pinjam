import express from "express";
import User from "./models/user.js";
import bcrypt from "bcrypt";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/users/count", async (req, res) => {
  try {
    const CountUsers = await User.countDocuments({ role: "user" });
    return res.status(200).json({ CountUser: CountUsers, message: "success" });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ CountUser: 0, message: error.message });
  }
});

app.get("/users", async (req, res) => {
  try {
    const AllUser = await User.find({ role: "user" });
    res
      .status(200)
      .json({ users: AllUser, message: "all users has been fetched" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/users/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "fill fields correctly!" });
  }

  if (!email.includes("@")) {
    return res
      .status(400)
      .json({ success: false, message: "enter field correctly!" });
  }

  const user = await User.findOne({ email });

  if (user) {
    return res
      .status(400)
      .json({ success: false, message: "use other email!" });
  }
  const hash_password = await bcrypt.hash(password, 7);

  try {
    const endIndex = email.indexOf("@");
    const startIndex = 0;
    const name = email.slice(startIndex, endIndex);
    const user = await User.create({
      email: email,
      password: hash_password,
      name: name,
    });
    return res
      .status(201)
      .json({ success: true, data: user, message: "sucess!" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

app.post("/users/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "invalid Email and password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Wrong credentials" });
    }

    if (user.role === "admin") {
      return res
        .status(200)
        .json({ success: true, message: "Welcome back admin!", isAdmin: true });
    }

    return res
      .status(200)
      .json({ success: true, message: "Welcome Back!", isAdmin: false });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

app.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User deleted",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.put("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, age, gender, date_birth, email, member_status } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (member_status !== undefined) user.member_status = member_status;
    if (age !== undefined) user.age = age;
    if (gender !== undefined) user.gender = gender;
    if (date_birth !== undefined) user.date_birth = date_birth;

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "User information updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.listen(3000, () => {
  console.log("server is running");
});
