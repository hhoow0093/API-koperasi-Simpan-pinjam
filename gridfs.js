import mongoose from "./db.js";
import { GridFSBucket } from "mongodb";

let profileBucket;
let simpananBucket;

mongoose.connection.once("open", () => {
  profileBucket = new GridFSBucket(
    mongoose.connection.db,
    { bucketName: "profileImages" }
  );

  simpananBucket = new GridFSBucket(
    mongoose.connection.db,
    { bucketName: "simpananImages" }
  );

  console.log("🟢 GridFS buckets ready");
});

export { profileBucket, simpananBucket };
