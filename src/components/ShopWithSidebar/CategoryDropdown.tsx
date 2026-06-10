"use client";

import { useState, useEffect } from "react";
import {
  LayoutGrid,
  CreditCard,
  FileText,
  Flag,
  ImageIcon,
  Sticker,
  Package,
  Mail,
  Calendar,
  BookOpen,
} from "lucide-react";

// 🔹 Buat interface props agar bisa dioper dari luar
interface CategoryDropdownProps {
  selected?: string;
  onSelect?: (id: string) => void;
}

const getCategoryIcon = (slug: string) => {
  switch (slug) {
    case "all": return LayoutGrid;
    case "kartu-nama": return CreditCard;
    case "brosur-flyer": case "brosur": return FileText;
    case "banner-spanduk": case "banner": case "spanduk": return Flag;
    case "poster": return ImageIcon;
    case "stiker": return Sticker;
    case "kemasan": return Package;
    case "undangan": return Mail;
    case "kalender": return Calendar;
    case "buku-majalah": return BookOpen;
    default: return Package;
  }
};

const CategoryDropdown = ({ selected, onSelect }: CategoryDropdownProps) => {
  const [categories, setCategories] = useState<any[]>([
    { id: "all", name: "Semua Produk", slug: "all" }
  ]);
  
  // State cadangan jika komponen ini dipanggil tanpa props (seperti di Hero.tsx)
  const [localSelected, setLocalSelected] = useState<string>("all");

  // Tentukan mana nilai selected dan fungsi klik yang aktif digunakan
  const activeSelected = selected !== undefined ? selected : localSelected;

  const handleSelect = (id: string) => {
    if (onSelect) {
      onSelect(id);
    } else {
      setLocalSelected(id);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://127.0.0.1:8000/api/categories", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setCategories([
            { id: "all", name: "Semua Produk", slug: "all" },
            ...data
          ]);
        }
      } catch (err) {
        console.error("Gagal memuat kategori:", err);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="bg-white shadow-1 rounded-lg py-4 px-5">
      <div className="space-y-0.5">
        {categories.map((category) => {
          const Icon = getCategoryIcon(category.slug);
          const isSelected = activeSelected === String(category.id);

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => handleSelect(String(category.id))}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                isSelected
                  ? "bg-blue-600 text-blue font-medium shadow-sm" 
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon size={14} className={isSelected ? "text-blue" : "text-gray-400"} />
              <span className="text-xs font-medium">
                {category.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryDropdown;