"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { checkoutFileCache } from "@/components/Checkout";
import { MessageSquare, X, Send, Bot, Paperclip } from "lucide-react";

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
      text: "Halo! Saya Nora, asisten cetak digitalmu. Mau cetak banner, stiker, atau produk lainnya hari ini?",
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [chatDesignFile, setChatDesignFile] = useState<File | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Otomatis scroll ke bawah
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener("open-chatbot", handleOpenChat);
    return () => window.removeEventListener("open-chatbot", handleOpenChat);
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const currentTime = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

    // 1. Tambahkan pesan User
    const userMsg: Message = {
      id: Date.now(),
      sender: "user",
      text: inputMessage,
      time: currentTime,
    };

    // 🔥 PENTING: Ubah m.sender 'ai' menjadi 'model' agar API Gemini tidak menolak HTTP 400!
    const historyToSend = messages
      .filter((m) => m.text && m.text.trim() !== "")
      .map((m) => ({
        role: m.sender === "ai" ? "model" : "user",
        text: m.text,
      }));

    setMessages((prev) => [...prev, userMsg]);
    const temporaryInput = inputMessage;
    setInputMessage("");
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

      const data = await res.json();

      if (res.ok) {
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
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: "ai",
            text: data.reply || "Terjadi kesalahan pada server backend.",
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

  const handleCheckout = (summary: OrderSummary) => {
    if (!summary.need_design && !chatDesignFile) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          text: "Sebelum lanjut ke checkout, upload dulu file desain kamu ya lewat tombol 📎 di bawah ringkasan pesanan.",
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
            text: "Kamu perlu login dulu sebelum masuk ke halaman checkout ya.",
            time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
        return;
      }

      if (chatDesignFile) {
        checkoutFileCache.readyDesignFile = chatDesignFile;
      }

      // ✅ Format payload yang disesuaikan dengan kebutuhan UI Checkout
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
            product_name: summary.product_name, // 👈 Ditambahkan agar nama produk tampil
            title: summary.product_name, // 👈 Agar nama produk (misal MMT) muncul
            img: (summary as any).product_photo || "/placeholder.png", // 👈 AMBIL GAMBAR ASLI PRODUK
            name: summary.product_name,         // 👈 Ditambahkan
            price: summary.harga_satuan,       // 👈 Harga satuan
            quantity: summary.quantity,
            panjang: summary.panjang_cm || 0,
            lebar: summary.lebar_cm || 0,
            subtotal: summary.subtotal,
            need_design: summary.need_design ? "1" : "0",
            dummy_file_name: null,
            catatan: [summary.catatan, summary.deadline ? `Deadline: ${summary.deadline}` : null]
              .filter(Boolean)
              .join(" | "),
            selectedOptions: {},
            attributes: summary.attribute_value_ids.map(String),
            attribute_names: summary.attribute_names,
          },
        ],
      };

      // Simpan ke sessionStorage
      sessionStorage.setItem("pendingCheckoutData", JSON.stringify(checkoutPayload));
      
      // Jika halaman checkout membaca dari 'checkoutItems' atau 'directCheckout'
      sessionStorage.setItem("checkoutItems", JSON.stringify(checkoutPayload.items));

      router.push("/checkout");

    } catch (error) {
      console.error("Gagal menyiapkan checkout dari chat:", error);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-99999 font-sans">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center w-14 h-14 rounded-full text-white shadow-lg transition-all duration-300 transform hover:scale-105 ${
          isOpen ? "bg-dark hover:bg-opacity-90 rotate-90" : "bg-blue hover:bg-blue-dark"
        }`}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      <div
        className={`absolute bottom-18 right-0 w-[360px] h-[480px] bg-white rounded-2xl shadow-2xl border border-gray-2 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
        }`}
      >
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

                {msg.orderSummary && (
                  <div className="mt-2 w-[85%] border border-blue/30 rounded-xl p-3 bg-blue-50 text-[11px] leading-relaxed shadow-sm">
                    <p className="font-bold mb-1 text-dark">📋 Ringkasan Pesanan</p>
                    <p><strong>Produk:</strong> {msg.orderSummary.product_name}</p>
                    {!!msg.orderSummary.panjang_cm && !!msg.orderSummary.lebar_cm && (
                      <p><strong>Ukuran:</strong> {msg.orderSummary.panjang_cm} x {msg.orderSummary.lebar_cm} cm</p>
                    )}
                    <p><strong>Jumlah:</strong> {msg.orderSummary.quantity} pcs</p>
                    {msg.orderSummary.attribute_names.length > 0 && (
                      <p><strong>Bahan:</strong> {msg.orderSummary.attribute_names.join(", ")}</p>
                    )}
                    <p><strong>Deadline:</strong> {msg.orderSummary.deadline}</p>
                    <p><strong>Desain:</strong> {msg.orderSummary.need_design ? "Butuh dibuatkan" : "Siap Cetak (Ada File)"}</p>
                    <p className="font-bold mt-1.5 text-blue text-xs">
                      Total: Rp {msg.orderSummary.subtotal.toLocaleString("id-ID")}
                    </p>

                    {!msg.orderSummary.need_design && (
                      <label className="flex items-center gap-1.5 mt-2.5 text-[11px] text-blue font-medium cursor-pointer hover:underline">
                        <Paperclip size={13} />
                        {chatDesignFile ? `File: ${chatDesignFile.name}` : "Upload File Desain"}
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
                      className="mt-3 w-full bg-blue text-white py-2 rounded-lg font-semibold hover:bg-blue-dark disabled:opacity-50 transition-all shadow-sm"
                    >
                      {isCheckingOut ? "Memproses..." : "Lanjut ke Halaman Checkout 🛒"}
                    </button>
                  </div>
                )}

                <span className="text-[9px] text-gray-400 mt-1 px-1">{msg.time}</span>
              </div>
            );
          })}

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