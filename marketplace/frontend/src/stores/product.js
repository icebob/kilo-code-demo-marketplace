import { defineStore } from 'pinia';
import { productAPI } from '../services/api';
import { useToast } from 'vue-toastification';

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [],
    currentProduct: null,
    myProducts: [],
    loading: false,
    pagination: {
      page: 1,
      pageSize: 20,
      total: 0,
      totalPages: 0,
    },
  }),

  getters: {
    productList: (state) => state.products,
    product: (state) => state.currentProduct,
    sellerProducts: (state) => state.myProducts,
    isLoading: (state) => state.loading,
  },

  actions: {
    async fetchProducts(params = {}) {
      const toast = useToast();
      this.loading = true;
      try {
        const response = await productAPI.list(params);
        const { rows, total, page, pageSize, totalPages } = response.data;
        
        this.products = rows;
        this.pagination = { total, page, pageSize, totalPages };
        
        return response.data;
      } catch (error) {
        toast.error('Failed to fetch products');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchProduct(id) {
      const toast = useToast();
      this.loading = true;
      try {
        const response = await productAPI.get(id);
        this.currentProduct = response.data;
        return response.data;
      } catch (error) {
        toast.error('Failed to fetch product details');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createProduct(productData) {
      const toast = useToast();
      this.loading = true;
      try {
        const response = await productAPI.create(productData);
        toast.success('Product created successfully!');
        return response.data;
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to create product';
        toast.error(message);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateProduct(id, productData) {
      const toast = useToast();
      this.loading = true;
      try {
        const response = await productAPI.update(id, productData);
        toast.success('Product updated successfully!');
        
        // Update in local state if it's the current product
        if (this.currentProduct?.id === id) {
          this.currentProduct = response.data;
        }
        
        // Update in products list
        const index = this.products.findIndex(p => p.id === id);
        if (index !== -1) {
          this.products[index] = response.data;
        }
        
        return response.data;
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to update product';
        toast.error(message);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteProduct(id) {
      const toast = useToast();
      this.loading = true;
      try {
        await productAPI.delete(id);
        toast.success('Product deleted successfully!');
        
        // Remove from local state
        this.products = this.products.filter(p => p.id !== id);
        this.myProducts = this.myProducts.filter(p => p.id !== id);
        
        if (this.currentProduct?.id === id) {
          this.currentProduct = null;
        }
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to delete product';
        toast.error(message);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    clearCurrentProduct() {
      this.currentProduct = null;
    },
  },
});