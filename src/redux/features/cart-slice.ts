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
  return items.reduce((total, item) => {
    let price = Number(item.price || 0);

    if (item.selectedOptions && typeof item.selectedOptions === 'object') {
      Object.values(item.selectedOptions).forEach((opt: any) => {
        price += Number(opt.additional_price || 0);
      });
    }

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
  setCartItems, 
  addItemToCart,
  removeItemFromCart,
  updateCartItemQuantity,
  removeAllItemsFromCart,
} = cart.actions;

export default cart.reducer;