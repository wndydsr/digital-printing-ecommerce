"use client";
import React, { useState, useEffect } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import AddressModal from "./AddressModal";
import Orders from "../Orders";

const MyAccount = () => {

  const [customer, setCustomer] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("account-details");
  const [addressModal, setAddressModal] = useState(false);


  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const openAddressModal = () => {
    setAddressModal(true);
  };

  const closeAddressModal = () => {
    setAddressModal(false);
  };

  useEffect(() => {
    const fetchCustomer = async () => {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://127.0.0.1:8000/api/me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await res.json();

      console.log(data);

      setCustomer(data);

    setName(data.name || "");
    setEmail(data.email || "");
    setPhone(data.phone || "");
    setAddress(data.address || "");
    };

    fetchCustomer();
  }, []);


    const handleUpdateProfile = async (
      e: React.FormEvent
    ) => {
      e.preventDefault();

      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          "http://127.0.0.1:8000/api/customer/profile",
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              name,
              phone,
              address,
            }),
          }
        );

        const data = await res.json();

        if (!res.ok) {
          alert(data.message || "Gagal update profile");
          return;
        }

        alert("Profile berhasil diperbarui");

        setCustomer(data.customer);
        localStorage.setItem(
          "customer",
          JSON.stringify(data.customer)
        );
      } catch (error) {
        console.error(error);
        alert("Terjadi kesalahan");
      }
    };


    const handleLogout = async () => {
    const token = localStorage.getItem("token");

    try {
      await fetch("http://127.0.0.1:8000/api/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
    } catch (error) {
      console.error(error);
    }

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
            {/* <!--== user dashboard menu start ==--> */}
            <div className="xl:max-w-[370px] w-full bg-white rounded-xl shadow-1">
              <div className="flex xl:flex-col">
                <div className="hidden lg:flex flex-wrap items-center gap-5 py-6 px-4 sm:px-7.5 xl:px-9 border-r xl:border-r-0 xl:border-b border-gray-3">
                  <div className="max-w-[64px] w-full h-16 rounded-full overflow-hidden">
                    <Image
                      src="/images/users/user-04.jpg"
                      alt="user"
                      width={64}
                      height={64}
                    />
                  </div>

                  <div>
                    <p className="font-medium text-dark mb-0.5">
                        {customer?.name}
                    </p>
                    <p className="text-custom-xs">Member Since Sep 2020</p>
                  </div>
                </div>

                <div className="p-4 sm:p-7.5 xl:p-9">
                  <div className="flex flex-wrap xl:flex-nowrap xl:flex-col gap-4">
                    <button
                      onClick={() => setActiveTab("account-details")}
                      className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${
                        activeTab === "account-details"
                          ? "text-white bg-blue"
                          : "text-dark-2 bg-gray-1"
                      }`}
                    >
                      <svg
                        className="fill-current"
                        width="22"
                        height="22"
                        viewBox="0 0 22 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M10.9995 1.14581C8.59473 1.14581 6.64531 3.09524 6.64531 5.49998C6.64531 7.90472 8.59473 9.85415 10.9995 9.85415C13.4042 9.85415 15.3536 7.90472 15.3536 5.49998C15.3536 3.09524 13.4042 1.14581 10.9995 1.14581ZM8.02031 5.49998C8.02031 3.85463 9.35412 2.52081 10.9995 2.52081C12.6448 2.52081 13.9786 3.85463 13.9786 5.49998C13.9786 7.14533 12.6448 8.47915 10.9995 8.47915C9.35412 8.47915 8.02031 7.14533 8.02031 5.49998Z"
                          fill=""
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M10.9995 11.2291C8.87872 11.2291 6.92482 11.7112 5.47697 12.5256C4.05066 13.3279 2.97864 14.5439 2.97864 16.0416L2.97858 16.1351C2.97754 17.2001 2.97624 18.5368 4.14868 19.4916C4.7257 19.9614 5.53291 20.2956 6.6235 20.5163C7.71713 20.7377 9.14251 20.8541 10.9995 20.8541C12.8564 20.8541 14.2818 20.7377 15.3754 20.5163C16.466 20.2956 17.2732 19.9614 17.8503 19.4916C19.0227 18.5368 19.0214 17.2001 19.0204 16.1351L19.0203 16.0416C19.0203 14.5439 17.9483 13.3279 16.522 12.5256C15.0741 11.7112 13.1202 11.2291 10.9995 11.2291ZM4.35364 16.0416C4.35364 15.2612 4.92324 14.4147 6.15108 13.724C7.35737 13.0455 9.07014 12.6041 10.9995 12.6041C12.9288 12.6041 14.6416 13.0455 15.8479 13.724C17.0757 14.4147 17.6453 15.2612 17.6453 16.0416C17.6453 17.2405 17.6084 17.9153 16.982 18.4254C16.6424 18.702 16.0746 18.9719 15.1027 19.1686C14.1338 19.3648 12.8092 19.4791 10.9995 19.4791C9.18977 19.4791 7.86515 19.3648 6.89628 19.1686C5.92437 18.9719 5.35658 18.702 5.01693 18.4254C4.39059 17.9153 4.35364 17.2405 4.35364 16.0416Z"
                          fill=""
                        />
                      </svg>
                      Account Details
                    </button>
                    <button
                      onClick={() => setActiveTab("orders")}
                      className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${
                        activeTab === "orders"
                          ? "text-white bg-blue"
                          : "text-dark-2 bg-gray-1"
                      }`}
                    >
                      <svg
                        className="fill-current"
                        width="22"
                        height="22"
                        viewBox="0 0 22 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M8.0203 11.9167C8.0203 11.537 7.71249 11.2292 7.3328 11.2292C6.9531 11.2292 6.6453 11.537 6.6453 11.9167V15.5833C6.6453 15.963 6.9531 16.2708 7.3328 16.2708C7.71249 16.2708 8.0203 15.963 8.0203 15.5833V11.9167Z"
                          fill=""
                        />
                        <path
                          d="M14.6661 11.2292C15.0458 11.2292 15.3536 11.537 15.3536 11.9167V15.5833C15.3536 15.963 15.0458 16.2708 14.6661 16.2708C14.2864 16.2708 13.9786 15.963 13.9786 15.5833V11.9167C13.9786 11.537 14.2864 11.2292 14.6661 11.2292Z"
                          fill=""
                        />
                        <path
                          d="M11.687 11.9167C11.687 11.537 11.3792 11.2292 10.9995 11.2292C10.6198 11.2292 10.312 11.537 10.312 11.9167V15.5833C10.312 15.963 10.6198 16.2708 10.9995 16.2708C11.3792 16.2708 11.687 15.963 11.687 15.5833V11.9167Z"
                          fill=""
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M15.8338 3.18356C15.3979 3.01319 14.9095 2.98443 14.2829 2.97987C14.0256 2.43753 13.473 2.0625 12.8328 2.0625H9.16613C8.52593 2.0625 7.97332 2.43753 7.716 2.97987C7.08942 2.98443 6.60107 3.01319 6.16515 3.18356C5.64432 3.38713 5.19129 3.73317 4.85788 4.18211C4.52153 4.63502 4.36363 5.21554 4.14631 6.01456L3.57076 8.12557C3.21555 8.30747 2.90473 8.55242 2.64544 8.88452C2.07527 9.61477 1.9743 10.4845 2.07573 11.4822C2.17415 12.4504 2.47894 13.6695 2.86047 15.1955L2.88467 15.2923C3.12592 16.2573 3.32179 17.0409 3.55475 17.6524C3.79764 18.2899 4.10601 18.8125 4.61441 19.2095C5.12282 19.6064 5.70456 19.7788 6.38199 19.8598C7.03174 19.9375 7.8394 19.9375 8.83415 19.9375H13.1647C14.1594 19.9375 14.9671 19.9375 15.6169 19.8598C16.2943 19.7788 16.876 19.6064 17.3844 19.2095C17.8928 18.8125 18.2012 18.2899 18.4441 17.6524C18.6771 17.0409 18.8729 16.2573 19.1142 15.2923L19.1384 15.1956C19.5199 13.6695 19.8247 12.4504 19.9231 11.4822C20.0245 10.4845 19.9236 9.61477 19.3534 8.88452C19.0941 8.55245 18.7833 8.30751 18.4282 8.12562L17.8526 6.01455C17.6353 5.21554 17.4774 4.63502 17.141 4.18211C16.8076 3.73317 16.3546 3.38713 15.8338 3.18356ZM6.66568 4.46423C6.86717 4.38548 7.11061 4.36231 7.71729 4.35618C7.97516 4.89706 8.527 5.27083 9.16613 5.27083H12.8328C13.4719 5.27083 14.0238 4.89706 14.2816 4.35618C14.8883 4.36231 15.1318 4.38548 15.3332 4.46423C15.6137 4.57384 15.8576 4.76017 16.0372 5.00191C16.1986 5.21928 16.2933 5.52299 16.56 6.50095L16.8841 7.68964C15.9328 7.56246 14.7046 7.56248 13.1787 7.5625H8.82014C7.29428 7.56248 6.06614 7.56246 5.11483 7.68963L5.43894 6.50095C5.7056 5.52299 5.80033 5.21928 5.96176 5.00191C6.14129 4.76017 6.38523 4.57384 6.66568 4.46423ZM9.16613 3.4375C9.03956 3.4375 8.93696 3.5401 8.93696 3.66667C8.93696 3.79323 9.03956 3.89583 9.16613 3.89583H12.8328C12.9594 3.89583 13.062 3.79323 13.062 3.66667C13.062 3.5401 12.9594 3.4375 12.8328 3.4375H9.16613ZM3.72922 9.73071C3.98482 9.40334 4.38904 9.18345 5.22428 9.06262C6.07737 8.93921 7.23405 8.9375 8.87703 8.9375H13.1218C14.7648 8.9375 15.9215 8.93921 16.7746 9.06262C17.6098 9.18345 18.014 9.40334 18.2696 9.73071C18.5252 10.0581 18.6405 10.5036 18.5552 11.3432C18.468 12.2007 18.1891 13.3233 17.7906 14.9172C17.5365 15.9338 17.3595 16.6372 17.1592 17.1629C16.9655 17.6713 16.7758 17.9402 16.5382 18.1257C16.3007 18.3112 15.9938 18.43 15.4536 18.4946C14.895 18.5614 14.1697 18.5625 13.1218 18.5625H8.87703C7.8291 18.5625 7.10386 18.5614 6.54525 18.4946C6.005 18.43 5.69817 18.3112 5.4606 18.1257C5.22304 17.9402 5.03337 17.6713 4.83967 17.1629C4.63938 16.6372 4.46237 15.9338 4.20822 14.9172C3.80973 13.3233 3.53086 12.2007 3.44368 11.3432C3.35832 10.5036 3.47362 10.0581 3.72922 9.73071Z"
                          fill=""
                        />
                      </svg>
                      Orders
                    </button>

                    <button
                      onClick={handleLogout}
                      className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${
                        activeTab === "logout"
                          ? "text-white bg-blue"
                          : "text-dark-2 bg-gray-1"
                      }`}
                    >
                      <svg
                        className="fill-current"
                        width="22"
                        height="22"
                        viewBox="0 0 22 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M13.7005 1.14581C12.4469 1.14579 11.4365 1.14578 10.6417 1.25263C9.81664 1.36356 9.12193 1.60088 8.57017 2.15263C8.08898 2.63382 7.84585 3.22514 7.71822 3.91997C7.59419 4.59515 7.57047 5.42142 7.56495 6.41282C7.56284 6.79251 7.86892 7.10202 8.24861 7.10414C8.6283 7.10625 8.93782 6.80016 8.93993 6.42047C8.94551 5.4181 8.97154 4.70761 9.07059 4.16838C9.16603 3.64881 9.31927 3.34807 9.54244 3.12491C9.79614 2.87121 10.1523 2.7058 10.825 2.61537C11.5174 2.52227 12.435 2.52081 13.7508 2.52081H14.6675C15.9833 2.52081 16.901 2.52227 17.5934 2.61537C18.266 2.7058 18.6222 2.87121 18.8759 3.12491C19.1296 3.37861 19.295 3.7348 19.3855 4.40742C19.4786 5.09983 19.48 6.01752 19.48 7.33331V14.6666C19.48 15.9824 19.4786 16.9001 19.3855 17.5925C19.295 18.2652 19.1296 18.6214 18.8759 18.8751C18.6222 19.1288 18.266 19.2942 17.5934 19.3846C16.901 19.4777 15.9833 19.4791 14.6675 19.4791H13.7508C12.435 19.4791 11.5174 19.4777 10.825 19.3846C10.1523 19.2942 9.79614 19.1288 9.54244 18.8751C9.31927 18.6519 9.16603 18.3512 9.07059 17.8316C8.97154 17.2924 8.94551 16.5819 8.93993 15.5795C8.93782 15.1998 8.6283 14.8937 8.24861 14.8958C7.86892 14.8979 7.56284 15.2075 7.56495 15.5871C7.57047 16.5785 7.59419 17.4048 7.71822 18.08C7.84585 18.7748 8.08898 19.3661 8.57017 19.8473C9.12193 20.3991 9.81664 20.6364 10.6417 20.7473C11.4365 20.8542 12.4469 20.8542 13.7006 20.8541H14.7178C15.9714 20.8542 16.9819 20.8542 17.7766 20.7473C18.6017 20.6364 19.2964 20.3991 19.8482 19.8473C20.4 19.2956 20.6373 18.6009 20.7482 17.7758C20.855 16.981 20.855 15.9706 20.855 14.7169V7.28302C20.855 6.02939 20.855 5.01893 20.7482 4.22421C20.6373 3.39911 20.4 2.70439 19.8482 2.15263C19.2964 1.60088 18.6017 1.36356 17.7766 1.25263C16.9819 1.14578 15.9714 1.14579 14.7178 1.14581H13.7005Z"
                          fill=""
                        />
                        <path
                          d="M13.7507 10.3125C14.1303 10.3125 14.4382 10.6203 14.4382 11C14.4382 11.3797 14.1303 11.6875 13.7507 11.6875H3.69247L5.48974 13.228C5.77802 13.4751 5.81141 13.9091 5.56431 14.1974C5.3172 14.4857 4.88318 14.5191 4.5949 14.272L1.38657 11.522C1.23418 11.3914 1.14648 11.2007 1.14648 11C1.14648 10.7993 1.23418 10.6086 1.38657 10.478L4.5949 7.72799C4.88318 7.48089 5.3172 7.51428 5.56431 7.80256C5.81141 8.09085 5.77802 8.52487 5.48974 8.77197L3.69247 10.3125H13.7507Z"
                          fill=""
                        />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* <!--== user dashboard menu end ==-->


          <!-- orders tab content start --> */}
            <div
              className={`xl:max-w-[770px] w-full bg-white rounded-xl shadow-1 ${
                activeTab === "orders" ? "block" : "hidden"
              }`}
            >
              <Orders />
            </div>
            {/* <!-- orders tab content end -->

          <!-- details tab content start --> */}
            <div
              className={`xl:max-w-[770px] w-full ${
                activeTab === "account-details" ? "block" : "hidden"
              }`}
            >
              <form onSubmit={handleUpdateProfile}>
                <div className="bg-white shadow-1 rounded-xl p-4 sm:p-8.5">

                  <div className="mb-5">
                    <label className="block mb-2.5">
                      Name <span className="text-red">*</span>
                    </label>

                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5"
                    />
                  </div>

                  <div className="mb-5">
                    <label className="block mb-2.5">
                      Email
                    </label>

                    <input
                      type="email"
                      value={email}
                      disabled
                      className="rounded-md border border-gray-3 bg-gray-100 w-full py-2.5 px-5"
                    />
                  </div>

                  <div className="mb-5">
                    <label className="block mb-2.5">
                      Phone
                    </label>

                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5"
                    />
                  </div>

                  <div className="mb-5">
                    <label className="block mb-2.5">
                      Address
                    </label>

                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={4}
                      className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5"
                    />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md"
                  >
                    Save Changes
                  </button>

                </div>
              </form>
            </div>
            {/* <!-- details tab content end -->
          <!--== user dashboard content end ==--> */}
          </div>
        </div>
      </section>

      <AddressModal isOpen={addressModal} closeModal={closeAddressModal} />
    </>
  );
};

export default MyAccount;
