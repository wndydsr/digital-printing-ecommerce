"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Breadcrumb from "../Common/Breadcrumb";
import ShippingMethod from "./ShippingMethod";
import PaymentMethod from "./PaymentMethod";
import { useAppSelector, AppDispatch } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
// Import pemanggil total harga dari cart-slice (sama seperti di OrderSummary)
import { removeAllItemsFromCart, selectTotalPrice } from "@/redux/features/cart-slice"; 

const Checkout = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [loading, setLoading] = useState(false);
  const [customerData, setCustomerData] = useState<any>(null);

  // 🔥 PERBAIKAN: Mengambil data keranjang dari "items" (sesuai Redux Anda)
  const cartItems = useAppSelector((state: any) => state.cartReducer.items) || [];
  
  // 🔥 PERBAIKAN: Mengambil total harga dari selector bawaan Redux Anda
  const totalPrice = useSelector(selectTotalPrice);

  useEffect(() => {
    const customerStr = localStorage.getItem("customer");
    const token = localStorage.getItem("token");

    if (!customerStr || !token) {
      alert("Silakan login terlebih dahulu");
      router.push("/signin");
    } else {
      setCustomerData(JSON.parse(customerStr));
    }
  }, [router]);

  // Fungsi untuk memproses pesanan ke Database via API
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      alert("Keranjang Kosong! Silakan pilih produk terlebih dahulu.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("customer_id", customerData.id);
      formData.append("total_price", totalPrice.toString());
      
      // Default pesanan dari pelanggan masuk tahap ID 1 (Menunggu / Butuh Desain)
      formData.append("current_stage_id", "1"); 

      cartItems.forEach((item: any, index: number) => {
        formData.append(`items[${index}][product_id]`, item.id);
        formData.append(`items[${index}][quantity]`, item.quantity);
        formData.append(`items[${index}][panjang]`, item.panjang || 0);
        formData.append(`items[${index}][lebar]`, item.lebar || 0);
        formData.append(`items[${index}][need_design]`, "0"); 

        // Menyertakan Atribut (Spesifikasi Cetak)
        if (item.selectedOptions) {
          Object.values(item.selectedOptions).forEach((opt: any) => {
            formData.append(`items[${index}][attributes][]`, String(opt.id));
          });
        }
      });

      // Panggil API Backend membuat pesanan
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:8000/api/orders", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Gagal menyimpan pesanan");
      }

      // 🔥 KOSONGKAN KERANJANG DI DATABASE SETELAH CHECKOUT SUKSES
      await fetch(`http://127.0.0.1:8000/api/cart/clear/${customerData.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      alert("Pesanan berhasil dibuat! Akan segera diproses.");
      dispatch(removeAllItemsFromCart());
      
      // Arahkan ke halaman sukses
      router.push(`/payment?amount=${totalPrice}`);

    } catch (error) {
      console.error("Checkout error:", error);
      alert("Terjadi kesalahan saat memproses pesanan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb title={"Checkout"} pages={["checkout"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <form onSubmit={handleCheckoutSubmit}>
            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11">
              
              {/* */}
              <div className="lg:max-w-[670px] w-full">
                <div className="bg-white shadow-1 rounded-[10px] overflow-hidden">

                  {/* Header */}
                  <div className="border-b border-gray-3 py-5 px-6 flex items-center justify-between">
                    <h3 className="font-medium text-xl text-dark">
                      Item Pesanan ({cartItems.length} Item)
                    </h3>
                  </div>

                  {/* Table Header */}
                  <div className="grid grid-cols-6 gap-4 px-6 py-4 border-b border-gray-3 bg-gray-1 text-sm font-medium">
                    <div>Gambar</div>
                    <div className="col-span-2">Produk</div>
                    <div className="text-center">Qty</div>
                    <div className="text-center">Harga</div>
                    <div className="text-center">Total</div>
                  </div>

                  {/* 🔥 Render Produk dari Cart Redux */}
                  {cartItems.length > 0 ? (
                    cartItems.map((item: any, idx: number) => {
                      // Mengatasi perbedaan key "price" vs "discountedPrice" di Redux Anda
                      const itemPrice = item.price || item.discountedPrice || 0;

                      return (
                        <div key={idx} className="grid grid-cols-6 gap-4 px-6 py-5 items-center border-b border-gray-3">
                          <div>
                            <img
                              src={item.img || item.imgs?.previews?.[0] || "/placeholder.png"}
                              alt={item.title}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                          </div>

                          <div className="col-span-2">
                            <h4 className="font-medium text-dark">
                              {item.title}
                            </h4>
                            {item.selectedOptions && (
                              <p className="text-xs text-gray-500 mt-1">
                                {Object.values(item.selectedOptions).map((opt: any) => opt.name).join(", ")}
                              </p>
                            )}
                            {Number(item.panjang) > 0 && Number(item.lebar) > 0 && (
                              <p className="text-xs text-gray-500">
                                Ukuran: {item.panjang} x {item.lebar} cm
                              </p>
                            )}
                          </div>

                          <div className="text-center font-medium">
                            {item.quantity}
                          </div>

                          <div className="text-center">
                            Rp {Number(itemPrice).toLocaleString("id-ID")}
                          </div>

                          <div className="text-center font-medium text-red">
                            Rp {(Number(itemPrice) * Number(item.quantity)).toLocaleString("id-ID")}
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center py-10 text-gray-500">
                      Keranjang belanja Anda kosong.
                    </div>
                  )}

                  {/* Subtotal / Total */}
                  <div className="flex items-center justify-between px-6 py-5">
                    <span className="font-medium text-dark">
                      Total Pembayaran
                    </span>
                    <span className="font-semibold text-red text-lg">
                      Rp {totalPrice.toLocaleString("id-ID")}
                    </span>
                  </div>

                </div>
              </div>

              {/* */}
              <div className="max-w-[455px] w-full">

                {/* */}
                <ShippingMethod />

                {/* */}
                <PaymentMethod />

                {/* */}
                <button
                  type="submit"
                  disabled={loading || cartItems.length === 0}
                  className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Memproses..." : "Process to Checkout"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default Checkout;