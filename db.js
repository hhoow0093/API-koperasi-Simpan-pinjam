import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const user_db =process.env.db_username 
const password = process.env.db_password;
const url = `mongodb+srv://${user_db}:${password}@koperasicluster.okfyku9.mongodb.net/?retryWrites=true&w=majority&appName=koperasiCluster`

mongoose.connect(url, {
  dbName: "koperasiSimpan", 
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB with Mongoose!"))
    .catch(err => console.error("❌ Mongoose connection error:", err));

export default mongoose;

