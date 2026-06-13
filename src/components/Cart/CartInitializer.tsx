"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCartItems } from "@/redux/features/cart-slice";
import { AppDispatch } from "@/redux/store";
// 🔥 1. Import usePathname
import { usePathname } from "next/navigation"; 

export default function CartInitializer() {
  const dispatch = useDispatch<AppDispatch>();
  // 🔥 2. Inisialisasi pathname
  const pathname = usePathname(); 

  useEffect(() => {
    const fetchCartFromDB = async () => {
      const customerStr = localStorage.getItem("customer");
      const token = localStorage.getItem("token");

      // Jika user sedang login (punya customer & token)
      if (customerStr && token) {
        try {
          const customer = JSON.parse(customerStr);
          
          // Memanggil API Keranjang milik customer ini
          const res = await fetch(`http://127.0.0.1:8000/api/cart/${customer.id}`, {
            method: "GET",
            headers: {
              "Accept": "application/json",
              "Authorization": `Bearer ${token}`
            }
          });

          if (res.ok) {
            const json = await res.json();
            
            // Mengecek apakah data items tersedia
            if (json.data && json.data.items) {
              // Memformat data dari database agar cocok dengan struktur Redux
              const formattedItems = json.data.items.map((item: any) => ({
                id: item.product_id,
                title: item.product?.name || "Produk",
                price: item.product?.price || 0,
                quantity: item.quantity,
                panjang: item.panjang || 0,
                lebar: item.lebar || 0,
                selectedOptions: item.selected_options || {},
                img: item.product?.photo 
                  ? (item.product.photo.startsWith("http") ? item.product.photo : `http://127.0.0.1:8000/storage/${item.product.photo}`) 
                  : "/placeholder.png",
                imgs: {
                  previews: [item.product?.photo ? `http://127.0.0.1:8000/storage/${item.product.photo}` : "/placeholder.png"],
                  thumbnails: [item.product?.photo ? `http://127.0.0.1:8000/storage/${item.product.photo}` : "/placeholder.png"]
                }
              }));

              // Memasukkan seluruh data keranjang dari DB ke memori Redux
              dispatch(setCartItems(formattedItems));
            } else {
              // Jika keranjang di database kosong, kosongkan juga di Redux
              dispatch(setCartItems([]));
            }
          }
        } catch (error) {
          console.error("Gagal mengambil sinkronisasi keranjang dari server:", error);
        }
      } else {
        // 🔥 3. Jika TIDAK login (misal baru saja Logout), wajib kosongkan keranjang!
        dispatch(setCartItems([]));
      }
    };

    fetchCartFromDB();
  }, [dispatch, pathname]); // <-- 🔥 4. Tambahkan pathname ke sini agar otomatis ter-trigger saat pindah halaman!

  return null; 
}