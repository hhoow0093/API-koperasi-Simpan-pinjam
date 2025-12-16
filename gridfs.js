import { GridFSBucket } from "mongodb";
import mongoose from "mongoose";

let profileBucket;
let simpananBucket;
let buktiAngsuranBucket;

mongoose.connection.once("open", () => {
  profileBucket = new GridFSBucket(
    mongoose.connection.db,
    { bucketName: "profileImages" }
  );

  simpananBucket = new GridFSBucket(
    mongoose.connection.db,
    { bucketName: "simpananImages" }
  );

  buktiAngsuranBucket = new GridFSBucket(
    mongoose.connection.db,
    { bucketName: "buktiAngsuran" }
  );

  console.log("🟢 GridFS buckets ready");
});

export { profileBucket, simpananBucket, buktiAngsuranBucket };
