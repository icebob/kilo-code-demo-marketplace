<template>
  <div v-if="loading" class="text-center py-8">
    <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    <p class="mt-2 text-gray-600">Loading product details...</p>
  </div>

  <div v-else-if="product" class="max-w-6xl mx-auto">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Product Image -->
      <div>
        <div class="aspect-w-1 aspect-h-1">
          <img
            v-if="product.image_url"
            :src="product.image_url"
            :alt="product.title"
            class="w-full h-96 object-cover rounded-lg"
          />
          <div v-else class="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
            <svg class="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </div>
        </div>
      </div>

      <!-- Product Info -->
      <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-4">{{ product.title }}</h1>
        
        <div class="mb-6">
          <span class="text-4xl font-bold text-gray-900">${{ parseFloat(product.price).toFixed(2) }}</span>
        </div>

        <div class="mb-6">
          <h2 class="text-lg font-semibold text-gray-800 mb-2">Description</h2>
          <p class="text-gray-600 whitespace-pre-wrap">{{ product.description }}</p>
        </div>

        <div class="mb-6 space-y-2">
          <div class="flex items-center text-gray-600">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            Seller: {{ product.seller?.name || 'Unknown' }}
          </div>
          
          <div class="flex items-center text-gray-600">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
            </svg>
            Stock: {{ product.quantity }} available
          </div>

          <div class="flex items-center text-gray-600">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Status: <span class="capitalize ml-1">{{ product.status }}</span>
          </div>
        </div>

        <!-- Add to Cart Section -->
        <div class="border-t pt-6">
          <div class="flex items-center space-x-4 mb-4">
            <label for="quantity" class="text-gray-700 font-medium">Quantity:</label>
            <input
              id="quantity"
              v-model.number="quantity"
              type="number"
              min="1"
              :max="product.quantity"
              class="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            @click="handleAddToCart"
            :disabled="product.quantity === 0 || addingToCart"
            class="w-full btn btn-primary"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            {{ addingToCart ? 'Adding to Cart...' : 'Add to Cart' }}
          </button>

          <p v-if="product.quantity === 0" class="mt-2 text-red-600 text-sm">
            This product is currently out of stock.
          </p>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="text-center py-8">
    <p class="text-gray-600">Product not found</p>
    <router-link to="/" class="mt-4 inline-block text-blue-600 hover:text-blue-700">
      Back to Home
    </router-link>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProductStore } from '../stores/product';
import { useCartStore } from '../stores/cart';
import { useAuthStore } from '../stores/auth';

const route = useRoute();
const router = useRouter();
const productStore = useProductStore();
const cartStore = useCartStore();
const authStore = useAuthStore();

const product = ref(null);
const loading = ref(true);
const quantity = ref(1);
const addingToCart = ref(false);

const handleAddToCart = async () => {
  if (!authStore.isLoggedIn) {
    router.push('/login');
    return;
  }

  addingToCart.value = true;
  try {
    await cartStore.addToCart(product.value.id, quantity.value);
    quantity.value = 1; // Reset quantity after adding
  } catch (error) {
    // Error is handled by the store
  } finally {
    addingToCart.value = false;
  }
};

onMounted(async () => {
  try {
    const productId = parseInt(route.params.id);
    product.value = await productStore.fetchProduct(productId);
  } catch (error) {
    console.error('Failed to fetch product:', error);
  } finally {
    loading.value = false;
  }
});
</script>