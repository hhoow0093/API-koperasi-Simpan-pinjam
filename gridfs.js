import mongoose from "./db.js";
import { GridFSBucket } from "mongodb";

let profileBucket;
let transactionBucket;

mongoose.connection.once("open", () => {
  profileBucket = new GridFSBucket(
    mongoose.connection.db,
    { bucketName: "profileImages" }
  );

  transactionBucket = new GridFSBucket(
    mongoose.connection.db,
    { bucketName: "transactionImages" }
  );

  console.log("🟢 GridFS buckets ready");
});

export { profileBucket, transactionBucket };
