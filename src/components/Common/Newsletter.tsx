import React from "react";
import Image from "next/image";
import {
  User,
  ShoppingBag,
  Upload,
  CreditCard,
  Truck,
} from "lucide-react";

const OrderSteps = () => {
  const steps = [
    {
      icon: <User size={28} />,
      title: "Login",
      desc: "Masuk atau daftar akun.",
    },
    {
      icon: <ShoppingBag size={28} />,
      title: "Pilih Produk",
      desc: "Pilih jenis dan spesifikasi produk.",
    },
    {
      icon: <Upload size={28} />,
      title: "Upload Desain",
      desc: "Upload desain sendiri atau gunakan jasa desain kami.",
    },
    {
      icon: <CreditCard size={28} />,
      title: "Checkout",
      desc: "Konfirmasi pesanan dan lakukan pembayaran.",
    },
    {
      icon: <Truck size={28} />,
      title: "Pengiriman",
      desc: "Pesanan dikirim atau dapat diambil langsung.",
    },
  ];

  return (
    <section className="overflow-hidden">
      <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
        <div className="relative overflow-hidden rounded-xl">

          <Image
            src="/images/shapes/newsletter-bg.jpg"
            alt="background"
            fill
            className="absolute inset-0 object-cover -z-10"
          />

          <div className="absolute inset-0 bg-blue-900/80 -z-10"></div>

          <div className="py-4 px-6 lg:px-12">
            <div className="text-center mb-8">
              <h2 className="text-white text-2xl font-semibold mb-3">
                Langkah-Langkah Order Online
              </h2>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5 text-center text-white hover:bg-white/15 transition"
                >
                  <div className="w-6 h-6 mx-auto mb-4 flex items-center justify-center rounded-full bg-blue-500">
                    {step.icon}
                  </div>

                  <h3 className="font-bold mb-2">{step.title}</h3>

                  <p className="text-sm text-white/75">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default OrderSteps;