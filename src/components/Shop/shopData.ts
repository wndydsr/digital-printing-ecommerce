import { Product } from "@/types/product";

const shopData: Product[] = [
  {
    id: 1,
    title: "Dummy Product 1",
    reviews: 45,
    price: 50000,
    imgs: {
      thumbnails: ["/images/products/product-01.png"],
      previews: ["/images/products/product-01.png"]
    }
  },
  {
    id: 2,
    title: "Dummy Product 2",
    reviews: 12,
    price: 3000,
    imgs: {
      thumbnails: ["/images/products/product-02.png"],
      previews: ["/images/products/product-02.png"]
    }
  }
];

export default shopData;
