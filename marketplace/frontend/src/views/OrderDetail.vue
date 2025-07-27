<template>
  <div class="max-w-4xl mx-auto">
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      <p class="mt-2 text-gray-600">Loading order details...</p>
    </div>

    <div v-else-if="order">
      <div class="mb-6">
        <router-link to="/orders" class="text-blue-600 hover:text-blue-700 text-sm">
          ← Back to Orders
        </router-link>
      </div>

      <div class="card mb-6">
        <div class="flex flex-col md:flex-row md:justify-between md:items-start mb-6">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Order #{{ order.id }}</h1>
            <p class="text-gray-600 mt-1">
              Placed on {{ formatDate(order.created_at) }}
            </p>
          </div>
          <div class="mt-4 md:mt-0">
            <span :class="[
              'inline-block px-3 py-1 text-sm font-medium rounded-full',
              getStatusClass(order.status)
            ]">
              {{ order.status }}
            </span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 class="text-lg font-semibold text-gray-800 mb-3">Shipping Address</h2>
            <p class="text-gray-600 whitespace-pre-wrap">{{ order.shipping_address }}</p>
          </div>
          <div>
            <h2 class="text-lg font-semibold text-gray-800 mb-3">Order Summary</h2>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-600">Subtotal:</span>
                <span class="text-gray-800">${{ parseFloat(order.total_amount).toFixed(2) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Shipping:</span>
                <span class="text-gray-800">Free</span>
              </div>
              <div class="flex justify-between font-semibold text-lg pt-2 border-t">
                <span>Total:</span>
                <span>${{ parseFloat(order.total_amount).toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Order Items</h2>
        
        <div class="space-y-4">
          <div v-for="item in order.items" :key="item.id" class="flex items-start space-x-4 pb-4 border-b last:border-0">
            <img
              v-if="item.product.image_url"
              :src="item.product.image_url"
              :alt="item.product.title"
              class="w-20 h-20 object-cover rounded"
            />
            <div v-else class="w-20 h-20 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            
            <div class="flex-1">
              <h3 class="font-medium text-gray-800">{{ item.product.title }}</h3>
              <p class="text-sm text-gray-600 mt-1">
                Sold by: {{ item.seller?.name || 'Unknown' }}
              </p>
              <p class="text-sm text-gray-600 mt-1">
                Quantity: {{ item.quantity }} × ${{ parseFloat(item.price).toFixed(2) }}
              </p>
            </div>
            
            <div class="text-right">
              <p class="font-medium text-gray-800">
                ${{ (item.quantity * parseFloat(item.price)).toFixed(2) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-6 text-center">
        <router-link to="/" class="btn btn-primary">
          Continue Shopping
        </router-link>
      </div>
    </div>

    <div v-else class="text-center py-8">
      <p class="text-gray-600">Order not found</p>
      <router-link to="/orders" class="mt-4 inline-block text-blue-600 hover:text-blue-700">
        Back to Orders
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useOrderStore } from '../stores/order';

const route = useRoute();
const orderStore = useOrderStore();

const order = ref(null);
const loading = ref(true);

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusClass = (status) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

onMounted(async () => {
  try {
    const orderId = parseInt(route.params.id);
    order.value = await orderStore.fetchOrder(orderId);
  } catch (error) {
    console.error('Failed to fetch order:', error);
  } finally {
    loading.value = false;
  }
});
</script>