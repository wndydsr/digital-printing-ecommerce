"use client";
import { selectTotalPrice } from "@/redux/features/cart-slice";
import { useAppSelector } from "@/redux/store";
import React from "react";
import { useSelector } from "react-redux";
import Link from "next/link"; // 🔥 Import Link untuk navigasi

const OrderSummary = () => {
  const cartItems = useAppSelector((state: any) => state.cartReducer.items) || [];
  const totalPrice = useSelector(selectTotalPrice) || 0;

  return (
    <div className="lg:max-w-[455px] w-full">
      {/* */}
      <div className="bg-white shadow-1 rounded-[10px]">
        <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
          <h3 className="font-medium text-xl text-dark">Ringkasan Pesanan</h3>
        </div>

        <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
          {/* */}
          <div className="flex items-center justify-between py-5 border-b border-gray-3">
            <div>
              <h4 className="font-medium text-dark">Produk</h4>
            </div>
            <div>
              <h4 className="font-medium text-dark text-right">Subtotal</h4>
            </div>
          </div>

          {/* */}
          {cartItems.length > 0 ? (
            cartItems.map((item: any, key: number) => {
              // Menyesuaikan key harga dari Redux
              const itemPrice = item.price || item.discountedPrice || 0;

              return (
                <div key={key} className="flex items-center justify-between py-5 border-b border-gray-3">
                  <div>
                    <p className="text-dark">
                      {item.quantity}x {item.title}
                    </p>
                    {/* Menampilkan ukuran kustom jika ada */}
                    {Number(item.panjang) > 0 && Number(item.lebar) > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Ukuran: {item.panjang} x {item.lebar} cm
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-dark text-right font-medium">
                      Rp {(itemPrice * item.quantity).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-6 text-center text-gray-500 text-sm">
              Keranjang belanja Anda masih kosong.
            </div>
          )}

          {/* */}
          <div className="flex items-center justify-between pt-5">
            <div>
              <p className="font-medium text-lg text-dark">Total</p>
            </div>
            <div>
              <p className="font-bold text-xl text-blue text-right">
                Rp {totalPrice.toLocaleString("id-ID")}
              </p>
            </div>
          </div>

          {/* */}
          {cartItems.length > 0 ? (
            <Link
              href="/checkout"
              className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5"
            >
              Lanjut ke Checkout
            </Link>
          ) : (
            <button
              disabled
              className="w-full flex justify-center font-medium text-white bg-gray-400 py-3 px-6 rounded-md mt-7.5 cursor-not-allowed"
            >
              Keranjang Kosong
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;