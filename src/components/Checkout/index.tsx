"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Breadcrumb from "../Common/Breadcrumb";
import ShippingMethod from "./ShippingMethod";
import PaymentMethod from "./PaymentMethod";
import { useAppSelector, AppDispatch } from "@/redux/store";
import { useDispatch } from "react-redux";
import { removeItemFromCart } from "@/redux/features/cart-slice"; 

const Checkout = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [isDirect, setIsDirect] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customerData, setCustomerData] = useState<any>(null);

  const [shippingMethod, setShippingMethod] = useState("regular");
  const [shippingCost, setShippingCost] = useState(0);

  // Update shipping cost saat metode berubah
  const handleShippingChange = (method: string) => {
    setShippingMethod(method);
    setShippingCost(method === "delivery" ? 20000 : 0);
  };

  const totalPayment = totalPrice + shippingCost;

  const allCartItems = useAppSelector((state: any) => state.cartReducer.items);

  // 🔥 FUNGSI PEMBANTU UNTUK KALKULASI HARGA (Sama dengan Backend)
  const calculateItemPrice = (item: any) => {
    let price = Number(item.price || item.discountedPrice || 0);

    // Tambahkan harga atribut
    if (item.selectedOptions && typeof item.selectedOptions === 'object') {
      Object.values(item.selectedOptions).forEach((opt: any) => {
        price += Number(opt.additional_price || 0);
      });
    }

    // Kalkulasi Luas
    const panjang = Number(item.panjang || 0);
    const lebar = Number(item.lebar || 0);
    if (panjang > 0 && lebar > 0) {
      const luasM2 = (panjang * lebar) / 10000;
      price = luasM2 * price;
    }
    
    return price;
  };

  useEffect(() => {
    const customerStr = localStorage.getItem("customer");
    if (customerStr) {
      setCustomerData(JSON.parse(customerStr));
    }

    const params = new URLSearchParams(window.location.search);
    const type = params.get("type");

    if (type === "direct") {
      setIsDirect(true);
      const directItem = sessionStorage.getItem("directCheckoutItem");
      if (directItem) {
        const item = JSON.parse(directItem);
        setCartItems([item]);
        setTotalPrice(calculateItemPrice(item) * Number(item.quantity));
      }
    } else {
      setIsDirect(false);
      setCartItems(allCartItems);

      const totalRedux = allCartItems.reduce((sum: number, item: any) => {
        return sum + (calculateItemPrice(item) * Number(item.quantity));
      }, 0);
      setTotalPrice(totalRedux);
    }
  }, [allCartItems]);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

    if (!customerData) {
      alert("Data pelanggan belum dimuat. Mohon tunggu sebentar.");
      return;
    }

    if (cartItems.length === 0) {
      alert("Keranjang Kosong! Silakan pilih produk terlebih dahulu.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("customer_id", customerData.id);
      formData.append("total_price", totalPrice.toString());
      formData.append("current_stage_id", "1"); 
      formData.append("shipping_method", shippingMethod); 
      formData.append("shipping_cost", shippingCost.toString());

      cartItems.forEach((item: any, index: number) => {
        const productId = item.product_id || item.id; 
        formData.append(`items[${index}][product_id]`, productId); 
        formData.append(`items[${index}][quantity]`, item.quantity);
        formData.append(`items[${index}][panjang]`, item.panjang || 0);
        formData.append(`items[${index}][lebar]`, item.lebar || 0);
        formData.append(`items[${index}][need_design]`, item.need_design ? "1" : "0");

        if (item.design_file instanceof File) {
            formData.append(`items[${index}][design_file][]`, item.design_file);
        }
        
        if (item.support_files && Array.isArray(item.support_files)) {
            item.support_files.forEach((file: File) => {
                formData.append(`items[${index}][reference_files][]`, file);
            });
        }

        if (item.selectedOptions) {
            Object.values(item.selectedOptions).forEach((opt: any) => {
                formData.append(`items[${index}][attributes][]`, String(opt.id));
            });
        }
      });

      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Accept": "application/json",
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Gagal menyimpan pesanan");

      if (isDirect) {
        sessionStorage.removeItem("directCheckoutItem");
      } else {
        for (const item of cartItems) {
          const deleteRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/cart/item/${item.id}`, {
            method: "DELETE",
            headers: { 
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json"
            }
          });
          if (deleteRes.ok) dispatch(removeItemFromCart(item.id)); 
        }
      }

      alert("Pesanan berhasil dibuat!");
      router.push(`/payment?amount=${totalPayment}`);
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
              <div className="lg:max-w-[670px] w-full">
                <div className="bg-white shadow-1 rounded-[10px] overflow-hidden">
                  <div className="border-b border-gray-3 py-5 px-6 flex items-center justify-between">
                    <h3 className="font-medium text-xl text-dark">
                      Item Pesanan ({cartItems.length} Item)
                    </h3>
                  </div>

                  <div className="grid grid-cols-6 gap-4 px-6 py-4 border-b border-gray-3 bg-gray-1 text-sm font-medium">
                    <div>Gambar</div>
                    <div className="col-span-2">Produk</div>
                    <div className="text-center">Qty</div>
                    <div className="text-center">Harga</div>
                    <div className="text-center">Total</div>
                  </div>

                  {cartItems.length > 0 ? (
                    cartItems.map((item: any, idx: number) => {
                      const pricePerUnit = calculateItemPrice(item);
                      const options = item.selectedOptions || item.selected_options;
                      
                      return (
                        <div key={idx} className="grid grid-cols-6 gap-4 px-6 py-5 items-center border-b border-gray-3 text-xs">
                          <div>
                            <img src={item.img || "/placeholder.png"} alt="product" className="w-16 h-16 object-cover rounded-lg" />
                          </div>
                          <div className="col-span-2">
                            <h4 className="font-medium text-dark">{item.title || item.product?.name}</h4>
                            {options && (
                              <p className="text-xs text-gray-500 mt-1">
                                {Object.values(options).map((opt: any) => opt.name).join(", ")}
                              </p>
                            )}
                            {Number(item.panjang) > 0 && (
                              <p className="text-xs text-gray-500">Ukuran: {item.panjang} x {item.lebar} cm</p>
                            )}
                          </div>
                          <div className="text-center font-medium">{item.quantity}</div>
                          <div className="text-center">Rp {pricePerUnit.toLocaleString("id-ID")}</div>
                          <div className="text-center font-medium text-red">
                            Rp {(pricePerUnit * Number(item.quantity)).toLocaleString("id-ID")}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-10 text-gray-500">Keranjang belanja Anda kosong.</div>
                  )}

                  <div className="flex items-center justify-between px-6 py-2">
                    <span>Subtotal</span>
                    <span>Rp {totalPrice.toLocaleString("id-ID")}</span>
                  </div>

                  <div className="flex items-center justify-between px-6 py-2">
                    <span>Ongkos Kirim</span>
                    <span>{shippingCost === 0 ? "Free" : `Rp ${shippingCost.toLocaleString("id-ID")}`}</span>
                  </div>

                  <div className="flex items-center justify-between px-6 py-5">
                    <span className="font-medium text-dark">Total Pembayaran</span>
                    <span className="font-semibold text-red text-lg">
                      Rp {totalPayment.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="max-w-[455px] w-full">
                <ShippingMethod 
                  shippingMethod={shippingMethod} 
                  setShippingMethod={handleShippingChange} 
                />
                {/* <PaymentMethod /> */}
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