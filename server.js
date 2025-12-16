import express from "express";
import User from "./models/user.js";
import Loans from "./models/loans.js";
import Saving from "./models/saving.js";
import Transaction from "./models/transaction.js";
import bcrypt from "bcrypt";
import UserRoutesRouter from "./routes/UserRoutesRouter.js";
import path from "path";
import { fileURLToPath } from "url";
import { Readable } from "stream";
import { simpananBucket, buktiAngsuranBucket } from "./gridfs.js";
import upload from "./upload.js";
import mongoose from "./db.js";
import { error } from "console";
import PembayaranLoan from "./models/pembayaranLoans.js";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();


const MACHINE_LEARNING_IP_ADDRESS = process.env.IP_address_Machine_Learning;
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// This allows the app to access http://localhost:3000/uploads/profile/image.jpg
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); 

app.use(UserRoutesRouter);

// 2. Dapat mencatat transaksi simpanan anggota (pokok, wajib, sukarela).
// 3. Dapat memproses dan menyetujui pengajuan pinjaman anggota.
// 4. Dapat mengatur suku bunga pinjaman dan denda keterlambatan.
// 5. Dapat mencatat pembayaran angsuran.

// ==============================================
// INI PAS UTS                                  |
// ==============================================


// mendapatkan jumlah user dalam aplikasi
app.get("/users/count", async (req, res) => {
  try {
    const CountUsers = await User.countDocuments({ role: "user" });
    return res.status(200).json({ CountUser: CountUsers, message: "success" });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ CountUser: 0, message: error.message });
  }
});


// mendapatkan seluruh user dalam aplikasi
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

// user dapat melakukan pendaftaran akun
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

// user dapat melakukan login
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
        .json({ success: true, message: "Welcome back admin!", isAdmin: true, user_id: user._id});
    }

    return res
      .status(200)
      .json({ success: true, message: "Welcome Back!", isAdmin: false, user_id: user._id });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// admin daoat menghapus user pada manageUserPage
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

// update informasi user pada sisi admin
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

///INI UNTUK POST KE SIMPANAN
// POST /simpanan → create new saving
app.post("/simpanan", upload.single("simpananImage"), async (req, res) => {
  try {
    const { userId, type, amount } = req.body;

    if (!userId || !type || !amount) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    const saving = await Saving.create({ userId, type, amount });

    if (req.file) {
      const stream = Readable.from(req.file.buffer);

      const uploadStream = simpananBucket.openUploadStream(
        `simpanan-${saving._id}`, // UNIQUE
        {
          contentType: req.file.mimetype,
          metadata: {
            userId,
            savingId: saving._id,
            type: "SIMPANAN"
          }
        }
      );

      stream.pipe(uploadStream);

      await new Promise((resolve, reject) => {
        uploadStream.on("finish", resolve);
        uploadStream.on("error", reject);
      });

      await Saving.findByIdAndUpdate(
        saving._id,
        { BuktiImagePembayaranDalamSimpananId: uploadStream.id }
      );
    }

    await Transaction.create({
      userId,
      tanggal: new Date(),
      jumlah: amount,
      keterangan: `Simpanan ${type}`,
      tipe: "SIMPANAN_MASUK"
    });

    return res.status(201).json({
      message: "Simpanan berhasil",
      savingId: saving._id
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Gagal simpanan" });
  }
});


// GET /simpanan/user/:userId → get all savings + total balance
app.get("/simpanan/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const savings = await Saving.find({ userId });

    // Calculate total balance (KREDIT = +, but you're storing only deposits)
    const totalSaldo = savings.reduce((sum, s) => sum + (s.amount || 0), 0);

    // Map to TransaksiSimpanan format
    const riwayatTransaksi = savings.map((s) => ({
      id: s._id.toString(),
      tanggal: new Date(s.createdAt).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }),
      keterangan: s.type,
      jumlah: s.amount,
      tipe: "KREDIT",
      // assuming all are deposits for now

      buktiImageId: s.BuktiImagePembayaranDalamSimpananId
    ? s.BuktiImagePembayaranDalamSimpananId.toString()
    : null,

    buktiImageUrl: s.BuktiImagePembayaranDalamSimpananId
      ? `/simpanan/image/${s.BuktiImagePembayaranDalamSimpananId}`
      : null
    }));

    return res.status(200).json({ totalSaldo, riwayatTransaksi });
  } catch (error) {
    console.error("Error fetching simpanan:", error);
    return res.status(500).json({ message: "Gagal mengambil data simpanan" });
  }
});

