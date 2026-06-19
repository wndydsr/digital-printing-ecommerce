"use client";
import React, { useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import {
  ChevronDown,
  FileText,
  Truck,
  CreditCard,
  Package,
  Image,
  RefreshCw,
  Phone,
  Search,
} from "lucide-react";

const categories = [
  { id: "semua", label: "Semua", icon: null },
  { id: "desain", label: "File & Desain", icon: Image },
  { id: "produk", label: "Produk & Harga", icon: Package },
  { id: "pembayaran", label: "Pembayaran", icon: CreditCard },
  { id: "pengiriman", label: "Pengiriman", icon: Truck },
  { id: "revisi", label: "Revisi & Komplain", icon: RefreshCw },
  { id: "lainnya", label: "Lainnya", icon: FileText },
];

const faqs = [
  // Desain
  {
    id: 1,
    cat: "desain",
    q: "Format file apa saja yang bisa saya upload?",
    a: "Kami menerima format PDF (sangat disarankan), JPG, PNG, AI, CDR, dan PSD. Format PDF adalah yang terbaik karena menjaga kualitas warna dan font secara akurat. Jika Anda memiliki banyak file, kompres menjadi .ZIP atau .RAR.",
  },
  {
    id: 2,
    cat: "desain",
    q: "Berapa resolusi file desain yang dibutuhkan?",
    a: "Minimal 300 dpi (dots per inch) untuk hasil cetak yang tajam dan jernih. File dengan resolusi di bawah 150 dpi berisiko menghasilkan cetakan yang buram atau pixelated. Untuk banner atau spanduk besar, resolusi 72–150 dpi sudah cukup karena dilihat dari jarak jauh.",
  },
  {
    id: 3,
    cat: "desain",
    q: "Apakah saya bisa minta bantuan desain?",
    a: "Ya! Kami menyediakan jasa desain grafis profesional dengan biaya tambahan. Hubungi CS kami melalui WhatsApp dan sampaikan konsep atau referensi yang Anda inginkan. Tim desainer kami siap membantu.",
  },
  {
    id: 4,
    cat: "desain",
    q: "Apa itu bleed area dan mengapa penting?",
    a: "Bleed area adalah area tambahan di luar batas potong desain (biasanya 3–5mm di setiap sisi). Ini penting agar tidak ada garis putih yang muncul di pinggir hasil cetak akibat pergeseran saat proses pemotongan. Pastikan desain Anda sudah menyertakan bleed area.",
  },
  {
    id: 5,
    cat: "desain",
    q: "Mode warna apa yang sebaiknya digunakan — RGB atau CMYK?",
    a: "Gunakan mode warna CMYK untuk hasil cetak yang paling akurat. Mesin cetak kami menggunakan sistem warna CMYK, sehingga file RGB akan dikonversi secara otomatis dan bisa menyebabkan sedikit pergeseran warna. Untuk warna yang paling presisi, konversi ke CMYK sebelum upload.",
  },
  // Produk
  {
    id: 6,
    cat: "produk",
    q: "Produk apa saja yang tersedia di PrinOra?",
    a: "Kami menyediakan berbagai produk cetak: Kartu Nama, Brosur, Flyer, Poster, Banner/Spanduk, Stiker, Kalender, Nota & Kwitansi, Undangan, Packaging, dan masih banyak lagi. Kunjungi halaman Produk untuk daftar lengkapnya.",
  },
  {
    id: 7,
    cat: "produk",
    q: "Apakah ada minimum order?",
    a: "Minimum order berbeda untuk setiap produk. Sebagai contoh, kartu nama minimal 100 lembar, sedangkan banner bisa dipesan mulai 1 pcs. Detail minimum order tertera di halaman masing-masing produk saat memilih spesifikasi.",
  },
  {
    id: 8,
    cat: "produk",
    q: "Berapa lama waktu produksi?",
    a: "Waktu produksi umumnya 1–3 hari kerja setelah pembayaran dan file desain dikonfirmasi. Produk custom atau jumlah besar bisa memerlukan waktu 3–7 hari kerja. Estimasi waktu selalu tertera saat checkout.",
  },
  {
    id: 9,
    cat: "produk",
    q: "Apakah harga sudah termasuk ongkos kirim?",
    a: "Belum. Harga yang tertera adalah harga produksi saja. Ongkos kirim dihitung terpisah saat checkout: Pesan Antar dalam kota Rp 20.000, atau Ambil di Toko gratis tanpa biaya tambahan.",
  },
  // Pembayaran
  {
    id: 10,
    cat: "pembayaran",
    q: "Metode pembayaran apa yang tersedia?",
    a: "Kami menerima Transfer Bank (BCA, Mandiri, BRI, BNI) dan QRIS yang bisa dipindai dari semua aplikasi dompet digital dan mobile banking.",
  },
  {
    id: 11,
    cat: "pembayaran",
    q: "Berapa batas waktu pembayaran setelah order?",
    a: "Pembayaran harus dilakukan maksimal 1×24 jam setelah order dibuat. Jika melewati batas waktu, pesanan akan otomatis dibatalkan dan Anda perlu membuat order baru.",
  },
  {
    id: 12,
    cat: "pembayaran",
    q: "Apakah ada biaya tambahan atau pajak?",
    a: "Harga yang tertera di website sudah final (sudah termasuk PPN jika berlaku). Tidak ada biaya tersembunyi. Anda hanya membayar harga produk + ongkos kirim yang sudah tertera saat checkout.",
  },
  {
    id: 13,
    cat: "pembayaran",
    q: "Bagaimana cara upload bukti pembayaran?",
    a: "Setelah melakukan transfer, masuk ke menu 'Pesanan Saya', pilih pesanan yang bersangkutan, lalu klik 'Upload Bukti Bayar'. Upload foto atau screenshot struk transfer Anda. Tim kami akan memverifikasi dalam 1–2 jam pada jam kerja.",
  },
  // Pengiriman
  {
    id: 14,
    cat: "pengiriman",
    q: "Apakah tersedia pengiriman ke luar kota?",
    a: "Saat ini layanan Pesan Antar hanya tersedia dalam kota. Untuk pengiriman ke luar kota, Anda bisa memilih opsi Ambil di Toko kemudian mengirimkan sendiri menggunakan ekspedisi pilihan Anda (JNE, J&T, SiCepat, dll).",
  },
  {
    id: 15,
    cat: "pengiriman",
    q: "Kapan pesanan saya akan dikirim?",
    a: "Pesanan akan dikirim setelah proses produksi selesai. Anda akan mendapat notifikasi melalui WhatsApp atau email ketika pesanan sudah dikirim, beserta estimasi waktu tiba.",
  },
  {
    id: 16,
    cat: "pengiriman",
    q: "Bagaimana jika produk rusak saat pengiriman?",
    a: "Jika produk rusak dalam pengiriman, segera foto kondisi paket dan produk, lalu hubungi CS kami dalam 1×24 jam setelah barang diterima. Kami akan mengevaluasi dan memberikan solusi terbaik termasuk penggantian produk.",
  },
  // Revisi
  {
    id: 17,
    cat: "revisi",
    q: "Apakah bisa revisi setelah file dikirim?",
    a: "Revisi file bisa dilakukan sebelum proses produksi dimulai. Jika produksi sudah berjalan, revisi tidak bisa dilakukan. Segera hubungi CS jika ingin melakukan perubahan file setelah order.",
  },
  {
    id: 18,
    cat: "revisi",
    q: "Bagaimana jika hasil cetak tidak sesuai pesanan?",
    a: "Jika ada ketidaksesuaian dari pihak kami (salah ukuran, salah bahan, atau cacat produksi), kami akan mencetak ulang tanpa biaya tambahan. Hubungi CS kami dengan menyertakan foto produk dalam 1×24 jam setelah barang diterima.",
  },
  {
    id: 19,
    cat: "revisi",
    q: "Apakah ada garansi kualitas cetak?",
    a: "Ya! Kami berkomitmen pada kualitas. Jika ada cacat produksi dari mesin atau bahan yang tidak sesuai spesifikasi yang dipesan, kami tanggung jawab penuh dengan mencetak ulang. Namun, perbedaan warna layar (monitor) dengan hasil cetak adalah hal normal karena perbedaan mode warna RGB vs CMYK.",
  },
  // Lainnya
  {
    id: 20,
    cat: "lainnya",
    q: "Apakah bisa minta sampel cetak sebelum order banyak?",
    a: "Ya, kami melayani cetak sampel (proof print) dengan biaya tambahan. Ini sangat disarankan untuk order dalam jumlah besar atau produk dengan spesifikasi khusus agar Anda bisa melihat hasil cetak sebelum produksi massal.",
  },
  {
    id: 21,
    cat: "lainnya",
    q: "Jam operasional PrinOra?",
    a: "Kami beroperasi Senin–Sabtu pukul 08.00–17.00 WIB. CS kami melayani pertanyaan melalui WhatsApp pada jam yang sama. Pesanan online bisa dilakukan 24 jam, namun akan diproses pada hari kerja berikutnya.",
  },
  {
    id: 22,
    cat: "lainnya",
    q: "Bagaimana cara memantau status pesanan?",
    a: "Login ke akun Anda, lalu buka menu 'Pesanan Saya'. Di sana Anda bisa melihat status terkini: Menunggu Pembayaran → Diverifikasi → Dalam Produksi → Siap Kirim → Selesai.",
  },
];

const contacts = [
  { label: "Customer Service 1", number: "08985636138" },
  { label: "Customer Service 2", number: "083838782742" },
];

export default function FAQ() {
  const [activecat, setActiveCat] = useState("semua");
  const [openId, setOpenId] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = faqs.filter((f) => {
    const matchCat = activecat === "semua" || f.cat === activecat;
    const matchSearch =
      search.trim() === "" ||
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const toggle = (id) => setOpenId(openId === id ? null : id);

  return (
    <>
      <Breadcrumb title="FAQ" pages={["faq"]} />

      <section className="faq-section">
        <div className="faq-container">

          {/* ── Hero ── */}
          <div className="faq-hero">
            <h1 className="faq-hero-title">Pertanyaan yang Sering Ditanyakan</h1>
            <p className="faq-hero-sub">
              Temukan jawaban atas pertanyaan umum seputar produk, desain, pembayaran, dan pengiriman.
            </p>

            {/* Search */}
            <div className="faq-search-wrap">
              <Search size={18} className="faq-search-icon" />
              <input
                className="faq-search"
                type="text"
                placeholder="Cari pertanyaan, misal: format file, waktu produksi..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setOpenId(null); }}
              />
              {search && (
                <button className="faq-search-clear" onClick={() => setSearch("")}>✕</button>
              )}
            </div>
          </div>

          {/* ── Category Pills ── */}
          <div className="faq-cats">
            {categories.map((c) => {
              const Icon = c.icon;
              return (
                <button
                  key={c.id}
                  onClick={() => { setActiveCat(c.id); setOpenId(null); }}
                  className={`faq-cat-btn ${activecat === c.id ? "faq-cat-btn--active" : ""}`}
                >
                  {Icon && <Icon size={15} />}
                  {c.label}
                </button>
              );
            })}
          </div>

          {/* ── Results count ── */}
          <p className="faq-count">
            {filtered.length} pertanyaan ditemukan
            {search && <> untuk "<strong>{search}</strong>"</>}
          </p>

          {/* ── Accordion ── */}
          <div className="faq-list">
            {filtered.length === 0 ? (
              <div className="faq-empty">
                <p>Tidak ada hasil yang cocok.</p>
                <button className="faq-reset" onClick={() => { setSearch(""); setActiveCat("semua"); }}>
                  Reset pencarian
                </button>
              </div>
            ) : (
              filtered.map((f) => (
                <div
                  key={f.id}
                  className={`faq-item ${openId === f.id ? "faq-item--open" : ""}`}
                >
                  <button className="faq-q" onClick={() => toggle(f.id)}>
                    <span className="faq-q-text">{f.q}</span>
                    <span className={`faq-chevron ${openId === f.id ? "faq-chevron--open" : ""}`}>
                      <ChevronDown size={18} />
                    </span>
                  </button>
                  {openId === f.id && (
                    <div className="faq-a">
                      <p>{f.a}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* ── Contact Banner ── */}
          <div className="faq-contact">
            <div className="faq-contact-left">
              <h3 className="faq-contact-title">Tidak menemukan jawaban yang kamu cari?</h3>
              <p className="faq-contact-sub">Tim CS kami siap membantu Senin–Sabtu, 08.00–17.00 WIB</p>
            </div>
            <div className="faq-contact-numbers">
              {contacts.map((c) => (
                <a
                  key={c.label}
                  href={`https://wa.me/62${c.number.replace(/^0/, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="faq-contact-item"
                >
                  <Phone size={14} className="faq-wa-icon" />
                  <div>
                    <span className="faq-contact-label">{c.label}</span>
                    <strong className="faq-contact-num">{c.number}</strong>
                  </div>
                </a>
              ))}
            </div>
          </div>

        </div>
      </section>

      <style>{`
        .faq-section {
          padding: 64px 0 80px;
          background: #f5f7fa;
          font-family: 'Inter', 'Segoe UI', sans-serif;
        }
        .faq-container {
          max-width: 1140px;
          margin: 0 auto;
          padding: 0 20px;
        }

        /* Hero */
        .faq-hero {
          text-align: center;
          margin-bottom: 36px;
        }
        .faq-eyebrow {
          display: inline-block;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #1d4ed8;
          background: #dbeafe;
          padding: 4px 14px;
          border-radius: 100px;
          margin-bottom: 14px;
        }
        .faq-hero-title {
          font-size: 30px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 10px;
          letter-spacing: -0.02em;
        }
        .faq-hero-sub {
          font-size: 15px;
          color: #64748b;
          margin: 0 0 24px;
          line-height: 1.6;
        }

        /* Search */
        .faq-search-wrap {
          position: relative;
          max-width: 560px;
          margin: 0 auto;
        }
        .faq-search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
        }
        .faq-search {
          width: 100%;
          padding: 14px 44px 14px 46px;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          font-size: 14px;
          color: #0f172a;
          background: #fff;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          box-sizing: border-box;
        }
        .faq-search:focus {
          border-color: #1d4ed8;
          box-shadow: 0 0 0 3px rgba(29,78,216,0.1);
        }
        .faq-search-clear {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          border: none;
          background: none;
          color: #94a3b8;
          font-size: 14px;
          cursor: pointer;
          padding: 4px;
        }
        .faq-search-clear:hover { color: #475569; }

        /* Category pills */
        .faq-cats {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 16px;
        }
        .faq-cat-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 16px;
          border-radius: 100px;
          border: 1.5px solid #e2e8f0;
          background: #fff;
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          cursor: pointer;
          transition: all 0.15s;
        }
        .faq-cat-btn:hover {
          border-color: #93c5fd;
          color: #1d4ed8;
        }
        .faq-cat-btn--active {
          background: #1d4ed8;
          border-color: #1d4ed8;
          color: #fff;
        }

        /* Count */
        .faq-count {
          font-size: 13px;
          color: #94a3b8;
          margin: 0 0 20px;
        }

        /* Accordion */
        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 48px;
        }
        .faq-item {
          background: #fff;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .faq-item--open {
          border-color: #1d4ed8;
          box-shadow: 0 0 0 3px rgba(29,78,216,0.07);
        }
        .faq-q {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 18px 20px;
          border: none;
          background: none;
          cursor: pointer;
          text-align: left;
        }
        .faq-q-text {
          font-size: 14.5px;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.45;
          flex: 1;
        }
        .faq-item--open .faq-q-text {
          color: #1d4ed8;
        }
        .faq-chevron {
          flex-shrink: 0;
          color: #94a3b8;
          transition: transform 0.2s;
          display: flex;
        }
        .faq-chevron--open {
          transform: rotate(180deg);
          color: #1d4ed8;
        }
        .faq-a {
          padding: 0 20px 18px;
          border-top: 1px solid #f1f5f9;
        }
        .faq-a p {
          margin: 14px 0 0;
          font-size: 14px;
          color: #475569;
          line-height: 1.7;
        }

        /* Empty */
        .faq-empty {
          text-align: center;
          padding: 48px 0;
          color: #94a3b8;
          font-size: 14px;
        }
        .faq-reset {
          margin-top: 12px;
          padding: 8px 20px;
          border-radius: 8px;
          border: 1.5px solid #e2e8f0;
          background: #fff;
          font-size: 13px;
          font-weight: 600;
          color: #1d4ed8;
          cursor: pointer;
        }
        .faq-reset:hover { background: #eff6ff; }

        /* Contact */
        .faq-contact {
          background: linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%);
          border-radius: 16px;
          padding: 28px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
        }
        .faq-contact-title {
          font-size: 16px;
          font-weight: 800;
          color: #fff;
          margin: 0 0 4px;
        }
        .faq-contact-sub {
          font-size: 13px;
          color: #93c5fd;
          margin: 0;
        }
        .faq-contact-numbers {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .faq-contact-item {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 10px;
          padding: 10px 16px;
          text-decoration: none;
          transition: background 0.15s;
        }
        .faq-contact-item:hover { background: rgba(255,255,255,0.18); }
        .faq-wa-icon { color: #93c5fd; flex-shrink: 0; }
        .faq-contact-label {
          display: block;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #93c5fd;
          margin-bottom: 2px;
        }
        .faq-contact-num {
          display: block;
          font-size: 13.5px;
          font-weight: 800;
          color: #fff;
        }
      `}</style>
    </>
  );
}