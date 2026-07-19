"use client";
import React, { useState, useEffect } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import AddressModal from "./AddressModal";
import Orders from "./myorder";
import { useSearchParams } from "next/navigation";

const MyAccount = () => {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab"); 

  const [customer, setCustomer] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(tabParam || "account-details");
  const [addressModal, setAddressModal] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const openAddressModal = () => setAddressModal(true);
  const closeAddressModal = () => setAddressModal(false);

  // 🔥 FUNGSI PEMBANTU UNTUK FORMAT "MEMBER SINCE"
  const formatMemberSince = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      month: "short",
      year: "numeric"
    });
  };

  useEffect(() => {
    const fetchCustomer = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/me`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      const data = await res.json();
      setCustomer(data);
      setName(data.name || "");
      setEmail(data.email || "");
      setPhone(data.phone || "");
      setAddress(data.address || "");
    };
    fetchCustomer();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/customer/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, phone, address }),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.message || "Gagal update profile");
      alert("Profile berhasil diperbarui");
      setCustomer(data.customer);
      localStorage.setItem("customer", JSON.stringify(data.customer));
    } catch (error) { console.error(error); alert("Terjadi kesalahan"); }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
    } catch (error) { console.error(error); }
    localStorage.removeItem("token");
    localStorage.removeItem("customer");
    window.location.href = "/signin";
  };

  return (
    <>
      <Breadcrumb title={"My Account"} pages={["my account"]} />

      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col xl:flex-row gap-7.5">
            
            {/* --- SIDEBAR MENU --- */}
            <div className="xl:max-w-[370px] w-full bg-white rounded-xl shadow-1">
              <div className="flex xl:flex-col">
                <div className="hidden lg:flex flex-wrap items-center gap-5 py-6 px-4 sm:px-7.5 xl:px-9 border-r xl:border-r-0 xl:border-b border-gray-3">
                  {/* <div className="max-w-[64px] w-full h-16 rounded-full overflow-hidden">
                    <Image src="/images/users/user-04.jpg" alt="user" width={64} height={64} />
                  </div> */}
                  <div>
                    <p className="font-medium text-dark mb-0.5">{customer?.name}</p>
                    {/* 🔥 PERBAIKAN: Membaca kolom created_at dari database secara dinamis */}
                    <p className="text-custom-xs text-gray-500">
                      Member Sejak {customer?.created_at ? formatMemberSince(customer.created_at) : "..."}
                    </p>
                  </div>
                </div>

                <div className="p-4 sm:p-7.5 xl:p-9">
                  <div className="flex flex-wrap xl:flex-nowrap xl:flex-col gap-4">
                    <button
                      onClick={() => setActiveTab("account-details")}
                      className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ${activeTab === "account-details" ? "text-white bg-blue" : "text-dark-2 bg-gray-1"}`}
                    >
                      Account Details
                    </button>
                    
                    <button
                      onClick={() => setActiveTab("orders")}
                      className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ${activeTab === "orders" ? "text-white bg-blue" : "text-dark-2 bg-gray-1"}`}
                    >
                      Orders
                    </button>

                    <button
                      onClick={handleLogout}
                      className="flex items-center rounded-md gap-2.5 py-3 px-4.5 text-dark-2 bg-gray-1 hover:bg-blue hover:text-white"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* --- KONTEN KANAN --- */}
            <div className="xl:max-w-[770px] w-full">
              {activeTab === "orders" ? (
                <div className="bg-white p-6 rounded-xl shadow-1">
                  <Orders />
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile}>
                  <div className="bg-white shadow-1 rounded-xl p-4 sm:p-8.5">
                    <div className="mb-5">
                      <label className="block mb-2.5">Name <span className="text-red">*</span></label>
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5" />
                    </div>
                    <div className="mb-5">
                      <label className="block mb-2.5">Email</label>
                      <input type="email" value={email} disabled className="rounded-md border border-gray-3 bg-gray-100 w-full py-2.5 px-5" />
                    </div>
                    <div className="mb-5">
                      <label className="block mb-2.5">Phone</label>
                      <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5" />
                    </div>
                    <div className="mb-5">
                      <label className="block mb-2.5">Address</label>
                      <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={4} className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5" />
                    </div>
                    <button type="submit" className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md">Save Changes</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
      <AddressModal isOpen={addressModal} closeModal={closeAddressModal} />
    </>
  );
};

export default MyAccount;