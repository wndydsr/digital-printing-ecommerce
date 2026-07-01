import React, { useState } from "react";
import Image from "next/image";

interface ShippingMethodProps {
  shippingMethod: string;
  setShippingMethod: (method: string) => void;
}

const ShippingMethod = ({ shippingMethod, setShippingMethod }: ShippingMethodProps) => {
  return (
    <div className="bg-white shadow-1 rounded-[10px] mt-0">
      <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
        <h3 className="font-medium text-xl text-dark">Shipping Method</h3>
      </div>

      <div className="p-4 sm:p-8.5 flex flex-col gap-4">
        {/* Opsi Ambil di Toko */}
        <label className="flex cursor-pointer items-center gap-3.5">
          <input
            type="radio"
            className="hidden"
            checked={shippingMethod === "pickup"}
            onChange={() => setShippingMethod("pickup")}
          />
          <div className={`h-4 w-4 rounded-full border-4 ${shippingMethod === "pickup" ? "border-blue" : "border-gray-4"}`} />
          <span>Ambil di Toko</span>
        </label>

        {/* Opsi Pesan Antar */}
        <label className="flex cursor-pointer items-center gap-3.5">
          <input
            type="radio"
            className="hidden"
            checked={shippingMethod === "delivery"}
            onChange={() => setShippingMethod("delivery")}
          />
          <div className={`h-4 w-4 rounded-full border-4 ${shippingMethod === "delivery" ? "border-blue" : "border-gray-4"}`} />
          <span>Pesan Antar</span>
        </label>
      </div>
    </div>
  );
};

export default ShippingMethod;
