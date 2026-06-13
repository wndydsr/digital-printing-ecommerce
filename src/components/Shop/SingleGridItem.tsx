"use client";
import React from "react";
import { Product } from "@/types/product";
import { useModalContext } from "@/app/context/QuickViewModalContext";
import { updateQuickView } from "@/redux/features/quickView-slice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import Image from "next/image";

const SingleGridItem = ({ item }: { item: Product }) => {
  const { openModal } = useModalContext();
  const dispatch = useDispatch<AppDispatch>();

  // Fungsi untuk membuka Quick View saat produk diklik
  const handleProductClick = () => {
    dispatch(updateQuickView({ ...item }));
    openModal();
  };

  return (
    <div 
      className="group cursor-pointer" 
      onClick={handleProductClick}
    >
      {/* Container Gambar */}
      <div className="relative overflow-hidden flex items-center justify-center rounded-lg bg-white shadow-1 min-h-[270px] mb-4 transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-md">
        <img 
          src={item.imgs.previews[0]} 
          alt={item.title || "Product image"} 
          width={250} 
          height={250} 
          className="object-contain"
        />
      </div>

      {/* Rating Bintang */}
      <div className="flex items-center gap-2.5 mb-2">
        <div className="flex items-center gap-1">
          <Image src="/images/icons/icon-star.svg" alt="star icon" width={15} height={15} />
          <Image src="/images/icons/icon-star.svg" alt="star icon" width={15} height={15} />
          <Image src="/images/icons/icon-star.svg" alt="star icon" width={15} height={15} />
          <Image src="/images/icons/icon-star.svg" alt="star icon" width={15} height={15} />
          <Image src="/images/icons/icon-star.svg" alt="star icon" width={15} height={15} />
        </div>
        <p className="text-custom-sm">({item.reviews})</p>
      </div>

      {/* Judul Produk */}
      <h3 className="font-medium text-dark ease-out duration-200 group-hover:text-blue mb-1.5">
        {item.title}
      </h3>

      {/* Harga Produk */}
      <span className="flex items-center gap-2 font-medium text-lg">
        Rp {Number(item.price).toLocaleString("id-ID")}
      </span>
    </div>
  );
};

export default SingleGridItem;