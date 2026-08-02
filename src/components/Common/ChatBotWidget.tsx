"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { checkoutFileCache } from "@/components/Checkout";
import { MessageSquare, X, Send, Bot, Paperclip, FolderPlus } from "lucide-react";

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
  deadline?: string;
  need_design: boolean;
  catatan: string;
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

  // 1. File Siap Cetak (Wajib jika tidak butuh desain)
  const [chatDesignFile, setChatDesignFile] = useState<File | null>(null);
  // 2. File Referensi / Rujukan (Opsional jika butuh dibuatkan desain)
  const [chatReferenceFiles, setChatReferenceFiles] = useState<File[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);

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

    const userMsg: Message = {
      id: Date.now(),
      sender: "user",
      text: inputMessage,
      time: currentTime,
    };

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
          text: "Gagal terhubung ke backend. Pastikan server Laravel aktif.",
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

      // SIMPAN FILE KE CACHE
      if (!summary.need_design && chatDesignFile) {
        checkoutFileCache.readyDesignFile = chatDesignFile;
      }

      // Jika Butuh Desain dan Pelanggan Mengunggah File Referensi (Opsional)
      if (summary.need_design && chatReferenceFiles.length > 0) {
        checkoutFileCache.supportFiles = chatReferenceFiles;
      }

      const isNeedDesignBool = Boolean(summary.need_design);

      const checkoutPayload = {
        customer_id: customerData.id,
        total_price: summary.subtotal.toString(),
        shipping_method: "pickup",
        shipping_cost: "0",
        is_direct: true,
        design_method: isNeedDesignBool ? "need-design" : "ready-to-print", 
        shipping_latitude: "",
        shipping_longitude: "",
        items: [
          {
            id: summary.product_id,
            product_id: summary.product_id,
            product_name: summary.product_name,
            title: summary.product_name,
            img: (summary as any).product_photo || "/placeholder.png",
            name: summary.product_name,
            price: summary.harga_satuan,
            quantity: summary.quantity,
            panjang: summary.panjang_cm || 0,
            lebar: summary.lebar_cm || 0,
            subtotal: summary.subtotal,
            need_design: isNeedDesignBool, 
            designMethod: isNeedDesignBool ? "need-design" : "ready-to-print",
            design_method: isNeedDesignBool ? "need-design" : "ready-to-print",
            dummy_file_name: isNeedDesignBool 
              ? (chatReferenceFiles[0]?.name || "materi_referensi_pembeli.png") 
              : null,
            catatan: summary.catatan || "-",
            selectedOptions: {},
            attributes: summary.attribute_value_ids.map(String),
            attribute_names: summary.attribute_names,
          },
        ],
      };

      sessionStorage.setItem("pendingCheckoutData", JSON.stringify(checkoutPayload));
      sessionStorage.setItem("checkoutItems", JSON.stringify(checkoutPayload.items));

      router.push("/checkout");

    } catch (error) {
      console.error("Gagal menyiapkan checkout dari chat:", error);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-99999 font-sans">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full text-white shadow-lg transition-all duration-300 transform hover:scale-105 ${
          isOpen ? "bg-dark hover:bg-opacity-90 rotate-90" : "bg-blue hover:bg-blue-dark"
        }`}
      >
        {isOpen ? <X size={22} /> : <MessageSquare size={22} />}
      </button>

      {/* Jendela Chat Responsif */}
      <div
        className={`fixed sm:absolute bottom-20 right-4 left-4 sm:left-auto sm:right-0 w-auto sm:w-[380px] h-[80vh] sm:h-[500px] max-h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-2 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${
          isOpen ? "scale-100 opacity-100 pointer-events-auto" : "scale-0 opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-blue p-3.5 sm:p-4 flex items-center gap-3 text-white shadow-md shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
            <Bot size={18} className="text-white" />
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm tracking-wide">Nora - AI Assistant</h4>
            <span className="text-[10px] sm:text-[11px] text-blue-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Online / Siap Membantu
            </span>
          </div>
        </div>

        <div className="flex-1 p-3 sm:p-4 overflow-y-auto bg-gray-50 space-y-3 no-scrollbar">
          {messages.map((msg) => {
            const isAI = msg.sender === "ai";
            return (
              <div key={msg.id} className={`flex flex-col ${isAI ? "items-start" : "items-end"}`}>
                <div
                  className={`max-w-[85%] sm:max-w-[80%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm whitespace-pre-line ${
                    isAI
                      ? "bg-white text-dark rounded-tl-none border border-gray-100"
                      : "bg-blue text-white rounded-tr-none"
                  }`}
                >
                  {msg.text}
                </div>

                {/* CARD RINGKASAN PESANAN */}
                {msg.orderSummary && (
                  <div className="mt-2 w-[90%] sm:w-[85%] border border-blue/30 rounded-xl p-3 bg-blue-50 text-[11px] leading-relaxed shadow-sm">
                    <p className="font-bold mb-1 text-dark">📋 Ringkasan Pesanan</p>
                    <p><strong>Produk:</strong> {msg.orderSummary.product_name}</p>
                    {!!msg.orderSummary.panjang_cm && !!msg.orderSummary.lebar_cm && (
                      <p><strong>Ukuran:</strong> {msg.orderSummary.panjang_cm} x {msg.orderSummary.lebar_cm} cm</p>
                    )}
                    <p><strong>Jumlah:</strong> {msg.orderSummary.quantity} pcs</p>
                    {msg.orderSummary.attribute_names.length > 0 && (
                      <p><strong>Bahan:</strong> {msg.orderSummary.attribute_names.join(", ")}</p>
                    )}
                    <p><strong>Desain:</strong> {msg.orderSummary.need_design ? "Butuh dibuatkan" : "Siap Cetak (Ada File)"}</p>
                    <p className="mt-1 text-gray-700"><strong>Catatan:</strong> {msg.orderSummary.catatan}</p>
                    <p className="font-bold mt-1.5 text-blue text-xs">
                      Total: Rp {msg.orderSummary.subtotal.toLocaleString("id-ID")}
                    </p>

                    {/* 1. JIKA SIAP CETAK: UPLOAD FILE DESAIN MASTER (WAJIB) */}
                    {!msg.orderSummary.need_design && (
                      <label className="flex items-center gap-1.5 mt-2.5 text-[11px] text-blue font-medium cursor-pointer hover:underline">
                        <Paperclip size={13} />
                        {chatDesignFile ? `File: ${chatDesignFile.name}` : "Upload File Desain Siap Cetak (Wajib)"}
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          onChange={(e) => setChatDesignFile(e.target.files?.[0] || null)}
                        />
                      </label>
                    )}

                    {/* 2. JIKA BUTUH DESAIN: UPLOAD FILE REFERENSI / MATERI RUJUKAN (OPSIONAL) */}
                    {msg.orderSummary.need_design && (
                      <div className="mt-2.5 pt-2 border-t border-blue-200/60 space-y-1">
                        <label className="flex items-center gap-1.5 text-[11px] text-orange-600 font-medium cursor-pointer hover:underline">
                          <FolderPlus size={13} />
                          {chatReferenceFiles.length > 0 
                            ? `Terlampir: ${chatReferenceFiles.length} File Referensi` 
                            : "Upload File Referensi / Contoh Logo (Opsional)"}
                          <input
                            type="file"
                            multiple
                            accept="image/*,application/pdf"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files) {
                                setChatReferenceFiles(Array.from(e.target.files));
                              }
                            }}
                          />
                        </label>

                        {/* List File Referensi Terlampir */}
                        {chatReferenceFiles.length > 0 && (
                          <div className="space-y-1 mt-1">
                            {chatReferenceFiles.map((file, idx) => (
                              <div key={idx} className="flex items-center justify-between text-[10px] bg-white px-2 py-1 rounded border border-orange-200 text-gray-600">
                                <span className="truncate max-w-[180px]">📁 {file.name}</span>
                                <button
                                  type="button"
                                  onClick={() => setChatReferenceFiles(chatReferenceFiles.filter((_, i) => i !== idx))}
                                  className="text-red-500 font-bold hover:underline"
                                >
                                  Hapus
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
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

        <form onSubmit={handleSendMessage} className="p-2.5 sm:p-3 bg-white border-t border-gray-2 flex gap-2 items-center shrink-0">
          <input
            type="text"
            className="flex-1 bg-gray-100 border border-transparent focus:border-gray-3 px-3 py-2 sm:py-2.5 rounded-xl text-xs text-dark focus:outline-none transition-all"
            placeholder="Tanyakan harga banner, jenis stiker dll..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isTyping}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl bg-blue text-white hover:bg-blue-dark disabled:opacity-40 disabled:hover:bg-blue transition-all shrink-0"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBotWidget;