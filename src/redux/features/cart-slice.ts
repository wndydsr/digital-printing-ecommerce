import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

type InitialState = {
  items: CartItem[];
};

export type CartItem = {
  id: number; 
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
  need_design?: boolean;
  design_method?: "ready-to-print" | "need-design";
  dummy_file_name?: string | null;
};

const initialState: InitialState = {
  items: [],
};

export const cart = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
    },

    addItemToCart: (state, action: PayloadAction<CartItem>) => {
      const newItem = action.payload;
      const existingItem = state.items.find((item) => item.id === newItem.id);
      const isCustom = Number(newItem.panjang) > 0 || Object.keys(newItem.selectedOptions || {}).length > 0;

      if (existingItem && !isCustom) {
        existingItem.quantity += newItem.quantity;
        existingItem.need_design = newItem.need_design;
        existingItem.design_method = newItem.design_method;
        existingItem.dummy_file_name = newItem.dummy_file_name;
        existingItem.selectedOptions = newItem.selectedOptions;
      } else {
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

    removeAllItemsFromCart: (state) => {
      state.items = [];
    },
  },
});

export const selectCartItems = (state: RootState) => state.cartReducer.items;

export const selectTotalPrice = createSelector([selectCartItems], (items) => {
  return items.reduce((total, item: any) => {
    // 1. Ambil harga dasar produk
    let basePrice = Number(item.price || item.product?.price || 0);

    // 2. Jika harga masih 0 atau ingin memastikan, hitung dari tambahan harga atribut (additional_price)
    let selectedOpts = item.selectedOptions || item.selected_options || {};
    if (typeof selectedOpts === "string") {
      try { selectedOpts = JSON.parse(selectedOpts); } catch { selectedOpts = {}; }
    }

    if (item.product?.attributes && Array.isArray(item.product.attributes) && typeof selectedOpts === "object") {
      item.product.attributes.forEach((attr: any) => {
        const selectedVal = selectedOpts[attr.name] || selectedOpts[attr.id];
        if (selectedVal && attr.values && Array.isArray(attr.values)) {
          const matchedVal = attr.values.find(
            (v: any) => String(v.name) === String(selectedVal) || String(v.id) === String(selectedVal)
          );
          if (matchedVal && matchedVal.additional_price) {
            basePrice += Number(matchedVal.additional_price || 0);
          }
        }
      });
    }

    // 3. Hitung perkalian luas jika produk kustom (Panjang x Lebar)
    const panjang = Number(item.panjang || 0);
    const lebar = Number(item.lebar || 0);
    const isCustom = item.product?.is_custom == 1 || item.product?.is_custom === true;
    
    let finalPricePerUnit = basePrice;
    if (isCustom && panjang > 0 && lebar > 0) {
      const luasM2 = (panjang * lebar) / 10000;
      finalPricePerUnit = luasM2 * basePrice;
    }

    // Jika item.price dari quickview sudah membawa angka valid dan murni, gunakan itu
    if (Number(item.price) > 0 && !isCustom && Object.keys(selectedOpts).length === 0) {
      finalPricePerUnit = Number(item.price);
    }

    return total + (finalPricePerUnit * Number(item.quantity || 1));
  }, 0);
});

export const {
  setCartItems, 
  addItemToCart,
  removeItemFromCart,
  updateCartItemQuantity,
  removeAllItemsFromCart,
} = cart.actions;

export default cart.reducer;