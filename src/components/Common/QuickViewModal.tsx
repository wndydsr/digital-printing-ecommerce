"use client";
import React, { useEffect, useState } from "react";

import { useModalContext } from "@/app/context/QuickViewModalContext";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { addItemToCart } from "@/redux/features/cart-slice";
import { useDispatch } from "react-redux";
import { usePreviewSlider } from "@/app/context/PreviewSliderContext";
import { updateproductDetails } from "@/redux/features/product-details";
import { useRouter } from "next/navigation";

const QuickViewModal = () => {
  const { isModalOpen, closeModal } = useModalContext();
  const { openPreviewModal } = usePreviewSlider();
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();

  const dispatch = useDispatch<AppDispatch>();

  const product = useAppSelector((state) => state.quickViewReducer.value) as any;

  const [activePreview, setActivePreview] = useState(0);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, any>>({});

  const [panjang, setPanjang] = useState("");
  const [lebar, setLebar] = useState("");

  // 🔥 STATE MANAJEMEN BERKAS & TAHAPAN DESAIN (EKSKLUSIF SESUAI GAMBAR UI)
  const [designMethod, setDesignMethod] = useState<"ready-to-print" | "need-design">("ready-to-print");
  const [readyDesignFile, setReadyDesignFile] = useState<File | null>(null);
  const [supportFiles, setSupportFiles] = useState<File[]>([]);
  const [designNotes, setDesignNotes] = useState("");

  useEffect(() => {
    if (product?.attributes?.length) {
      const defaults: Record<string, any> = {};
      product.attributes.forEach((attr: any) => {
        if (attr.values?.length) {
          defaults[attr.id || attr.name] = attr.values[0];
        }
      });
      setSelectedAttributes(defaults);
    } else {
      setSelectedAttributes({});
    }
  }, [product]);

  const isCustom = product?.is_custom == 1 || product?.is_custom === true;

  const pPanjang = Number(panjang || 0);
  const pLebar = Number(lebar || 0);
  const luas = (pPanjang * pLebar) / 10000;

  let hargaPerMeter = Number(product?.price || 0);
  const additionalPriceSum = Object.values(selectedAttributes).reduce(
    (sum, valueObj: any) => sum + Number(valueObj?.additional_price || 0),
    0
  );
  hargaPerMeter += additionalPriceSum;

  const hargaPerItem = (isCustom && luas > 0) 
    ? luas * hargaPerMeter 
    : hargaPerMeter;

  const totalEstimatedPrice = hargaPerItem * quantity;

  const photoUrl = product?.photo
    ? product.photo.startsWith("http")
      ? product.photo
      : `http://127.0.0.1:8000/storage/${product.photo}`
    : "/placeholder.png";

  const productImages = [photoUrl];

  const handlePreviewSlider = () => {
    dispatch(updateproductDetails({
      ...product,
      imgs: { previews: productImages, thumbnails: productImages }
    }));
    openPreviewModal();
  };

  // 🔥 VALIDASI SEBELUM MASUK DATABASE / KERANJANG
  const validateInput = () => {
    if (isCustom) {
      if (!panjang || Number(panjang) <= 0) {
        alert("Mohon masukkan ukuran panjang yang valid.");
        return false;
      }
      if (!lebar || Number(lebar) <= 0) {
        alert("Mohon masukkan ukuran lebar yang valid.");
        return false;
      }
    }
    
    // Validasi file wajib jika memilih metode Sudah Punya Desain
    if (designMethod === "ready-to-print" && !readyDesignFile) {
      alert("Mohon upload berkas desain master siap cetak Anda terlebih dahulu.");
      return false;
    }
    
    return true;
  };

  const createCartPayload = (customerId: string) => {
    const formData = new FormData();
    formData.append("customer_id", customerId);
    formData.append("product_id", product.id.toString());
    formData.append("quantity", quantity.toString());
    formData.append("panjang", isCustom ? panjang : "0");
    formData.append("lebar", isCustom ? lebar : "0");
    formData.append("catatan", designNotes);
    
    const isNeedDesign = designMethod === "need-design";
    formData.append("need_design", isNeedDesign ? "1" : "0");
    formData.append("tahapan_order", isNeedDesign ? "antrean desain" : "siap cetak");
    formData.append("selected_options", JSON.stringify(selectedAttributes));

    // 🔥 SESUAIKAN DENGAN VALIDASI LARAVEL
    if (isNeedDesign) {
      // Kirim sebagai array reference_files
      supportFiles.forEach((file) => {
        formData.append("reference_files[]", file);
      });
    } else {
      // Kirim sebagai design_file (tunggal sesuai controller)
      if (readyDesignFile) {
        formData.append("design_file", readyDesignFile);
      }
    }

    return formData;
  };

  const handleAddToCart = async () => {
    if (!validateInput()) return;

    const customerStr = localStorage.getItem("customer");
    const token = localStorage.getItem("token");

    if (!customerStr || !token) {
      alert("Silakan login terlebih dahulu");
      router.push("/signin"); 
      return;
    }

    const customer = JSON.parse(customerStr);

    if (product) {
      try {
        const payload = createCartPayload(customer.id);

        const res = await fetch("http://127.0.0.1:8000/api/cart", {
          method: "POST",
          headers: { 
            "Authorization": `Bearer ${token}` 
          },
          body: payload
        });

        if (!res.ok) {
           const errorResponse = await res.json().catch(() => null);
           console.error("🔴 DETAIL ERROR DARI LARAVEL BACKEND:", errorResponse);
           throw new Error("Gagal menyimpan ke database");
        }

        dispatch(addItemToCart({
          id: product.id,
          title: product.name,
          price: Number(product.price), 
          quantity: quantity,
          photo: product.photo,
          img: photoUrl,
          panjang: isCustom ? panjang : "0", 
          lebar: isCustom ? lebar : "0",    
          selectedOptions: selectedAttributes, 
          imgs: { previews: [photoUrl], thumbnails: [photoUrl] }
        } as any));
        
        alert("Pesanan berhasil dimasukkan ke keranjang!");
        closeModal();
      } catch (error) {
        console.error("Gagal menyimpan keranjang:", error);
        alert("Terjadi kesalahan sistem saat menambahkan data ke keranjang.");
      }
    }
  };

  const handleCheckout = async () => {
    if (!validateInput()) return;

    const customerStr = localStorage.getItem("customer");
    const token = localStorage.getItem("token");

    if (!customerStr || !token) {
      alert("Silakan login terlebih dahulu");
      router.push("/signin");
      return;
    }

    const customer = JSON.parse(customerStr);

    if (product) {
      try {
        const payload = createCartPayload(customer.id);

        const res = await fetch("http://127.0.0.1:8000/api/cart", {
          method: "POST",
          headers: { 
            "Authorization": `Bearer ${token}` 
          },
          body: payload
        });

        if (!res.ok) {
           throw new Error("Gagal memproses Beli Langsung");
        }

        dispatch(addItemToCart({
          id: product.id,
          title: product.name,
          // 🔥 KIRIM HARGA DASAR PER METER/UNIT, BUKAN HARGA TOTAL
          price: Number(product.price), 
          quantity: quantity,
          photo: product.photo,
          img: photoUrl,
          panjang: isCustom ? panjang : "0", 
          lebar: isCustom ? lebar : "0",    
          selectedOptions: selectedAttributes, 
          imgs: { previews: [photoUrl], thumbnails: [photoUrl] }
        } as any))


        const directItem = {
        id: product.id,
        title: product.name,
        price: hargaPerItem,
        quantity: quantity,
        photo: product.photo,
        img: photoUrl,
        panjang: isCustom ? panjang : "0",
        lebar: isCustom ? lebar : "0",
        selectedOptions: selectedAttributes,
    };
    
        sessionStorage.setItem("directCheckoutItem", JSON.stringify(directItem));
    
        // Arahkan ke checkout dengan parameter type=direct
        router.push("/checkout?type=direct");
        closeModal();
        

        
      } catch (error) {
        console.error("Gagal memproses Beli Langsung:", error);
        alert("Terjadi kesalahan jaringan saat memproses pesanan.");
      }
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (!target.closest(".modal-content")) {
        closeModal();
      }
    }

    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      setQuantity(1);
      setActivePreview(0);
      setPanjang("");
      setLebar("");
      setReadyDesignFile(null);
      setSupportFiles([]);
      setDesignNotes("");
      setDesignMethod("ready-to-print");
    };
  }, [isModalOpen, closeModal]);

  if (!product) return null;

  return (
    <div className={`${isModalOpen ? "z-99999" : "hidden"} fixed top-0 left-0 overflow-y-auto no-scrollbar w-full h-screen sm:py-10 xl:py-16 bg-dark/70 sm:px-8 px-4 py-5`}>
      <div className="flex items-center justify-center ">
        <div className="w-full max-w-[1100px] rounded-xl shadow-3 bg-white p-7.5 relative modal-content">
          
          {/* Close Button */}
          <button
            onClick={() => closeModal()}
            aria-label="button for close modal"
            className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center justify-center w-10 h-10 rounded-full ease-in duration-150 bg-meta text-body hover:text-dark z-50"
          >
            <svg className="fill-current" width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M14.3108 13L19.2291 8.08167C19.5866 7.72417 19.5866 7.12833 19.2291 6.77083C19.0543 6.59895 18.8189 6.50262 18.5737 6.50262C18.3285 6.50262 18.0932 6.59895 17.9183 6.77083L13 11.6892L8.08164 6.77083C7.90679 6.59895 7.67142 6.50262 7.42623 6.50262C7.18104 6.50262 6.94566 6.59895 6.77081 6.77083C6.41331 7.12833 6.41331 7.72417 6.77081 8.08167L11.6891 13L6.77081 17.9183C6.41331 18.2758 6.41331 18.8717 6.77081 19.2292C7.12831 19.5867 7.72414 19.5867 8.08164 19.2292L13 14.3108L17.9183 19.2292C18.2758 19.5867 18.8716 19.5867 19.2291 19.2292C19.5866 18.8717 19.5866 18.2758 19.2291 17.9183L14.3108 13Z" />
            </svg>
          </button>

          <div className="flex flex-wrap items-start gap-12.5">
            
            {/* ==================== SISI KIRI: PREVIEW IMAGES & SELEKTOR TAB FILE EKSKLUSIF ==================== */}
            <div className="max-w-[526px] w-full space-y-6">
              <div className="flex gap-5">
                <div className="flex flex-col gap-5">
                  {productImages.map((img, key) => (
                    <button
                      onClick={() => setActivePreview(key)}
                      key={key}
                      className={`flex items-center justify-center w-20 h-20 overflow-hidden rounded-lg bg-gray-1 ease-out duration-200 hover:border-2 hover:border-blue ${activePreview === key && "border-2 border-blue"}`}
                    >
                      <img src={img || "/placeholder.png"} alt="thumbnail" className="w-full h-full object-cover aspect-square" />
                    </button>
                  ))}
                </div>

                <div className="relative z-1 overflow-hidden flex items-center justify-center w-full sm:min-h-[280px] bg-gray-1 rounded-lg border border-gray-3">
                  <button
                    onClick={handlePreviewSlider}
                    aria-label="button for zoom"
                    className="gallery__Image w-10 h-10 rounded-[5px] bg-white shadow-1 flex items-center justify-center ease-out duration-200 text-dark hover:text-blue absolute top-4 right-4 z-40"
                  >
                    <svg className="fill-current" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M9.11493 1.14581L9.16665 1.14581C9.54634 1.14581 9.85415 1.45362 9.85415 1.83331C9.85415 2.21301 9.54634 2.52081 9.16665 2.52081C7.41873 2.52081 6.17695 2.52227 5.23492 2.64893C4.31268 2.77292 3.78133 3.00545 3.39339 3.39339C3.00545 3.78133 2.77292 4.31268 2.64893 5.23492C2.52227 6.17695 2.52081 7.41873 2.52081 9.16665C2.52081 9.54634 2.21301 9.85415 1.83331 9.85415C1.45362 9.85415 1.14581 9.54634 1.14581 9.16665L1.14581 9.11493C1.1458 7.43032 1.14579 6.09599 1.28619 5.05171C1.43068 3.97699 1.73512 3.10712 2.42112 2.42112C3.10712 1.73512 3.97699 1.43068 5.05171 1.28619C6.09599 1.14579 7.43032 1.1458 9.11493 1.14581ZM16.765 2.64893C15.823 2.52227 14.5812 2.52081 12.8333 2.52081C12.4536 2.52081 12.1458 2.21301 12.1458 1.83331C12.1458 1.45362 12.4536 1.14581 12.8333 1.14581L12.885 1.14581C14.5696 1.1458 15.904 1.14579 16.9483 1.28619C18.023 1.43068 18.8928 1.73512 19.5788 2.42112C20.2648 3.10712 20.5693 3.97699 20.7138 5.05171C20.8542 6.09599 20.8542 7.43032 20.8541 9.11494V9.16665C20.8541 9.54634 20.5463 9.85415 20.1666 9.85415C19.787 9.85415 19.4791 9.54634 19.4791 9.16665C19.4791 7.41873 19.4777 6.17695 19.351 5.23492C19.227 4.31268 18.9945 3.78133 18.6066 3.39339C18.2186 3.00545 17.6873 2.77292 16.765 2.64893ZM1.83331 12.1458C2.21301 12.1458 2.52081 12.4536 2.52081 12.8333C2.52081 14.5812 2.52227 15.823 2.64893 16.765C2.77292 17.6873 3.00545 18.2186 3.39339 18.6066C3.78133 18.9945 4.31268 19.227 5.23492 19.351C6.17695 19.4777 7.41873 19.4791 9.16665 19.4791C9.54634 19.4791 9.85415 19.787 9.85415 20.1666C9.85415 20.5463 9.54634 20.8541H9.11494C7.43032 20.8542 6.09599 20.8542 5.05171 20.7138C3.97699 20.5693 3.10712 20.2648 2.42112 19.5788C1.73512 18.8928 1.43068 18.023 1.28619 16.9483C1.14579 15.904 1.1458 14.5696 1.14581 12.885L1.14581 12.8333C1.14581 12.4536 1.45362 12.1458 1.83331 12.1458ZM20.1666 12.1458C20.5463 12.1458 20.8541 12.4536 20.8541 12.8333V12.885C20.8542 14.5696 20.8542 15.904 20.7138 16.9483C20.5693 18.023 20.2648 18.8928 19.5788 19.5788C18.8928 20.2648 18.023 20.5693 16.9483 20.7138C15.904 20.8542 14.5696 20.8542 12.885 20.8541H12.8333C12.4536 20.8541 12.1458 20.5463 12.1458 20.1666C12.1458 19.787 12.4536 19.4791 12.8333 19.4791C14.5812 19.4791 15.823 19.4777 16.765 19.351C17.6873 19.227 18.2186 18.9945 18.6066 18.6066C18.9945 18.2186 19.227 17.6873 19.351 16.765C19.4777 15.823 19.4791 14.5812 19.4791 12.8333C19.4791 12.4536 19.787 12.1458 20.1666 12.1458Z" />
                    </svg>
                  </button>
                  {productImages[activePreview] && (
                    <img src={productImages[activePreview]} alt="products-details" className="object-contain max-w-full h-auto max-h-[260px] rounded-lg" />
                  )}
                </div>
              </div>

              {/* 🔥 SELEKTOR TAB EXCLUSIVE (HANYA BISA MEMILIH SALAH SATU) */}
              <div className="w-full border border-gray-200 rounded-xl overflow-hidden shadow-md">
                <div className="flex border-b border-gray-200 bg-gray-50">
                  <button
                    type="button"
                    onClick={() => setDesignMethod("ready-to-print")}
                    className={`flex-1 py-4 text-center text-xs font-black transition-all flex items-center justify-center gap-2 ${designMethod === "ready-to-print" ? "bg-white text-blue border-b-2 border-blue" : "text-gray-400 hover:text-dark bg-gray-100"}`}
                  >
                    📤 Upload Desain (Siap Cetak)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDesignMethod("need-design")}
                    className={`flex-1 py-4 text-center text-xs font-black transition-all flex items-center justify-center gap-2 ${designMethod === "need-design" ? "bg-white text-blue border-b-2 border-blue" : "text-gray-400 hover:text-dark bg-gray-100"}`}
                  >
                    🎨 Belum Ada Desain (Butuh Desain)
                  </button>
                </div>

                {/* AREA KONTEN BERKAS BERDASARKAN METODE PILIHAN USER */}
                <div className="p-5 bg-white min-h-[220px]">
                  {designMethod === "ready-to-print" ? (
                    <div className="space-y-4">
                      {/* Drag & Drop File Utama (Siap Cetak) */}
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gray-5 hover:bg-gray-50 transition relative group">
                        <input
                          type="file"
                          accept=".pdf,.ai,.cdr,.psd,.jpg,.png,.zip,.rar"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setReadyDesignFile(e.target.files[0]);
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <span className="text-3xl text-blue group-hover:scale-110 transition-transform">📤</span>
                          <p className="text-xs font-bold text-dark-2">
                            {readyDesignFile ? `✅ Berkas Terpilih: ${readyDesignFile.name}` : "Klik atau seret File Desain Siap Cetak Anda di sini"}
                          </p>
                          <p className="text-[11px] text-gray-400">PDF, AI, CDR, PSD, JPG, PNG, ZIP, RAR</p>
                        </div>
                      </div>

                      {/* Info Formats & Badges */}
                      <div className="grid grid-cols-1 bg-gray-50 p-3 rounded-lg border text-[11px] text-gray-600 gap-1">
                        <div><strong>Format Utama:</strong> PDF, AI, CDR, PSD, High-Res JPG/PNG</div>
                        <div><strong>Maksimal:</strong> 50MB per file</div>
                        <div className="mt-2 pt-2 border-t border-dashed border-gray-200 text-green-600 font-medium flex items-center gap-1.5 text-xs">
                          <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse" />
                          Alur Pengerjaan Sistem: <span className="uppercase font-black bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[10px]">Siap Cetak</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Detail Layanan Pembuatan Desain */}
                      <div className="bg-blue-light-6/10 border border-blue/20 rounded-lg p-3.5 text-xs text-blue-dark leading-relaxed">
                        <span className="font-extrabold block mb-1">✨ Layanan Kreatif Setting & Jasa Layout</span>
                        Gunakan opsi ini jika Anda belum memiliki file cetak siap pakai. Operator desainer kami akan membantu mengolah materi layout Anda.
                      </div>

                      {/* Upload Berkas Referensi Pendukung (Opsional) */}
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black tracking-wider text-gray-400 uppercase">
                          Upload File Pendukung / Materi Rujukan (Opsional)
                        </label>
                        <div className="border border-gray-300 rounded-lg p-3 text-center bg-gray-5 hover:bg-gray-100 transition relative">
                          <input
                            type="file"
                            multiple
                            onChange={(e) => {
                              if (e.target.files) {
                                setSupportFiles([...supportFiles, ...Array.from(e.target.files)]);
                              }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <p className="text-xs text-gray-600 font-bold">
                            📂 Klik untuk melampirkan file sketsa, coretan kertas, atau logo
                          </p>
                        </div>
                      </div>

                      {/* Badge Alur Kerja Sistem */}
                      <div className="bg-orange-50 border border-orange-200 p-2.5 rounded-lg text-xs text-orange-700 font-medium flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-orange-500 inline-block animate-pulse" />
                        Alur Pengerjaan Sistem: <span className="uppercase font-black bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded text-[10px]">Antrean Desain</span>
                      </div>

                      {/* Preview List Berkas Pendukung Terpilih */}
                      {supportFiles.length > 0 && (
                        <div className="space-y-1.5 pt-2">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">File Pendukung Terlampir:</p>
                          {supportFiles.map((file, i) => (
                            <div key={file.name + i} className="flex items-center justify-between text-xs bg-gray-50 border rounded-lg px-3 py-2 shadow-sm">
                              <span className="truncate max-w-[250px]">📁 {file.name}</span>
                              <button 
                                type="button" 
                                onClick={() => setSupportFiles(supportFiles.filter((_, idx) => idx !== i))}
                                className="text-red-500 font-bold hover:underline"
                              >
                                Hapus
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Input Detail Instruksi / Catatan Tambahan */}
                  <div className="mt-4">
                    <label className="block text-[10px] font-black tracking-wider text-gray-400 uppercase mb-1">Catatan Tambahan / Detail Keterangan Cetak</label>
                    <textarea
                      value={designNotes}
                      onChange={(e) => setDesignNotes(e.target.value)}
                      placeholder="Masukkan detail instruksi cetak (misal: finishing lubang ring tiap pojok banner, warna dominan, teks tambahan, dll)"
                      className="w-full border border-gray-3 bg-white px-3 py-2 rounded-lg text-xs text-dark focus:outline-none focus:border-blue resize-none h-16"
                    />
                  </div>

                </div>
              </div>
            </div>

            {/* ==================== SISI KANAN: DETAIL PRODUK, CONFIG & PRICING ==================== */}
            <div className="max-w-[445px] w-full">
              {product.category?.name ? (
                <span className="inline-block text-custom-xs font-semibold tracking-wider text-white py-1 px-3 bg-blue mb-4 rounded-sm">
                  {product.category.name.toUpperCase()}
                </span>
              ) : (
                <span className="inline-block text-custom-xs font-medium text-white py-1 px-3 bg-gray-500 mb-4 rounded-sm">UMUM</span>
              )}

              <h3 className="font-semibold text-xl text-dark mb-2">
                {product.name}
              </h3>

              {/* Ringkasan Biaya */}
              <div className="bg-gray-50 border p-4 rounded-lg my-3 space-y-1.5">
                <p className="text-xs text-gray-500">
                  Harga Satuan Dasar: Rp {Number(product?.price || 0).toLocaleString("id-ID")}
                </p>
                {isCustom && luas > 0 && (
                  <p className="text-xs text-green-600 font-medium">
                    Luas Cetak: {luas.toFixed(2)} m² ({panjang} x {lebar} cm)
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Harga Konfigurasi: Rp {hargaPerItem.toLocaleString("id-ID")} / item
                </p>
                <p className="text-lg font-black text-blue pt-1 border-t border-dashed">
                  Total Ringkasan: Rp {totalEstimatedPrice.toLocaleString("id-ID")}
                </p>
              </div>

              {/* Badge info produk */}
              <div className="flex flex-wrap items-center gap-5 mb-4">
                <div className="flex items-center gap-1.5">
                  <svg className="fill-[#FFA645]" width="18" height="18" viewBox="0 0 18 18">
                    <path d="M16.7906 6.72187L11.7 5.93438L9.39377 1.09688C9.22502 0.759375 8.77502 0.759375 8.60627 1.09688L6.30002 5.9625L1.23752 6.72187C0.871891 6.77812 0.731266 7.25625 1.01252 7.50938L4.69689 11.3063L3.82502 16.6219C3.76877 16.9875 4.13439 17.2969 4.47189 17.0719L9.05627 14.5687L13.6125 17.0719C13.9219 17.2406 14.3156 16.9594 14.2313 16.6219L13.3594 11.3063L17.0438 7.50938C17.2688 7.25625 17.1563 6.77812 16.7906 6.72187Z"/>
                  </svg>
                  <span className="text-sm"><span className="font-medium text-dark">5.0</span> <span className="text-dark-2">Terlaris</span></span>
                </div>
                <span className="font-medium text-xs text-dark flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-full">
                  <span className={`w-2 h-2 rounded-full ${product.status ? "bg-green-500" : "bg-red-500"}`} />
                  {product.status ? "Tersedia / Aktif" : "Tidak Aktif"}
                </span>
              </div>

              <p className="text-body text-sm mb-4 leading-relaxed text-gray-600">
                {product.description || <span className="text-gray-400 italic">Tidak ada deskripsi spesifikasi untuk produk ini.</span>}
              </p>

              {/* Pilihan Variasi Atribut */}
              {product.attributes?.length > 0 && (
                <div className="space-y-3 border-t border-b border-gray-200 py-4 mb-4">
                  <h4 className="font-bold text-sm text-dark">Pilih Spesifikasi Cetak:</h4>
                  {product.attributes.map((attr: any) => (
                    <div key={attr.id || attr.name} className="space-y-1.5">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">{attr.name}</span>
                      <div className="flex flex-wrap gap-2">
                        {attr.values?.map((val: any) => {
                          const isSelected = selectedAttributes[attr.id || attr.name]?.id === val.id;
                          return (
                            <button
                              key={val.id}
                              type="button"
                              onClick={() => setSelectedAttributes({ ...selectedAttributes, [attr.id || attr.name]: val })}
                              className={`px-3 py-1.5 rounded-[5px] text-xs font-medium border transition-all ${isSelected ? "bg-blue text-white border-blue shadow-sm font-bold" : "bg-white text-gray-700 border-gray-3 hover:border-gray-4"}`}
                            >
                              {val.name}
                              {Number(val.additional_price) > 0 && (
                                <span className={`ml-1 text-[10px] ${isSelected ? "text-blue-100" : "text-green-600"}`}>
                                  (+Rp {Number(val.additional_price).toLocaleString("id-ID")})
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Input Ukuran Cetak Kustom */}
              {isCustom && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block font-bold text-xs text-dark mb-1.5">Panjang (cm)</label>
                    <input
                      type="number"
                      className="w-full border border-gray-3 bg-white px-3 py-2.5 rounded-[5px] text-xs text-dark focus:outline-none focus:border-blue"
                      placeholder="Contoh: 100"
                      value={panjang}
                      onChange={(e) => setPanjang(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-xs text-dark mb-1.5">Lebar (cm)</label>
                    <input
                      type="number"
                      className="w-full border border-gray-3 bg-white px-3 py-2.5 rounded-[5px] text-xs text-dark focus:outline-none focus:border-blue"
                      placeholder="Contoh: 50"
                      value={lebar}
                      onChange={(e) => setLebar(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-500 mb-4 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                ⏰ Estimasi Produksi: <span className="font-semibold text-gray-900">{product.estimated_duration || 0} Hari Kerja</span>
              </div>

              {/* Kuantitas Order */}
              <div className="flex flex-wrap justify-between gap-5 mt-4 mb-5">
                <div>
                  <h4 className="font-semibold text-sm text-dark mb-2">Quantity Pesanan</h4>
                  <div className="flex items-center gap-3">
                    <button onClick={() => quantity > 1 && setQuantity(quantity - 1)} className="flex items-center justify-center w-10 h-10 rounded-[5px] bg-gray-2 text-dark hover:text-blue">-</button>
                    <span className="flex items-center justify-center w-20 h-10 rounded-[5px] border border-gray-4 bg-white font-medium text-dark">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="flex items-center justify-center w-10 h-10 rounded-[5px] bg-gray-2 text-dark hover:text-blue">+</button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <button
                  disabled={quantity === 0}
                  onClick={handleAddToCart}
                  className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add to Cart
                </button>

                <button
                  disabled={quantity === 0}
                  onClick={handleCheckout}
                  className="inline-flex font-medium text-blue border-2 border-blue bg-white py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Beli Langsung
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;