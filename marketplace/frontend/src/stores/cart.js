import { defineStore } from 'pinia';
import { cartAPI } from '../services/api';
import { useToast } from 'vue-toastification';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    total: 0,
    count: 0,
    loading: false,
  }),

  getters: {
    cartItems: (state) => state.items,
    cartTotal: (state) => state.total,
    cartCount: (state) => state.count,
    isLoading: (state) => state.loading,
    isEmpty: (state) => state.items.length === 0,
  },

  actions: {
    async fetchCart() {
      const toast = useToast();
      this.loading = true;
      try {
        const response = await cartAPI.list();
        const { items, total, count } = response.data;
        
        this.items = items;
        this.total = parseFloat(total);
        this.count = count;
        
        return response.data;
      } catch (error) {
        toast.error('Failed to fetch cart');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async addToCart(productId, quantity = 1) {
      const toast = useToast();
      this.loading = true;
      try {
        const response = await cartAPI.add({ product_id: productId, quantity });
        toast.success('Added to cart!');
        
        // Refresh cart
        await this.fetchCart();
        
        return response.data;
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to add to cart';
        toast.error(message);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateCartItem(itemId, quantity) {
      const toast = useToast();
      this.loading = true;
      try {
        const response = await cartAPI.update(itemId, { quantity });
        
        // Update local state
        const item = this.items.find(i => i.id === itemId);
        if (item) {
          item.quantity = quantity;
          this.recalculateTotal();
        }
        
        return response.data;
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to update cart';
        toast.error(message);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async removeFromCart(itemId) {
      const toast = useToast();
      this.loading = true;
      try {
        await cartAPI.remove(itemId);
        
        // Remove from local state
        this.items = this.items.filter(i => i.id !== itemId);
        this.recalculateTotal();
        
        toast.success('Removed from cart');
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to remove from cart';
        toast.error(message);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async clearCart() {
      const toast = useToast();
      this.loading = true;
      try {
        await cartAPI.clear();
        
        // Clear local state
        this.items = [];
        this.total = 0;
        this.count = 0;
        
        toast.success('Cart cleared');
      } catch (error) {
        toast.error('Failed to clear cart');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    recalculateTotal() {
      this.total = this.items.reduce((sum, item) => {
        return sum + (parseFloat(item.product.price) * item.quantity);
      }, 0);
      this.count = this.items.length;
    },

    resetCart() {
      this.items = [];
      this.total = 0;
      this.count = 0;
    },
  },
});