import { defineStore } from 'pinia';
import { orderAPI } from '../services/api';
import { useToast } from 'vue-toastification';
import { useCartStore } from './cart';

export const useOrderStore = defineStore('order', {
  state: () => ({
    orders: [],
    currentOrder: null,
    sellerOrders: [],
    loading: false,
    pagination: {
      page: 1,
      pageSize: 20,
      total: 0,
      totalPages: 0,
    },
  }),

  getters: {
    orderList: (state) => state.orders,
    order: (state) => state.currentOrder,
    isLoading: (state) => state.loading,
  },

  actions: {
    async createOrder(shippingAddress) {
      const toast = useToast();
      this.loading = true;
      try {
        const response = await orderAPI.create({ shipping_address: shippingAddress });
        const order = response.data;
        
        // Clear cart after successful order
        const cartStore = useCartStore();
        cartStore.resetCart();
        
        toast.success('Order placed successfully!');
        return order;
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to create order';
        toast.error(message);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchOrders(params = {}) {
      const toast = useToast();
      this.loading = true;
      try {
        const response = await orderAPI.list(params);
        const { rows, total, page, pageSize, totalPages } = response.data;
        
        this.orders = rows;
        this.pagination = { total, page, pageSize, totalPages };
        
        return response.data;
      } catch (error) {
        toast.error('Failed to fetch orders');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchOrder(id) {
      const toast = useToast();
      this.loading = true;
      try {
        const response = await orderAPI.get(id);
        this.currentOrder = response.data;
        return response.data;
      } catch (error) {
        toast.error('Failed to fetch order details');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchSellerOrders(params = {}) {
      const toast = useToast();
      this.loading = true;
      try {
        const response = await orderAPI.getSellerOrders(params);
        const { rows, total, page, pageSize, totalPages } = response.data;
        
        this.sellerOrders = rows;
        this.pagination = { total, page, pageSize, totalPages };
        
        return response.data;
      } catch (error) {
        toast.error('Failed to fetch seller orders');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    clearCurrentOrder() {
      this.currentOrder = null;
    },
  },
});