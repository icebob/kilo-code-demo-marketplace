<template>
  <div class="card hover:shadow-lg transition-shadow duration-200 cursor-pointer" @click="$emit('click')">
    <div class="aspect-w-1 aspect-h-1 mb-4">
      <img
        v-if="product.image_url"
        :src="product.image_url"
        :alt="product.title"
        class="w-full h-48 object-cover rounded-md"
      />
      <div v-else class="w-full h-48 bg-gray-200 rounded-md flex items-center justify-center">
        <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
      </div>
    </div>

    <h3 class="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
      {{ product.title }}
    </h3>

    <p class="text-gray-600 text-sm mb-4 line-clamp-3">
      {{ product.description }}
    </p>

    <div class="flex justify-between items-center mb-4">
      <span class="text-2xl font-bold text-gray-900">
        ${{ parseFloat(product.price).toFixed(2) }}
      </span>
      <span class="text-sm text-gray-500">
        Stock: {{ product.quantity }}
      </span>
    </div>

    <div class="flex items-center text-sm text-gray-500">
      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
      </svg>
      {{ product.seller?.name || 'Unknown Seller' }}
    </div>

    <div class="mt-4 flex space-x-2">
      <button
        @click.stop="handleAddToCart"
        :disabled="product.quantity === 0 || addingToCart"
        class="flex-1 btn btn-primary text-sm"
      >
        {{ addingToCart ? 'Adding...' : 'Add to Cart' }}
      </button>
      <button
        @click.stop="$emit('click')"
        class="btn btn-secondary text-sm"
      >
        View Details
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '../../stores/cart';
import { useAuthStore } from '../../stores/auth';

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['click']);

const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();

const addingToCart = ref(false);

const handleAddToCart = async () => {
  if (!authStore.isLoggedIn) {
    router.push('/login');
    return;
  }

  addingToCart.value = true;
  try {
    await cartStore.addToCart(props.product.id);
  } catch (error) {
    // Error is handled by the store
  } finally {
    addingToCart.value = false;
  }
};
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>