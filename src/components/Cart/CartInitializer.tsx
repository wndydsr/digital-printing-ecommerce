"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCartItems } from "@/redux/features/cart-slice";
import { AppDispatch } from "@/redux/store";
import { usePathname } from "next/navigation"; 

export default function CartInitializer() {
  const dispatch = useDispatch<AppDispatch>();
  const pathname = usePathname(); 

  useEffect(() => {
    const fetchCartFromDB = async () => {
      const customerStr = localStorage.getItem("customer");
      const token = localStorage.getItem("token");

      if (customerStr && token) {
        try {
          const customer = JSON.parse(customerStr);
          
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/${customer.id}`, {
            method: "GET",
            headers: {
              "Accept": "application/json",
              "Authorization": `Bearer ${token}`
            }
          });

          if (res.ok) {
            const json = await res.json(); 
            const rawItems = Array.isArray(json) ? json : [];

            if (rawItems.length > 0) {
              const formattedItems = rawItems.map((item: any) => ({
                id: item.id,
                product_id: item.product_id,
                title: item.product?.name || "Produk",
                price: item.product?.price || 0,
                quantity: item.quantity,
                panjang: item.panjang || 0,
                lebar: item.lebar || 0,
                selectedOptions: item.selected_options || {},
                img: item.product?.photo 
                  ? (item.product.photo.startsWith("http") ? item.product.photo : `${process.env.NEXT_PUBLIC_API_URL}/storage/${item.product.photo}`) 
                  : "/placeholder.png",
                imgs: {
                  previews: [item.product?.photo ? `${process.env.NEXT_PUBLIC_API_URL}/storage/${item.product.photo}` : "/placeholder.png"],
                  thumbnails: [item.product?.photo ? `${process.env.NEXT_PUBLIC_API_URL}/storage/${item.product.photo}` : "/placeholder.png"]
                },
                need_design: !!item.need_design,
                design_method: (item.need_design ? "need-design" : "ready-to-print") as "need-design" | "ready-to-print",
                dummy_file_name: item.design_file || null,
              }));

              dispatch(setCartItems(formattedItems));
            } else {
              dispatch(setCartItems([]));
            }
          }
        } catch (error) {
          console.error("Gagal mengambil sinkronisasi keranjang dari server:", error);
        }
      } else {
        dispatch(setCartItems([]));
      }
    };

    fetchCartFromDB();
  }, [dispatch, pathname]); 

  return null; 
}