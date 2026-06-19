"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

const MyOrdersPage = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Menunggu Pembayaran");

  const router = useRouter();

  // Daftar Tab sesuai permintaan Anda
  const tabs = [
    { name: "Menunggu Pembayaran" },
    { name: "Menunggu Verifikasi" },
    { name: "Dalam Proses" },
    { name: "Pesanan Selesai" },
    { name: "History Order" },
  ];

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token");
      const customerStr = localStorage.getItem("customer");
      if (!token || !customerStr) { setLoading(false); return; }
      const customer = JSON.parse(customerStr);
      
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/orders/customer/${customer.id}`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        const json = await res.json();
        setOrders(json.data || []);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchOrders();
  }, []);

  // Logika Filter Status
  const filteredOrders = orders.filter((order) => {
    const stageId = Number(order.current_stage_id);

    switch (activeTab) {
      case "Menunggu Pembayaran":
        // Stage 1 (Butuh Desain) di awal transaksi sebelum upload bukti
        return stageId === 1;
        
      case "Menunggu Verifikasi":
        // Stage 6 (Antrean Desain) dengan status_id 1 (Pending)
        return stageId === 6;
        
      case "Dalam Proses":
        // Stage 3 (Desain) atau Stage 4 (Cetak) dengan status_id 2 (Diproses)
        return stageId === 3 || stageId === 4 || stageId === 2;
        
      case "Pesanan Selesai":
        // Stage 5 (Selesai) dengan status_id 3 (Done)
        return stageId === 5;
        
      default:
        return false;
    }
  });

  return (
    <section className="pt-32 pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-[1000px] mx-auto px-4">
        <h1 className="text-3xl font-black text-dark mb-8">Pesanan Saya</h1>

        {/* TABS MENU */}
        <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 mb-8 flex overflow-x-auto gap-2 sticky top-24 z-10">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`px-6 py-3 text-sm font-bold whitespace-nowrap rounded-lg transition-all ${
                activeTab === tab.name 
                  ? "bg-red-500 text-blue shadow-md" 
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* ORDER LIST */}
        {loading ? <p>Memuat pesanan...</p> : (
          <div className="space-y-6">
            {filteredOrders.length > 0 ? (
  filteredOrders.map((order) => (
    <div key={order.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      {/* Header Order */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
        <div>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Order ID: #{order.id}</p>
          <p className="text-sm font-medium text-dark">{new Date(order.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
        </div>
        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
          order.status === 'Selesai' ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue'
        }`}>
          {order.status}
        </span>
      </div>

      {/* List Item Produk */}
      <div className="space-y-4 mb-6">
        {order.order_items && order.order_items.map((item: any, idx: number) => (
          <div key={idx} className="flex gap-4 items-center">
            {/* Gambar Produk */}
            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
              <img 
                src={item.product?.photo ? `http://127.0.0.1:8000/storage/${item.product.photo}` : "/placeholder.png"} 
                alt={item.product?.name} 
                className="w-full h-full object-cover"
              />
            </div>
            {/* Detail Produk */}
            <div className="flex-grow">
              <h4 className="font-bold text-dark text-sm">{item.product?.name || "Produk"}</h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Variasi: {item.panjang > 0 ? `${item.panjang}x${item.lebar}cm` : "Standar"}
              </p>
              <p className="text-xs font-bold text-gray-900 mt-1">x{item.quantity}</p>
            </div>
            {/* Harga per item */}
            <div className="text-right">
              <p className="font-bold text-sm text-dark">Rp {Number(item.price).toLocaleString("id-ID")}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Total & Action */}
      <div className="flex justify-between items-center border-t border-gray-100 pt-4">
        <div className="text-sm">
            <span className="text-gray-500">Total Pesanan: </span>
            <span className="font-black text-red-500 text-lg">
              Rp {Number(order.total_price).toLocaleString("id-ID")}
            </span>
        </div>
        
        <div className="flex gap-3">
        {/* 1. Tombol Bayar */}
        {order.status === 'Menunggu Pembayaran' && (
          <Link href={`/payment?amount=${order.total_price}&order_id=${order.id}`} 
                className="px-6 py-2 bg-blue text-white rounded-lg text-sm font-bold hover:bg-blue-dark transition">
            Bayar Sekarang
          </Link>
        )}
        {/* 2. Tombol Hubungi Desainer (Tampil jika Dalam Proses DAN ada data designer) */}
        {/* Gunakan ID stage untuk Dalam Proses (Stage 3 & 4 sesuai switch case Anda) */}
        {(order.current_stage_id == 3 || order.current_stage_id == 4) && order.designer ? (
          <button
            onClick={() => router.push('/chat/${order.id}')}
            className="inline-flex items-center gap-2 font-medium text-sm text-blue border border-blue bg-white py-2 px-4 rounded-md ease-out duration-200 hover:bg-blue hover:text-white"
          >
            <svg className="fill-current" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M21 12c0 4.418-4.03 8-9 8a9.7 9.7 0 01-3.13-.51L3 21l1.66-4.32A7.93 7.93 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
            Chat Desainer
          </button>
          ) : null}

        {order.designer?.name ? (
          <p>Desainer: {order.designer.name}</p>
            ) : (
              <p>Desainer belum ditugaskan</p>
            )}
      </div>
      </div>
    </div>
  ))
) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <div className="text-5xl mb-4"></div>
                <h3 className="text-lg font-bold text-dark">Tidak ada pesanan di tahap ini</h3>
                <p className="text-gray-500">Semua pesanan Anda sudah diproses</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default MyOrdersPage;