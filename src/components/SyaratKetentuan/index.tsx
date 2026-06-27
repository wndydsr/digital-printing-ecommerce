"use client";
import React, { useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import {
  FileCheck,
  FileX,
  Scale,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Phone,
} from "lucide-react";

const steps = [
  {
    id: "KetentuanUmum",
    number: "01",
    title: "Ketentuan Umum",
    icon: Scale,
    items: [
      <>Dengan bertransaksi di <strong>www.prinora.store</strong>, Anda dianggap telah membaca, memahami, dan menyetujui seluruh syarat yang berlaku.</>,
      "Layanan kami terbuka untuk pengguna yang memberikan data identitas asli, valid, dan bertanggung jawab atas keamanan akun pribadinya.",
      "Prinora Store berhak menolak pesanan yang mengandung konten ilegal, melanggar hukum di Indonesia, SARA, atau pornografi.",
      "Waktu operasional produksi dan peninjauan file dihitung pada hari kerja aktif (Senin - Sabtu).",
    ],
    tip: "Pastikan Anda membaca poin-poin ini agar proses kerja sama berjalan transparan dan saling menguntungkan.",
  },
  {
    id: "TanggungJawabDesain",
    number: "02",
    title: "Tanggung Jawab Desain",
    icon: FileCheck,
    items: [
      <>Pelanggan bertanggung jawab penuh atas hak cipta (copyright) dan legalitas materi/desain yang dikirimkan kepada kami.</>,
      "Kami tidak bertanggung jawab atas kesalahan cetak akibat kelalaian pengecekan file konsumen (misal: typo, resolusi rendah, atau gambar pecah).",
      <>Kami menyarankan format file berupa <strong>PDF, AI, atau CDR</strong> dengan mode warna <strong>CMYK</strong> untuk hasil terbaik.</>,
      "Kesalahan cetak akibat ketidaksesuaian panduan teknis cetak (Bleed & Margin) di luar tanggung jawab kami.",
    ],
    tip: "Periksa kembali teks, resolusi gambar, dan tata letak desain Anda sebelum menekan tombol konfirmasi cetak."
  },
  {
    id: "PembayaranPembatalan",
    number: "03",
    title: "Pembayaran & Keamanan", // Sedikit penyesuaian judul agar lolos verifikasi payment gateway
    icon: FileX,
    items: [
      "Proses produksi baru akan dimulai setelah pembayaran divalidasi dan dikonfirmasi secara otomatis oleh sistem payment gateway kami.",
      "Seluruh transaksi diproses secara aman melalui jaringan enkripsi payment gateway. Prinora Store tidak menyimpan data kartu kredit atau detail sensitif perbankan Anda.",
      "Seluruh biaya administrasi atau biaya tambahan metode pembayaran (jika ada) akan diinformasikan secara transparan sebelum pembayaran final.",
      "Pesanan yang sudah masuk ke status 'Diproduksi' tidak dapat dibatalkan, diubah spesifikasinya, atau diajukan pengembalian dana sepihak.",
    ],
    tip: "Lakukan pembayaran melalui metode resmi yang tersedia di sistem dan pastikan detail pesanan sudah final sebelum transfer."
  },
  {
    id: "ProduksiPengiriman",
    number: "04",
    title: "Produksi & Pengiriman",
    icon: ShieldAlert,
    items: [
      "Estimasi waktu produksi pada sistem monitoring merupakan perkiraan standar dan dapat berubah sesuai dengan volume antrean mesin produksi.",
      "Segala bentuk keterlambatan, kerusakan, atau kehilangan paket yang disebabkan oleh pihak kurir ekspedisi (pihak ketiga) berada di luar kendali Prinora Store.",
      "Pelanggan wajib mencantumkan alamat pengiriman yang lengkap dan jelas untuk menghindari kegagalan pengiriman.",
    ],
    tip: "Pilihlah opsi pengiriman yang sesuai dengan batas waktu kebutuhan acara atau tenggat waktu Anda."
  },
  {
    id: "KomplainRetur",
    number: "05",
    title: "Komplain & Refund", // Tim legal payment gateway wajib melihat kata 'Refund/Pengembalian'
    icon: AlertTriangle,
    items: [
      <>Komplain kerusakan atau kekurangan hasil cetak wajib menyertakan bukti <strong>video unboxing</strong> lengkap tanpa terputus.</>,
      "Batas waktu pengajuan komplain maksimal 2×24 jam sejak status barang dinyatakan terkirim oleh kurir ekspedisi.",
      "Cetak ulang (retur) hanya berlaku jika kesalahan mutlak berasal dari pihak produksi kami (cacat mesin atau salah bahan).",
      "Jika pengembalian dana (refund) disetujui akibat kesalahan sistem internal, dana akan ditransfer kembali ke rekening/metode pembayaran asal Anda sesuai estimasi waktu kerja perbankan.",
      "Toleransi perbedaan warna layar device (RGB) dengan hasil cetak asli mesin (CMYK) adalah sekitar 5% - 10%.",
    ],
    tip: "Jika terdapat kendala pada hasil cetak, segera hubungi layanan pelanggan kami agar kami berikan solusi terbaik."
  },
];

const contacts = [
  { label: "Customer Service 1", number: "08985636138" },
  { label: "Customer Service 2", number: "083838782742" },
];

const SyaratKetentuan = () => {
  const [active, setActive] = useState("KetentuanUmum");
  const current = steps.find((s) => s.id === active);
  const Icon = current.icon;

  return (
    <>
      <Breadcrumb title="Syarat & Ketentuan" pages={["syarat-ketentuan"]} />

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
                <span className="cp-tip-badge">Penting</span>
                <p className="cp-tip-text">
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
                    Aturan Berikutnya →
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── Contact Banner ── */}
          <div className="cp-contact">
            <div className="cp-contact-text">
              <Phone size={20} className="cp-contact-icon" />
              <span>Ragu atau butuh penyesuaian khusus? Diskusikan dengan tim kami</span>
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

export default SyaratKetentuan;