"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Breadcrumb from "../Common/Breadcrumb";
import { initEcho } from "@/lib/echo";

// 🔥 TIPE DATA (DISERASIKAN DENGAN BACKEND LARAVEL)
interface ChatMessage {
  id: number;
  sender: "customer" | "desainer";
  message: string;
  file?: string; // Path file desain dari storage backend
  is_design?: boolean | number | string; // Tambahkan tipe penampung dinamis database
  created_at: string; // ISO date string
}

interface OrderInfo {
  order_code: string;
  product_name: string;
  product_thumbnail_label: string; 
  size: string;
  qty: number;
  status: "dikerjakan" | "selesai" | "siap_cetak" | "revisi" | "menunggu";
}

// 🔥 HELPER FORMAT TANGGAL & WAKTU (INDONESIA)
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

const ChatDesainer = ({ orderId }: { orderId: string }) => {
  const router = useRouter();

  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  // 🛠️ FILTER URL UNTUK PATH ASSET (MENGHAPUS SUFIKS /api AGAR TIDAK TERJADI 404)
  const ASSET_URL = API_URL ? API_URL.replace(/\/api$/, "").replace(/\/api\/$/, "") : "";

  // State Kontrol Interaksi Aksi Desain
  const [showRevisi, setShowRevisi] = useState(false);
  const [revisiNote, setRevisiNote] = useState("");
  const [selectedMsgId, setSelectedMsgId] = useState<number | null>(null);
  const [approvedId, setApprovedId] = useState<number | null>(null);
  
  // 🔹 State Baru untuk Preview Gambar Penuh
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

// 1. Integrasi Echo Laravel (Real-time Handler di dalam chat.tsx)
  useEffect(() => {
    initEcho();

    if (!orderId || !window.Echo) return;

    const channel = window.Echo.private(`chat.${orderId}`);

    // 🔥 Fungsi untuk mengambil data chat paling valid langsung dari database Laravel
    const fetchPesanTerbaru = async () => {
      try {
        const responseMessages = await fetch(`${API_URL}/api/orders/${orderId}/messages`, {
          headers: { 
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "Accept": "application/json"
          },
        });
        if (responseMessages.ok) {
          const dataMessages = await responseMessages.json();
          setMessages(dataMessages.reverse()); // Menimpa state lama dengan data gambar yang valid dari DB
        }
      } catch (err) {
        console.error("Gagal sinkronisasi data gambar real-time:", err);
      }
    };

    channel.listen('.MessageSent', (e: any) => {
      console.log("🔥 PESAN DITERIMA DARI ECHO:", e);
      const incomingMessage = e.message || e;
      
      // 🛠️ PAKSA FETCH ULANG jika pengirim adalah desainer atau mengandung indikasi file pratinjau
      const dariDesainer = incomingMessage.sender === "desainer";
      const indikasiGambar = incomingMessage.file || 
                             incomingMessage.is_design || 
                             (incomingMessage.message && incomingMessage.message.includes("pratinjau desain"));

      if (dariDesainer || indikasiGambar) {
        // Langsung tembak database untuk mengambil path 'file' yang utuh dan valid
        fetchPesanTerbaru();
      } else {
        // Jika hanya pesan teks biasa dari customer sendiri, masukkan ke list secara normal
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
  }, [orderId]);

 // 2. Load Data Awal dari Database Laravel
  useEffect(() => {
    const loadData = async () => {
      if (!orderId) return;
      
      setIsLoading(true);
      try {
        // Fetch Riwayat Pesan Chat
        const responseMessages = await fetch(`${API_URL}/api/orders/${orderId}/messages`, {
          headers: { 
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "Accept": "application/json"
          },
        });

        if (!responseMessages.ok) throw new Error("Gagal mengambil pesan");
        const dataMessages = await responseMessages.json();
        setMessages(dataMessages.reverse());
        
        // 🔹 FETCH DATA ORDER ASLI DARI DATABASE (BUKAN DUMMY)
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

          const firstItem = orderData.items?.[0];
          
          // Format ukuran dinamis dari panjang & lebar tanpa desimal .00
          let ukuranDisplay = "Ukuran Kustom";
          if (firstItem && firstItem.panjang && firstItem.lebar) {
            const panjangClean = Number(firstItem.panjang);
            const lebarClean = Number(firstItem.lebar);
            ukuranDisplay = `${panjangClean} x ${lebarClean} meter`;
          }

          setOrderInfo({
            order_code: orderData.order_code || "ORD-UNKNOWN",
            product_name: firstItem?.product?.name || "Produk Cetak", 
            product_thumbnail_label: firstItem?.product?.name?.substring(0, 5).toUpperCase() || "PRINT",
            size: ukuranDisplay, 
            qty: firstItem?.quantity || 1,
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
  }, [orderId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const groupedMessages = messages.reduce((groups: Record<string, ChatMessage[]>, msg) => {
    const dateKey = new Date(msg.created_at).toDateString();
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(msg);
    return groups;
  }, {});

  // 🔹 Ambil riwayat file desain secara dinamis dari tabel messages yang memiliki file
  const designFilesFromMessages = messages.filter((msg) => msg.file);

  const handleSendMessage = async () => {
      if (!inputMessage.trim()) return;
      // 🔒 Cegah pengiriman jika status sudah siap cetak / selesai
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
        body: JSON.stringify({ message: tempMessage, sender: "customer" }),
      });

      if (!response.ok) throw new Error("Gagal kirim");

      const fetchResponse = await fetch(`${API_URL}/api/orders/${orderId}/messages`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Accept": "application/json"
        }
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
        body: JSON.stringify({ message_id: msgId })
      });

      const resData = await response.json();

      if (!response.ok) {
        // 🔥 Tangkap langsung pesan error asli jika ada Exception SQL di backend
        throw new Error(resData.message || "Gagal menyetujui desain");
      }

      setApprovedId(msgId);
      setOrderInfo(prev => prev ? { ...prev, status: "siap_cetak" } : null);
      alert("Desain berhasil disetujui! Status pesanan diubah ke Siap Cetak.");
    } catch (err: any) {
      console.error("Detail Error Aksi Approve:", err);
      alert(err.message || "Terjadi kesalahan saat memproses persetujuan desain.");
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
          sender: "customer" 
        }),
      });

      if (!response.ok) throw new Error("Gagal mengirim revisi");

      setShowRevisi(false);
      setRevisiNote("");
      setSelectedMsgId(null);
      setOrderInfo(prev => prev ? { ...prev, status: "revisi" } : null);

      const fetchResponse = await fetch(`${API_URL}/api/orders/${orderId}/messages`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await fetchResponse.json();
      setMessages(data.reverse());

    } catch (err) {
      console.error(err);
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
    <>
      <Breadcrumb title="Chat Desainer" pages={["chat"]} />
      <div className="flex flex-col h-screen bg-white">

        {/* ==================== BODY: CHAT + SIDEBAR ==================== */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* ---------- AREA BUBBLE CHAT PERCAKAPAN ---------- */}
          <div className="flex flex-col flex-1 overflow-y-auto no-scrollbar px-6 sm:px-10 py-6">
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
                    <span className="text-custom-xs font-semibold tracking-wider text-dark-4">
                      {formatDateHeader(msgs[0].created_at)}
                    </span>
                  </div>

                  {msgs.map((msg, index) => {
                    const isCustomer = msg.sender === "customer";

                    // 🛠️ FIX: PINDAHKAN EVALUASI LOGIKA KE DALAM .map AGAR SETIAP BUBBLE CHAT TER-RENDER SECARA VALID
                    const memilikiFile = msg.file && msg.file.trim() !== "";
                    const merupakanDesain = msg.is_design === true || String(msg.is_design) === "1";

                    return (
                      <div
                        key={`${msg.id}-${index}`}
                        className={`flex ${isCustomer ? "justify-end" : "justify-start"} mb-4`}
                      >
                        <div className={`max-w-[75%] sm:max-w-[60%] flex flex-col ${isCustomer ? "items-end" : "items-start"}`}>
                          
                          {/* KONDISI 1: PREVIEW GAMBAR DESAIN */}
                          {memilikiFile || merupakanDesain ? (
                            <div className="bg-white border border-gray-3 rounded-2xl overflow-hidden shadow-sm max-w-[320px]">
                              <img 
                                src={`${ASSET_URL}/storage/${msg.file}`} 
                                alt="Kiriman Desain" 
                                className="w-full h-44 object-cover border-b border-gray-2 cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => setPreviewImage(`${ASSET_URL}/storage/${msg.file}`)}
                                onError={(e) => console.error("Gambar gagal dimuat:", e.currentTarget.src)}
                              />
                              
                              <div className="p-3 bg-white">
                                {msg.message && <p className="text-sm text-dark mb-3 leading-relaxed">{msg.message}</p>}
                                
                                {approvedId === msg.id || orderInfo.status === "siap_cetak" || orderInfo.status === "selesai" ? (
                                  <div className="flex items-center gap-2 bg-green-light-6 text-green px-3 py-1.5 rounded-xl text-xs font-bold justify-center">
                                    <span className="w-2 h-2 rounded-full bg-green animate-pulse"></span>
                                    Desain Disetujui (Siap Cetak)
                                  </div>
                                ) : (
                                  <div className="flex gap-2">
                                    <button 
                                      onClick={() => {
                                        setSelectedMsgId(msg.id);
                                        setShowRevisi(true);
                                      }}
                                      className="flex-1 py-2 text-xs font-bold text-red border border-red rounded-xl hover:bg-red-light-6 transition-all active:scale-95"
                                    >
                                      Minta Revisi
                                    </button>
                                    <button 
                                      onClick={() => handleApproveDesign(msg.id)}
                                      className="flex-1 py-2 text-xs font-bold text-white bg-blue rounded-xl hover:bg-blue-dark transition-all active:scale-95"
                                    >
                                      Setujui Desain
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            /* KONDISI 2: TAMPILAN PESAN TEKS BIASA */
                            <div
                              className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                                isCustomer
                                  ? "bg-blue text-white rounded-br-sm"
                                  : "bg-gray-1 text-dark rounded-bl-sm"
                              }`}
                            >
                              <p>{msg.message}</p>
                            </div>
                          )}

                          <span className={`block mt-1 text-[10px] ${isCustomer ? "text-blue-light-5" : "text-dark-4"}`}>
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

          {/* ---------- SIDEBAR DETAIL ORDER & RIWAYAT ---------- */}
          <div className="hidden lg:block w-[360px] border-l border-gray-3 overflow-y-auto no-scrollbar px-6 py-6">
            <h2 className="font-bold text-base text-dark mb-3">Info Pesanan</h2>
            <div className="border border-gray-3 rounded-xl p-4 bg-gray-1 flex items-start gap-3.5">
              <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-blue text-white text-[10px] font-black text-center leading-tight shrink-0 uppercase">
                {orderInfo.product_thumbnail_label}
              </div>
              <div className="space-y-1 min-w-0">
                <p className="font-bold text-sm text-dark truncate">{orderInfo.product_name}</p>
                <p className="text-xs text-dark-4">
                  {orderInfo.size} &middot; {orderInfo.qty} pcs
                </p>
                <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full ${badge?.className}`}>
                  {badge?.label || "Diproses"}
                </span>
              </div>
            </div>

            <h2 className="font-bold text-base text-dark mt-7 mb-3">Riwayat File Desain</h2>
            <div className="space-y-3 mt-4">
              {designFilesFromMessages.length === 0 ? (
                <p className="text-xs text-dark-4 italic">Belum ada file desain dari obrolan.</p>
              ) : (
                designFilesFromMessages.map((msgItem) => (
                  <div 
                    key={msgItem.id} 
                    onClick={() => setPreviewImage(`${ASSET_URL}/storage/${msgItem.file}`)}
                    className="flex items-center gap-3 border border-gray-3 rounded-xl px-3.5 py-3 bg-white hover:border-blue cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-light-5 text-blue shrink-0">
                      <svg className="fill-current" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
                      </svg>
                    </div>
                    <div className="overflow-hidden flex-1">
                      <p className="font-semibold text-sm text-dark truncate group-hover:text-blue transition-colors">
                        {msgItem.file ? msgItem.file.split('/').pop() : "file-desain.jpg"}
                      </p>
                      <p className="text-[11px] text-dark-4">
                        {formatDateHeader(msgItem.created_at)} &middot; {formatTime(msgItem.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ==================== PANEL BAWAH: INPUT FIELD PESAN ==================== */}
        <div className="flex items-center gap-4 px-6 sm:px-8 py-4 border-t border-gray-3 bg-white">
          {orderInfo.status === "siap_cetak" || orderInfo.status === "selesai" ? (
            <div className="flex-1 text-center bg-gray-1 text-dark-4 py-3 px-4 rounded-xl text-sm font-semibold border border-dashed border-gray-3 shadow-sm select-none">
              🔒 Diskusi desain telah selesai karena Anda telah menyetujui desain ini.
            </div>
          ) : (
            <>
              <div className="flex-1 flex items-center gap-3 bg-gray-1 rounded-full px-4 py-2.5">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Tulis pesan..."
                  className="flex-1 bg-transparent text-sm text-dark placeholder:text-dark-4 focus:outline-none"
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Kirim
              </button>
            </>
          )}
        </div>
      </div>

      {/* ==================== MODAL OVERLAY: REVISI FORM ==================== */}
      {showRevisi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-dark mb-1">Minta Revisi Desain</h3>
            <p className="text-xs text-dark-4 mb-4">
              Jelaskan secara spesifik detail perbaikan desain agar mempermudah desainer bekerja.
            </p>
            
            <textarea
              value={revisiNote}
              onChange={(e) => setRevisiNote(e.target.value)}
              placeholder="Contoh: Logo ditaruh di tengah, ganti kombinasi font teks menjadi sans-serif tebal..."
              className="w-full h-28 border border-gray-3 rounded-xl p-3 text-sm text-dark placeholder:text-dark-4 focus:outline-none focus:border-blue mb-4 resize-none"
            />
            
            <div className="flex justify-end gap-2 text-sm font-bold">
              <button 
                onClick={() => {
                  setShowRevisi(false);
                  setRevisiNote("");
                  setSelectedMsgId(null);
                }}
                className="px-4 py-2 text-dark-4 hover:bg-gray-2 rounded-xl transition-all"
              >
                Batal
              </button>
              <button 
                onClick={handleSendRevision}
                disabled={!revisiNote.trim()}
                className="px-5 py-2 text-white bg-red rounded-xl hover:bg-red-dark disabled:opacity-50 transition-all"
              >
                Kirim Catatan Revisi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 🔹 MODAL CUSTOM PDF VIEWER LAYOUT ==================== */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[9999] flex flex-col bg-[#525659] text-white font-sans select-none"
          onContextMenu={(e) => e.preventDefault()}
        >
          <div className="flex items-center justify-between px-4 py-2 bg-[#323639] border-b border-[#202224] shadow-md h-12">
            <div className="flex items-center gap-3 min-w-0">
              <svg className="w-5 h-5 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
              </svg>
              <span className="text-sm font-medium truncate tracking-wide max-w-[200px] sm:max-w-xs">
                {previewImage.split('/').pop() || "Pratinjau_Desain.pdf"}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center bg-[#202224] px-3 py-1 rounded border border-neutral-700">
                <span>1</span>
                <span className="mx-1 text-neutral-500">/</span>
                <span className="text-neutral-400">1</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPreviewImage(null)}
                className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded shadow-sm transition-all active:scale-95"
              >
                Tutup
              </button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden bg-[#525659]">
            <div className="w-48 bg-[#323639] border-r border-[#202224] p-4 flex flex-col items-center overflow-y-auto hidden md:flex shrink-0">
              <div className="relative border-2 border-blue bg-white p-1 shadow-md w-32 aspect-[3/4] rounded cursor-default">
                <img 
                  src={previewImage} 
                  alt="Thumbnail" 
                  className="w-full h-full object-contain opacity-60 filter grayscale"
                  onDragStart={(e) => e.preventDefault()}
                />
                <div className="absolute inset-0 bg-transparent" />
              </div>
              <span className="text-xs text-neutral-300 mt-2 font-medium">1</span>
            </div>

            <div className="flex-1 overflow-auto p-6 flex items-start justify-center bg-[#525659] no-scrollbar">
              <div className="relative bg-white p-8 shadow-2xl rounded-sm my-2 max-w-4xl select-none">
                <img 
                  src={previewImage} 
                  alt="Konten Halaman" 
                  className="max-w-full h-auto object-contain pointer-events-none"
                />
                <div className="absolute inset-0 bg-transparent pointer-events-auto cursor-default" />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatDesainer;