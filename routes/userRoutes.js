import express from "express";
import User from "../models/user.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// STORAGE UNTUK MULTER
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/profile/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); 
  },
});

const upload = multer({ storage: storage });


// GET USER BY ID (untuk ProfilePage)
router.get("/user/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user" });
  }
});


// UPDATE USER (tanpa ganti foto)
router.put("/user/:userId", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      req.body,
      { new: true }
    );

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: "Error updating user" });
  }
});


//UPLOAD / UBAH FOTO PROFIL
router.put(
  "/user/:userId/profile-photo",
  upload.single("profile_image"),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No file uploaded" });

      const imageUrl = `/uploads/profile/${req.file.filename}`;

      const updatedUser = await User.findByIdAndUpdate(
        req.params.userId,
        { profile_image: imageUrl },
        { new: true }
      );

      res.json({
        message: "Profile photo updated successfully",
        user: updatedUser,
      });
    } catch (err) {
      res.status(500).json({ message: "Error uploading profile image" });
    }
  }
);


//DELETE USER
router.delete("/user/:userId", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.userId);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting user" });
  }
});

export default router;
