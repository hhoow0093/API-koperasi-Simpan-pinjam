# 💰 Koperasi Simpan Pinjam

<p align="center">
  <a href="https://postimg.cc/kD8gvyJN">
    <img src="https://i.postimg.cc/442HZ8j0/Frame-35540.png" alt="Koperasi Simpan Pinjam" width="600"/>
  </a>
</p>

Koperasi **Simpan Pinjam** merupakan sebuah lembaga yang menyediakan **jasa simpanan** dan **pinjaman** kepada anggota koperasi dalam bentuk **uang**.  
**Simpanan** biasanya terdiri dari *Simpanan wajib*, *pokok*, dan *sukarela*.  
Untuk **pinjaman**, anggota harus mengajukan permohonan kepada pengurus koperasi untuk diproses lebih lanjut.  

Tujuan dari *repository* ini adalah membangun aplikasi **mobile berbasis Android** menggunakan **Android Studio** untuk mendukung sistem koperasi tersebut.  

---

## 👥 Kelompok

Kami adalah **Kelompok 9** dari mata kuliah **IF 570 - Mobile Application (Kelas C)**.  

<div align="center">

| 👤 Name                  | 🆔 Student ID  |
|---------------------------|----------------|
| Howard                   | 00000099772    |
| Jastin Afrian            | 00000099187    |
| John Isaac Witnesss      | 00000088626    |
| Theo Ferdinando Aditya   | 00000111483    |

</div>

---

## 🎯 Tujuan

Tujuan pengembangan aplikasi ini adalah untuk **mengimplementasikan sistem koperasi simpan pinjam berbasis Android** menggunakan bahasa pemrograman **Kotlin**.  
Aplikasi ini dirancang agar pengurus dan anggota koperasi dapat berinteraksi dalam satu sistem yang efisien dan modern.  

---

## ⚙️ Fitur

Proyek ini untuk saat ini berfokus pada **antarmuka aplikasi (UI/UX)** dan telah berhasil mengimplementasikan fitur **Login & Register** menggunakan **backend custom**.  

### 🧩 Teknologi Backend
- **Backend Framework:** Express.js  
- **Database:** MongoDB (Non-relational)  
- **CRUD API:** Dibangun secara custom  
- **Alasan Pemilihan MongoDB:** Non-relational database meningkatkan *scalability* dan performa akses data.  

---

### 👨‍💼 Fitur Pengurus Koperasi

1. Kelola data anggota (tambah, edit, nonaktifkan).  
2. Catat transaksi simpanan (pokok, wajib, sukarela).  
3. Proses & setujui pengajuan pinjaman anggota.  
4. Atur suku bunga dan denda keterlambatan.  
5. Catat pembayaran angsuran.  
6. Lihat daftar pinjaman aktif & riwayat pelunasan.  
7. Kirim notifikasi ke seluruh anggota.  
8. Buat laporan keuangan per bulan/tahun.  
9. Kelola kas koperasi (saldo masuk/keluar).  
10. Lihat rekap total simpanan & pinjaman anggota.  
11. Pantau saldo kas & laba bersih koperasi.  
12. Tampilkan grafik perkembangan simpanan/pinjaman.  
13. Lihat laporan laba-rugi koperasi.  
14. Cetak laporan ke PDF/Excel *(opsional)*.  

---

### 👨‍👩‍👧‍👦 Fitur Anggota Koperasi

1. Daftar & login ke aplikasi.  
2. Lihat saldo simpanan pokok, wajib, dan sukarela.  
3. Ajukan pinjaman baru dengan jumlah & tenor tertentu.  
4. Pantau status pengajuan pinjaman (disetujui, ditolak, diproses).  
5. Lihat rincian pinjaman aktif (pokok, bunga, total cicilan).  
6. Cek histori pembayaran angsuran.  
7. Lihat laporan bulanan pribadi (simpanan, pinjaman, angsuran).  
8. Kelola profil & status keanggotaan.  
9. Terima notifikasi jatuh tempo & pengumuman koperasi.  
10. Unggah bukti pembayaran manual.  

---

## 🚀 Cara Menjalankan Proyek

### 📦 1. Menjalankan Backend (API)

> **Prasyarat:** Pastikan **Node.js** dan **VSCode** sudah terinstal.  

Clone repository API kami terlebih dahulu:  
```bash
git clone https://github.com/hhoow0093/API-koperasi-Simpan-pinjam.git

# Masuk ke folder project
cd to/your/project

# Buka di VS Code
code .

# Install dependencies
npm install

# Jalankan server pada port 3000
node server.js
```

> **Penting:**  
> Tambahkan file `.env` berisi kredensial database seperti `db_username` dan `db_password`.  
> Detail kredensial dapat ditemukan pada laporan yang telah kami lampirkan.  

📎 [API Repository Link](https://github.com/hhoow0093/API-koperasi-Simpan-pinjam)

---

### 📱 2. Menjalankan Aplikasi Android

1. Buka project Android di **Android Studio**.  
2. Cari file:  
   ```
   res/xml/network_security_config.xml
   ```
   Lalu, ubah tag `<domain>` menjadi **IP Address asli Anda**.  

   💡 Cek IP lokal Anda menggunakan perintah:
   ```bash
   ipconfig
   ```
   Cari pada bagian `Wireless LAN adapter Wi-Fi` → `IPv4 Address`.

3. Selanjutnya, di file  
   ```
   eu.tutorials.koperasi_simpan_pinjam.data.API.RetrofitClient.kt
   ```
   Ubah nilai variabel `BASE_URL` menjadi IP lokal Anda dengan port `3000`.

---

<p align="center">
  <img src="https://i.postimg.cc/NjFZr00z/Screenshot-2025-10-17-180652.png" width="600"/>
</p>

<p align="center">
  <img src="https://i.postimg.cc/T1HJ8TXw/Screenshot-2025-10-17-181226.png" width="600"/>
</p>

<p align="center">
  <img src="https://i.postimg.cc/wvjN9n29/Screenshot-2025-10-17-181733.png" width="600"/>
</p>

---

## 💬 Ucapan Terima Kasih

Kami mengucapkan terima kasih sebesar-besarnya kepada  
👩‍🏫 **Ibu Ester Lumba** *(Dosen)* dan 🧑‍💻 **Owen Christian** *(Asisten Laboratorium)*  
yang telah memberikan bimbingan, arahan, serta ilmu tentang pengembangan aplikasi mobile menggunakan **Retrofit**, serta pembuatan antarmuka yang interaktif dan modern.

---

<p align="center">
  <b>✨ Dibuat dengan semangat kolaborasi & pembelajaran ✨</b><br>
  <i>Kelompok 9 - IF 570 Mobile Application - C</i>
</p>