app.get("/simpanan/image/:imageId", async (req, res) => {
  try {
    const imageId = new mongoose.Types.ObjectId(req.params.imageId);

    const downloadStream = simpananBucket.openDownloadStream(imageId);

    downloadStream.on("error", () => {
      return res.status(404).json({ message: "Image not found" });
    });

    res.set("Content-Type", "image/jpeg"); // or from metadata
    downloadStream.pipe(res);
  } catch (err) {
    return res.status(400).json({ message: "Invalid image id" });
  }
});

app.delete("/simpanan/:simpananId", async (req, res) => { 
    try {
    const { simpananId } = req.params;

    const deletedSimpanan = await Saving.findByIdAndDelete(simpananId);

    if (!deletedSimpanan) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "simpanan deleted",
    });
      
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
})

app.get("/pinjaman/list/:idNasabah", async (req, res) => { 
  const { idNasabah } = req.params;
  try { 
    const userExist = await User.findById(idNasabah);
    if (!userExist) { 
       return res.status(400).json({nasabahLoans: [] , error: true, message: "user tidak ada!"})
    }
    const nasabahLoans = await Loans.find({ userId: idNasabah })
    if (nasabahLoans.length === 0) { 
      return res.status(400).json({nasabahLoans: [] , error: true, message: "userId tidak ada peminjaman"})
    }
      return res.status(200).json({ nasabahLoans, error: false, message: "pinjaman berhasil didapatkan dari nasabah" })
  } catch (error) { 
        console.error("error mendapatkan pinjaman nasabah:", error.message);
        return res.status(500).json({ nasabahLoans: [] , error: true,message: error.message });
  }
})

// PUT /pinjaman/approve/:loanId
app.put("/pinjaman/approve/:loanId", async (req, res) => {
  try {
    const { loanId } = req.params;
    const { bungaPersen, dendaPersen } = req.body;

    const loan = await Loans.findById(loanId);
    if (!loan) {
      return res.status(404).json({ message: "Pinjaman tidak ditemukan" });
    }

    if (loan.status !== "Proses") {
      return res.status(400).json({ message: "Pinjaman sudah diproses" });
    }

    // === CALCULATION ===
    const bunga = (bungaPersen / 100) * loan.jumlah;
    const totalPinjaman = loan.jumlah + bunga;
    const cicilanPerBulan = totalPinjaman / loan.tenor;

    loan.status = "Disetujui";
    loan.bunga = bungaPersen;
    loan.dendaKeterlembatan = dendaPersen;
    loan.totalCicilanPerBulan = cicilanPerBulan;
    loan.sisaAngsuran = loan.tenor;
    loan.totalAngsuran = loan.tenor;
    loan.approvedAt = new Date();

    await loan.save();

    return res.status(200).json({
      message: "Pinjaman disetujui",
      loan
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Gagal menyetujui pinjaman" });
  }
});

// PUT /pinjaman/reject/:loanId
app.put("/pinjaman/reject/:loanId", async (req, res) => {
  try {
    const { loanId } = req.params;
    const { reason } = req.body; // optional rejection message

    const loan = await Loans.findById(loanId);
    if (!loan) {
      return res.status(404).json({ message: "Pinjaman tidak ditemukan" });
    }

    if (loan.status !== "Proses") {
      return res.status(400).json({ message: "Pinjaman sudah diproses" });
    }

    loan.status = "Ditolak";

    // Optional (if you add this field later)
    if (reason) {
      loan.rejectionReason = reason;
    }

    await loan.save();

    return res.status(200).json({
      message: "Pinjaman berhasil ditolak",
      loan
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Gagal menolak pinjaman" });
  }
});


// GET /pembayaran-loan/by-loan/:loanId
app.get("/pembayaran-loan/by-loan/:loanId", async (req, res) => {
  try {
    const { loanId } = req.params;

    const pembayaranList = await PembayaranLoan.find({ loanId })
      .sort({ createdAt: -1 }); // newest first

    return res.status(200).json(pembayaranList);

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Gagal mengambil data pembayaran pinjaman"
    });
  }
});

// GET /pembayaran-loan/image/:imageId
app.get("/pembayaran-loan/image/:Id", async (req, res) => {
  try {
    const { Id } = req.params;

    const PembayaranLoanku = await PembayaranLoan.findById(Id); 

    if (!PembayaranLoanku || !PembayaranLoanku.BuktiImagePembayaranDalamPinjamanId) {
      return res.status(404).json({ error: "Image not found" });
    }

    const downloadStream = buktiAngsuranBucket.openDownloadStream(
      PembayaranLoanku.BuktiImagePembayaranDalamPinjamanId
    );

    downloadStream.on("error", () => {
      res.status(404).json({ error: "Image not found" });
    });

    res.set("Content-Type", "image/jpeg");
    downloadStream.pipe(res);

    res.set("Content-Type", "image/jpeg");
    downloadStream.pipe(res);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil gambar" });
  }
});



///INI UNTUK POST KE PINJAMAN
// POST /pinjaman/apply → submit loan application
app.post("/pinjaman/apply", async (req, res) => {
  try {
    const { userId, jumlah, tenor } = req.body;

    if (!userId || !jumlah || !tenor) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const loan = new Loans({
      userId,
      jumlah,
      tenor,
      status: "Proses", // default status
      // You can add interest logic later
      bunga: jumlah * 0.01, // example: 1% interest
      totalCicilanPerBulan: (jumlah * 1.01) / tenor, // simple calc
      sisaAngsuran: tenor,
      totalAngsuran: tenor, 
    });

    await loan.save();

    //buat nambahin ke histori
    const histori = new Transaction({
      userId,
      tanggal: new Date().toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }),
      jumlah: jumlah,
      keterangan: `Pinjaman`,
      tipe: "PENGAJUAN_PINJAMAN"
    });
    await histori.save();

    return res.status(201).json({
      message: "Pengajuan pinjaman berhasil dikirim",
      user_id: userId
    });
  } catch (error) {
    console.error("Error creating pinjaman:", error);
    return res.status(500).json({ message: "Gagal mengajukan pinjaman" });
  }
});

