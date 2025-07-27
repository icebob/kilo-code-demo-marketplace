<template>
  <div class="max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      <p class="mt-2 text-gray-600">Loading cart...</p>
    </div>

    <div v-else-if="isEmpty" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
      </svg>
      <p class="mt-2 text-gray-600">Your cart is empty</p>
      <router-link to="/" class="mt-4 inline-block btn btn-primary">
        Continue Shopping
      </router-link>
    </div>

    <div v-else>
      <div class="space-y-4 mb-8">
        <CartItem
          v-for="item in cartItems"
          :key="item.id"
          :item="item"
          @update="updateQuantity"
          @remove="removeItem"
        />
      </div>

      <!-- Cart Summary -->
      <div class="border-t pt-6">
        <div class="flex justify-between items-center mb-4">
          <span class="text-lg font-semibold text-gray-800">Total:</span>
          <span class="text-2xl font-bold text-gray-900">${{ cartTotal.toFixed(2) }}</span>
        </div>

        <div class="flex space-x-4">
          <button
            @click="clearCart"
            :disabled="clearing"
            class="btn btn-secondary"
          >
            {{ clearing ? 'Clearing...' : 'Clear Cart' }}
          </button>
          
          <router-link to="/checkout" class="flex-1 btn btn-primary text-center">
            Proceed to Checkout
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useCartStore } from '../stores/cart';
import CartItem from '../components/cart/CartItem.vue';

const cartStore = useCartStore();

const clearing = ref(false);

const cartItems = computed(() => cartStore.cartItems);
const cartTotal = computed(() => cartStore.cartTotal);
const loading = computed(() => cartStore.isLoading);
const isEmpty = computed(() => cartStore.isEmpty);

const updateQuantity = async (itemId, quantity) => {
  await cartStore.updateCartItem(itemId, quantity);
};

const removeItem = async (itemId) => {
  await cartStore.removeFromCart(itemId);
};

const clearCart = async () => {
  if (confirm('Are you sure you want to clear your cart?')) {
    clearing.value = true;
    await cartStore.clearCart();
    clearing.value = false;
  }
};

onMounted(() => {
  cartStore.fetchCart();
});
</script>