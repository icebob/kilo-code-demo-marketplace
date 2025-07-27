<template>
  <div class="card flex flex-col md:flex-row gap-4">
    <!-- Product Image -->
    <div class="w-full md:w-24 h-24 flex-shrink-0">
      <img
        v-if="item.product.image_url"
        :src="item.product.image_url"
        :alt="item.product.title"
        class="w-full h-full object-cover rounded-md"
      />
      <div v-else class="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
      </div>
    </div>

    <!-- Product Info -->
    <div class="flex-1">
      <h3 class="text-lg font-semibold text-gray-800 mb-1">
        {{ item.product.title }}
      </h3>
      <p class="text-sm text-gray-600 mb-2">
        Seller: {{ item.product.seller?.name || 'Unknown' }}
      </p>
      <p class="text-lg font-bold text-gray-900">
        ${{ parseFloat(item.product.price).toFixed(2) }}
      </p>
    </div>

    <!-- Quantity and Actions -->
    <div class="flex items-center space-x-4">
      <div class="flex items-center space-x-2">
        <button
          @click="decreaseQuantity"
          :disabled="item.quantity <= 1 || updating"
          class="w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
          </svg>
        </button>
        
        <input
          v-model.number="quantity"
          @change="updateQuantity"
          type="number"
          min="1"
          :max="item.product.quantity"
          class="w-16 text-center px-2 py-1 border border-gray-300 rounded-md"
          :disabled="updating"
        />
        
        <button
          @click="increaseQuantity"
          :disabled="item.quantity >= item.product.quantity || updating"
          class="w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
        </button>
      </div>

      <div class="text-right">
        <p class="text-sm text-gray-600">Subtotal</p>
        <p class="text-lg font-bold text-gray-900">
          ${{ (parseFloat(item.product.price) * item.quantity).toFixed(2) }}
        </p>
      </div>

      <button
        @click="handleRemove"
        :disabled="removing"
        class="text-red-600 hover:text-red-700"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['update', 'remove']);

const quantity = ref(props.item.quantity);
const updating = ref(false);
const removing = ref(false);

watch(() => props.item.quantity, (newVal) => {
  quantity.value = newVal;
});

const updateQuantity = async () => {
  if (quantity.value === props.item.quantity) return;
  if (quantity.value < 1) {
    quantity.value = 1;
    return;
  }
  if (quantity.value > props.item.product.quantity) {
    quantity.value = props.item.product.quantity;
  }
  
  updating.value = true;
  await emit('update', props.item.id, quantity.value);
  updating.value = false;
};

const increaseQuantity = () => {
  if (quantity.value < props.item.product.quantity) {
    quantity.value++;
    updateQuantity();
  }
};

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
    updateQuantity();
  }
};

const handleRemove = async () => {
  if (confirm('Remove this item from cart?')) {
    removing.value = true;
    await emit('remove', props.item.id);
    removing.value = false;
  }
};
</script>