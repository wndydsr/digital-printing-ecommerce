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
              const formattedItems = rawItems.map((item: any) => {
                const product = item.product || {};
                let basePrice = Number(product.price || 0);

                let selectedOpts = item.selected_options || item.selectedOptions || {};
                if (typeof selectedOpts === "string") {
                  try { selectedOpts = JSON.parse(selectedOpts); } catch { selectedOpts = {}; }
                }

                const attributeIds: string[] = [];
                // 🔥 Pindai additional_price dari atribut produk relasi backend
                if (product.attributes && Array.isArray(product.attributes)) {
                  product.attributes.forEach((attr: any) => {
                    const selectedVal = selectedOpts[attr.name] || selectedOpts[String(attr.id)];
                    if (selectedVal && attr.values && Array.isArray(attr.values)) {
                      const matchedVal = attr.values.find(
                        (v: any) => String(v.name).trim() === String(selectedVal).trim() || String(v.id) === String(selectedVal)
                      );
                      if (matchedVal) {
                        basePrice += Number(matchedVal.additional_price || 0);
                        attributeIds.push(String(matchedVal.id));
                      }
                    }
                  });
                }

                if (basePrice === 0 && Number(item.price) > 0) {
                  basePrice = Number(item.price);
                }

                const panjang = Number(item.panjang || 0);
                const lebar = Number(item.lebar || 0);
                const isCustom = product.is_custom == 1 || product.is_custom === true;
                
                let finalPricePerUnit = basePrice;
                if (isCustom && panjang > 0 && lebar > 0) {
                  const luasM2 = (panjang * lebar) / 10000;
                  finalPricePerUnit = luasM2 * basePrice;
                }

                return {
                  id: item.id,
                  product_id: item.product_id,
                  title: product.name || "Produk",
                  price: finalPricePerUnit,
                  quantity: item.quantity,
                  panjang: item.panjang || 0,
                  lebar: item.lebar || 0,
                  selectedOptions: selectedOpts,
                  attributeIds: attributeIds,
                  img: product.photo 
                    ? (product.photo.startsWith("http") ? product.photo : `${process.env.NEXT_PUBLIC_API_URL}/storage/${product.photo}`) 
                    : "/placeholder.png",
                  imgs: {
                    previews: [product.photo ? `${process.env.NEXT_PUBLIC_API_URL}/storage/${product.photo}` : "/placeholder.png"],
                    thumbnails: [product.photo ? `${process.env.NEXT_PUBLIC_API_URL}/storage/${product.photo}` : "/placeholder.png"]
                  },
                  need_design: !!item.need_design,
                  design_method: (item.need_design ? "need-design" : "ready-to-print") as "need-design" | "ready-to-print",
                  dummy_file_name: item.design_file || null,
                };
              });

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