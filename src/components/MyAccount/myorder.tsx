"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

const MyOrdersPage = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // Default tab kita arahkan langsung ke "Dalam Proses" agar user melihat isi datanya langsung
  const [activeTab, setActiveTab] = useState("Dalam Proses");

  const router = useRouter();
  const searchParams = useSearchParams();

  // 🛠️ FUNGSI SINKRON DENGAN DATABASE KAMU
const getOrderStatus = (stageId: number) => {
  switch (stageId) {
    case 1:
      return "Butuh Desain";
    case 2:
      return "Siap Cetak";
    case 3:
      return "Proses Desain";
    case 4:
      return "Proses Cetak";
    case 5:
      return "Selesai";
    case 6:
      return "Antrean Desain";
    default:
      return "Status Tidak Diketahui";
  }
};
  
  const tabs = [
    {
      name: "Menunggu Pembayaran",
      desc: "Pesanan Anda sedang menunggu pembayaran",
      empty: "Tidak ada pesanan menunggu pembayaran",
      emptySub: "Semua pesanan Anda sudah dibayar",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      ),
    },
    {
      name: "Menunggu Verifikasi",
      desc: "Pesanan Anda sedang menunggu verifikasi pembayaran",
      empty: "Tidak ada pesanan menunggu verifikasi",
      emptySub: "Semua pembayaran sudah diverifikasi",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 2h12M6 22h12M6 2c0 5 6 6 6 10s-6 5-6 10M18 2c0 5-6 6-6 10s6 5 6 10" />
        </svg>
      ),
    },
    {
      name: "Dalam Proses",
      desc: "Pesanan Anda sedang dikerjakan oleh desainer",
      empty: "Tidak ada pesanan dalam proses",
      emptySub: "Semua pesanan sudah selesai dikerjakan",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9V3h12v6M6 18h12v4H6zM4 9h16a2 2 0 0 1 2 2v5a1 1 0 0 1-1 1h-3M4 9a2 2 0 0 0-2 2v5a1 1 0 0 0 1 1h3" />
        </svg>
      ),
    },
    {
      name: "Pesanan Selesai",
      desc: "Pesanan Anda telah selesai dikerjakan",
      empty: "Tidak ada pesanan selesai",
      emptySub: "Belum ada pesanan yang selesai diproses",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 12l3 3 5-6" />
        </svg>
      ),
    },
  ];

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token");
      const customerStr = localStorage.getItem("customer");
      if (!token || !customerStr) {
        setLoading(false);
        return;
      }
      const customer = JSON.parse(customerStr);

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/orders/customer/${customer.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );
        const json = await res.json();
        setOrders(json.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // 🔥 LOGIKA FILTER COCOK DATABASE + PAJANGAN MENUNGGU PEMBAYARAN
  const filteredOrders = orders.filter((order) => {
    const stageId = Number(order.current_stage_id);

    switch (activeTab) {
      case "Menunggu Pembayaran":
        // Sengaja dibikin pajangan aja, dikasih return false biar isinya selalu kosong/empty state
        return false;
        
      case "Menunggu Verifikasi":
        // Stage 6 masuk ke Menunggu Verifikasi
        return stageId === 6;
        
      case "Dalam Proses":
        // Sesuai request: Stage 1 (Menunggu Pembayaran bawaan database), 2, 3, dan 4 berkumpul di sini
        return stageId === 1 || stageId === 2 || stageId === 3 || stageId === 4;
        
      case "Pesanan Selesai":
        // Stage 5 masuk ke Pesanan Selesai
        return stageId === 5;
        
      default:
        return false;
    }
  });

  const currentTab = tabs.find((t) => t.name === activeTab)!;

  return (
    <section className="pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-[1000px] mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* HEADER */}
          <div className="flex items-center gap-2.5 px-6 py-5">
            <span className="w-7 h-7 rounded-lg bg-blue text-white flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <path d="M3 6h18M16 10a4 4 0 01-8 0" />
              </svg>
            </span>
            <h1 className="text-lg font-bold text-dark">Pesanan Saya</h1>
          </div>

          {/* TABS MENU */}
          <div className="flex overflow-x-auto px-2">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`flex items-center gap-2 shrink-0 px-3 py-3.5 m-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.name
                    ? "bg-blue text-white"
                    : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                }`}
              >
                {tab.icon}
                {tab.name}
              </button>
            ))}
          </div>

          {/* ORDER LIST */}
          <div className="p-6">
            {loading ? (
              <p className="text-center text-sm text-gray-400 py-20">Memuat pesanan...</p>
            ) : (
              <div className="space-y-5">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <div key={order.id} className="bg-white p-5 rounded-xl border-gray -200 border shadow-sm">
                      {/* Header Order */}
                      <div className="flex justify-between items-center border-b border-gray -200 pb-2 mb-2">
                        <div>
                          <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
                            Order #{order.id}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                            Number(order.current_stage_id) === 5
                              ? "bg-green-50 text-green-700"
                              : "bg-white text-blue border border-blue-500"
                          }`}
                        >
                           {new Date(order.created_at).toLocaleDateString("id-ID", { dateStyle: "long" })}
                        </span>
                      </div>

                      {/* List Item Produk */}
                      <div className="space-y-3 mb-4">
                        {order.order_items &&
                          order.order_items.map((item: any, idx: number) => (
                            <div key={idx} className="flex gap-3 items-center">
                              <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                                <img
                                  src={
                                    item.product?.photo
                                      ? `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/storage/${item.product.photo}`
                                      : "/placeholder.png"
                                  }
                                  alt={item.product?.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-grow">
                                <h4 className="font-semibold text-dark text-sm">
                                  {item.product?.name || "Produk"}
                                </h4>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  Variasi: {item.panjang > 0 ? `${item.panjang}x${item.lebar}cm` : "Standar"}
                                </p>
                                <p className="text-xs font-medium text-gray-600 mt-1">x{item.quantity}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-sm text-dark">
                                  Rp {Number(item.price).toLocaleString("id-ID")}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>

                      {/* Footer Total & Action */}
                      <div className="flex flex-wrap justify-between items-center gap-3 border-t border-gray -200 pt-3">
                        <div className="text-sm">
                          <span className="text-gray-400">Total: </span>
                          <span className="font-bold text-blue-500">
                            Rp {Number(order.total_price).toLocaleString("id-ID")}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">

                          {(Number(order.current_stage_id) === 3 || Number(order.current_stage_id) === 3) &&
                          order.designer ? (
                            <button
                              onClick={() => router.push(`/chat/${order.id}`)}
                              className="inline-flex items-center gap-1.5 font-medium text-xs text-white border border-blue-500 bg-blue py-2 px-3 rounded-lg transition duration-150"
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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

                          {(Number(order.current_stage_id) === 4 || Number(order.current_stage_id) === 2) && (
                          <div className="inline-flex items-center gap-1.5 font-semibold text-xs text-orange-600 ">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6 9 6 2 18 2 18 9" />
                              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                              <rect x="6" y="14" width="12" height="8" />
                            </svg>
                            Sedang Dicetak
                          </div>
                        )}

                        {(Number(order.current_stage_id) === 5) && (
                          <div className="inline-flex items-center gap-1.5 font-semibold text-xs text-green ">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            </svg>
                            Pesanan Selesai
                          </div>
                        )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gray-100 flex items-center justify-center text-gray-300">
                      {currentTab.icon}
                    </div>
                    <h3 className="text-base font-bold text-dark">{currentTab.empty}</h3>
                    <p className="text-sm text-gray-400 mt-1">{currentTab.emptySub}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MyOrdersPage;