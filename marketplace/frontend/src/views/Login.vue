<template>
  <div class="max-w-md mx-auto">
    <div class="card">
      <h1 class="text-2xl font-bold text-center mb-6">Login</h1>
      
      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            class="input"
            placeholder="Enter your email"
          />
        </div>

        <div class="mb-6">
          <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            class="input"
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full btn btn-primary"
        >
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>

      <p class="mt-4 text-center text-sm text-gray-600">
        Don't have an account?
        <router-link to="/register" class="text-blue-600 hover:text-blue-700">
          Register here
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const loading = ref(false);
const form = reactive({
  email: '',
  password: '',
});

const handleLogin = async () => {
  loading.value = true;
  
  const result = await authStore.login(form);
  
  if (result.success) {
    // Redirect to the page they were trying to access, or home
    const redirect = route.query.redirect || '/';
    router.push(redirect);
  }
  
  loading.value = false;
};
</script>