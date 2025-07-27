<template>
  <div class="max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      <p class="mt-2 text-gray-600">Loading checkout...</p>
    </div>

    <div v-else-if="isEmpty" class="text-center py-12">
      <p class="text-gray-600">Your cart is empty</p>
      <router-link to="/" class="mt-4 inline-block btn btn-primary">
        Continue Shopping
      </router-link>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Order Form -->
      <div>
        <div class="card">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">Shipping Information</h2>
          
          <form @submit.prevent="handleCheckout">
            <div class="mb-4">
              <label for="address" class="block text-sm font-medium text-gray-700 mb-2">
                Shipping Address
              </label>
              <textarea
                id="address"
                v-model="shippingAddress"
                required
                rows="4"
                class="input"
                placeholder="Enter your full shipping address"
              ></textarea>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <div class="bg-gray-50 p-4 rounded-md">
                <p class="text-sm text-gray-600">
                  <svg class="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Payment processing is not implemented in this demo. Orders will be marked as pending.
                </p>
              </div>
            </div>

            <button
              type="submit"
              :disabled="processing || !shippingAddress.trim()"
              class="w-full btn btn-primary"
            >
              {{ processing ? 'Processing...' : 'Place Order' }}
            </button>
          </form>
        </div>
      </div>

      <!-- Order Summary -->
      <div>
        <div class="card">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
          
          <div class="space-y-3 mb-4">
            <div v-for="item in cartItems" :key="item.id" class="flex justify-between text-sm">
              <div class="flex-1">
                <p class="font-medium text-gray-800">{{ item.product.title }}</p>
                <p class="text-gray-600">Qty: {{ item.quantity }} × ${{ parseFloat(item.product.price).toFixed(2) }}</p>
              </div>
              <p class="font-medium text-gray-800">
                ${{ (item.quantity * parseFloat(item.product.price)).toFixed(2) }}
              </p>
            </div>
          </div>

          <div class="border-t pt-4">
            <div class="flex justify-between items-center mb-2">
              <span class="text-gray-600">Subtotal:</span>
              <span class="text-gray-800">${{ cartTotal.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between items-center mb-2">
              <span class="text-gray-600">Shipping:</span>
              <span class="text-gray-800">Free</span>
            </div>
            <div class="flex justify-between items-center text-lg font-semibold">
              <span>Total:</span>
              <span class="text-2xl">${{ cartTotal.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <div class="mt-4 text-sm text-gray-600">
          <p class="mb-2">
            <svg class="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Secure checkout
          </p>
          <p>
            <svg class="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            Fast processing
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '../stores/cart';
import { useOrderStore } from '../stores/order';

const router = useRouter();
const cartStore = useCartStore();
const orderStore = useOrderStore();

const shippingAddress = ref('');
const processing = ref(false);

const cartItems = computed(() => cartStore.cartItems);
const cartTotal = computed(() => cartStore.cartTotal);
const loading = computed(() => cartStore.isLoading);
const isEmpty = computed(() => cartStore.isEmpty);

const handleCheckout = async () => {
  if (!shippingAddress.value.trim()) return;

  processing.value = true;
  try {
    const order = await orderStore.createOrder(shippingAddress.value);
    if (order) {
      router.push(`/orders/${order.id}`);
    }
  } catch (error) {
    console.error('Checkout failed:', error);
  } finally {
    processing.value = false;
  }
};

onMounted(() => {
  cartStore.fetchCart();
});
</script>