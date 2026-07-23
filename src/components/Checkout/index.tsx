"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic"; 
import Breadcrumb from "../Common/Breadcrumb";
import ShippingMethod from "./ShippingMethod";
import PaymentMethod from "./PaymentMethod";
import { useAppSelector, AppDispatch } from "@/redux/store";
import { useDispatch } from "react-redux";
import { removeItemFromCart } from "@/redux/features/cart-slice"; 
import { directDirectFileCache } from "../Common/QuickViewModal";

export const checkoutFileCache = {
  readyDesignFile: null as File | null,
  supportFiles: [] as File[],
};

const MapSelector = dynamic(() => import("./MapSelector"), {
  ssr: false,
  loading: () => <div className="h-[300px] bg-gray-100 flex items-center justify-center text-xs text-gray-400">Memuat Peta Interaktif...</div>
});

const STORE_LAT = -7.0522; 
const STORE_LNG = 110.4357;
const COST_PER_KM = 5000;

const Checkout = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [isDirect, setIsDirect] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customerData, setCustomerData] = useState<any>(null);

  const [shippingMethod, setShippingMethod] = useState("pickup"); 
  const [shippingCost, setShippingCost] = useState(0); 
  const [distance, setDistance] = useState<number | null>(null); 
  const [gpsLoading, setGpsLoading] = useState(false);

  const [selectedLat, setSelectedLat] = useState<number>(STORE_LAT);
  const [selectedLng, setSelectedLng] = useState<number>(STORE_LNG);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; 
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
  };

  const handleLocationChange = (lat: number, lng: number) => {
    setSelectedLat(lat);
    setSelectedLng(lng);

    const calculatedKm = calculateDistance(STORE_LAT, STORE_LNG, lat, lng);
    const finalDistance = Math.ceil(calculatedKm); 
    const calculatedCost = finalDistance * COST_PER_KM;

    setDistance(finalDistance);
    setShippingCost(calculatedCost);
  };

  const handleShippingChange = (method: string) => {
    setShippingMethod(method);
    
    if (method === "pickup") {
      setShippingCost(0);
      setDistance(null);
      return;
    }

    if (method === "delivery") {
      if (navigator.geolocation) {
        setGpsLoading(true);
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const currentLat = position.coords.latitude;
            const currentLng = position.coords.longitude;
            handleLocationChange(currentLat, currentLng);
            setGpsLoading(false);
          },
          (error) => {
            console.error("GPS Terblokir/Error: ", error);
            alert("Gagal mendeteksi koordinat otomatis. Silakan gunakan kolom pencarian jalan atau geser penanda manual.");
            handleLocationChange(STORE_LAT, STORE_LNG);
            setGpsLoading(false);
          },
          { enableHighAccuracy: true, timeout: 6000 }
        );
      } else {
        handleLocationChange(STORE_LAT, STORE_LNG);
      }
    }
  };

  const totalPayment = totalPrice + shippingCost;
  const allCartItems = useAppSelector((state: any) => state.cartReducer.items);

  // ─── 🛠️ FIX KALKULASI HARGA CHECKOUT AGAR TIDAK 0 ───
  const calculateItemPrice = (item: any) => {
    let basePrice = Number(item.price || item.product?.price || 0);

    let selectedOpts = item.selectedOptions || item.selected_options || {};
    if (typeof selectedOpts === "string") {
      try { selectedOpts = JSON.parse(selectedOpts); } catch { selectedOpts = {}; }
    }

    // Hitung tambahan harga dari atribut produk
    if (item.product?.attributes && Array.isArray(item.product.attributes) && typeof selectedOpts === "object") {
      item.product.attributes.forEach((attr: any) => {
        const selectedVal = selectedOpts[attr.name] || selectedOpts[attr.id];
        if (selectedVal && attr.values && Array.isArray(attr.values)) {
          const matchedVal = attr.values.find(
            (v: any) => String(v.name) === String(selectedVal) || String(v.id) === String(selectedVal)
          );
          if (matchedVal && matchedVal.additional_price) {
            basePrice += Number(matchedVal.additional_price || 0);
          }
        }
      });
    }

    // Hitung perkalian luas dimensi (Panjang x Lebar)
    const panjang = Number(item.panjang || 0);
    const lebar = Number(item.lebar || 0);
    const isCustom = item.product?.is_custom == 1 || item.product?.is_custom === true;

    if (isCustom && panjang > 0 && lebar > 0) {
      const luasM2 = (panjang * lebar) / 10000;
      return luasM2 * basePrice;
    }

    return basePrice > 0 ? basePrice : Number(item.price || 0);
  };

  useEffect(() => {
    const customerStr = localStorage.getItem("customer");
    if (customerStr) setCustomerData(JSON.parse(customerStr));

    const params = new URLSearchParams(window.location.search);
    const type = params.get("type");

    if (type === "direct") {
      setIsDirect(true);
      const directItem = sessionStorage.getItem("directCheckoutItem");
      if (directItem) {
        const item = JSON.parse(directItem);
        setCartItems([item]);
        setTotalPrice(calculateItemPrice(item) * Number(item.quantity));

        if (directDirectFileCache.readyDesignFile) {
          checkoutFileCache.readyDesignFile = directDirectFileCache.readyDesignFile;
          checkoutFileCache.supportFiles = directDirectFileCache.supportFiles;
        }
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
    if (!customerData || cartItems.length === 0 || gpsLoading) return;

    setLoading(true);
    try {
      const currentDesignMethod = cartItems[0]?.designMethod || cartItems[0]?.design_method || "ready-to-print";

      const checkoutPayload = {
        customer_id: customerData.id,
        total_price: totalPrice.toString(),
        shipping_method: shippingMethod,
        shipping_cost: shippingCost.toString(),
        is_direct: isDirect,
        design_method: currentDesignMethod, 
        current_stage_id: 7,
        shipping_latitude: selectedLat.toString(),
        shipping_longitude: selectedLng.toString(),
        items: cartItems.map((item) => {
          const itemMethod = item.designMethod || item.design_method || "ready-to-print";
          const dynamicDummyName = itemMethod === "need-design"
            ? (isDirect ? directDirectFileCache.supportFiles?.[0]?.name : item.dummy_file_name) || "materi_referensi_pembeli.png"
            : (item.dummy_file_name || null);

          let selectedOpts = item.selectedOptions || {};
          if (typeof selectedOpts === "string") {
            try { selectedOpts = JSON.parse(selectedOpts); } catch { selectedOpts = {}; }
          }

          const finalAttributes = item.attributeIds && Array.isArray(item.attributeIds)
            ? item.attributeIds
            : (item.selectedOptions && typeof item.selectedOptions === "object"
                ? Object.values(item.selectedOptions).map((opt: any) => String(opt.id || opt)).filter((id) => !isNaN(Number(id)))
                : []);

          return {
            id: item.id,
            product_id: item.product_id || item.id,
            quantity: item.quantity,
            panjang: item.panjang || 0,
            lebar: item.lebar || 0,
            need_design: itemMethod === "need-design" ? "1" : "0",
            dummy_file_name: dynamicDummyName,
            catatan: isDirect ? directDirectFileCache.catatan : (item.catatan || ""),
            selectedOptions: selectedOpts,
            attributes: finalAttributes
          };
        })
      };

      sessionStorage.setItem("pendingCheckoutData", JSON.stringify(checkoutPayload));
      router.push(`/payment?amount=${totalPayment}`);
    } catch (error) {
      console.error(error);
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
              <div className="lg:max-w-[670px] w-full space-y-6">
                
                {/* Ringkasan Belanjaan */}
                <div className="bg-white shadow-1 rounded-[10px] overflow-hidden">
                  <div className="border-b border-gray-3 py-5 px-6">
                    <h3 className="font-medium text-xl text-dark">Item Pesanan</h3>
                  </div>
                  
                  <div className="grid grid-cols-6 gap-4 px-6 py-4 border-b border-gray-3 bg-gray-1 text-sm font-medium">
                    <div>Gambar</div>
                    <div className="col-span-2">Produk</div>
                    <div className="text-center">Qty</div>
                    <div className="text-center">Harga</div>
                    <div className="text-center">Total</div>
                  </div>

                  {cartItems.map((item: any, idx: number) => {
                    const pricePerUnit = calculateItemPrice(item);
                    return (
                      <div key={idx} className="grid grid-cols-6 gap-4 px-6 py-5 items-center border-b border-gray-3 text-xs">
                        <div><img src={item.img || "/placeholder.png"} alt="product" className="w-16 h-16 object-cover rounded-lg" /></div>
                        <div className="col-span-2">
                          <h4 className="font-medium text-dark">{item.title || item.product?.name}</h4>
                          {Number(item.panjang) > 0 && <p className="text-xs text-gray-500">Ukuran: {Math.round(Number(item.panjang))} x {Math.round(Number(item.lebar))} cm</p>}
                        </div>
                        <div className="text-center font-medium">{item.quantity}</div>
                        <div className="text-center">Rp {pricePerUnit.toLocaleString("id-ID")}</div>
                        <div className="text-center font-medium text-red">Rp {(pricePerUnit * Number(item.quantity)).toLocaleString("id-ID")}</div>
                      </div>
                    );
                  })}

                  <div className="flex items-center justify-between px-6 py-2 mt-4">
                    <span>Subtotal</span>
                    <span>Rp {totalPrice.toLocaleString("id-ID")}</span>
                  </div>

                  <div className="flex items-center justify-between px-6 py-2">
                    <span>
                      Ongkos Kirim 
                      {distance !== null && <span className="text-xs text-gray-400 block">(Jarak terdeteksi: {distance} Km)</span>}
                    </span>
                    <span className="font-medium">
                      {gpsLoading ? (
                        <span className="text-xs text-blue animate-pulse">Melacak koordinat GPS Anda...</span>
                      ) : shippingCost === 0 ? (
                        "Free"
                      ) : (
                        `Rp ${shippingCost.toLocaleString("id-ID")}`
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between px-6 py-5 border-t border-gray-1">
                    <span className="font-medium text-dark">Total Pembayaran</span>
                    <span className="font-semibold text-red text-lg">Rp {totalPayment.toLocaleString("id-ID")}</span>
                  </div>
                </div>

                {shippingMethod === "delivery" && (
                  <div className="bg-white shadow-1 rounded-[10px] p-6 space-y-4 animate-fade-in">
                    <h3 className="font-medium text-lg text-dark flex items-center gap-2">
                      📍 Alamat Lokasi Pengantaran Cetak
                    </h3>
                    <MapSelector 
                      initialLat={selectedLat} 
                      initialLng={selectedLng} 
                      onLocationSelect={handleLocationChange} 
                    />
                  </div>
                )}

              </div>

              <div className="max-w-[455px] w-full">
                <ShippingMethod 
                  shippingMethod={shippingMethod} 
                  setShippingMethod={handleShippingChange} 
                />
                <button
                  type="submit"
                  disabled={loading || gpsLoading || cartItems.length === 0}
                  className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {gpsLoading ? "Menunggu GPS..." : loading ? "Memproses..." : "Process to Checkout"}
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