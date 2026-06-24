import Echo from "laravel-echo";
import Pusher from "pusher-js";

declare global {
  interface Window {
    Pusher: any;
    Echo: any;
  }
}

export function initEcho() {
  // Pastikan berjalan hanya di sisi client
  if (typeof window === "undefined") return;
  if (window.Echo) return;

  window.Pusher = Pusher;

  window.Echo = new Echo({
    broadcaster: "reverb",
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
    wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) || 80,
    wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) || 443,
    forceTLS: true, // Reverb lokal biasanya false
    enabledTransports: ["ws", "wss"],

    // Gunakan URL API dari env untuk auth
    authEndpoint: `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/broadcasting/auth`,
    auth: {
      headers: {
        // Menggunakan getter agar selalu mengambil token terbaru dari localStorage
        get Authorization() {
          return `Bearer ${localStorage.getItem("token") || ""}`;
        },
        Accept: "application/json",
      },
    },
  });

  console.log("Echo initialized successfully!");
}
