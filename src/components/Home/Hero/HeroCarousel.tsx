"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

// Import Swiper styles
import "swiper/css/pagination";
import "swiper/css";

import Image from "next/image";

const HeroCarousal = () => {
  return (
    <Swiper
      spaceBetween={30}
      centeredSlides={true}
      autoplay={{
        delay: 2500,
        disableOnInteraction: false,
      }}
      pagination={{
        clickable: true,
      }}
      modules={[Autoplay, Pagination]}
      className="hero-carousel"
    >
      <SwiperSlide>
        <div className="flex items-center pt-6 sm:pt-0 flex-col-reverse sm:flex-row">
          <div className="max-w-[500px] mt-10 py-10 sm:py-8 lg:py-10 pl-10 sm:pl-15 lg:pl-24">
            <div className="flex items-center gap-4 mb-7 sm:mb-5">
              <span className="block font-semibold text-blue text-xl sm:text-xl mb-1">
                Cetak Berkualitas, Hasil Maksimal
              </span>
            </div>

            <h1 className="font-semibold text-dark text-xl sm:text-3xl mb-5">
              <a href="#">Solusi Cetak Untuk Semua Kebutuhan Anda</a>
            </h1>

            <p>
            Dari kebutuhan pribadi hingga bisnis, kami siap memberikan hasil terbaik dengan kualitas premium.
            </p>

            <a
              href="#"
              className="inline-flex font-medium text-white text-custom-sm rounded-md bg-dark py-3 px-9 ease-out duration-200 hover:bg-blue mt-10"
            >
              Beli Sekarang
            </a>
          </div>

          <div>
            <Image
              src="/images/hero/hero2.png"
              alt="headphone"
              width={951}
              height={758}
            />
          </div>
        </div>
      </SwiperSlide>
      <SwiperSlide>
        {" "}
         <div>
            <Image
              src="/images/hero/hero3.png"
              alt="headphone"
              width={1000}
              height={258}
            />
          </div>
      </SwiperSlide>
    </Swiper>
  );
};

export default HeroCarousal;
