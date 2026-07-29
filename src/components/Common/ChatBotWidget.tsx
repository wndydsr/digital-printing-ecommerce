"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { checkoutFileCache } from "@/components/Checkout";
import { MessageSquare, X, Send, Bot } from "lucide-react";

interface OrderSummary {
  product_id: number;
  product_name: string;
  quantity: number;
  panjang_cm?: number;
  lebar_cm?: number;
  attribute_value_ids: number[];
  attribute_names: string[];
  harga_satuan: number;
  subtotal: number;
  deadline: string;
  need_design: boolean;
  catatan?: string;
}

interface Message {
  id: number;
  sender: "user" | "ai";
  text: string;
  time: string;
  orderSummary?: OrderSummary;
}

const ChatBotWidget = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "ai",
      text: "Halo! Saya Nora, asisten virtual cetak digitalmu. Ada yang bisa saya bantu hari ini?",
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [chatDesignFile, setChatDesignFile] = useState<File | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Otomatis scroll ke bawah setiap ada pesan baru
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

    useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener("open-chatbot", handleOpenChat);
    return () => window.removeEventListener("open-chatbot", handleOpenChat);
  }, []);

  // 🔥 FUNGSI BARU: MENEMBAK API LARAVEL SECARA REAL-TIME
 // 🔥 FUNGSI YANG SUDAH DIPERBAIKI UNTUK MEMBACA EMAS ERROR DARI LARAVEL
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const currentTime = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

    // 1. Tampilkan pesan user di chat box
    const userMsg: Message = {
      id: Date.now(),
      sender: "user",
      text: inputMessage,
      time: currentTime,
    };

    setMessages((prev) => [...prev, userMsg]);
    const temporaryInput = inputMessage;

    // siapkan history SEBELUM pesan baru ditambahkan, untuk dikirim ke backend
    const historyToSend = messages.map((m) => ({ role: m.sender, text: m.text }));

    setInputMessage(""); 

    // 2. Aktifkan animasi mengetik
    setIsTyping(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/chatbot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: temporaryInput,
          history: historyToSend,
        }),
      });

      // 💡 KUNCI FIX: Ambil data JSON dulu tanpa memedulikan status res.ok
      const data = await res.json();

      if (res.ok) {
        // Jika status 200 (Sukses)
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: "ai",
            text: data.reply,
            time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
            orderSummary: data.ready_checkout ? data.order_summary : undefined,
          },
        ]);
      } else {
        // 🔥 JIKA LARAVEL EROR 500, PAKSA TAMPILKAN PESAN DEBUG NYA DI BUBBLE CHAT
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: "ai",
            text: data.reply || "Laravel merespon dengan error 500 tanpa pesan khusus.",
            time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } catch (error) {
      console.error("Gagal koneksi chatbot:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          text: "Gagal terhubung ke backend Laravel. Pastikan 'php artisan serve' menyala.",
          time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

// 🔥 DIGANTI: ikut alur Checkout.tsx (sessionStorage + redirect ke /payment)
  const handleCheckout = (summary: OrderSummary) => {
    if (!summary.need_design && !chatDesignFile) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          text: "Sebelum checkout, upload dulu file desain kamu ya lewat tombol 📎 di bawah ringkasan pesanan.",
          time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      return;
    }

    setIsCheckingOut(true);
    try {
      const customerStr = localStorage.getItem("customer");
      const customerData = customerStr ? JSON.parse(customerStr) : null;

      if (!customerData?.id) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: "ai",
            text: "Kamu perlu login dulu sebelum checkout ya.",
            time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
        return;
      }

      const totalPayment = summary.subtotal;

      if (chatDesignFile) {
        checkoutFileCache.readyDesignFile = chatDesignFile;
      }

      const checkoutPayload = {
        customer_id: customerData.id,
        total_price: summary.subtotal.toString(),
        shipping_method: "pickup",
        shipping_cost: "0",
        is_direct: true,
        design_method: summary.need_design ? "need-design" : "ready-to-print",
        shipping_latitude: "",
        shipping_longitude: "",
        items: [
          {
            id: summary.product_id,
            product_id: summary.product_id,
            quantity: summary.quantity,
            panjang: summary.panjang_cm || 0,
            lebar: summary.lebar_cm || 0,
            need_design: summary.need_design ? "1" : "0",
            dummy_file_name: null,
            catatan: [summary.catatan, summary.deadline ? `Deadline: ${summary.deadline}` : null]
              .filter(Boolean)
              .join(" | "),
            selectedOptions: {},
            attributes: summary.attribute_value_ids.map(String),
          },
        ],
      };

      sessionStorage.setItem("pendingCheckoutData", JSON.stringify(checkoutPayload));
      router.push(`/payment?amount=${totalPayment}`);
    } catch (error) {
      console.error("Gagal menyiapkan checkout dari chat:", error);
    } finally {
      setIsCheckingOut(false);
    }
  };
  
  return (
    <div className="fixed bottom-6 right-6 z-99999 font-sans">
      {/* TOMBOL MELAYANG */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center w-14 h-14 rounded-full text-white shadow-lg transition-all duration-300 transform hover:scale-105 ${
          isOpen ? "bg-dark hover:bg-opacity-90 rotate-90" : "bg-blue hover:bg-blue-dark"
        }`}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {/* JENDELA KOTAK CHAT */}
      <div
        className={`absolute bottom-18 right-0 w-[360px] h-[480px] bg-white rounded-2xl shadow-2xl border border-gray-2 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="bg-blue p-4 flex items-center gap-3 text-white shadow-md">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h4 className="font-bold text-sm tracking-wide">Nora - AI Assistant</h4>
            <span className="text-[11px] text-blue-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Online / Siap Membantu
            </span>
          </div>
        </div>

        {/* List Bubble Chat */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-3 no-scrollbar">
          {messages.map((msg) => {
            const isAI = msg.sender === "ai";
            return (
              <div key={msg.id} className={`flex flex-col ${isAI ? "items-start" : "items-end"}`}>
                <div
                  className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm whitespace-pre-line ${
                    isAI
                      ? "bg-white text-dark rounded-tl-none border border-gray-100"
                      : "bg-blue text-white rounded-tr-none"
                  }`}
                >
                  {msg.text}
                </div>

                {/* 🔥 CARD RINGKASAN PESANAN + TOMBOL CHECKOUT */}
                {msg.orderSummary && (
                  <div className="mt-2 w-[85%] border border-blue rounded-xl p-3 bg-blue-50 text-[11px] leading-relaxed">
                    <p className="font-bold mb-1 text-dark">Ringkasan Pesanan</p>
                    <p>Produk: {msg.orderSummary.product_name}</p>
                    {!!msg.orderSummary.panjang_cm && !!msg.orderSummary.lebar_cm && (
                      <p>Ukuran: {msg.orderSummary.panjang_cm} x {msg.orderSummary.lebar_cm} cm</p>
                    )}
                    <p>Jumlah: {msg.orderSummary.quantity}</p>
                    {msg.orderSummary.attribute_names.length > 0 && (
                      <p>Bahan: {msg.orderSummary.attribute_names.join(", ")}</p>
                    )}
                    <p>Deadline: {msg.orderSummary.deadline}</p>
                    <p>Desain: {msg.orderSummary.need_design ? "Butuh dibuatkan" : "Sudah punya sendiri"}</p>
                    <p className="font-bold mt-1 text-dark">
                      Total: Rp {msg.orderSummary.subtotal.toLocaleString("id-ID")}
                    </p>

                                        {!msg.orderSummary.need_design && (
                      <label className="flex items-center gap-1 mt-2 text-[11px] text-blue cursor-pointer">
                        📎 {chatDesignFile ? `File terpilih: ${chatDesignFile.name}` : "Upload file desain kamu"}
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          onChange={(e) => setChatDesignFile(e.target.files?.[0] || null)}
                        />
                      </label>
                    )}

                    <button
                      onClick={() => handleCheckout(msg.orderSummary!)}
                      disabled={isCheckingOut}
                      className="mt-2 w-full bg-blue text-white py-1.5 rounded-lg font-semibold hover:bg-blue-dark disabled:opacity-50 transition-all"
                    >
                      {isCheckingOut ? "Memproses..." : "Checkout Sekarang"}
                    </button>
                  </div>
                )}

                <span className="text-[9px] text-gray-400 mt-1 px-1">{msg.time}</span>
              </div>
            );
          })}

          {/* Indikator Mengetik */}
          {isTyping && (
            <div className="flex flex-col items-start">
              <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Form Input Kirim Pesan */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-2 flex gap-2 items-center">
          <input
            type="text"
            className="flex-1 bg-gray-100 border border-transparent focus:border-gray-3 px-3 py-2.5 rounded-xl text-xs text-dark focus:outline-none transition-all"
            placeholder="Tanyakan harga banner, jenis stiker dll..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isTyping}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue text-white hover:bg-blue-dark disabled:opacity-40 disabled:hover:bg-blue transition-all shrink-0"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBotWidget;
