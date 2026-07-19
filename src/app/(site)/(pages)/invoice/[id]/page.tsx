"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, Printer, ArrowLeft, CreditCard, ShoppingBag, Check } from "lucide-react";

export default function InvoicePage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoiceDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        
        const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const baseUrl = rawBaseUrl.endsWith("/api") ? rawBaseUrl : `${rawBaseUrl}/api`;

        const response = await fetch(`${baseUrl}/orders/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`, 
          },
        });

        if (!response.ok) {
          throw new Error("Gagal mengambil data invoice");
        }

        const data = await response.json();
        setOrder(data);
      } catch (err) {
        console.error("Gagal memuat berkas nota invoice:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchInvoiceDetail();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">Memuat berkas nota digital...</div>;
  if (!order) return <div className="min-h-screen flex items-center justify-center text-sm text-red-500">Nota transaksi tidak ditemukan.</div>;

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 print:bg-white print:py-0">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Tombol Kontrol */}
        <div className="flex justify-between items-center print:hidden">
          <button 
            onClick={() => router.push("/my-account?tab=orders")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Pesanan Saya
          </button>
          <button 
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded-lg shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" /> Cetak Nota (PDF)
          </button>
        </div>

        {/* 📄 BOX UTAMA INVOICE */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-10 space-y-8 print:border-0 print:shadow-none">
          
          {/* Header Invoice */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 border-b border-slate-100 pb-6">
            <div>
              <div className="flex items-center gap-2 text-green-600 font-bold text-sm mb-1 print:hidden">
                <CheckCircle2 className="w-4 h-4" /> Transaksi Diproses
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">INVOICE NOTA</h1>
              <p className="text-xs text-slate-400 font-mono mt-1">ORD-{String(order.id).padStart(5, "0")}</p>
            </div>
            <div className="sm:text-right text-xs text-slate-500 space-y-1">
              <p className="font-bold text-slate-800 text-sm">Percetakan Prinora</p>
              <p>Tanggal: {new Date(order.created_at || order.order_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
              <p>Metode: <span className="uppercase font-semibold text-slate-700">{order.shipping_method || "pickup"}</span></p>
            </div>
          </div>

          {/* Informasi Pemesan */}
          <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Ditujukan Kepada:</span>
              <p className="font-bold text-slate-800">{order.customer?.name || "Pelanggan Terhormat"}</p>
              <p className="text-slate-500 mt-0.5">{order.customer?.phone || "-"}</p>
            </div>
            {order.shipping_method === "delivery" && (
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Alamat Pengiriman:</span>
                <p className="text-slate-600 leading-relaxed">{order.customer?.address || "-"}</p>
              </div>
            )}
          </div>

          {/* Tabel Rincian Belanja */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
              <ShoppingBag className="w-3.5 h-3.5 text-slate-400" /> Rincian Item Cetakan
            </span>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                    <th className="p-3">Nama Produk / Spesifikasi</th>
                    <th className="p-3 text-center">Jumlah</th>
                    <th className="p-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {order.items?.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td className="p-3">
                        <p className="font-bold text-slate-800">{item.product?.name || "-"}</p>
                        {Number(item.panjang) > 0 && (
                          <p className="text-[10px] text-slate-400 mt-0.5">Ukuran: {item.panjang}x{item.lebar} cm</p>
                        )}
                      </td>
                      <td className="p-3 text-center font-medium">{item.quantity}</td>
                      <td className="p-3 text-right font-semibold text-slate-800">
                        Rp {Number(item.subtotal || item.price * item.quantity).toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Rincian Total Akhir */}
          <div className="flex justify-end pt-2">
            <div className="w-full sm:w-64 space-y-2.5 text-xs">
              {order.shipping_method === "delivery" && (
                <div className="flex justify-between text-slate-500">
                  <span>Ongkos Kirim</span>
                  <span className="font-medium">Rp {Number(order.shipping_cost || 0).toLocaleString("id-ID")}</span>
                </div>
              )}
              <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-sm font-black text-slate-900">
                <span className="flex items-center gap-1"><CreditCard className="w-4 h-4 text-blue-600" /> Total Bayar</span>
                <span className="text-base text-blue-600">Rp {Number(order.total_price).toLocaleString("id-ID")}</span>
              </div>
            </div>
          </div>

          {/* Catatan Kaki Nota */}
          <div className="text-center text-[10px] text-slate-400 border-t border-slate-100 pt-6">
            <p>Terima kasih telah mempercayakan kebutuhan digital printing kamu kepada Prinora.</p>
            <p className="mt-0.5">Nota ini sah dikeluarkan oleh sistem komputerisasi resmi.</p>
          </div>

          {/* 🔥 SEKSI TOMBOL OKE SELESAI AKHIR */}
          <div className="pt-4 flex justify-end print:hidden">
            <button
              onClick={() => router.push("/my-account?tab=orders")}
              className="w-full sm:w-auto px-6 py-3 font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
              style={{ 
                backgroundColor: '#ffffff', 
                color: '#2563eb', 
                border: '1px solid #2563eb' 
              }}
            >
              <Check className="w-4 h-4" style={{ stroke: '#2563eb' }} /> Oke, Selesai
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}