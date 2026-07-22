import axios from "axios";
import { ApiDomain } from "../../utils/APIDomain";

export interface WishlistItem {
  wishlistId: number;
  userId: number;
  productId: number;
  createdAt: string;
  product?: any;
}

const api = axios.create({
  baseURL: ApiDomain,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const wishlistAPI = {
  getWishlist: (): Promise<{ success: boolean; data: WishlistItem[] }> =>
    api.get("/wishlist").then((res) => res.data),

  add: (productId: number): Promise<{ success: boolean; data: WishlistItem; message: string }> =>
    api.post("/wishlist", { productId }).then((res) => res.data),

  remove: (productId: number): Promise<{ success: boolean; data: WishlistItem; message: string }> =>
    api.delete(`/wishlist/${productId}`).then((res) => res.data),

  clear: (): Promise<{ success: boolean; message: string }> =>
    api.delete("/wishlist/clear").then((res) => res.data),

  check: (productId: number): Promise<{ success: boolean; data: boolean }> =>
    api.get(`/wishlist/check/${productId}`).then((res) => res.data),
};