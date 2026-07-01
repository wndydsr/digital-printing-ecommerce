import React from "react";
import {
  User,
  ShoppingBag,
  Upload,
  CreditCard,
  Truck,
  ChevronRight,
} from "lucide-react";

const OrderSteps = () => {
  const steps = [
    { icon: <User size={24} />, title: "Login", desc: "Masuk atau daftar akun." },
    { icon: <ShoppingBag size={24} />, title: "Pilih Produk", desc: "Pilih jenis dan spesifikasi produk." },
    { icon: <Upload size={24} />, title: "Upload Desain", desc: "Upload desain sendiri atau gunakan jasa kami." },
    { icon: <CreditCard size={24} />, title: "Checkout", desc: "Konfirmasi pesanan dan lakukan pembayaran." },
    { icon: <Truck size={24} />, title: "Pengiriman", desc: "Pesanan dikirim atau dapat diambil langsung." },
  ];

  return (
    <section className="py-20 bg-[#fafbfe]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-8">
        
        {/* --- HEADER SECTION --- */}
        <div className="text-center mb-16">
          <span className="text-[11px] font-black tracking-[0.2em] text-blue uppercase block mb-3">
            Let's Get Printing
          </span>
          <h2 className="text-dark text-3xl md:text-4xl font-black mb-4 tracking-tight max-w-2xl mx-auto leading-tight">
            Reasons to get <span className="text-blue">printing</span>{" "}
            <span className="text-purple-600">started</span> with us
          </h2>
          <p className="text-gray-500 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Ikuti 5 langkah mudah berikut untuk melakukan pemesanan cetak online berkualitas tinggi bersama kami.
          </p>
        </div>

        {/* --- STEPS CONTAINER --- */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-4 relative">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              {/* Card Step */}
              <div className="flex-1 w-full max-w-[210px] flex flex-col items-center text-center group">
                {/* Lingkaran Icon Wrapper */}
                <div className="w-16 h-16 mb-5 flex items-center justify-center rounded-2xl bg-white border border-gray-100 shadow-[0_10px_25px_rgba(59,130,246,0.06)] text-blue group-hover:text-white group-hover:bg-blue group-hover:shadow-[0_10px_25px_rgba(59,130,246,0.25)] transition-all duration-300 transform group-hover:-translate-y-1">
                  {step.icon}
                </div>

                {/* Judul Langkah */}
                <h3 className="font-bold text-dark text-base mb-2 group-hover:text-blue transition-colors duration-200">
                  {step.title}
                </h3>

                {/* Deskripsi */}
                <p className="text-xs text-gray-500 leading-relaxed font-normal">
                  {step.desc}
                </p>
              </div>

              {/* --- GENERATOR PANAH PEMBATAS (DOTTED LINE WITH ARROW) --- */}
              {index < steps.length - 1 && (
                <div className="hidden lg:flex items-center justify-center flex-1 max-w-[60px] mb-14">
                  <div className="flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-gray-300 animate-pulse" />
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <div className="w-4 h-4 rounded-full bg-purple-50 flex items-center justify-center border border-purple-200 ml-1">
                      <ChevronRight size={10} className="text-purple-600 stroke-[3]" />
                    </div>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

      </div>
    </section>
  );
};

export default OrderSteps;