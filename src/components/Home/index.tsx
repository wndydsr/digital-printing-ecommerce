"use client";

import React, { useEffect } from "react";
import Hero from "./Hero";
import Categories from "./Categories";
import NewArrival from "./NewArrivals";
import PromoBanner from "./PromoBanner";
import BestSeller from "./BestSeller";
import CounDown from "./Countdown";
import Testimonials from "./Testimonials";
import Newsletter from "../Common/Newsletter";

const Home = () => {

  useEffect(() => {
    console.log("TOKEN:", localStorage.getItem("token"));
    console.log(
      "CUSTOMER:",
      localStorage.getItem("customer")
    );
  }, []);

  return (
    <main>
      <Hero />
      <Newsletter />
      {/* <Categories /> */}
      <NewArrival />
      {/* <PromoBanner /> */}
      {/* <BestSeller /> */}
      {/* <CounDown /> */}
      {/* <Testimonials /> */}
    </main>
  );
};

export default Home;
