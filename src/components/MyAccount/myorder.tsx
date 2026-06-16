"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const MyOrdersPage = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Menunggu Pembayaran");

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
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Order ID: #{order.id}</p>
                      <p className="font-bold text-lg">Rp {Number(order.total_price).toLocaleString("id-ID")}</p>
                    </div>
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold uppercase text-gray-600">
                      {order.status}
                    </span>
                  </div>

                  {order.status === 'Menunggu Pembayaran' && (
                    <Link href={`/payment?amount=${order.total_price}&order_id=${order.id}`} 
                          className="inline-block px-6 py-2 bg-blue text-white rounded-lg font-bold hover:bg-blue-dark">
                      Bayar Sekarang
                    </Link>
                  )}
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