app.post(
  "/pinjaman/bayarAngsuran/:userId/:pinjamanId",
  upload.single("image"),
  async (req, res) => {
    try {
      const { userId, pinjamanId } = req.params;

      if (!req.file) {
        return res.status(400).json({ message: "Bukti pembayaran wajib diunggah" });
      }

      const loan = await Loans.findOne({
        _id: pinjamanId,
        userId
      });

      if (!loan) {
        return res.status(404).json({ message: "Pinjaman tidak ditemukan" });
      }

      if (loan.status === "Lunas") {
        return res.status(400).json({ message: "Pinjaman sudah lunas" });
      }

      if (loan.sisaAngsuran <= 0) {
        return res.status(400).json({ message: "Tidak ada angsuran tersisa" });
      }

      // 📤 Upload to GridFS
      const uploadStream = buktiAngsuranBucket.openUploadStream(
        `angsuran-${pinjamanId}-${Date.now()}`,
        {
          contentType: req.file.mimetype,
          metadata: { userId, pinjamanId }
        }
      );

      uploadStream.end(req.file.buffer);

      uploadStream.on("finish", async () => {
        // ✅ USE uploadStream.id
        await PembayaranLoan.create({
          userId,
          loanId: pinjamanId,
          BuktiImagePembayaranDalamPinjamanId: uploadStream.id
        });

        // ➖ decrement angsuran
        loan.sisaAngsuran -= 1;

        if (loan.sisaAngsuran === 0) {
          loan.status = "Lunas";
        }

        await loan.save();

        res.status(201).json({
          message: "Angsuran berhasil dibayar"
        });
      });

      uploadStream.on("error", (err) => {
        console.error(err);
        res.status(500).json({ message: "Gagal menyimpan bukti pembayaran" });
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);


app.post("/pinjaman/bayar", async (req, res) => {
  try {
    const { userId, loanId, amount } = req.body;

    //buat ngurangin sisa angsuran di loans
    const loan = await Loans.findByIdAndUpdate(
      loanId,
      { $inc: { sisaAngsuran: -1 } },
      { new: true }
    );

    if (!loan) {
      return res.status(404).json({ message: "Pinjaman tidak ditemukan" });
    }

    //nambahin ke histori
    const histori = new Transaction({
      userId,
      tanggal: new Date().toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }),
      jumlah: amount,
      keterangan: `Pembayaran Angsuran Pinjaman`,
      tipe: "BAYAR_ANGSURAN"
    });
    await histori.save();

    return res.status(200).json({ message: "Pembayaran berhasil dicatat" });
  } catch (error) {
    console.error("Error bayar angsuran:", error);
    return res.status(500).json({ message: "Gagal mencatat pembayaran" });
  }
});

// GET /pinjaman/active/:userId → gabungkan semua pinjaman aktif
app.get("/pinjaman/active/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Ambil semua pinjaman aktif
    const activeLoans = await Loans.find({
      userId,
      status: "Disetujui"
    });
    // console.log("pinjaman aktif: ", activeLoans);

    if (activeLoans.length === 0) {
      return res.status(404).json({ message: "Tidak ada pinjaman aktif" });
    }

    // Hitung total cicilan per bulan
    const totalCicilanPerBulan = activeLoans.reduce(
      (sum, loan) => sum + (loan.totalCicilanPerBulan || 0),
      0
    );

    // Untuk pokok dan bunga, juga bisa dijumlahkan
    const totalPokok = activeLoans.reduce(
      (sum, loan) => sum + (loan.jumlah || 0),
      0
    );
    const totalBunga = activeLoans.reduce(
      (sum, loan) => sum + (loan.bunga || 0),
      0
    );

    const maxTotalAngsuran = Math.max(...activeLoans.map(l => l.totalAngsuran || 0));
    const maxSisaAngsuran = Math.max(...activeLoans.map(l => l.sisaAngsuran || 0));


    return res.status(200).json({
      id: activeLoans[0]._id,
      size: activeLoans.length,
      pokok: totalPokok,
      bunga: totalBunga,
      totalCicilanPerBulan: totalCicilanPerBulan,
      sisaAngsuran: maxSisaAngsuran,
      totalAngsuran: maxTotalAngsuran
    });

  } catch (error) {
    console.error("Error fetching active pinjaman:", error);
    return res.status(500).json({ message: "Gagal mengambil data pinjaman aktif" });
  }
});

