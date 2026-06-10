"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Breadcrumb from "../Common/Breadcrumb";
import Login from "./Login";
import Shipping from "./Shipping";
import ShippingMethod from "./ShippingMethod";
import PaymentMethod from "./PaymentMethod";
import Coupon from "./Coupon";
import Billing from "./Billing";

const Checkout = () => {
  const router = useRouter();

  useEffect(() => {
    const customer = localStorage.getItem("customer");
    const token = localStorage.getItem("token");

    if (!customer || !token) {
      alert("Silakan login terlebih dahulu");
      router.push("/signin");
    }
  }, [router]);

  return (
    <>
      <Breadcrumb title={"Checkout"} pages={["checkout"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <form>
            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11">
              {/* <!-- checkout left --> */}
              <div className="lg:max-w-[670px] w-full">
                <div className="bg-white shadow-1 rounded-[10px] overflow-hidden">

                  {/* Header */}
                  <div className="border-b border-gray-3 py-5 px-6 flex items-center justify-between">
                    <h3 className="font-medium text-xl text-dark">
                      Item Pesanan (1 Item)
                    </h3>

                    <button
                      type="button"
                      className="px-4 py-2 rounded-full bg-red-50 text-red-500 text-sm"
                    >
                      Hapus Semua
                    </button>
                  </div>

                  {/* Table Header */}
                  <div className="grid grid-cols-6 gap-4 px-6 py-4 border-b border-gray-3 bg-gray-1 text-sm font-medium">
                    <div>Gambar</div>
                    <div className="col-span-2">Produk</div>
                    <div className="text-center">Qty</div>
                    <div className="text-center">Harga</div>
                    <div className="text-center">Total</div>
                  </div>

                  {/* Product */}
                  <div className="grid grid-cols-6 gap-4 px-6 py-5 items-center border-b border-gray-3">

                    <div>
                      <img
                        src="/images/products/product-1.jpg"
                        alt="product"
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    </div>

                    <div className="col-span-2">
                      <h4 className="font-medium text-dark">
                        A3 Color
                      </h4>

                      <p className="text-sm text-gray-500">
                        Stiker Chromo, 1 Muka
                      </p>
                    </div>

                    <div className="text-center font-medium">
                      1
                    </div>

                    <div className="text-center">
                      Rp 5.500
                    </div>

                    <div className="text-center font-medium text-red">
                      Rp 5.500
                    </div>

                  </div>

                  {/* Subtotal */}
                  <div className="flex items-center justify-between px-6 py-5">
                    <span className="font-medium text-dark">
                      Subtotal
                    </span>

                    <span className="font-semibold text-red text-lg">
                      Rp 5.500
                    </span>
                  </div>

                </div>
              </div>

              {/* // <!-- checkout right --> */}
              <div className="max-w-[455px] w-full">

                {/* <!-- shipping box --> */}
                <ShippingMethod />

                {/* <!-- payment box --> */}
                <PaymentMethod />

                {/* <!-- checkout button --> */}
                <button
                  type="submit"
                  className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5"
                >
                  Process to Checkout
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
