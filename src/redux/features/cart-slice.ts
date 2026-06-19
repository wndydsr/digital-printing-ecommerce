import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

type InitialState = {
  items: CartItem[];
};

// 🔥 PERBAIKAN: Menambahkan properti khusus percetakan agar TypeScript tidak error
export type CartItem = {
  id: number; // Akan diisi ID produk atau ID Cart Item dari database
  title: string;
  price: number;
  quantity: number;
  img?: string;
  panjang?: number | string;
  lebar?: number | string;
  selectedOptions?: Record<string, any>;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};

const initialState: InitialState = {
  items: [],
};

export const cart = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // 🔥 FUNGSI BARU: Untuk menarik data langsung dari database saat pertama kali login
    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
    },

    addItemToCart: (state, action: PayloadAction<CartItem>) => {
  const newItem = action.payload;
  
  // Cari apakah item dengan ID yang sama sudah ada (sebagai dasar perbandingan)
  const existingItem = state.items.find((item) => item.id === newItem.id);

  // Jika produk custom, JANGAN PERNAH gabungkan quantity.
  // Jika produk biasa, baru boleh gabungkan.
  const isCustom = Number(newItem.panjang) > 0 || Object.keys(newItem.selectedOptions || {}).length > 0;

  if (existingItem && !isCustom) {
    existingItem.quantity += newItem.quantity;
  } else {
    // 🔥 PENTING: Gunakan spread operator (...) untuk memastikan kita membuat objek baru
    state.items.push({ ...newItem }); 
  }
},

    removeItemFromCart: (state, action: PayloadAction<number>) => {
      const itemId = action.payload;
      state.items = state.items.filter((item) => item.id !== itemId);
    },

    updateCartItemQuantity: (
      state,
      action: PayloadAction<{ id: number; quantity: number }>
    ) => {
      const { id, quantity } = action.payload;
      const existingItem = state.items.find((item) => item.id === id);

      if (existingItem) {
        existingItem.quantity = quantity;
      }
    },

    // Fungsi ini akan kita pakai setelah checkout berhasil
    removeAllItemsFromCart: (state) => {
      state.items = [];
    },
  },
});

export const selectCartItems = (state: RootState) => state.cartReducer.items;

export const selectTotalPrice = createSelector([selectCartItems], (items) => {
  return items.reduce((total, item) => {
    // 1. Ambil harga dasar (sekarang ini adalah hargaPerMeter)
    let price = Number(item.price || 0);

    // 2. Tambah harga atribut
    if (item.selectedOptions && typeof item.selectedOptions === 'object') {
      Object.values(item.selectedOptions).forEach((opt: any) => {
        price += Number(opt.additional_price || 0);
      });
    }

    // 3. Kalkulasi Luas (SEKARANG DILAKUKAN SEKALI SAJA DI SINI)
    const panjang = Number(item.panjang || 0);
    const lebar = Number(item.lebar || 0);
    let finalPricePerUnit = price;
    
    if (panjang > 0 && lebar > 0) {
      const luasM2 = (panjang * lebar) / 10000;
      finalPricePerUnit = luasM2 * price;
    }

    return total + (finalPricePerUnit * item.quantity);
  }, 0);
});

export const {
  setCartItems, // Export fungsi barunya
  addItemToCart,
  removeItemFromCart,
  updateCartItemQuantity,
  removeAllItemsFromCart,
} = cart.actions;

export default cart.reducer;