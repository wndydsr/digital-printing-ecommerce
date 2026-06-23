"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Breadcrumb from "../Common/Breadcrumb";
import { initEcho } from "@/lib/echo";

// 🔥 TIPE DATA (SESUAIKAN DENGAN RESPONSE LARAVEL NANTI)
interface ChatMessage {
  id: number;
  sender: "customer" | "desainer";
  message: string;
  created_at: string; // ISO date string
}

interface DesignFile {
  id: number;
  filename: string;
  uploaded_at: string; // ISO date string
  status: "approved" | "pending" | "revisi";
}

interface OrderInfo {
  order_code: string;
  product_name: string;
  product_thumbnail_label: string; // dummy pengganti foto, misal "SOUND FEST"
  size: string;
  qty: number;
  status: "dikerjakan" | "selesai" | "revisi" | "menunggu";
}

// 🔥 DUMMY DATA (NANTI DIGANTI FETCH KE LARAVEL: /api/orders/{orderId}/chat)
const DUMMY_ORDER_INFO: OrderInfo = {
  order_code: "ORD-02131",
  product_name: "Banner",
  product_thumbnail_label: "SOUND FEST",
  size: "2 x 1 meter",
  qty: 2,
  status: "dikerjakan",
};

const DUMMY_DESIGN_FILES: DesignFile[] = [
  {
    id: 1,
    filename: "desain-awal-v1.jpg",
    uploaded_at: "2023-04-17T14:45:00",
    status: "approved",
  },
];

const DUMMY_MESSAGES: ChatMessage[] = [];

// 🔥 HELPER FORMAT TANGGAL (INDONESIA)
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

const STATUS_BADGE: Record<OrderInfo["status"], { label: string; className: string }> = {
  dikerjakan: { label: "Dikerjakan", className: "bg-yellow-light-4 text-yellow-dark" },
  selesai: { label: "Selesai", className: "bg-green-light-6 text-green" },
  revisi: { label: "Revisi", className: "bg-red-light-6 text-red" },
  menunggu: { label: "Menunggu", className: "bg-gray-2 text-dark-2" },
};

const ChatDesainer = ({ orderId }: { orderId: string }) => {
  const router = useRouter();

  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [designFiles, setDesignFiles] = useState<DesignFile[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    initEcho(); // ← tambahkan ini

    if (!orderId || !window.Echo) return;

    const channel = window.Echo.private(`chat.${orderId}`);

    channel.listen('.MessageSent', (e: any) => {
      console.log("Event diterima:", e);
      const incomingMessage = e.message || e;
      setMessages((prev) => {
        if (prev.some(m => m.id === incomingMessage.id)) return prev;
        return [...prev, incomingMessage];
      });
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });

    return () => window.Echo?.leave(`chat.${orderId}`);
  }, [orderId]);

useEffect(() => {
  if (!orderId || !window.Echo) return;

  console.log("Menghubungkan ke channel:", `chat.${orderId}`);

  const channel = window.Echo.private(`chat.${orderId}`);

 channel.listen('.MessageSent', (e: any) => {
    console.log("🔥 PESAN DITERIMA DARI ECHO:", e);
    
    // Asumsi: Laravel mengirim data dibungkus dalam key 'message'
    const incomingMessage = e.message || e;
    
    setMessages((prev) => {
      // Mencegah duplikasi berdasarkan ID
      if (prev.some(m => m.id === incomingMessage.id)) return prev;
      return [...prev, incomingMessage];
    });
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}`}/api/orders/${orderId}/messages`, {
        headers: { 
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Accept": "application/json"
        },
      });

      if (!response.ok) throw new Error("Gagal mengambil pesan");

      const data = await response.json();
      
      setMessages(data.reverse());
      
      // Anda juga bisa fetch orderInfo dari API di sini jika sudah ada endpoint-nya
      setOrderInfo(DUMMY_ORDER_INFO); 
      setDesignFiles(DUMMY_DESIGN_FILES);
    } catch (err) {
      console.error("Gagal memuat data chat:", err);
    } finally {
      setIsLoading(false);
    }
  };

  loadData();
}, [orderId]); // useEffect ini akan jalan otomatis saat orderId tersedia

