import Home from "@/components/Home";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prinora | Cetak Online",
  description: "Ini adalah Platform Percetakan Online",
  // other metadata
};

export default function HomePage() {
  return (
    <>
      <Home />
    </>
  );
}
