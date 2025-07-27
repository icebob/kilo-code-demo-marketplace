<template>
  <nav class="bg-white shadow-md">
    <div class="container mx-auto px-4">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <router-link to="/" class="text-xl font-bold text-gray-800">
          Marketplace
        </router-link>

        <!-- Navigation Links -->
        <div class="hidden md:flex items-center space-x-4">
          <router-link to="/" class="text-gray-600 hover:text-gray-800">
            Home
          </router-link>
          
          <template v-if="isLoggedIn">
            <router-link to="/seller/dashboard" class="text-gray-600 hover:text-gray-800">
              My Products
            </router-link>
            <router-link to="/orders" class="text-gray-600 hover:text-gray-800">
              My Orders
            </router-link>
          </template>
        </div>

        <!-- Right Side -->
        <div class="flex items-center space-x-4">
          <!-- Cart -->
          <router-link v-if="isLoggedIn" to="/cart" class="relative">
            <svg class="w-6 h-6 text-gray-600 hover:text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <span v-if="cartCount > 0" class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {{ cartCount }}
            </span>
          </router-link>

          <!-- User Menu -->
          <div v-if="isLoggedIn" class="relative" ref="userMenuRef">
            <button @click="toggleUserMenu" class="flex items-center text-gray-600 hover:text-gray-800">
              <svg class="w-6 h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              <span class="hidden md:inline">{{ currentUser?.name }}</span>
            </button>
            
            <!-- Dropdown Menu -->
            <div v-if="showUserMenu" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
              <div class="px-4 py-2 text-sm text-gray-700 border-b">
                {{ currentUser?.email }}
              </div>
              <router-link to="/seller/dashboard" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Seller Dashboard
              </router-link>
              <router-link to="/orders" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                My Orders
              </router-link>
              <hr class="my-1">
              <button @click="handleLogout" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Logout
              </button>
            </div>
          </div>

          <!-- Login/Register -->
          <template v-else>
            <router-link to="/login" class="text-gray-600 hover:text-gray-800">
              Login
            </router-link>
            <router-link to="/register" class="btn btn-primary">
              Register
            </router-link>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useCartStore } from '../../stores/cart';

const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore();

const showUserMenu = ref(false);
const userMenuRef = ref(null);

const isLoggedIn = computed(() => authStore.isLoggedIn);
const currentUser = computed(() => authStore.currentUser);
const cartCount = computed(() => cartStore.cartCount);

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
};

const handleLogout = () => {
  authStore.logout();
  showUserMenu.value = false;
  router.push('/');
};

// Close menu when clicking outside
const handleClickOutside = (event) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
    showUserMenu.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  
  // Fetch cart if logged in
  if (isLoggedIn.value) {
    cartStore.fetchCart();
  }
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>