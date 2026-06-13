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
      const { id, title, price, quantity, imgs, img, panjang, lebar, selectedOptions } = action.payload;
      
      // LOGIKA BARU: Jika produknya custom (ada ukuran panjang/lebar atau pilihan atribut), 
      // kita JANGAN gabungkan quantity-nya, melainkan buat baris baru di keranjang.
      const isCustom = Number(panjang) > 0 || Object.keys(selectedOptions || {}).length > 0;

      const existingItem = state.items.find((item) => item.id === id);

      if (existingItem && !isCustom) {
        // Jika produk umum (bukan custom), gabungkan jumlahnya
        existingItem.quantity += quantity;
      } else {
        // Jika produk custom atau belum ada, tambahkan item baru
        state.items.push({
          id, // Jika nanti pakai DB, lebih baik pakai Date.now() sementara atau ID dari DB
          title,
          price,
          quantity,
          img,
          panjang,
          lebar,
          selectedOptions,
          imgs,
        });
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
    return total + item.price * item.quantity;
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