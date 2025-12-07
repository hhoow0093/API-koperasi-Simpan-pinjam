import express from "express";
import User from "./models/user.js";
import Loans from "./models/loans.js";
import Saving from "./models/saving.js";
import Transaction from "./models/transaction.js";
import bcrypt from "bcrypt";
import userRoutes from "./routes/userRoutes.js";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// This allows the app to access http://localhost:3000/uploads/profile/image.jpg
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); 

app.use(userRoutes);

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
app.post("/simpanan", async (req, res) => {
  try {
    const { userId, type, amount } = req.body;
    const saving = new Saving({ userId, type, amount });
    await saving.save();

    //buat nambahin ke histori
    const histori = new Transaction({
      userId,
      tanggal: new Date().toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }),
      jumlah: amount,
      keterangan: `Simpanan ${type}`,
      tipe: "SIMPANAN_MASUK"
    });
    await histori.save();

    return res.status(201).json({ message: "Simpanan berhasil", user_id: userId });
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
      tipe: "KREDIT" // assuming all are deposits for now
    }));

    return res.status(200).json({ totalSaldo, riwayatTransaksi });
  } catch (error) {
    console.error("Error fetching simpanan:", error);
    return res.status(500).json({ message: "Gagal mengambil data simpanan" });
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
      totalAngsuran: tenor
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

app.listen(3000, () => {
  console.log("server is running");
});

// ==============================================
// Backend untuk fitur ke 2                     |
// ==============================================

// user bisa melakukan simpanan pokok, wajib, dan sukarela
app.post("/users/melakukan-simpanan/:id", async(req, res)=>{


});