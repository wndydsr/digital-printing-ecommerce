"use client";
import React, { useEffect, useState } from "react";

import { useModalContext } from "@/app/context/QuickViewModalContext";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { addItemToCart } from "@/redux/features/cart-slice";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";

export const directDirectFileCache = {
  readyDesignFile: null as File | null,
  supportFiles: [] as File[],
  catatan: "" as string,
};


const QuickViewModal = () => {
  const { isModalOpen, closeModal } = useModalContext();
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();

  const dispatch = useDispatch<AppDispatch>();

  const product = useAppSelector((state) => state.quickViewReducer.value) as any;

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
      : `${process.env.NEXT_PUBLIC_API_URL}/storage/${product.photo}`
    : "/placeholder.png";

  const productImages = [photoUrl];

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

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart`, {
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
          designMethod: designMethod, 
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

  const handleCheckout = () => {
    if (!validateInput()) return;

    const customerStr = localStorage.getItem("customer");
    const token = localStorage.getItem("token");

    if (!customerStr || !token) {
      alert("Silakan login terlebih dahulu");
      router.push("/signin");
      return;
    }

    if (product) {
      // 🔥 SIMPAN BERKAS ASLI KE MEMORI RUNTIME (ANTI-SERIAlISASI JSON)
      directDirectFileCache.readyDesignFile = readyDesignFile;
      directDirectFileCache.supportFiles = supportFiles;
      directDirectFileCache.catatan = designNotes;

      const directItem = {
        id: product.id,
        title: product.name,
        price: Number(product.price), 
        quantity: quantity,
        photo: product.photo,
        img: photoUrl,
        panjang: isCustom ? panjang : "0",
        lebar: isCustom ? lebar : "0",
        selectedOptions: selectedAttributes,
        catatan: designNotes,
        designNotes: designNotes,
        designMethod: designMethod,
        design_method: designMethod,
        dummy_file_name: designMethod === "ready-to-print" 
          ? (readyDesignFile?.name || "design_siap_cetak.pdf") 
          : null,
        is_ready_to_print: designMethod === "ready-to-print",
      };
    
      sessionStorage.setItem("directCheckoutItem", JSON.stringify(directItem));
      router.push("/checkout?type=direct");
      closeModal();
    }
  };
  

  if (!isModalOpen || !product) return null;

  return (
    <div className="fixed top-0 left-0 overflow-y-auto no-scrollbar w-full h-screen sm:py-10 xl:py-16 bg-dark/70 sm:px-8 px-4 py-5 z-99999">
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
            
            {/* ==================== SISI KIRI ==================== */}
            <div className="max-w-[526px] w-full space-y-6">
              <div className="relative z-1 overflow-hidden flex items-center justify-center w-full sm:min-h-[280px] bg-gray-1 rounded-lg border border-gray-3 p-4">
                {productImages[0] && (
                  <img src={productImages[0]} alt="products-details" className="object-contain max-w-full h-auto max-h-[260px] rounded-lg" />
                )}
              </div>

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

                <div className="p-5 bg-white min-h-[220px]">
                  {designMethod === "ready-to-print" ? (
                    <div className="space-y-4">
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
                      <div className="bg-blue-light-6/10 border border-blue/20 rounded-lg p-3.5 text-xs text-blue-dark leading-relaxed">
                        <span className="font-extrabold block mb-1">✨ Layanan Kreatif Setting & Jasa Layout</span>
                        Gunakan opsi ini jika Anda belum memiliki file cetak siap pakai. Operator desainer kami akan membantu mengolah materi layout Anda.
                      </div>

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

                      <div className="bg-orange-50 border border-orange-200 p-2.5 rounded-lg text-xs text-orange-700 font-medium flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-orange-500 inline-block animate-pulse" />
                        Alur Pengerjaan Sistem: <span className="uppercase font-black bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded text-[10px]">Antrean Desain</span>
                      </div>

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

            {/* ==================== SISI KANAN ==================== */}
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

              <div className="bg-gray-50 border p-4 rounded-lg my-3 space-y-1.5">
                <p className="text-xs text-gray-500">
                  Harga Satuan: Rp {hargaPerItem.toLocaleString("id-ID")} / item
                </p>
                <p className="text-lg font-black text-blue pt-1 border-t border-dashed">
                  Total Ringkasan: Rp {totalEstimatedPrice.toLocaleString("id-ID")}
                </p>
              </div>

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

              {/* 🔥 Pilihan Variasi Atribut */}
              {product.attributes?.length > 0 && (
                <div className="space-y-4 border-t border-b border-gray-200 py-4 mb-4">
                  <h4 className="font-bold text-sm text-dark">Pilih Spesifikasi Cetak:</h4>
                  {product.attributes.map((attr: any) => {
                    const currentAttrKey = attr.id || attr.name;
                    return (
                      <div key={currentAttrKey} className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                          {attr.name}
                        </label>
                        <select
                          value={selectedAttributes[currentAttrKey]?.id || ""}
                          onChange={(e) => {
                            const valId = Number(e.target.value);
                            const selectedObj = attr.values.find((val: any) => val.id === valId);
                            if (selectedObj) {
                              setSelectedAttributes({
                                ...selectedAttributes,
                                [currentAttrKey]: selectedObj,
                              });
                            }
                          }}
                          className="w-full border border-blue bg-white px-3 py-2.5 rounded-[5px] text-xs font-bold text-blue focus:outline-none cursor-pointer shadow-sm"
                        >
                          {attr.values?.map((val: any) => (
                            <option key={val.id} value={val.id} className="text-dark font-normal">
                              {val.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
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