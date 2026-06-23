"use client";
import React from "react";
import { useDispatch } from "react-redux";
import { useModalContext } from "@/app/context/QuickViewModalContext";
import { updateQuickView } from "@/redux/features/quickView-slice";
import { AppDispatch } from "@/redux/store";

const ProductItem = ({ item }: { item: any }) => { // Gunakan 'any' atau sesuaikan type-nya
  const { openModal } = useModalContext();
  const dispatch = useDispatch<AppDispatch>();

  const handleProductClick = () => {
  // Kirim item apa adanya (semua properti dari Laravel) + mapping gambar
  const productData = {
    ...item, 
    // Pastikan gambar di-mapping agar QuickView bisa menampilkan preview
    imgs: {
      previews: [`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/storage/${item.photo}`],
      thumbnails: [`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/storage/${item.photo}`],
    },
  };
  
  dispatch(updateQuickView(productData));
  openModal();
};

  return (
    <div className="group cursor-pointer" onClick={handleProductClick}>
      <div className="relative overflow-hidden flex items-center justify-center rounded-lg bg-[#F6F7FB] min-h-[270px] mb-4 transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-md">
        <img
          src={item.imgs?.previews?.[0] || "/placeholder.png"} 
          alt={item.title || "Product image"} 
          className="object-contain w-full h-full"
        />
      </div>

      {/* Menampilkan Kategori jika ada */}
      {item.category && (
        <p className="text-xs text-gray-500 uppercase mb-1">{item.category.name}</p>
      )}

      <h3 className="font-medium text-dark ease-out duration-200 group-hover:text-blue mb-1.5">
        {item.title}
      </h3>

      <span className="flex items-center gap-2 font-medium text-lg text-blue-600">
        Rp {Number(item.price || 0).toLocaleString("id-ID")}
      </span>
    </div>
  );
};

export default ProductItem;