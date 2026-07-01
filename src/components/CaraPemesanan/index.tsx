"use client";
import React, { useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import {
  User,
  ShoppingCart,
  FileText,
  Truck,
  CreditCard,
  CheckCircle,
  ChevronRight,
  Phone,
} from "lucide-react";

const steps = [
  {
    id: "Akun",
    number: "01",
    title: "Login & Daftar Akun",
    icon: User,
    items: [
      <>Buka website <strong>www.prinora.store</strong> di browser Anda.</>,
      <>Klik <strong>"Daftar"</strong> di pojok kanan atas jika belum punya akun.</>,
      <>Isi data diri: Nama, Email, No HP, Alamat, dan Password.</>,
      <>Klik tombol <strong>"Sign in"</strong> agar data tersimpan otomatis.</>,
      <>Setelah berhasil <strong>login</strong>, pengguna akan diarahkan ke halaman beranda.</>,
    ],
    tip: "Pastikan data akun yang dimasukkan sudah benar agar proses pemesanan berjalan lancar.",
  },
  {
    id: "Pesanan",
    number: "02",
    title: "Pilih Produk & Spesifikasi",
    icon: ShoppingCart,
    items: [
      "Pilih kategori produk di beranda (Brosur, Kartu Nama, Banner, Sticker, dll).",
      "Klik produk yang diinginkan untuk melihat detail lengkapnya.",
      "Pilih spesifikasi: ukuran, bahan, jumlah, dan jenis cetak (1 atau 2 sisi).",
      "Harga akan otomatis terhitung sesuai pilihan Anda.",
    ],
    tip: "Pilih spesifikasi dengan teliti karena setiap pilihan dapat memengaruhi harga dan hasil cetak."
  },
  {
    id: "Desain",
    number: "03",
    title: "Upload File Desain",
    icon: FileText,
    items: [
      <>Jika sudah memiliki desain, klik tombol <strong>"Upload File"</strong> kemudian unggah file desain dari perangkat Anda.</>,
      <>Jika ingin menggunakan jasa desain, pilih opsi <strong>"Butuh Desain</strong> dan unggah file pendukung seperti logo atau gambar referensi yang diperlukan (opsional).</>,
      <>Tuliskan instruksi atau konsep desain pada kolom catatan untuk membantu tim desain memahami kebutuhan Anda.</>,
      <>Format disarankan: <strong>PDF</strong> (terbaik), JPG, PNG, atau AI/CDR.</>,
      "Jika file banyak, kompres terlebih dahulu menjadi format .ZIP atau .RAR.",
    ],
    tip: "Berikan referensi dan instruksi yang jelas agar hasil desain sesuai dengan kebutuhan Anda."
  },
  {
    id: "Order",
    number: "04",
    title: "Checkout & Pengiriman",
    icon: Truck,
    items: [
      "Review kembali produk di keranjang belanja sebelum melanjutkan.",
      <>Pilih metode pengiriman: <strong>Pesan Antar</strong>atau <strong>Ambil di Toko</strong> (Gratis).</>,
      "Ongkos kirim akan otomatis ditambahkan ke total tagihan Anda.",
    ],
    tip: "Periksa kembali detail pesanan untuk menghindari kesalahan sebelum checkout."
  },
  {
    id: "Pembayaran",
    number: "05",
    title: "Pembayaran & Verifikasi",
    icon: CreditCard,
    items: [
      "Pilih metode pembayaran: Transfer Bank atau QRIS.",
      "Lakukan pembayaran maksimal dalam 1×24 jam.",
      "Upload bukti transfer agar tim kami segera memproses pesanan.",
      <>Pantau status pesanan kapan saja di menu <strong>"Pesanan Saya"</strong>.</>,
    ],
    tip: "Lakukan pembayaran sebelum batas waktu agar pesanan tidak dibatalkan secara otomatis."
  },
];

const contacts = [
  { label: "Customer Service 1", number: "08985636138" },
  { label: "Customer Service 2", number: "083838782742" },
];

const CaraPemesanan = () => {
  const [active, setActive] = useState("Akun");
  const current = steps.find((s) => s.id === active);
  const Icon = current.icon;

  return (
    <>
      <Breadcrumb title="Cara Pemesanan" pages={["cara-pemesanan"]} />

      <section className="cp-section">
        <div className="cp-container">
          <div className="cp-progress">
            {steps.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`cp-prog-step ${active === s.id ? "cp-prog-step--active" : ""}`}
              >
                <span className="cp-prog-num">{s.number}</span>
                <span className="cp-prog-label">{s.title}</span>
                {i < steps.length - 1 && (
                  <ChevronRight className="cp-prog-arrow" size={14} />
                )}
              </button>
            ))}
          </div>

          {/* ── Main Content ── */}
          <div className="cp-body">


            {/* Detail Panel */}
            <div className="cp-panel">
              {/* Panel header */}
              <div className="cp-panel-head">
                <div className="cp-panel-icon-wrap">
                  <Icon size={24} color="#fff" />
                </div>
                <div>
                  <h3 className="cp-panel-title">{current.title}</h3>
                </div>
              </div>

              {/* Steps list */}
              <ul className="cp-list">
                {current.items.map((item, idx) => (
                  <li key={idx} className="cp-list-item">
                    <CheckCircle size={18} className="cp-list-icon" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {/* Tip */}
              <div className="cp-tip">
                <span className="cp-tip-badge">Tips</span>
                <p className="cp-tip-text">
                  {/* Mengambil nilai tip dari objek 'current' yang sedang aktif */}
                  {current.tip}
                </p>
              </div>

              {/* Step navigation */}
              <div className="cp-step-nav">
                {steps.findIndex(s => s.id === active) > 0 && (
                  <button
                    className="cp-btn cp-btn--ghost"
                    onClick={() => {
                      const idx = steps.findIndex(s => s.id === active);
                      setActive(steps[idx - 1].id);
                    }}
                  >
                    ← Sebelumnya
                  </button>
                )}
                {steps.findIndex(s => s.id === active) < steps.length - 1 && (
                  <button
                    className="cp-btn cp-btn--primary"
                    onClick={() => {
                      const idx = steps.findIndex(s => s.id === active);
                      setActive(steps[idx + 1].id);
                    }}
                  >
                    Langkah Berikutnya →
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── Contact Banner ── */}
          <div className="cp-contact">
            <div className="cp-contact-text">
              <Phone size={20} className="cp-contact-icon" />
              <span>Butuh bantuan? Hubungi Customer Service kami</span>
            </div>
            <div className="cp-contact-numbers">
              {contacts.map((c) => (
                <a
                  key={c.label}
                  href={`https://wa.me/62${c.number.replace(/^0/, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cp-contact-item"
                >
                  <span className="cp-contact-label">{c.label}</span>
                  <strong className="cp-contact-num">{c.number}</strong>
                </a>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── Scoped Styles ── */}
      <style>{`
        /* ─── Layout ─────────────────────────────── */
        .cp-section {
          padding: 64px 0 80px;
          background: #f5f7fa;
          font-family: 'Inter', 'Segoe UI', sans-serif;
        }
        .cp-container {
          max-width: 1140px;
          margin: 0 auto;
          padding: 0 20px;
        }

        /* ─── Header ─────────────────────────────── */
        .cp-header {
          text-align: center;
          margin-bottom: 44px;
        }
        .cp-eyebrow {
          display: inline-block;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #1d4ed8;
          background: #dbeafe;
          padding: 4px 14px;
          border-radius: 100px;
          margin-bottom: 14px;
        }
        .cp-title {
          font-size: 28px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 10px;
          letter-spacing: -0.02em;
        }
        .cp-subtitle {
          font-size: 15px;
          color: #64748b;
          max-width: 480px;
          margin: 0 auto;
          line-height: 1.6;
        }

        /* ─── Progress Strip ─────────────────────── */
        .cp-progress {
          display: flex;
          align-items: center;
          gap: 0;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 6px;
          margin-bottom: 28px;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .cp-progress::-webkit-scrollbar { display: none; }
        .cp-prog-step {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 14px;
          border-radius: 8px;
          border: none;
          background: transparent;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.15s;
          flex-shrink: 0;
        }
        .cp-prog-step:hover { background: #f1f5f9; }
        .cp-prog-step--active { background: #1d4ed8 !important; }
        .cp-prog-step--active .cp-prog-num,
        .cp-prog-step--active .cp-prog-label { color: #fff; }
        .cp-prog-num {
          font-size: 11px;
          font-weight: 700;
          color: #94a3b8;
        }
        .cp-prog-label {
          font-size: 13px;
          font-weight: 600;
          color: #475569;
        }
        .cp-prog-arrow {
          color: #cbd5e1;
          margin-left: 4px;
        }

        /* ─── Body ───────────────────────────────── */
        .cp-body {
          display: flex;
          gap: 24px;
          align-items: flex-start;
        }
        @media (max-width: 768px) {
          .cp-body { flex-direction: column; }
        }

        /* ─── Sidebar ─────────────────────────────── */
        .cp-sidebar {
          width: 260px;
          flex-shrink: 0;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        @media (max-width: 768px) {
          .cp-sidebar { width: 100%; flex-direction: row; flex-wrap: wrap; }
        }
        .cp-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 14px;
          border-radius: 9px;
          border: none;
          background: transparent;
          cursor: pointer;
          text-align: left;
          transition: all 0.15s;
          width: 100%;
        }
        .cp-nav-item:hover { background: #f8fafc; }
        .cp-nav-item--active { background: #eff6ff; }
        .cp-nav-num {
          font-size: 11px;
          font-weight: 700;
          color: #94a3b8;
          width: 24px;
          flex-shrink: 0;
        }
        .cp-nav-num--active { color: #1d4ed8; }
        .cp-nav-icon { color: #94a3b8; flex-shrink: 0; }
        .cp-nav-item--active .cp-nav-icon { color: #1d4ed8; }
        .cp-nav-text {
          flex: 1;
          font-size: 13.5px;
          font-weight: 600;
          color: #475569;
        }
        .cp-nav-item--active .cp-nav-text { color: #1d4ed8; }
        .cp-nav-chevron { color: #1d4ed8; flex-shrink: 0; }

        /* ─── Panel ───────────────────────────────── */
        .cp-panel {
          flex: 1;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 32px;
        }
        .cp-panel-head {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 28px;
          padding-bottom: 24px;
          border-bottom: 1px solid #f1f5f9;
        }
        .cp-panel-icon-wrap {
          width: 52px;
          height: 52px;
          background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(29,78,216,0.25);
        }
        .cp-panel-step-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #1d4ed8;
          margin: 0 0 4px;
        }
        .cp-panel-title {
          font-size: 20px;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.01em;
        }

        /* ─── List ────────────────────────────────── */
        .cp-list {
          list-style: none;
          margin: 0 0 28px;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .cp-list-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          font-size: 14.5px;
          color: #334155;
          line-height: 1.6;
        }
        .cp-list-icon {
          color: #1d4ed8;
          flex-shrink: 0;
          margin-top: 2px;
        }

        /* ─── Tip ─────────────────────────────────── */
        .cp-tip {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          background: #eff6ff;
          border-left: 3px solid #1d4ed8;
          border-radius: 0 10px 10px 0;
          padding: 14px 18px;
          margin-bottom: 28px;
        }
        .cp-tip-badge {
          flex-shrink: 0;
          font-size: 10.5px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #1d4ed8;
          background: #dbeafe;
          padding: 3px 8px;
          border-radius: 6px;
          margin-top: 1px;
        }
        .cp-tip-text {
          font-size: 13.5px;
          color: #1e40af;
          line-height: 1.55;
          margin: 0;
        }

        /* ─── Step nav ────────────────────────────── */
        .cp-step-nav {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }
        .cp-btn {
          padding: 10px 22px;
          border-radius: 9px;
          font-size: 13.5px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s;
          border: none;
        }
        .cp-btn--primary {
          background: #1d4ed8;
          color: #fff;
        }
        .cp-btn--primary:hover { background: #1e40af; }
        .cp-btn--ghost {
          background: #f1f5f9;
          color: #475569;
        }
        .cp-btn--ghost:hover { background: #e2e8f0; }

        /* ─── Contact Banner ─────────────────────── */
        .cp-contact {
          margin-top: 36px;
          background: linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%);
          border-radius: 16px;
          padding: 28px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
        }
        .cp-contact-text {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #bfdbfe;
          font-size: 14px;
          font-weight: 600;
        }
        .cp-contact-icon { color: #93c5fd; flex-shrink: 0; }
        .cp-contact-numbers {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .cp-contact-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 10px;
          padding: 10px 20px;
          text-decoration: none;
          transition: background 0.15s;
          cursor: pointer;
        }
        .cp-contact-item:hover { background: rgba(255,255,255,0.18); }
        .cp-contact-label {
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #93c5fd;
          margin-bottom: 3px;
        }
        .cp-contact-num {
          font-size: 14px;
          font-weight: 800;
          color: #fff;
          letter-spacing: 0.02em;
        }
      `}</style>
    </>
  );
};

export default CaraPemesanan;