"use client";
import React, { useState, useEffect, Suspense } from "react"; 
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { checkoutFileCache } from "@/components/Checkout"; 
import { directDirectFileCache } from "@/components/Common/QuickViewModal";

const PaymentContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const amount = searchParams.get("amount") || "0";
  const orderId = searchParams.get("orderId") || "PRINT-" + new Date().getTime();

  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://app.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "");
    script.async = true;
    
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleMidtransPayment = async () => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token"); 

      if (!token) {
        alert("Sesi Anda telah habis. Silakan login kembali.");
        router.push("/login");
        return;
      }

      if (!(window as any).snap) {
        alert("Sistem pembayaran Midtrans belum siap sepenuhnya. Mohon tunggu beberapa detik, lalu klik kembali.");
        setIsProcessing(false);
        return;
      }

      const pendingCheckoutRaw = sessionStorage.getItem("pendingCheckoutData");
      if (!pendingCheckoutRaw) {
        alert("Data transaksi tidak ditemukan. Silakan ulangi checkout.");
        router.push("/checkout");
        return;
      }
      const pendingCheckoutData = JSON.parse(pendingCheckoutRaw);

      const formData = new FormData();

      formData.append("customer_id", pendingCheckoutData.customer_id);
      formData.append("total_price", pendingCheckoutData.total_price);
      formData.append("shipping_method", pendingCheckoutData.shipping_method);
      formData.append("shipping_cost", pendingCheckoutData.shipping_cost);
      formData.append("is_direct", pendingCheckoutData.is_direct ? "1" : "0");
      formData.append("design_method", pendingCheckoutData.design_method);
      formData.append("shipping_latitude", pendingCheckoutData.shipping_latitude);
      formData.append("shipping_longitude", pendingCheckoutData.shipping_longitude);
      formData.append("orderId", orderId);
      formData.append("totalHarga", amount); 
      formData.append("platform", "customer")

      if (pendingCheckoutData.items && Array.isArray(pendingCheckoutData.items)) {
        pendingCheckoutData.items.forEach((item: any, index: number) => {
          formData.append(`items[${index}][id]`, item.id.toString());
          formData.append(`items[${index}][product_id]`, item.product_id.toString());
          formData.append(`items[${index}][quantity]`, item.quantity.toString());
          formData.append(`items[${index}][panjang]`, item.panjang.toString());
          formData.append(`items[${index}][lebar]`, item.lebar.toString());
          formData.append(`items[${index}][need_design]`, item.need_design);
          formData.append(`items[${index}][catatan]`, item.catatan || "");
          
          if (item.dummy_file_name) {
            formData.append(`items[${index}][dummy_file_name]`, item.dummy_file_name);
          }

          if (item.attributes && Array.isArray(item.attributes)) {
            item.attributes.forEach((attrId: string) => {
              formData.append(`items[${index}][attributes][]`, attrId);
            });
          }

          // Kirim opsi teks tambahan jika ada
          if (item.selectedOptions && typeof item.selectedOptions === "object") {
            Object.entries(item.selectedOptions).forEach(([key, val]) => {
              formData.append(`items[${index}][selectedOptions][${key}]`, String(val));
            });
          }

          if (pendingCheckoutData.is_direct) {
            if (pendingCheckoutData.design_method === "ready-to-print" && checkoutFileCache.readyDesignFile) {
              formData.append(`items[${index}][design_file]`, checkoutFileCache.readyDesignFile);
            } 
           else if (pendingCheckoutData.design_method === "need-design" && directDirectFileCache.supportFiles?.length > 0) {
              directDirectFileCache.supportFiles.forEach((file: File) => {
                formData.append(`items[${index}][reference_files][]`, file);
              });
            }
          }
        });
      }

      const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const baseUrl = rawBaseUrl.endsWith("/api") ? rawBaseUrl : `${rawBaseUrl}/api`;

      const response = await fetch(`${baseUrl}/checkout`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.token) {
        throw new Error(data.error || data.message || "Gagal mendapatkan token pembayaran dari server.");
      }

      (window as any).snap.pay(data.token, {
        onSuccess: function (result: any) {
          alert("Pembayaran Berhasil!");
          sessionStorage.removeItem("pendingCheckoutData");
          sessionStorage.removeItem("directCheckoutItem");
          router.push(`/invoice/${data.order_id}`);
        },
        onPending: function (result: any) {
          alert("Menunggu Pembayaran Selesai.");
          sessionStorage.removeItem("pendingCheckoutData");
          sessionStorage.removeItem("directCheckoutItem");
          router.push(`/invoice/${data.order_id}`);
        },
        onError: function (result: any) {
          alert("Pembayaran Gagal! Silakan coba lagi.");
          setIsProcessing(false);
        },
        onClose: function () {
          setIsProcessing(false);
        },
      });
    } catch (error: any) {
      alert(error.message || "Terjadi kesalahan koneksi ke server Laravel.");
      setIsProcessing(false);
    }
  };

  return (
    <section className="py-20 bg-gray-2 min-h-screen flex items-center justify-center mt-10">
      <div className="max-w-[550px] w-full mx-auto px-4">
        <div className="bg-white shadow-1 rounded-[10px] p-6 sm:p-10 text-center">
          
          <h2 className="text-2xl sm:text-3xl font-bold text-dark mb-2">Konfirmasi Pembayaran</h2>
          <p className="text-gray-500 mb-8">
            Klik tombol di bawah untuk membayar pesananmu melalui gerbang pembayaran resmi Midtrans.
          </p>

          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-8 text-left">
            <p className="text-sm text-gray-500 mb-1 text-center">Total yang harus dibayar</p>
            <p className="text-4xl font-black text-blue text-center mb-4">
              Rp {Number(amount).toLocaleString("id-ID")}
            </p>
            <div className="text-xs space-y-1 text-gray-600 border-t border-gray-200 pt-3">
              {/* <p><strong>Order ID:</strong> {orderId}</p> */}
              <p className="text-gray-400 mt-2">
                * Metode pembayaran seperti QRIS, Transfer Bank (Virtual Account) dll. akan tersedia langsung di dalam pop-up Midtrans.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleMidtransPayment}
              disabled={isProcessing || Number(amount) <= 0}
              className={`w-full font-bold text-white py-4 rounded-xl text-lg transition-all duration-200 flex justify-center items-center ${
                isProcessing || Number(amount) <= 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue hover:bg-blue-dark shadow-md"
              }`}
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses ke Midtrans...
                </span>
              ) : (
                "Bayar Sekarang"
              )}
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase">Atau</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <a
              href="https://wa.me/08985636138"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex justify-center items-center gap-2 font-medium text-green-600 bg-green-50 border border-green-200 py-3 rounded-md hover:bg-green-100 transition-colors"
            >
              Hubungi CS via WhatsApp
            </a>
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

const PaymentPage = () => {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Memuat detail pembayaran...</div>}>
      <PaymentContent />
    </Suspense>
  );
};

export default PaymentPage;