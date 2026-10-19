import type { Document } from '@anvia/core'

export const document: Document = {
  id: 'pt-maju-data-bersama-customer-service-guide',
  text: `# Panduan Layanan Pelanggan PT Maju Data Bersama

> Seluruh nama produk, harga, nomor, dan kebijakan dalam dokumen ini adalah data simulasi untuk PT Maju Data Bersama. Dokumen ini bukan penawaran atau kebijakan operator telekomunikasi nyata.

## Profil perusahaan

PT Maju Data Bersama (MDB) adalah perusahaan telekomunikasi Indonesia dengan merek layanan **MajuSel**. Layanan simulasi mencakup kartu prabayar, paket data, telepon, SMS, eSIM, dan internet rumah MajuFiber. Harga sudah termasuk pajak kecuali dinyatakan lain.

Kanal resmi:
- Aplikasi MajuSel: layanan mandiri 24 jam
- Call center: 188 dari nomor MajuSel atau 0800-1-628-628 dari operator lain, 24 jam
- WhatsApp terverifikasi: 0811-0000-188, 24 jam
- Email: care@majudatabersama.example, target balasan 1 hari kerja
- GraPARI Maju: Senin–Sabtu, 09.00–17.00 waktu setempat; hari libur mengikuti lokasi

Alamat dan nomor di atas hanya untuk simulasi dan tidak boleh digambarkan sebagai kanal milik perusahaan nyata.

## Produk simulasi

### Prabayar MajuSel

| Paket | Kuota | Masa aktif | Harga |
| --- | ---: | ---: | ---: |
| Maju Hemat 5 | 5 GB nasional | 7 hari | Rp18.000 |
| Maju Bulanan 25 | 25 GB nasional | 30 hari | Rp65.000 |
| Maju Bulanan 60 | 60 GB nasional | 30 hari | Rp110.000 |
| Maju Nelpon | 200 menit ke semua operator | 30 hari | Rp35.000 |

- Kuota berlaku di jaringan 4G/5G MajuSel; akses 5G memerlukan perangkat dan area yang mendukung.
- Paket tidak diperpanjang otomatis kecuali pelanggan mengaktifkan fitur perpanjangan otomatis.
- Sisa kuota tidak terakumulasi setelah masa aktif berakhir.
- Masa aktif kartu bertambah 30 hari setelah isi ulang minimal Rp20.000.
- Kartu masuk masa tenggang 30 hari setelah masa aktif berakhir. Saat masa tenggang, pelanggan hanya dapat menerima panggilan dan SMS. Nomor dapat didaur ulang setelah masa tenggang berakhir.

### Pascabayar MajuPrime

| Paket | Kuota | Tagihan bulanan |
| --- | ---: | ---: |
| Prime 40 | 40 GB nasional | Rp120.000 |
| Prime 100 | 100 GB nasional | Rp220.000 |

Siklus tagihan berakhir tanggal 20, tagihan terbit tanggal 21, dan jatuh tempo tanggal 5 bulan berikutnya. Layanan keluar dapat dibatasi jika tagihan belum dibayar 7 hari setelah jatuh tempo. Pembukaan pembatasan ditargetkan maksimal 2 jam setelah pembayaran terverifikasi.

### Internet rumah MajuFiber

| Paket | Kecepatan hingga | Harga per bulan |
| --- | ---: | ---: |
| Fiber 30 | 30 Mbps | Rp250.000 |
| Fiber 100 | 100 Mbps | Rp425.000 |

- Kecepatan aktual dipengaruhi perangkat, Wi-Fi, jumlah pengguna, dan kondisi jaringan.
- Biaya pemasangan baru Rp150.000. Modem dipinjamkan selama berlangganan.
- Kunjungan teknisi tersedia setiap hari pukul 08.00–18.00 dengan slot dua jam.

## Aturan privasi dan verifikasi

1. Informasi umum tentang produk dan gangguan tidak memerlukan verifikasi identitas.
2. Informasi akun, sisa kuota, tagihan, riwayat transaksi, perubahan layanan, dan keluhan finansial hanya diproses setelah verifikasi di kanal privat resmi.
3. Verifikasi standar menggunakan dua data yang cocok, misalnya nomor MajuSel yang dimasking, nama terdaftar, nominal isi ulang terakhir, atau bulan dan tahun lahir. Jangan meminta seluruh data sekaligus.
4. Penggantian SIM/eSIM, perubahan kepemilikan, dugaan pengambilalihan akun, dan perubahan data registrasi wajib diproses melalui aplikasi dengan verifikasi biometrik atau di GraPARI Maju dengan identitas asli.
5. Petugas tidak pernah meminta OTP, PIN, kata sandi, CVV, nomor kartu pembayaran lengkap, NIK lengkap, atau nomor KK lengkap melalui percakapan.
6. Data pelanggan tidak boleh dibacakan, diteruskan ke pihak lain, atau ditampilkan tanpa masking. Contoh masking: 0812••••1234 dan NIK ••••••••••••1234.
7. Jika seseorang mengaku mewakili pelanggan, arahkan pemilik nomor untuk menghubungi kanal resmi sendiri, kecuali ada prosedur kuasa yang diverifikasi di gerai.

## Prosedur layanan umum

### Sinyal atau internet seluler bermasalah

Tanyakan lokasi setingkat kecamatan/kota, waktu mulai gangguan, jenis layanan, dan apakah pengguna lain terdampak. Lalu sarankan secara berurutan:
1. Aktifkan mode pesawat selama 30 detik, lalu nonaktifkan.
2. Pastikan data seluler aktif, kuota dan masa aktif tersedia, serta mode jaringan otomatis dipilih.
3. Mulai ulang perangkat.
4. Coba di area terbuka atau lokasi lain di sekitar.

Jangan meminta pelanggan mereset perangkat atau pengaturan jaringan sebelum data penting dicadangkan. Jika masalah tetap ada, arahkan ke call center atau aplikasi agar pemeriksaan jaringan dan tiket dapat dibuat. Target pemeriksaan awal gangguan individual adalah 1 x 24 jam. Gangguan area besar mengikuti estimasi pemulihan yang diumumkan di kanal resmi; jangan membuat estimasi sendiri.

### MajuFiber bermasalah

Pastikan lampu daya modem menyala. Minta pelanggan mencabut daya modem selama 30 detik lalu menyalakannya kembali satu kali. Jika lampu LOS merah atau berkedip setelah modem menyala stabil, jangan menyuruh pelanggan mencabut kabel fiber; arahkan untuk membuat tiket teknisi. Target kunjungan adalah maksimal 2 hari kalender, bergantung ketersediaan slot dan akses lokasi.

### Paket atau pulsa belum masuk

Minta waktu transaksi, nominal atau nama paket, metode pembayaran, dan bukti transaksi tanpa data kartu lengkap. Tunggu maksimal 15 menit untuk transaksi digital yang masih diproses. Jika belum masuk, arahkan pelanggan mengajukan pemeriksaan transaksi melalui aplikasi atau call center. Jangan menyarankan pembelian ulang sebelum status transaksi pertama jelas.

### Nomor hilang atau diduga diambil alih

Prioritaskan keamanan. Arahkan pelanggan segera meminta pemblokiran sementara melalui call center, lalu mengganti SIM/eSIM melalui aplikasi dengan biometrik atau di GraPARI Maju. Jangan meminta OTP. Dugaan penipuan, SIM swap, atau transaksi tanpa izin harus langsung dieskalasikan ke Tim Keamanan Akun dengan target respons awal 2 jam.

### Berhenti berlangganan

Paket prabayar dengan perpanjangan otomatis dapat dimatikan melalui aplikasi sebelum masa aktif berikutnya. Penutupan MajuPrime atau MajuFiber memerlukan verifikasi pemilik, pelunasan tagihan, dan pengembalian perangkat pinjaman. Sampaikan kemungkinan tagihan akhir tanpa menjanjikan nominal sebelum dihitung oleh sistem.

## Keluhan, pengembalian dana, dan eskalasi

Catat ringkasan masalah, waktu kejadian, layanan terdampak, langkah yang sudah dicoba, dan kanal yang dapat dihubungi. Sistem resmi—bukan agen percakapan ini—menerbitkan nomor tiket berformat **MDB-YYYYMMDD-XXXX**.

Target penanganan simulasi:
- Pertanyaan umum: pada kontak pertama
- Pemeriksaan transaksi atau tagihan: maksimal 3 hari kerja
- Keluhan kualitas jaringan individual: maksimal 3 hari kerja
- Gangguan area: pembaruan minimal setiap 4 jam sampai pulih
- Dugaan fraud atau pengambilalihan akun: respons awal maksimal 2 jam
- Pengembalian dana yang disetujui: 5–10 hari kerja, bergantung metode pembayaran

Pengembalian dana dapat ditinjau untuk transaksi ganda, pembayaran berhasil tetapi layanan gagal diberikan, atau tagihan yang terbukti salah. Paket yang sudah aktif dan telah digunakan tidak dapat dikembalikan hanya karena pelanggan berubah pikiran. Agen tidak boleh menjanjikan persetujuan; keputusan dibuat setelah pemeriksaan transaksi.

Eskalasi dilakukan bila:
- keselamatan, fraud, kebocoran data, atau pengambilalihan akun diduga terjadi;
- gangguan melewati target penanganan;
- pelanggan sudah menghubungi dua kali untuk tiket yang sama tanpa kemajuan;
- ada sengketa tagihan yang tidak selesai pada pemeriksaan awal; atau
- pelanggan meminta supervisor.

Jika target terlewati, minta nomor tiket yang sudah dimasking, akui keterlambatan, dan arahkan ke call center atau aplikasi untuk eskalasi. Jangan membuat nomor tiket atau mengaku telah menghubungi tim internal.

## Standar komunikasi

- Dengarkan dan akui dampak masalah sebelum memberi langkah penyelesaian.
- Gunakan istilah sederhana dan berikan maksimal beberapa langkah dalam satu balasan.
- Jangan menyalahkan pelanggan, perangkat, pihak ketiga, atau tim lain.
- Jangan menjanjikan cakupan, kecepatan, kompensasi, atau waktu pulih di luar panduan ini.
- Untuk pelanggan yang kesulitan mengikuti instruksi, tawarkan kanal telepon atau gerai.
- Jika pelanggan marah, tetap tenang, rangkum kebutuhan utamanya, dan fokus pada tindakan berikutnya.
- Ancaman terhadap keselamatan atau keadaan darurat harus diarahkan ke layanan darurat setempat; kanal layanan pelanggan bukan layanan darurat.
`,
  additionalProps: { version: '2', language: 'id-ID', fictional: 'true' },
}
