<template>
  <div class="max-w-6xl mx-auto">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      <p class="mt-2 text-gray-600">Loading orders...</p>
    </div>

    <div v-else-if="orders.length === 0" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
      </svg>
      <p class="mt-2 text-gray-600">You haven't placed any orders yet</p>
      <router-link to="/" class="mt-4 inline-block btn btn-primary">
        Start Shopping
      </router-link>
    </div>

    <div v-else class="space-y-6">
      <div v-for="order in orders" :key="order.id" class="card">
        <div class="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
          <div>
            <h2 class="text-lg font-semibold text-gray-800">
              Order #{{ order.id }}
            </h2>
            <p class="text-sm text-gray-600">
              Placed on {{ formatDate(order.created_at) }}
            </p>
          </div>
          <div class="mt-2 md:mt-0 text-right">
            <p class="text-sm text-gray-600">Total</p>
            <p class="text-xl font-bold text-gray-900">
              ${{ parseFloat(order.total_amount).toFixed(2) }}
            </p>
            <span :class="[
              'inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full',
              getStatusClass(order.status)
            ]">
              {{ order.status }}
            </span>
          </div>
        </div>

        <div class="border-t pt-4">
          <h3 class="text-sm font-medium text-gray-700 mb-3">Items</h3>
          <div class="space-y-2">
            <div v-for="item in order.items" :key="item.id" class="flex items-center space-x-3">
              <img
                v-if="item.product.image_url"
                :src="item.product.image_url"
                :alt="item.product.title"
                class="w-12 h-12 object-cover rounded"
              />
              <div v-else class="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-800">{{ item.product.title }}</p>
                <p class="text-xs text-gray-600">
                  Qty: {{ item.quantity }} × ${{ parseFloat(item.price).toFixed(2) }}
                </p>
              </div>
              <p class="text-sm font-medium text-gray-800">
                ${{ (item.quantity * parseFloat(item.price)).toFixed(2) }}
              </p>
            </div>
          </div>
        </div>

        <div class="mt-4 pt-4 border-t">
          <router-link
            :to="`/orders/${order.id}`"
            class="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View Order Details →
          </router-link>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="mt-8 flex justify-center">
      <nav class="flex space-x-2">
        <button
          @click="changePage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        <button
          v-for="page in visiblePages"
          :key="page"
          @click="changePage(page)"
          :class="[
            'px-3 py-2 text-sm font-medium rounded-md',
            page === currentPage
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
          ]"
        >
          {{ page }}
        </button>
        
        <button
          @click="changePage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useOrderStore } from '../stores/order';

const orderStore = useOrderStore();

const currentPage = ref(1);

const orders = computed(() => orderStore.orderList);
const loading = computed(() => orderStore.isLoading);
const totalPages = computed(() => orderStore.pagination.totalPages);

const visiblePages = computed(() => {
  const pages = [];
  const start = Math.max(1, currentPage.value - 2);
  const end = Math.min(totalPages.value, currentPage.value + 2);
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  
  return pages;
});

const fetchOrders = async () => {
  await orderStore.fetchOrders({ page: currentPage.value });
};

const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  fetchOrders();
  window.scrollTo(0, 0);
};

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

onMounted(() => {
  fetchOrders();
});
</script>