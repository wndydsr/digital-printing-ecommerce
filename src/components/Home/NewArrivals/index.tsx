"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ProductItem from "@/components/Common/ProductItem";

const NewArrival = () => {

  const [products, setProducts] = useState([]);

    useEffect(() => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/public/products`)
        .then((res) => res.json())
        .then((data) => setProducts(data))
        .catch((err) => console.error(err));
    }, []);

  return (
    <section className="overflow-hidden pt-15">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {/* <!-- section title --> */}
        <div className="mb-7 flex items-center justify-between">
          <div>
            <span className="flex items-center gap-2.5 font-medium text-dark mb-1.5">
             
             
            </span>
            <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">
              Produk Kami
            </h2>
          </div>

          <Link
            href="/shop-with-sidebar"
            className="inline-flex font-medium text-custom-sm py-2.5 px-7 rounded-md border-gray-3 border bg-gray-1 text-dark ease-out duration-200 hover:bg-dark hover:text-white hover:border-transparent"
          >
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-7.5 gap-y-9">
          {/* <!-- New Arrivals item --> */}
          {/* */}
          {products.map((item: any) => (
            <ProductItem
              key={item.id}
              item={{
                ...item, // 🔥 SEBARKAN SEMUA DATA DARI API (attributes, is_custom, dll)
                id: item.id,
                title: item.name, // Tetap gunakan name sebagai title
                reviews: 0,
                price: item.price,
                // Mapping gambar agar sinkron dengan yang dibutuhkan ProductItem
                imgs: {
                  previews: [`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/storage/${item.photo}`],
                  thumbnails: [`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/storage/${item.photo}`],
                },
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewArrival;
