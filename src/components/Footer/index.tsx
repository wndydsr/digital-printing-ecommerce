import React from "react";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="overflow-hidden">
      <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
        {/* */}
        <div className="flex flex-wrap xl:flex-nowrap gap-10 xl:gap-19 xl:justify-between pt-17.5 xl:pt-22.5 pb-10 xl:pb-15">
          
          {/* Kolom 1: Logo & Deskripsi Sistem Digital Printing */}
          <div className="max-w-[330px] w-full">
            <div className="mb-6 flex items-center gap-3">
              {/* Ganti bagian kotak 'P' dan teks PrinOra dengan gambar logo */}
              <Link href="/" className="flex items-center gap-2">
                <Image 
                  src="/images/logo/prinora.png" 
                  alt="Logo Prinora" 
                  width={140} 
                  height={40} 
                  className="object-contain"
                />
              </Link>
            </div>

            <p className="text-custom-sm text-gray-500 mb-6 leading-relaxed">
              Solusi percetakan online terpercaya dengan pemesanan, approval desain, tracking pesanan, dan AI Assistant.
            </p>
          </div>

          {/* Kolom 2: Layanan Kami */}
          <div className="w-full sm:w-auto">
            <h2 className="mb-7.5 text-custom-1 font-medium text-dark">
              Layanan Kami
            </h2>
            <ul className="flex flex-col gap-3.5">
              <li>
                <Link className="ease-out duration-200 hover:text-blue" href="/shop-with-sidebar?category=3">
                  Banner & Spanduk
                </Link>
              </li>
              <li>
                <Link className="ease-out duration-200 hover:text-blue" href="/shop-with-sidebar?category=4">
                  Media Cetak
                </Link>
              </li>
              <li>
                <Link className="ease-out duration-200 hover:text-blue" href="/shop-with-sidebar?category=5">
                  Stiker
                </Link>
              </li>
              <li>
                <Link className="ease-out duration-200 hover:text-blue" href="/shop-with-sidebar?category=6">
                  Kebutuhan Kantor
                </Link>
              </li>
              <li>
                <Link className="ease-out duration-200 hover:text-blue" href="/shop-with-sidebar?category=1">
                  Kalender
                </Link>
              </li>
              <li>
                <Link className="ease-out duration-200 hover:text-blue" href="/shop-with-sidebar?category=2">
                  Merchandise
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Menu Cepat */}
          <div className="w-full sm:w-auto">
            <h2 className="mb-7.5 text-custom-1 font-medium text-dark">
              Menu Cepat
            </h2>
            <ul className="flex flex-col gap-3">
              <li>
                <Link className="ease-out duration-200 hover:text-blue" href="/">
                  Beranda
                </Link>
              </li>
              <li>
                <Link className="ease-out duration-200 hover:text-blue" href="/shop-with-sidebar">
                  Produk
                </Link>
              </li>
              <li>
                <Link className="ease-out duration-200 hover:text-blue" href="/my-account">
                  Akun Saya
                </Link>
              </li>
              <li>
                <Link className="ease-out duration-200 hover:text-blue" href="/my-account?tab=orders">
                  Tracking Pesanan
                </Link>
              </li>
              <li>
                <button 
                  onClick={() => {
                    // Mengirim sinyal agar ChatBotWidget terbuka
                    window.dispatchEvent(new CustomEvent("open-chatbot"));
                  }}
                  className="ease-out duration-200 hover:text-blue text-left w-full bg-transparent border-none cursor-pointer"
                >
                  Chatbot AI
                </button>
              </li>
            </ul>
          </div>

          {/* Kolom 4: Bantuan */}
          <div className="w-full sm:w-auto">
            <h2 className="mb-7.5 text-custom-1 font-medium text-dark">
              Bantuan
            </h2>
            <ul className="flex flex-col gap-3">
              <li>
              <Link className="ease-out duration-200 hover:text-blue" href="/cara-pemesanan">
                  Cara Pemesanan
                </Link>
              </li>
              <li>
                <Link className="ease-out duration-200 hover:text-blue" href="/faq">
                  FAQ
                </Link>
              </li>
               <li>
                <Link className="ease-out duration-200 hover:text-blue" href="/kebijakan-privasi">
                  Kebijakan Privasi
                </Link>
              </li>
              <li><a className="ease-out duration-200 hover:text-blue" href="/syarat-ketentuan">
                Syarat & Ketentuan
              </a></li>
            </ul>
          </div>

          

        </div>
        {/* */}
      </div>

      {/* */}
      <div className="py-5 xl:py-7.5 bg-gray-1 border-t border-gray-100">
        <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
          <div className="text-center">
            <p className="text-dark font-medium text-sm">
              &copy; {year} PrinOra. All rights reserved.
            </p>
          </div>
        </div>
      </div>
      {/* */}
    </footer>
  );
};

export default Footer;