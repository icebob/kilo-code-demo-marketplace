<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold text-gray-900 mb-6">
      {{ product ? 'Edit Product' : 'Add New Product' }}
    </h2>

    <form @submit.prevent="handleSubmit">
      <div class="mb-4">
        <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
          Product Title
        </label>
        <input
          id="title"
          v-model="form.title"
          type="text"
          required
          class="input"
          placeholder="Enter product title"
        />
      </div>

      <div class="mb-4">
        <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          id="description"
          v-model="form.description"
          required
          rows="4"
          class="input"
          placeholder="Enter product description"
        ></textarea>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label for="price" class="block text-sm font-medium text-gray-700 mb-2">
            Price ($)
          </label>
          <input
            id="price"
            v-model.number="form.price"
            type="number"
            step="0.01"
            min="0.01"
            required
            class="input"
            placeholder="0.00"
          />
        </div>

        <div>
          <label for="quantity" class="block text-sm font-medium text-gray-700 mb-2">
            Stock Quantity
          </label>
          <input
            id="quantity"
            v-model.number="form.quantity"
            type="number"
            min="0"
            required
            class="input"
            placeholder="0"
          />
        </div>
      </div>

      <div class="mb-4">
        <label for="image_url" class="block text-sm font-medium text-gray-700 mb-2">
          Image URL
        </label>
        <input
          id="image_url"
          v-model="form.image_url"
          type="url"
          class="input"
          placeholder="https://example.com/image.jpg"
        />
        <p class="mt-1 text-sm text-gray-500">
          Optional: Provide a URL to an image of your product
        </p>
      </div>

      <div v-if="product" class="mb-6">
        <label for="status" class="block text-sm font-medium text-gray-700 mb-2">
          Status
        </label>
        <select
          id="status"
          v-model="form.status"
          class="input"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="sold_out">Sold Out</option>
        </select>
      </div>

      <div class="flex justify-end space-x-3">
        <button
          type="button"
          @click="$emit('cancel')"
          class="btn btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="loading"
          class="btn btn-primary"
        >
          {{ loading ? 'Saving...' : (product ? 'Update Product' : 'Add Product') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { useProductStore } from '../../stores/product';

const props = defineProps({
  product: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['save', 'cancel']);

const productStore = useProductStore();

const loading = ref(false);
const form = reactive({
  title: '',
  description: '',
  price: '',
  quantity: 0,
  image_url: '',
  status: 'active',
});

// Watch for product changes and update form
watch(() => props.product, (newProduct) => {
  if (newProduct) {
    form.title = newProduct.title;
    form.description = newProduct.description;
    form.price = newProduct.price;
    form.quantity = newProduct.quantity;
    form.image_url = newProduct.image_url || '';
    form.status = newProduct.status;
  } else {
    // Reset form
    form.title = '';
    form.description = '';
    form.price = '';
    form.quantity = 0;
    form.image_url = '';
    form.status = 'active';
  }
}, { immediate: true });

const handleSubmit = async () => {
  loading.value = true;
  
  try {
    const productData = {
      title: form.title,
      description: form.description,
      price: parseFloat(form.price),
      quantity: parseInt(form.quantity),
      image_url: form.image_url || null,
    };

    if (props.product) {
      // Update existing product
      productData.status = form.status;
      await productStore.updateProduct(props.product.id, productData);
    } else {
      // Create new product
      await productStore.createProduct(productData);
    }

    emit('save');
  } catch (error) {
    console.error('Failed to save product:', error);
  } finally {
    loading.value = false;
  }
};
</script>