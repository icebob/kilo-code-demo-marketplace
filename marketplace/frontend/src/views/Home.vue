<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-4">Welcome to Marketplace</h1>
      
      <!-- Search Bar -->
      <div class="max-w-2xl mx-auto mb-8">
        <div class="relative">
          <input
            v-model="searchQuery"
            @input="handleSearch"
            type="text"
            placeholder="Search products..."
            class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg class="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      <p class="mt-2 text-gray-600">Loading products...</p>
    </div>

    <!-- Products Grid -->
    <div v-else-if="products.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
        @click="goToProduct(product.id)"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
      </svg>
      <p class="mt-2 text-gray-600">No products found</p>
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
import { useRouter } from 'vue-router';
import { useProductStore } from '../stores/product';
import ProductCard from '../components/product/ProductCard.vue';

const router = useRouter();
const productStore = useProductStore();

const searchQuery = ref('');
const currentPage = ref(1);
const searchTimeout = ref(null);

const products = computed(() => productStore.productList);
const loading = computed(() => productStore.isLoading);
const totalPages = computed(() => productStore.pagination.totalPages);

const visiblePages = computed(() => {
  const pages = [];
  const start = Math.max(1, currentPage.value - 2);
  const end = Math.min(totalPages.value, currentPage.value + 2);
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  
  return pages;
});

const fetchProducts = async () => {
  await productStore.fetchProducts({
    page: currentPage.value,
    search: searchQuery.value,
    status: 'active',
  });
};

const handleSearch = () => {
  clearTimeout(searchTimeout.value);
  searchTimeout.value = setTimeout(() => {
    currentPage.value = 1;
    fetchProducts();
  }, 300);
};

const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  fetchProducts();
  window.scrollTo(0, 0);
};

const goToProduct = (id) => {
  router.push(`/products/${id}`);
};

onMounted(() => {
  fetchProducts();
});
</script>