// 3. Scroll ke bawah saat pesan bertambah
useEffect(() => {
  chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages]);

  // 🔥 GROUP MESSAGE BERDASARKAN TANGGAL (UNTUK HEADER "17 APRIL 2023")
  const groupedMessages = messages.reduce((groups: Record<string, ChatMessage[]>, msg) => {
    const dateKey = new Date(msg.created_at).toDateString();
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(msg);
    return groups;
  }, {});

  const handleSendMessage = async () => {
  if (!inputMessage.trim()) return;
  const tempMessage = inputMessage;
  setInputMessage("");

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}`}/api/orders/${orderId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ message: tempMessage, sender: "customer" }),
    });

    if (!response.ok) throw new Error("Gagal kirim");

    // Refetch seperti desainer, agar konsisten
    const fetchResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}`}/api/orders/${orderId}/messages`, {
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleUploadDesignFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 🔥 NANTI: upload file ke Laravel via FormData
    // const formData = new FormData();
    // formData.append("design_file", file);
    // await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}`}/api/orders/${orderId}/design-files`, { method: "POST", body: formData, headers: { Authorization: `Bearer ${token}` } });

    const newFile: DesignFile = {
      id: Date.now(),
      filename: file.name,
      uploaded_at: new Date().toISOString(),
      status: "pending",
    };

    setDesignFiles((prev) => [newFile, ...prev]);
    e.target.value = "";
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
        {/* ---------- AREA CHAT ---------- */}
        <div className="flex flex-col flex-1 overflow-y-auto no-scrollbar px-6 sm:px-10 py-6">
          {Object.keys(groupedMessages).length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-dark-4 text-center">
                Belum ada percakapan.
                <br />
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

                {msgs.map((msg, index) => (
                      <div
                        key={`${msg.id}-${index}`} // Menggabungkan ID dan Index agar selalu unik
                        className={`flex ${msg.sender === "customer" ? "justify-end" : "justify-start"}`}
                      >
                    <div
                      className={`max-w-[75%] sm:max-w-[60%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        msg.sender === "customer"
                          ? "bg-blue text-white rounded-br-sm"
                          : "bg-gray-1 text-dark rounded-bl-sm"
                      }`}
                    >
                      <p>{msg.message}</p>
                      <span
                        className={`block mt-1 text-[10px] ${
                          msg.sender === "customer" ? "text-blue-light-5" : "text-dark-4"
                        }`}
                      >
                        {formatTime(msg.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>

        {/* ---------- SIDEBAR INFO PESANAN ---------- */}
        <div className="hidden lg:block w-[360px] border-l border-gray-3 overflow-y-auto no-scrollbar px-6 py-6">
          {/* Info Pesanan */}
          <h2 className="font-bold text-base text-dark mb-3">Info Pesanan</h2>
          <div className="border border-gray-3 rounded-xl p-4 bg-gray-1 flex items-start gap-3.5">
            <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-blue text-white text-[10px] font-black text-center leading-tight shrink-0">
              {orderInfo.product_thumbnail_label}
            </div>
            <div className="space-y-1">
              <p className="font-bold text-sm text-dark">{orderInfo.product_name}</p>
              <p className="text-xs text-dark-4">
                {orderInfo.size} &middot; {orderInfo.qty} pcs
              </p>
              <span
                className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full ${badge.className}`}
              >
                {badge.label}
              </span>
            </div>
          </div>

          {/* Riwayat File Desain */}
          <h2 className="font-bold text-base text-dark mt-7 mb-3">Riwayat File Desain</h2>
          <div className="space-y-3 mt-4">
            {designFiles.length === 0 ? (
              <p className="text-xs text-dark-4 italic">Belum ada file desain.</p>
            ) : (
              designFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-3 border border-gray-3 rounded-xl px-3.5 py-3 bg-white"
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-light-5 text-blue shrink-0">
                    <svg className="fill-current" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
                    </svg>
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-semibold text-sm text-dark truncate">{file.filename}</p>
                    <p className="text-[11px] text-dark-4">
                      {formatDateHeader(file.uploaded_at)} &middot; {formatTime(file.uploaded_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ==================== INPUT PESAN ==================== */}
      <div className="flex items-center gap-4 px-6 sm:px-8 py-4 border-t border-gray-3">
        <div className="flex-1 flex items-center gap-3 bg-gray-1 rounded-full px-4 py-2.5">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tulis pesan..."
            className="flex-1 bg-transparent text-sm text-dark placeholder:text-dark-4 focus:outline-none"
          />
          <button
            type="button"
            aria-label="lampirkan file"
            className="text-dark-4 hover:text-blue ease-out duration-150"
          >
            <svg className="fill-current" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="emoji"
            className="text-dark-4 hover:text-blue ease-out duration-150"
          >
            <svg className="fill-current" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
              <line x1="9" y1="9" x2="9" y2="9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="15" y1="9" x2="15" y2="9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim()}
          className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Kirim
        </button>
      </div>
    </div>
     </>
  );
};

export default ChatDesainer;