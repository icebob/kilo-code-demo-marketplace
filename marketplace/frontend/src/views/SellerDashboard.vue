<template>
  <div class="max-w-6xl mx-auto">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
      <button @click="showProductForm = true" class="btn btn-primary">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        Add Product
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="card">
        <div class="flex items-center">
          <div class="p-3 bg-blue-100 rounded-lg">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm text-gray-600">Total Products</p>
            <p class="text-2xl font-bold text-gray-900">{{ products.length }}</p>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center">
          <div class="p-3 bg-green-100 rounded-lg">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm text-gray-600">Active Products</p>
            <p class="text-2xl font-bold text-gray-900">{{ activeProducts }}</p>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center">
          <div class="p-3 bg-yellow-100 rounded-lg">
            <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm text-gray-600">Total Sales</p>
            <p class="text-2xl font-bold text-gray-900">${{ totalSales.toFixed(2) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Products List -->
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      <p class="mt-2 text-gray-600">Loading products...</p>
    </div>

    <div v-else-if="products.length === 0" class="text-center py-12 card">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
      </svg>
      <p class="mt-2 text-gray-600">You haven't added any products yet</p>
      <button @click="showProductForm = true" class="mt-4 btn btn-primary">
        Add Your First Product
      </button>
    </div>

    <div v-else class="card">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">My Products</h2>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="product in products" :key="product.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <img
                    v-if="product.image_url"
                    :src="product.image_url"
                    :alt="product.title"
                    class="w-10 h-10 rounded object-cover"
                  />
                  <div v-else class="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                    <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ product.title }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${{ parseFloat(product.price).toFixed(2) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ product.quantity }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                  'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                  product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                ]">
                  {{ product.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  @click="editProduct(product)"
                  class="text-blue-600 hover:text-blue-900 mr-3"
                >
                  Edit
                </button>
                <button
                  @click="deleteProduct(product.id)"
                  class="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Product Form Modal -->
    <div v-if="showProductForm" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <ProductForm
          :product="editingProduct"
          @save="handleSaveProduct"
          @cancel="closeProductForm"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useProductStore } from '../stores/product';
import { userAPI } from '../services/api';
import ProductForm from '../components/product/ProductForm.vue';

const productStore = useProductStore();

const products = ref([]);
const loading = ref(true);
const showProductForm = ref(false);
const editingProduct = ref(null);

const activeProducts = computed(() => 
  products.value.filter(p => p.status === 'active').length
);

const totalSales = computed(() => {
  // This would normally come from order data
  return 0;
});

const fetchMyProducts = async () => {
  loading.value = true;
  try {
    const response = await userAPI.getMyProducts({ pageSize: 100 });
    products.value = response.data.rows;
  } catch (error) {
    console.error('Failed to fetch products:', error);
  } finally {
    loading.value = false;
  }
};

const editProduct = (product) => {
  editingProduct.value = product;
  showProductForm.value = true;
};

const deleteProduct = async (id) => {
  if (confirm('Are you sure you want to delete this product?')) {
    try {
      await productStore.deleteProduct(id);
      await fetchMyProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  }
};

const handleSaveProduct = async () => {
  showProductForm.value = false;
  editingProduct.value = null;
  await fetchMyProducts();
};

const closeProductForm = () => {
  showProductForm.value = false;
  editingProduct.value = null;
};

onMounted(() => {
  fetchMyProducts();
});
</script>