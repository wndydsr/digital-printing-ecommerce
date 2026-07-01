"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Breadcrumb from "../Common/Breadcrumb";
import { initEcho } from "@/lib/echo";

interface ChatMessage {
  id: number;
  sender: "customer" | "desainer";
  message: string;
  file?: string;
  is_design?: boolean | number | string;
  created_at: string;
}

interface OrderInfo {
  order_code: string;
  product_name: string;
  product_thumbnail_label: string; 
  size: string;
  qty: number;
  status: "dikerjakan" | "selesai" | "siap_cetak" | "revisi" | "menunggu";
}

const formatDateHeader = (dateStr: string) => {
  return new Date(dateStr)
    .toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
    .toUpperCase();
};

const formatTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  dikerjakan: { label: "Dikerjakan", className: "bg-yellow-light-4 text-yellow-dark" },
  siap_cetak: { label: "Siap Cetak", className: "bg-green-light-6 text-green" },
  selesai: { label: "Selesai", className: "bg-blue-light-5 text-blue" },
  revisi: { label: "Revisi", className: "bg-red-light-6 text-red" },
  menunggu: { label: "Menunggu", className: "bg-gray-2 text-dark-2" },
};

// 🆕 Tipe data parameter (Props) ditambahkan orderItemId
const ChatDesainer = ({ orderId, orderItemId }: { orderId: string; orderItemId?: string }) => {
  const router = useRouter();

  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const ASSET_URL = API_URL ? API_URL.replace(/\/api$/, "").replace(/\/api\/$/, "") : "";

  const [showRevisi, setShowRevisi] = useState(false);
  const [revisiNote, setRevisiNote] = useState("");
  const [selectedMsgId, setSelectedMsgId] = useState<number | null>(null);
  const [approvedId, setApprovedId] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initEcho();
    if (!orderId || !window.Echo) return;

    const channel = window.Echo.private(`chat.${orderId}`);

    const syncPesanTerbaru = async () => {
      try {
        // 🆕 Tambahkan query parameter item_id jika ada agar sinkronisasi tersaring
        const url = orderItemId 
          ? `${API_URL}/api/orders/${orderId}/messages?item_id=${orderItemId}`
          : `${API_URL}/api/orders/${orderId}/messages`;

        const responseMessages = await fetch(url, {
          headers: { 
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "Accept": "application/json"
          },
        });
        if (responseMessages.ok) {
          const dataMessages = await responseMessages.json();
          setMessages(dataMessages.reverse());
        }
      } catch (err) {
        console.error("Gagal sinkronisasi data gambar real-time:", err);
      }
    };

    channel.listen('.MessageSent', (e: any) => {
      const incomingMessage = e.message || e;
      if (incomingMessage.is_design === 1 || incomingMessage.is_design === "1") {
        incomingMessage.is_design = true;
      }

      // 🆕 Jika chat dibatasi per item, abaikan pesan real-time yang bukan untuk item ini
      if (orderItemId && incomingMessage.order_item_id && String(incomingMessage.order_item_id) !== String(orderItemId)) {
        return;
      }

      const dariDesainer = incomingMessage.sender === "desainer";
      const indikasiGambar = incomingMessage.file || incomingMessage.is_design || (incomingMessage.message && incomingMessage.message.includes("pratinjau desain"));

      if (dariDesainer || indikasiGambar) {
        syncPesanTerbaru();
      } else {
        setMessages((prev) => {
          if (prev.some(m => m.id === incomingMessage.id)) return prev;
          return [...prev, incomingMessage];
        });
      }

      if (incomingMessage.message && incomingMessage.message.includes("[SISTEM]")) {
        setOrderInfo(prev => prev ? { ...prev, status: "siap_cetak" } : null);
      }
    });

    return () => {
      window.Echo.leave(`chat.${orderId}`);
    };
  }, [orderId, orderItemId, API_URL]);

  useEffect(() => {
    const loadData = async () => {
      if (!orderId) return;
      setIsLoading(true);
      try {
        // 🆕 Sesuaikan URL pengambilan pesan menggunakan orderItemId jika tersedia
        const messagesUrl = orderItemId
          ? `${API_URL}/api/orders/${orderId}/messages?item_id=${orderItemId}`
          : `${API_URL}/api/orders/${orderId}/messages`;

        const responseMessages = await fetch(messagesUrl, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "Accept": "application/json"
          }
        });
        const dataMessages = await responseMessages.json();
        setMessages(dataMessages.reverse());
        
        const responseOrder = await fetch(`${API_URL}/api/orders/${orderId}`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "Accept": "application/json"
          }
        });

        if (responseOrder.ok) {
          const orderData = await responseOrder.json();
          
          let mappedStatus: OrderInfo["status"] = "dikerjakan";
          if (orderData.current_stage_id === 2) mappedStatus = "siap_cetak";
          else if (orderData.current_stage_id === 3) mappedStatus = "dikerjakan";
          else if (orderData.current_stage_id === 5) mappedStatus = "selesai";

          // 🆕 Cari spesifik item produk yang sesuai dengan orderItemId, jika tidak ketemu/kosong baru pakai item pertama
          const currentItem = orderItemId 
            ? orderData.order_items?.find((i: any) => String(i.id) === String(orderItemId)) || orderData.order_items?.[0]
            : orderData.order_items?.[0] || orderData.items?.[0];
          
          let ukuranDisplay = "Ukuran Kustom";
          if (currentItem && currentItem.panjang && currentItem.lebar) {
            ukuranDisplay = `${Number(currentItem.panjang)} x ${Number(currentItem.lebar)} meter`;
          }

          setOrderInfo({
            order_code: orderData.order_code || `ORD-${orderData.id}`,
            product_name: currentItem?.product?.name || "Produk Cetak", 
            product_thumbnail_label: currentItem?.product?.name?.substring(0, 5).toUpperCase() || "PRINT",
            size: ukuranDisplay, 
            qty: currentItem?.quantity || 1,
            status: mappedStatus
          });
        }
      } catch (err) {
        console.error("Gagal memuat data chat & order:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [orderId, orderItemId, API_URL]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const groupedMessages = messages.reduce((groups: Record<string, ChatMessage[]>, msg) => {
    const dateKey = new Date(msg.created_at).toDateString();
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(msg);
    return groups;
  }, {});

  const designFilesFromMessages = messages.filter((msg) => msg.file);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    if (orderInfo?.status === "siap_cetak" || orderInfo?.status === "selesai") return;

    const tempMessage = inputMessage;
    setInputMessage("");

    try {
      const response = await fetch(`${API_URL}/api/orders/${orderId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        // 🆕 Sertakan order_item_id ke dalam payload request POST ke backend
        body: JSON.stringify({ 
          message: tempMessage, 
          sender: "customer",
          order_item_id: orderItemId || null 
        }),
      });

      if (!response.ok) throw new Error("Gagal kirim");

      const messagesUrl = orderItemId
        ? `${API_URL}/api/orders/${orderId}/messages?item_id=${orderItemId}`
        : `${API_URL}/api/orders/${orderId}/messages`;

      const fetchResponse = await fetch(messagesUrl, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}`, "Accept": "application/json" }
      });
      const data = await fetchResponse.json();
      setMessages(data.reverse());
    } catch (error) {
      console.error("Gagal mengirim pesan:", error);
      setInputMessage(tempMessage);
    }
  };

  const handleApproveDesign = async (msgId: number) => {
    try {
      const response = await fetch(`${API_URL}/api/orders/${orderId}/approve-design`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ message_id: msgId, order_item_id: orderItemId || null })
      });
      const resData = await response.json();
      if (!response.ok) throw new Error(resData.message || "Gagal menyetujui desain");

      setApprovedId(msgId);
      setOrderInfo(prev => prev ? { ...prev, status: "siap_cetak" } : null);
      alert("Desain berhasil disetujui!");
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan.");
    }
  };

  const handleSendRevision = async () => {
    if (!revisiNote.trim() || !selectedMsgId) return;
    try {
      const response = await fetch(`${API_URL}/api/orders/${orderId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ 
          message: `[REVISI DESAIN]: ${revisiNote}`, 
          sender: "customer",
          order_item_id: orderItemId || null 
        }),
      });
      if (!response.ok) throw new Error("Gagal");

      setShowRevisi(false);
      setRevisiNote("");
      setSelectedMsgId(null);
      setOrderInfo(prev => prev ? { ...prev, status: "revisi" } : null);

      const messagesUrl = orderItemId
        ? `${API_URL}/api/orders/${orderId}/messages?item_id=${orderItemId}`
        : `${API_URL}/api/orders/${orderId}/messages`;

      const fetchResponse = await fetch(messagesUrl, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await fetchResponse.json();
      setMessages(data.reverse());
    } catch (err) {
      alert("Gagal mengirim data revisi.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <span className="text-sm text-dark-2">Memuat percakapan...</span>
      </div>
    );
  }

  if (!orderInfo) return null;
  const badge = STATUS_BADGE[orderInfo.status];

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      <Breadcrumb title="Chat Desainer" pages={["chat"]} />

      {/* 📱 MOBILE HEADER BAR */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-gray-3 bg-gray-50 shrink-0">
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-bold text-dark-3">{orderInfo.order_code}</span>
          <span className="text-sm text-dark truncate font-medium">{orderInfo.product_name}</span>
        </div>
        <button 
          onClick={() => setShowMobileSidebar(!showMobileSidebar)}
          className="text-xs bg-blue text-white font-bold px-3 py-1.5 rounded-md hover:bg-blue-dark transition-all"
        >
          {showMobileSidebar ? "Tutup Detail" : "Lihat Detail"}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* AREA BUBBLE CHAT */}
        <div className="flex flex-col flex-1 bg-white overflow-y-auto px-4 sm:px-8 py-6">
          {Object.keys(groupedMessages).length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-dark-4 text-center">
                Belum ada percakapan.<br />
                Mulai diskusikan kebutuhan desainmu dengan tim desainer kami.
              </p>
            </div>
          ) : (
            Object.entries(groupedMessages).map(([dateKey, msgs]) => (
              <div key={dateKey} className="space-y-4 mb-6">
                <div className="text-center">
                  <span className="text-[10px] sm:text-custom-xs font-semibold tracking-wider text-dark-4 bg-gray-100 px-2.5 py-1 rounded-full">
                    {formatDateHeader(msgs[0].created_at)}
                  </span>
                </div>

                {msgs.map((msg, index) => {
                  const isCustomer = msg.sender === "customer";
                  const memilikiFile = msg.file && msg.file.trim() !== "";
                  const merupakanDesain = msg.is_design === true || String(msg.is_design) === "1";

                  return (
                    <div
                      key={`${msg.id}-${index}`}
                      className={`flex ${isCustomer ? "justify-end" : "justify-start"} mb-4`}
                    >
                      <div className={`max-w-[85%] sm:max-w-[70%] md:max-w-[60%] flex flex-col ${isCustomer ? "items-end" : "items-start"}`}>
                        {memilikiFile || merupakanDesain ? (
                          <div className="bg-white border border-gray-3 rounded-2xl overflow-hidden shadow-sm w-full max-w-[280px] sm:max-w-[320px]">
                            <img 
                              src={`${ASSET_URL}/storage/${msg.file}`} 
                              alt="Kiriman Desain" 
                              className="w-full h-36 sm:h-44 object-cover border-b border-gray-2 cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => setPreviewImage(`${ASSET_URL}/storage/${msg.file}`)} 
                            />
                            <div className="p-3 bg-white">
                              {msg.message && <p className="text-xs sm:text-sm text-dark mb-3 leading-relaxed">{msg.message}</p>}
                              
                              {approvedId === msg.id || orderInfo.status === "siap_cetak" || orderInfo.status === "selesai" ? (
                                <div className="flex items-center gap-2 bg-green-light-6 text-green px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold justify-center">
                                  <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse"></span>
                                  Desain Disetujui (Siap Cetak)
                                </div>
                              ) : (
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => {
                                      setSelectedMsgId(msg.id);
                                      setShowRevisi(true);
                                    }}
                                    className="flex-1 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold text-red border border-red rounded-xl hover:bg-red-light-6 transition-all"
                                  >
                                    Revisi
                                  </button>
                                  <button 
                                    onClick={() => handleApproveDesign(msg.id)}
                                    className="flex-1 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold text-white bg-blue rounded-xl hover:bg-blue-dark transition-all"
                                  >
                                    Setujui
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div
                            className={`rounded-2xl px-3.5 py-2 text-xs sm:text-sm leading-relaxed ${
                              isCustomer
                                ? "bg-blue text-white rounded-br-sm shadow-sm"
                                : "bg-gray-1 text-dark rounded-bl-sm"
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-all">{msg.message}</p>
                          </div>
                        )}

                        <span className={`block mt-1 text-[9px] sm:text-[10px] ${isCustomer ? "text-blue-light-5" : "text-dark-4"}`}>
                          {formatTime(msg.created_at)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>

        {/* SIDEBAR INFO */}
        <div className={`
          fixed inset-y-0 right-0 z-40 w-[290px] sm:w-[340px] bg-white border-l border-gray-3 transform transition-transform duration-300 ease-in-out px-5 py-6 overflow-y-auto no-scrollbar
          lg:relative lg:transform-none lg:z-0 lg:block shrink-0
          ${showMobileSidebar ? "translate-x-0 shadow-2xl" : "translate-x-full lg:translate-x-0"}
        `}>
          <h2 className="font-bold text-sm sm:text-base text-dark mb-3">Info Pesanan</h2>
          <div className="border border-gray-3 rounded-xl p-3.5 bg-gray-1 flex items-start gap-3">
            <div className="flex items-center justify-center w-12 h-14 rounded-lg bg-blue text-white text-[9px] font-black text-center leading-tight shrink-0 uppercase px-1">
              {orderInfo.product_thumbnail_label}
            </div>
            <div className="space-y-1 min-w-0 flex-1">
              <p className="font-bold text-xs sm:text-sm text-dark truncate">{orderInfo.product_name}</p>
              <p className="text-[11px] sm:text-xs text-dark-4 truncate">
                {orderInfo.size} &middot; {orderInfo.qty} pcs
              </p>
              <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge?.className}`}>
                {badge?.label || "Diproses"}
              </span>
            </div>
          </div>

          <h2 className="font-bold text-sm sm:text-base text-dark mt-6 mb-3">Riwayat File Desain</h2>
          <div className="space-y-3">
            {designFilesFromMessages.length === 0 ? (
              <p className="text-xs text-dark-4 italic">Belum ada file desain.</p>
            ) : (
              designFilesFromMessages.map((msgItem) => (
                <div 
                  key={msgItem.id} 
                  onClick={() => {
                    setPreviewImage(`${ASSET_URL}/storage/${msgItem.file}`);
                    setShowMobileSidebar(false);
                  }}
                  className="flex items-center gap-2.5 border border-gray-3 rounded-xl p-2.5 bg-white hover:border-blue cursor-pointer transition-colors group"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-light-5 text-blue shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11"></polyline>
                    </svg>
                  </div>
                  <div className="overflow-hidden flex-1 min-w-0">
                    <p className="font-semibold text-xs text-dark truncate group-hover:text-blue transition-colors">
                      {msgItem.file ? msgItem.file.split('/').pop() : "file-desain.jpg"}
                    </p>
                    <p className="text-[10px] text-dark-4">
                      {formatTime(msgItem.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {showMobileSidebar && (
          <div 
            onClick={() => setShowMobileSidebar(false)}
            className="lg:hidden fixed inset-0 z-30 bg-black/20 backdrop-blur-xs transition-opacity"
          />
        )}
      </div>

      {/* FIELD INPUT PESAN */}
      <div className="px-4 sm:px-8 py-3.5 border-t border-gray-3 bg-white shrink-0">
        {orderInfo.status === "siap_cetak" || orderInfo.status === "selesai" ? (
          <div className="w-full text-center bg-gray-50 text-dark-4 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold border border-dashed border-gray-3 select-none">
            🔒 Diskusi selesai karena Anda telah menyetujui desain ini.
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-4 w-full">
            <div className="flex-1 flex items-center bg-gray-1 rounded-full px-4 py-2 sm:py-2.5">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tulis pesan..."
                className="flex-1 bg-transparent text-xs sm:text-sm text-dark placeholder:text-dark-4 focus:outline-none w-full"
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className="font-medium text-white bg-blue py-2 sm:py-2.5 px-5 sm:px-7 rounded-full text-xs sm:text-sm transition-all duration-200 hover:bg-blue-dark disabled:opacity-50"
            >
              Kirim
            </button>
          </div>
        )}
      </div>

      {/* MODAL REVISI */}
      {showRevisi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-5 sm:p-6 shadow-xl animate-fade-in">
            <h3 className="text-base sm:text-lg font-bold text-dark mb-1">Minta Revisi Desain</h3>
            <p className="text-[11px] sm:text-xs text-dark-4 mb-4">Jelaskan detail perbaikan desain secara spesifik.</p>
            
            <textarea
              value={revisiNote}
              onChange={(e) => setRevisiNote(e.target.value)}
              placeholder="Contoh: Logo ditaruh di tengah..."
              className="w-full h-24 sm:h-28 border border-gray-3 rounded-xl p-3 text-xs sm:text-sm text-dark placeholder:text-dark-4 focus:outline-none focus:border-blue mb-4 resize-none"
            />
            
            <div className="flex justify-end gap-2 text-xs sm:text-sm font-bold">
              <button 
                onClick={() => {
                  setShowRevisi(false);
                  setRevisiNote("");
                  setSelectedMsgId(null);
                }}
                className="px-4 py-2 text-dark-4 hover:bg-gray-100 rounded-xl transition-all"
              >
                Batal
              </button>
              <button 
                onClick={handleSendRevision}
                disabled={!revisiNote.trim()}
                className="px-4 py-2 text-white bg-red rounded-xl hover:bg-red-dark disabled:opacity-50 transition-all"
              >
                Kirim Revisi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL IMAGE PREVIEW */}
      {previewImage && (
        <div className="fixed inset-0 z-[9999] flex flex-col bg-[#525659] text-white select-none">
          <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-[#323639] border-b border-[#202224] h-12 shrink-0">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-xs sm:text-sm font-medium truncate tracking-wide max-w-[160px] sm:max-w-xs">
                {previewImage.split('/').pop() || "Pratinjau_Desain.pdf"}
              </span>
            </div>
            <button 
              onClick={() => setPreviewImage(null)}
              className="bg-red-600 hover:bg-red-700 text-white text-[11px] sm:text-xs font-bold px-3 py-1.5 rounded transition-all shrink-0"
            >
              Tutup
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden bg-[#525659]">
            <div className="w-40 bg-[#323639] border-r border-[#202224] p-4 flex flex-col items-center overflow-y-auto hidden md:flex shrink-0">
              <div className="relative border border-blue bg-white p-1 shadow-md w-28 aspect-[3/4] rounded">
                <img src={previewImage} alt="Thumbnail" className="w-full h-full object-contain opacity-50" />
              </div>
              <span className="text-[11px] text-neutral-300 mt-1">1</span>
            </div>

            <div className="flex-1 overflow-auto p-4 sm:p-6 flex items-start justify-center no-scrollbar">
              <div className="relative bg-white p-2 sm:p-4 shadow-2xl rounded-sm my-1 max-w-full">
                <img src={previewImage} alt="Konten Halaman" className="max-w-full h-auto object-contain max-h-[80vh]" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatDesainer;