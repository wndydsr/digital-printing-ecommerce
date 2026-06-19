import React from "react";
import {
  User,
  ShoppingBag,
  Upload,
  CreditCard,
  Truck,
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
    <section className="py-12">
      <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
        <div className="text-center mb-10">
          <h2 className="text-dark text-2xl font-bold mb-3">
            Langkah-Langkah Order Online
          </h2>
          <p className="text-gray-500">Ikuti langkah mudah berikut untuk memesan produk kami.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className="
                  bg-white
                  border border-blue-100
                  rounded-xl
                  p-6
                  text-center
                  shadow-[0_4px_30px_rgba(59,130,246,0.12)]
                  hover:shadow-[0_8px_30px_rgba(59,130,246,0.25)]
                  hover:-translate-y-1
                  transition-all
                  duration-300
                "
            >
              <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                {step.icon}
              </div>

              <h3 className="font-bold text-dark mb-2">{step.title}</h3>

              <p className="text-sm text-gray-600 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OrderSteps;