// GET /pinjaman/history/:userId → get loan history
app.get("/pinjaman/history/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const history = await Loans.find({ userId });

    const pengajuanHistory = history.map((loan) => ({
      id: loan._id.toString(),
      tanggal: new Date(loan.createdAt).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }),
      jumlah: loan.jumlah,
      tenor: loan.tenor,
      status: loan.status
    }));

    return res.status(200).json(pengajuanHistory);
  } catch (error) {
    console.error("Error fetching pinjaman history:", error);
    return res.status(500).json({ message: "Gagal mengambil histori pinjaman" });
  }
});

app.get("/transaksi/all/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const histori = await Transaction.find({ userId })
      .sort({ createdAt: -1 }); // terbaru dulu

    return res.status(200).json(histori);
  } catch (error) {
    console.error(error);
    return res.status(500).json([]);
  }
});

app.post("/prediksi-machine-learning", async (req, res) => {
  try {
    const {
      age,
      income_per_month,
      credit_point,
      loan_occurrences_per_month
    } = req.body;


    // Basic validation
    if (
      age === undefined ||
      income_per_month === undefined ||
      credit_point === undefined ||
      loan_occurrences_per_month === undefined
    ) {
      return res.status(400).json({
        error: "Missing required fields"
      });
    }

    // Call Flask ML API
    const response = await axios.post(
      `${MACHINE_LEARNING_IP_ADDRESS}/predict-default`,
      {
        age,
        income_per_month,
        credit_point,
        loan_occurrences_per_month
      },
      {
        headers: {
          "Content-Type": "application/json"
        },
        timeout: 5000 // prevent hanging request
      }
    );

    console.log("ML RESPONSE:", response.data);

    // Forward ML response to client
    return res.status(200).json({
      success: true,
      ml_result: response.data
    });

  } catch (err) {
    console.error("ML API Error:", err.message);

    if (err.response) {
      // Flask returned an error
      return res.status(err.response.status).json({
        error: "Machine learning service error",
        details: err.response.data
      });
    }

    return res.status(500).json({
      error: "Failed to connect to machine learning service"
    });
  }
});

app.listen(3000, () => {
  console.log("server is running");
});
