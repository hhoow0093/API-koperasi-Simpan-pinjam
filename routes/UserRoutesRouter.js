import express from "express";
import User from "../models/user.js";
import upload from "../upload.js";
import { profileBucket } from "../gridfs.js";
import { Readable } from "stream";
import mongoose from "mongoose";


const UserRoutesRouter = express.Router();



// GET USER BY ID (untuk ProfilePage)
 UserRoutesRouter.get("/user/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user" });
  }
});


// UPDATE USER (tanpa ganti foto)
 UserRoutesRouter.put("/user/:userId", async (req, res) => {
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


UserRoutesRouter.post(
  "/user/:userId/upload-profile-image",
  upload.single("image"),
  async (req, res) => {

    const stream = Readable.from(req.file.buffer);

    const uploadStream = profileBucket.openUploadStream(
      `profile-${req.params.userId}`,
      { contentType: req.file.mimetype }
    );

    stream.pipe(uploadStream);

    uploadStream.on("finish", async () => {
      await User.findByIdAndUpdate(req.params.userId, {
        profileImageId: uploadStream.id
      });

      res.json({ message: "Profile image uploaded" });
    });
  }
);

UserRoutesRouter.get("/user/:userId/profile-image", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    const user = await User.findById(userId);

    if (!user || !user.profileImageId) {
      return res.status(404).json({ error: "Image not found" });
    }

    const downloadStream = profileBucket.openDownloadStream(
      user.profileImageId
    );

    downloadStream.on("error", () => {
      res.status(404).json({ error: "Image not found" });
    });

    res.set("Content-Type", "image/jpeg");
    downloadStream.pipe(res);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

//DELETE USER
 UserRoutesRouter.delete("/user/:userId", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.userId);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting user" });
  }
});

export default UserRoutesRouter;
