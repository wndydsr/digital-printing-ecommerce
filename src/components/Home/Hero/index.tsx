"use client"; // 🔥 Wajib tambahkan ini di paling atas

import React from "react";
import HeroCarousel from "./HeroCarousel";
import HeroFeature from "./HeroFeature";
import Image from "next/image";
// 🔹 Import useRouter untuk mengarahkan halaman
import { useRouter } from "next/navigation"; 

import CategoryDropdown from "../../ShopWithSidebar/CategoryDropdown";

const Hero = () => {
  const router = useRouter(); // 🔥 Inisialisasi router

  return (
    <section className="overflow-hidden pb-10 lg:pb-12.5 xl:pb-15 pt-57.5 sm:pt-45 lg:pt-30 xl:pt-51.5 bg-[#E5EAF4]">
      <div className="max-w-[1300px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="flex flex-col xl:flex-row gap-5">
          
          {/* Sidebar */}
          <div className="xl:w-[270px] w-full">
            <div className="bg-white rounded-[10px] p-5 shadow-1">
              <h3 className="font-semibold text-sm mb-2">
                Categories
              </h3>

              {/* 🔥 Hubungkan fungsi kliknya agar pindah ke halaman shop bawa parameter */}
              {/* Catatan: Sesuaikan "/shop" dengan rute url halaman katalog kamu (misal "/" atau "/product") */}
              <CategoryDropdown 
                onSelect={(id) => router.push(`/shop-with-sidebar?category=${id}`)} 
              />
            </div>
          </div>

          <div className="xl:max-w-[1000px] w-full">
            <div className="relative z-1 rounded-[10px] bg-white overflow-hidden">
              <Image
                src="/images/hero/hero-bg.png"
                alt="hero bg shapes"
                className="absolute right-0 bottom-0 -z-1"
                width={534}
                height={520}
              />

              <HeroCarousel />
            </div>
          </div>
        </div>
      </div>

      <HeroFeature />
    </section>
  );
};

export default Hero;