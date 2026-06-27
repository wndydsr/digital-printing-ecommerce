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
              <div className="w-9 h-9 bg-[#3C50E0] rounded flex items-center justify-center text-white font-bold text-lg shrink-0">
                P
              </div>
              <div>
                <h2 className="text-xl font-bold text-dark leading-none">
                  Print<span className="text-[#3C50E0]">Ora.</span>
                </h2>
                <span className="text-[10px] text-gray-400 block mt-1">Solusi Cetak Berkualitas</span>
              </div>
            </div>

            <p className="text-custom-sm text-gray-500 mb-6 leading-relaxed">
              Solusi percetakan online terpercaya dengan pemesanan, approval desain, tracking pesanan, dan AI Assistant.
            </p>

            {/* */}
            <div className="flex items-center gap-4 mt-7.5">
              <a href="#" aria-label="Instagram Social Link" className="flex ease-out duration-200 hover:text-blue">
                <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_317_501)">
                    <path d="M19.6562 6C19.625 5 19.4375 4.28125 19.2187 3.625C19 2.96875 18.6562 2.4375 18.125 1.90625C17.5937 1.375 17.0625 1.0625 16.4375 0.8125C15.8125 0.5625 15.125 0.40625 14.0625 0.375C12.9687 0.3125 12.6562 0.3125 10 0.3125C7.34375 0.3125 7.0625 0.3125 6 0.34375C4.9375 0.375 4.28125 0.5625 3.625 0.78125C2.96875 1 2.4375 1.375 1.90625 1.90625C1.375 2.4375 1.03125 2.96875 0.8125 3.625C0.5625 4.25 0.40625 4.9375 0.375 6C0.34375 7.0625 0.3125 7.34375 0.3125 10C0.3125 12.6562 0.3125 12.9375 0.34375 14C0.375 15.0625 0.5625 15.7188 0.78125 16.375C1 17.0312 1.34375 17.5625 1.875 18.0938C2.40625 18.625 2.96875 18.9688 3.59375 19.1875C4.21875 19.4062 4.90625 19.5938 5.96875 19.625C7.03125 19.6875 7.3125 19.6875 9.96875 19.6875C12.625 19.6875 12.9062 19.6875 13.9687 19.6562C15.0312 19.625 15.6875 19.4375 16.3437 19.2188C17 19 17.5312 18.6562 18.0625 18.125C18.5937 17.5938 18.9375 17.0312 19.1562 16.4062C19.375 15.7812 19.5625 15.0938 19.5937 14.0312C19.625 13.0312 19.625 12.7188 19.625 10.0625C19.625 7.40625 19.6875 7.0625 19.6562 6ZM17.9062 13.9062C17.875 14.8438 17.6875 15.3438 17.5625 15.7188C17.375 16.1562 17.1562 16.5 16.8125 16.8125C16.4687 17.1562 16.1562 17.3438 15.7187 17.5625C15.375 17.6875 14.875 17.875 13.9062 17.9062C12.9062 17.9062 12.5937 17.9062 10.0312 17.9062C7.46875 17.9062 7.125 17.9062 6.125 17.875C5.1875 17.8438 4.6875 17.6562 4.3125 17.5312C3.875 17.3438 3.53125 17.125 3.21875 16.7812C2.875 16.4375 2.6875 16.125 2.46875 15.6875C2.34375 15.3438 2.15625 14.8438 2.125 13.875C2.125 12.9063 2.125 12.5938 2.125 10C2.125 7.40625 2.125 7.09375 2.15625 6.09375C2.1875 5.15625 2.375 4.65625 2.5 4.28125C2.6875 3.84375 2.90625 3.5 3.21875 3.1875C3.5625 2.84375 3.875 2.65625 4.3125 2.46875C4.65625 2.34375 5.15625 2.15625 6.125 2.125C7.125 2.09375 7.4375 2.09375 10.0312 2.09375C12.625 2.09375 12.9375 2.09375 13.9375 2.125C14.875 2.15625 15.375 2.34375 15.75 2.46875C16.1875 2.65625 16.5312 2.875 16.8437 3.1875C17.1875 3.53125 17.375 3.84375 17.5937 4.28125C17.7187 4.625 17.9062 5.125 17.9375 6.09375C17.9687 7.09375 17.9687 7.40625 17.9687 10C17.9687 12.5938 17.9375 12.9062 17.9062 13.9062Z" fill="" />
                    <path d="M10.0005 5.03125C7.21924 5.03125 5.03174 7.28125 5.03174 10C5.03174 12.7812 7.28174 14.9688 10.0005 14.9688C12.7192 14.9688 15.0005 12.7812 15.0005 10C15.0005 7.21875 12.7817 5.03125 10.0005 5.03125ZM10.0005 13.25C8.18799 13.25 6.75049 11.7812 6.75049 10C6.75049 8.21875 8.21924 6.75 10.0005 6.75C11.813 6.75 13.2505 8.1875 13.2505 10C13.2505 11.8125 11.813 13.25 10.0005 13.25Z" fill="" />
                    <path d="M15.2188 5.96875C15.8573 5.96875 16.375 5.45106 16.375 4.8125C16.375 4.17391 15.8573 3.65625 15.2188 3.65625C14.5802 3.65625 14.0625 4.17391 14.0625 4.8125C14.0625 5.45106 14.5802 5.96875 15.2188 5.96875Z" fill="" />
                  </g>
                  <defs>
                    <clipPath id="clip0_317_501"><rect width="20" height="20" fill="white" /></clipPath>
                  </defs>
                </svg>
              </a>

              <a href="#" aria-label="Facebook Social Link" className="flex ease-out duration-200 hover:text-blue">
                <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.99984 0.666504C7.48706 0.666504 6.09165 1.04648 4.81361 1.80644C3.53557 2.54019 2.51836 3.5491 1.76197 4.83317C1.03166 6.11724 0.666504 7.51923 0.666504 9.03915C0.666504 10.428 0.966452 11.7252 1.56635 12.9307C2.19233 14.1099 3.04 15.0926 4.10938 15.8788C5.17876 16.6649 6.37855 17.1497 7.70876 17.3332V11.4763H5.59608V9.03915H7.70876V7.19166C7.70876 6.16965 7.98262 5.37038 8.53035 4.79386C9.10417 4.21734 9.8736 3.92908 10.8386 3.92908C11.4646 3.92908 12.0906 3.98149 12.7166 4.08632V6.16965H11.6602C11.1908 6.16965 10.8386 6.30068 10.6039 6.56273C10.3952 6.79858 10.2909 7.09994 10.2909 7.46682V9.03915H12.6383L12.2471 11.4763H10.2909V17.3332C11.6472 17.1235 12.86 16.6256 13.9294 15.8395C14.9988 15.0533 15.8334 14.0706 16.4333 12.8913C17.0332 11.6859 17.3332 10.4018 17.3332 9.03915C17.3332 7.51923 16.955 6.11724 16.1986 4.83317C15.4683 3.5491 14.4641 2.54019 13.1861 1.80644C11.908 1.04648 10.5126 0.666504 8.99984 0.666504Z" fill="" />
                </svg>
              </a>

              <a href="#" aria-label="TikTok Social Link" className="flex ease-out duration-200 hover:text-blue">
                <svg className="fill-current" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.53 21c-3.41 0-6.2-2.79-6.2-6.2 0-3.41 2.79-6.2 6.2-6.2.34 0 .67.03 1 .09V5.03c-.33-.02-.66-.03-1-.03-5.29 0-9.6 4.31-9.6 9.6s4.31 9.6 9.6 9.6 9.6-4.31 9.6-9.6v-5.9c-1.33.91-2.93 1.45-4.66 1.48v-3.42c1.93 0 3.51-1.37 3.86-3.21h3.33v11.05c0 5.29-4.31 9.6-9.6 9.6z" fill="currentColor"/>
                </svg>
              </a>

              <a href="#" aria-label="YouTube Social Link" className="flex ease-out duration-200 hover:text-blue">
                <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.3332 4.91293C17.7353 5.18229 17.0875 5.36594 16.39 5.46389C17.1124 5.02312 17.6107 4.39869 17.8847 3.59061C17.2121 3.98241 16.4896 4.25177 15.7173 4.39869C15.0447 3.68856 14.1976 3.3335 13.1762 3.3335C12.2544 3.3335 11.4572 3.66407 10.7846 4.32523C10.1119 4.98639 9.77562 5.78223 9.77562 6.71274C9.77562 6.95762 9.81299 7.21473 9.88773 7.48409C8.49261 7.41063 7.17223 7.06781 5.92659 6.45563C4.70587 5.81896 3.67198 4.98639 2.82495 3.95792C2.526 4.47216 2.37652 5.03536 2.37652 5.64755C2.37652 6.23524 2.51354 6.77396 2.78758 7.26371C3.06162 7.75345 3.42286 8.14525 3.87129 8.4391C3.34812 8.4391 2.83741 8.30442 2.33915 8.03506V8.07179C2.33915 8.87987 2.60073 9.59 3.1239 10.2022C3.64707 10.8144 4.29481 11.2062 5.0671 11.3776C4.79306 11.451 4.49411 11.4878 4.17024 11.4878C3.97094 11.4878 3.75918 11.4633 3.53496 11.4143C3.75918 12.0999 4.15778 12.6632 4.73078 13.1039C5.32869 13.5202 5.98888 13.7406 6.71135 13.7651C5.49062 14.7201 4.08305 15.1976 2.48863 15.1976C2.21459 15.1976 1.94054 15.1853 1.6665 15.1609C3.26092 16.1648 5.00482 16.6668 6.89819 16.6668C8.89122 16.6668 10.66 16.1648 12.2046 15.1609C13.6247 14.2793 14.7333 13.0794 15.5305 11.5612C16.2779 10.1165 16.6516 8.635 16.6516 7.11678L16.6142 6.67601C17.2868 6.21075 17.8598 5.62306 18.3332 4.91293Z" fill="" />
                </svg>
              </a>
            </div>
          </div>

          {/* Kolom 2: Layanan Kami */}
          <div className="w-full sm:w-auto">
            <h2 className="mb-7.5 text-custom-1 font-medium text-dark">
              Layanan Kami
            </h2>
            <ul className="flex flex-col gap-3.5">
              <li><a className="ease-out duration-200 hover:text-blue" href="#">Banner & Spanduk</a></li>
              <li><a className="ease-out duration-200 hover:text-blue" href="#">Brosur & Flyer</a></li>
              <li><a className="ease-out duration-200 hover:text-blue" href="#">Stiker</a></li>
              <li><a className="ease-out duration-200 hover:text-blue" href="#">Kartu Nama</a></li>
              <li><a className="ease-out duration-200 hover:text-blue" href="#">Kalender</a></li>
              <li><a className="ease-out duration-200 hover:text-blue" href="#">Kemasan Produk</a></li>
            </ul>
          </div>

          {/* Kolom 3: Menu Cepat */}
          <div className="w-full sm:w-auto">
            <h2 className="mb-7.5 text-custom-1 font-medium text-dark">
              Menu Cepat
            </h2>
            <ul className="flex flex-col gap-3">
              <li><a className="ease-out duration-200 hover:text-blue" href="#">Beranda</a></li>
              <li><a className="ease-out duration-200 hover:text-blue" href="#">Produk</a></li>
              <li><a className="ease-out duration-200 hover:text-blue" href="#">Pesanan Saya</a></li>
              <li><a className="ease-out duration-200 hover:text-blue" href="#">Tracking Pesanan</a></li>
              <li><a className="ease-out duration-200 hover:text-blue" href="#">Chatbot AI</a></li>
              <li><a className="ease-out duration-200 hover:text-blue" href="#">Kontak</a></li>
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