"use client";
import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot } from "lucide-react";

interface Message {
  id: number;
  sender: "user" | "ai";
  text: string;
  time: string;
}

const ChatBotWidget = () => {
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
    setInputMessage(""); 

    // 2. Aktifkan animasi mengetik
    setIsTyping(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/chatbot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: temporaryInput }),
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