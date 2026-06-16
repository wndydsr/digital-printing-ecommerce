"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

const PaymentContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const amount = searchParams.get("amount") || "0";
  
  const [paymentMethod, setPaymentMethod] = useState("qris");
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60); // 24 jam dalam detik

  // State untuk Upload Bukti
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Format Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")} : ${m.toString().padStart(2, "0")} : ${s.toString().padStart(2, "0")}`;
  };

  // Handler untuk memilih file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  // Handler untuk submit bukti
  const handleUploadSubmit = () => {
    if (!file) {
      alert("Pilih gambar bukti pembayaran terlebih dahulu!");
      return;
    }
    
    setIsUploading(true);
    
    // Simulasi proses upload (Nanti diganti dengan fetch API ke backend Laravel)
    setTimeout(() => {
      setIsUploading(false);
      alert("Bukti pembayaran berhasil diunggah! Pesanan Anda akan segera diproses.");
      router.push("/my-account?tab=orders"); // Arahkan ke sini!
      // Di sini bisa ditambahkan router.push('/order-success') atau ke dashboard akun
    }, 1500);
  };

  return (
    <section className="py-20 bg-gray-2 min-h-screen flex items-center justify-center mt-10">
      {/* 🔥 Diperlebar menjadi max-w-[900px] agar pas di Desktop */}
      <div className="max-w-[900px] w-full mx-auto px-4">
        <div className="bg-white shadow-1 rounded-[10px] p-6 sm:p-10 text-center">
          
          <h2 className="text-2xl sm:text-3xl font-bold text-dark mb-2">Menunggu Pembayaran</h2>
          <p className="text-gray-500 mb-6">Selesaikan pembayaran Anda dalam waktu:</p>
          
          {/* Timer */}
          <div className="inline-block bg-red-50 text-red-500 font-bold text-2xl px-8 py-3 rounded-lg mb-8">
            {formatTime(timeLeft)}
          </div>

          <div className="border-b border-gray-3 pb-6 mb-8">
            <p className="text-sm text-gray-500 mb-1">Total yang harus dibayar</p>
            <p className="text-4xl font-black text-blue">
              Rp {Number(amount).toLocaleString("id-ID")}
            </p>
          </div>

          {/* 🔥 Layout Grid 2 Kolom untuk Desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left">
            
            {/* --- KOLOM KIRI: INSTRUKSI PEMBAYARAN --- */}
            <div>
              <h3 className="font-bold text-dark mb-4">1. Pilih Metode Pembayaran</h3>
              
              {/* Tab Pemilihan Metode */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setPaymentMethod("qris")}
                  className={`flex-1 py-2.5 font-medium rounded-md transition-all ${
                    paymentMethod === "qris" ? "bg-blue text-white" : "bg-gray-100 text-dark hover:bg-gray-200"
                  }`}
                >
                  QRIS
                </button>
                <button
                  onClick={() => setPaymentMethod("transfer")}
                  className={`flex-1 py-2.5 font-medium rounded-md transition-all ${
                    paymentMethod === "transfer" ? "bg-blue text-white" : "bg-gray-100 text-dark hover:bg-gray-200"
                  }`}
                >
                  Transfer Bank
                </button>
              </div>

              {/* Konten Metode Pembayaran */}
              {paymentMethod === "qris" ? (
                <div className="animate-fade-in bg-gray-50 p-5 rounded-lg border border-gray-200 text-center">
                  <p className="text-sm text-gray-500 mb-4">Scan QR code di bawah ini menggunakan aplikasi M-Banking atau E-Wallet (Gopay, OVO, Dana).</p>
                  <div className="inline-block p-3 border border-gray-300 bg-white rounded-xl shadow-sm">
                    <Image src="/images/payment/image.png" alt="QRIS" width={200} height={200} className="rounded-lg" />
                  </div>
                </div>
              ) : (
                <div className="animate-fade-in space-y-3">
                  <p className="text-sm text-gray-500 mb-2">Transfer tepat sesuai nominal ke salah satu rekening berikut:</p>
                  
                  <div className="bg-white p-4 rounded-lg border border-gray-200 flex justify-between items-center shadow-sm">
                    <div>
                      <p className="font-bold text-dark">BNI</p>
                      <p className="text-sm text-gray-600">1787965251 <br/> a.n Windy Destiana Sari</p>
                    </div>
                    <button className="text-blue bg-blue/10 px-3 py-1 rounded text-xs font-medium hover:bg-blue/20">Salin</button>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-200 flex justify-between items-center shadow-sm">
                    <div>
                      <p className="font-bold text-dark">SuperBank</p>
                      <p className="text-sm text-gray-600">000038824819 <br/> a.n Nihlah Mutiara Taslimah</p>
                    </div>
                    <button className="text-blue bg-blue/10 px-3 py-1 rounded text-xs font-medium hover:bg-blue/20">Salin</button>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-200 flex justify-between items-center shadow-sm">
                    <div>
                      <p className="font-bold text-dark">SeaBank</p>
                      <p className="text-sm text-gray-600">901029456191 <br/> a.n Windy Destiana Sari</p>
                    </div>
                    <button className="text-blue bg-blue/10 px-3 py-1 rounded text-xs font-medium hover:bg-blue/20">Salin</button>
                  </div>
                </div>
              )}
            </div>

            {/* --- KOLOM KANAN: UPLOAD BUKTI --- */}
            <div>
              <h3 className="font-bold text-dark mb-4">2. Konfirmasi Pembayaran</h3>
              <p className="text-sm text-gray-500 mb-4">Upload tangkapan layar (screenshot) atau foto struk bukti transfer Anda di sini.</p>
              
              <label 
                htmlFor="upload-bukti" 
                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors overflow-hidden relative"
              >
                {preview ? (
                  <img src={preview} alt="Preview Bukti" className="w-full h-full object-contain p-2" />
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-10 h-10 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                    </svg>
                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold text-blue">Klik untuk upload</span></p>
                    <p className="text-xs text-gray-400">PNG, JPG atau JPEG (Maks. 2MB)</p>
                  </div>
                )}
                <input 
                  id="upload-bukti" 
                  type="file" 
                  accept="image/png, image/jpeg, image/jpg" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
              </label>

              {/* Tombol Konfirmasi */}
              <div className="mt-6 space-y-3">
                <button 
                  onClick={handleUploadSubmit}
                  disabled={isUploading}
                  className={`w-full font-medium text-white py-3 rounded-md ease-out duration-200 flex justify-center items-center ${
                    preview 
                      ? "bg-blue hover:bg-blue-dark shadow-md" 
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isUploading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Mengunggah...
                    </span>
                  ) : "Kirim Bukti Pembayaran"}
                </button>
                
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase">Atau</span>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>

                <a 
                  href="https://wa.me/08123456789" // Ganti dengan no WA asli
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex justify-center items-center gap-2 font-medium text-green-600 bg-green-50 border border-green-200 py-3 rounded-md hover:bg-green-100 transition-colors"
                >
                  Konfirmasi Manual via WA
                </a>
              </div>

            </div>
          </div>
          
          <div className="mt-10 pt-6 border-t border-gray-200">
            <Link href="/" className="text-sm font-medium text-gray-500 hover:text-blue transition-colors">
              &larr; Kembali ke Beranda
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
};

// 🔥 Komponen Utama yang diexport (Wajib membungkus Content dengan Suspense)
const PaymentPage = () => {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Memuat detail pembayaran...</div>}>
      <PaymentContent />
    </Suspense>
  );
};

export default PaymentPage;