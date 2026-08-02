"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

const MyOrdersContent = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Menunggu Pembayaran");
  const [openOrderDetail, setOpenOrderDetail] = useState<any>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  useEffect(() => {
    const existingScript = document.getElementById("midtrans-snap-script");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "midtrans-snap-script";
      script.src = "https://app.midtrans.com/snap/snap.js";
      script.setAttribute("data-client-key", process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "");
      script.async = true;
      document.body.appendChild(script);
    }
    fetchOrders();
  }, []);

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
      case 7:
        return "Menunggu Pembayaran";
      case 8:
        return "Dibatalkan";
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
    {
      name: "Dibatalkan",
      desc: "Pesanan yang telah dibatalkan",
      empty: "Tidak ada pesanan dibatalkan",
      emptySub: "Tidak ada riwayat pesanan yang dibatalkan",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      ),
    },
  ];

  const CountdownTimer = ({ createdAt }: { createdAt: string }) => {
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
      const calculateTime = () => {
        const expireTime = new Date(createdAt).getTime() + 30 * 60 * 1000;
        const difference = expireTime - new Date().getTime();

        if (difference <= 0) {
          setTimeLeft("Waktu Habis (Kadaluwarsa)");
          return;
        }

        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const hours = Math.floor(difference / (1000 * 60 * 60));
        setTimeLeft(`${hours > 0 ? `${hours} jam ` : ""}${minutes} menit lagi`);
      };

      calculateTime();
      const interval = setInterval(calculateTime, 1000);
      return () => clearInterval(interval);
    }, [createdAt]);

    return <span className="text-red-500 font-bold text-xs">⏳ Sisa Waktu Bayar: {timeLeft}</span>;
  };

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
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/customer/${customer.id}`,
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

  const handleCancelOrder = async (orderId: number) => {
    if (!confirm("Apakah Anda yakin ingin membatalkan pesanan ini?")) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/cancel`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        toast.success("Pesanan berhasil dibatalkan.");
        setOpenOrderDetail(null);
        fetchOrders(); 
      } else {
        toast.error("Gagal membatalkan pesanan.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan sistem.");
    }
  };

  const handlePayNow = async (order: any) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${order.id}/repay`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const json = await res.json();

      if (json.token) {
        (window as any).snap.pay(json.token, {
          onSuccess: function () {
            toast.success("Pembayaran Berhasil!");
            setOpenOrderDetail(null);
            fetchOrders();
          },
          onPending: function () {
            toast.success("Menunggu pembayaran Anda diselesaikan.");
          },
          onError: function () {
            toast.error("Pembayaran gagal, silakan coba lagi.");
          },
        });
      } else {
        toast.error("Gagal memuat token pembayaran: " + (json.error || "Terjadi kesalahan"));
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghubungkan ke server pembayaran.");
    }
  };

  const filteredOrders = orders.filter((order) => {
    const stageId = Number(order.current_stage_id);

    switch (activeTab) {
      case "Menunggu Pembayaran":
        return stageId === 7; 

      case "Menunggu Verifikasi":
        return stageId === 6 || (stageId === 1 && !order.designer_id);

      case "Dalam Proses":
        if ([2, 3, 4].includes(stageId)) return true;
        if ((stageId === 6 || stageId === 1) && order.designer_id) return true;
        return false;

      case "Pesanan Selesai":
        return stageId === 5;

      case "Dibatalkan":
        return stageId === 8; 

      default:
        return false;
    }
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentFilteredOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const currentTab = tabs.find((t) => t.name === activeTab)!;

  return (
    <section className="pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-[1000px] mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-6 py-5">
            <span className="w-7 h-7 rounded-lg bg-blue text-white flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <path d="M3 6h18M16 10a4 4 0 01-8 0" />
              </svg>
            </span>
            <h1 className="text-lg font-bold text-dark">Pesanan Saya</h1>
          </div>

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

          <div className="p-6">
            {loading ? (
              <p className="text-center text-sm text-gray-400 py-20">Memuat pesanan...</p>
            ) : (
              <div className="space-y-5">
                {currentFilteredOrders.length > 0 ? (
                  currentFilteredOrders.map((order) => (
                    <div 
                      key={order.id} 
                      onClick={() => setOpenOrderDetail(order)}
                      className="bg-white p-5 rounded-xl border-gray-200 border shadow-sm cursor-pointer hover:border-slate-300 transition-all"
                    >
                      <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4">
                        <div>
                          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                            Order #{order.order_code || order.id}
                          </p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-slate-50 text-gray-500 border border-slate-200">
                          {new Date(order.created_at).toLocaleDateString("id-ID", { dateStyle: "long" })}
                        </span>
                      </div>

                      {Number(order.current_stage_id) === 7 && (
                        <div className="mb-3 bg-red-50 p-2.5 rounded-lg border border-red-100 flex items-center justify-between">
                          <CountdownTimer createdAt={order.created_at} />
                        </div>
                      )}

                      <div className="space-y-2 mb-4">
                        {order.order_items &&
                          order.order_items.slice(0, 2).map((item: any, idx: number) => {
                            const currentItemStageId = Number(item.order_stage_id || order.current_stage_id);
                            return (
                              <div key={idx} className="flex gap-3 items-center justify-between p-2 rounded-xl bg-gray-50/60 border border-gray-100">
                                <div className="flex gap-2.5 items-center flex-grow">
                                  <div className="w-11 h-11 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                                    <img
                                      src={
                                        item.product?.photo
                                          ? `${process.env.NEXT_PUBLIC_API_URL}/storage/${item.product.photo}`
                                          : "/placeholder.png"
                                      }
                                      alt={item.product?.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="flex-grow">
                                    <h4 className="font-semibold text-dark text-xs line-clamp-1">
                                      {item.product?.name || "Produk"}
                                    </h4>
                                    <p className="text-[11px] text-gray-400">
                                      {item.panjang > 0 ? `${item.panjang}x${item.lebar}cm` : "Standar"} • x{item.quantity}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex flex-col items-end gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                                  <p className="font-bold text-xs text-dark">
                                    Rp {Number(
                                      (item.subtotal && Number(item.subtotal) > 0) 
                                        ? item.subtotal 
                                        : (item.price && Number(item.price) > 0) 
                                          ? item.price * item.quantity 
                                          : order.total_price
                                    ).toLocaleString("id-ID")}
                                  </p>
                                  {currentItemStageId === 3 && order.designer_id ? (
                                    <button
                                      onClick={() => router.push(`/chat/${order.id}?item=${item.id}`)}
                                      className="inline-flex items-center gap-1 font-bold text-[9px] text-white bg-blue py-1 px-2 rounded-md hover:bg-blue-dark shadow-sm"
                                    >
                                      Chat Desain
                                    </button>
                                  ) : null}
                                </div>
                              </div>
                            );
                          })}

                        {order.order_items && order.order_items.length > 2 && (
                          <p className="text-[11px] text-blue font-medium text-center pt-1">
                            + {order.order_items.length - 2} produk lainnya (Klik untuk lihat detail)
                          </p>
                        )}
                      </div>

                      <div className="flex justify-between items-center border-t border-gray-100 pt-3" onClick={(e) => e.stopPropagation()}>
                        <div className="text-xs text-gray-400">
                          Total Pembayaran: <span className="font-black text-sm text-blue ml-1">Rp {Number(order.total_price).toLocaleString("id-ID")}</span>
                        </div>
                        <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-[10px] font-medium text-gray-600 border-none shadow-none">
                          Global Status: {getOrderStatus(Number(order.current_stage_id))}
                        </span>
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

                {!loading && totalPages > 1 && (
                  <div className="flex justify-center items-center gap-3 mt-6 pt-4 border-t border-gray-200">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-dark disabled:opacity-40 hover:bg-gray-50 cursor-pointer"
                    >
                      &larr; Sebelumnya
                    </button>
                    <span className="text-xs text-gray-500 font-medium">
                      Halaman {currentPage} dari {totalPages}
                    </span>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-dark disabled:opacity-40 hover:bg-gray-50 cursor-pointer"
                    >
                      Berikutnya &rarr;
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {openOrderDetail && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="max-w-[1000px] w-full bg-white rounded-2xl shadow-sm overflow-hidden my-auto">
            
            <div className="flex justify-between items-center px-6 py-5 border-b border-gray-200">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-blue text-white flex items-center justify-center">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                    <path d="M3 6h18M16 10a4 4 0 01-8 0" />
                  </svg>
                </span>
                <h1 className="text-lg font-bold text-dark">Detail Transaksi</h1>
              </div>
              <button 
                onClick={() => setOpenOrderDetail(null)} 
                className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-dark font-bold text-base transition-colors cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-6">
              <div className="bg-white p-5 rounded-xl border-gray-200 border shadow-sm">
                
                <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-2">
                  <div>
                    <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
                      Order #{openOrderDetail.order_code || openOrderDetail.id}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                      Number(openOrderDetail.current_stage_id) === 5
                        ? "bg-green-50 text-green-700"
                        : "bg-white text-blue border border-blue-500"
                    }`}
                  >
                     {new Date(openOrderDetail.created_at).toLocaleDateString("id-ID", { dateStyle: "long" })}
                  </span>
                </div>

                <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto pr-1">
                  {openOrderDetail.order_items &&
                    openOrderDetail.order_items.map((item: any, idx: number) => {
                      const currentItemStageId = Number(item.order_stage_id || openOrderDetail.current_stage_id);
                      return (
                        <div key={idx} className="flex gap-3 items-center justify-between border-b border-gray-100 pb-2.5">
                          <div className="flex gap-3 items-center flex-grow">
                            <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                              <img
                                src={
                                  item.product?.photo
                                    ? `${process.env.NEXT_PUBLIC_API_URL}/storage/${item.product.photo}`
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
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs font-medium text-gray-600">x{item.quantity}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <p className="font-semibold text-sm text-dark">
                              Rp {Number(
                                (item.subtotal && Number(item.subtotal) > 0) 
                                  ? item.subtotal 
                                  : (item.price && Number(item.price) > 0) 
                                    ? item.price * item.quantity 
                                    : openOrderDetail.total_price
                              ).toLocaleString("id-ID")}
                            </p>
                            {(currentItemStageId === 1 || currentItemStageId === 3 || currentItemStageId === 6) && openOrderDetail.designer_id ? (
                              <button
                                onClick={() => {
                                  router.push(`/chat/${openOrderDetail.id}?item=${item.id}`);
                                  setOpenOrderDetail(null);
                                }}
                                className="inline-flex items-center gap-1.5 font-medium text-[11px] text-white border border-blue-500 bg-blue py-1.5 px-2.5 rounded-lg transition duration-150 hover:bg-blue-dark shadow-sm cursor-pointer"
                              >
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M21 12c0 4.418-4.03 8-9 8a9.7 9.7 0 01-3.13-.51L3 21l1.66-4.32A7.93 7.93 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                                </svg>
                                Chat Item
                              </button>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                </div>

                <div className="bg-white p-3 border border-gray-200 rounded-xl mb-4 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-semibold">Status Alur Sistem (Global):</span>
                    <span className="text-dark font-bold">{getOrderStatus(Number(openOrderDetail.current_stage_id))}</span>
                  </div>
                  {openOrderDetail.designer && (
                    <div className="flex justify-between border-t border-gray-200 pt-1.5">
                      <span className="text-gray-400 font-semibold">Desainer Pendamping:</span>
                      <span className="text-dark font-bold">{openOrderDetail.designer.name}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap justify-between items-center gap-3 border-t border-gray-200 pt-3">
                  <div className="text-sm">
                    <span className="text-gray-400">Total: </span>
                    <span className="font-bold text-blue-500">
                      Rp {Number(openOrderDetail.total_price).toLocaleString("id-ID")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {Number(openOrderDetail.current_stage_id) === 7 && (
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => handleCancelOrder(openOrderDetail.id)}
                          className="bg-red-50 text-red-600 border border-red-200 px-3 py-2 rounded-xl font-bold text-xs hover:bg-red-100 transition-colors cursor-pointer"
                        >
                          Batalkan Pesanan
                        </button>
                        <button
                          onClick={() => handlePayNow(openOrderDetail)}
                          className="bg-blue text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-blue-dark transition-colors cursor-pointer"
                        >
                          Bayar Sekarang
                        </button>
                      </div>
                    )}

                    {(Number(openOrderDetail.current_stage_id) === 4 || Number(openOrderDetail.current_stage_id) === 2) && (
                      <div className="inline-flex items-center gap-1.5 font-semibold text-xs text-orange-600">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 6 2 18 2 18 9" />
                          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                          <rect x="6" y="14" width="12" height="8" />
                        </svg>
                        Sedang Dicetak
                      </div>
                    )}
                    {Number(openOrderDetail.current_stage_id) === 5 && (
                      <div className="inline-flex items-center gap-1.5 font-semibold text-xs text-green">
                        ✓ Pesanan Selesai
                      </div>
                    )}
                    {Number(openOrderDetail.current_stage_id) === 8 && (
                      <div className="inline-flex items-center gap-1.5 font-semibold text-xs text-red-500">
                        ✕ Pesanan Dibatalkan
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}
    </section>
  );
};

export default function MyOrdersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Memuat riwayat pesanan...</div>}>
      <MyOrdersContent />
    </Suspense>
  );
}