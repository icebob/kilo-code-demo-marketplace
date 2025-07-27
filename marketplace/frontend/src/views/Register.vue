<template>
  <div class="max-w-md mx-auto">
    <div class="card">
      <h1 class="text-2xl font-bold text-center mb-6">Register</h1>
      
      <form @submit.prevent="handleRegister">
        <div class="mb-4">
          <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
            Name
          </label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            required
            class="input"
            placeholder="Enter your name"
          />
        </div>

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

        <div class="mb-4">
          <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            minlength="6"
            class="input"
            placeholder="Enter your password (min 6 characters)"
          />
        </div>

        <div class="mb-6">
          <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            type="password"
            required
            class="input"
            placeholder="Confirm your password"
          />
          <p v-if="passwordError" class="mt-1 text-sm text-red-600">
            {{ passwordError }}
          </p>
        </div>

        <button
          type="submit"
          :disabled="loading || !!passwordError"
          class="w-full btn btn-primary"
        >
          {{ loading ? 'Creating account...' : 'Register' }}
        </button>
      </form>

      <p class="mt-4 text-center text-sm text-gray-600">
        Already have an account?
        <router-link to="/login" class="text-blue-600 hover:text-blue-700">
          Login here
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
});

const passwordError = computed(() => {
  if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
    return 'Passwords do not match';
  }
  return '';
});

const handleRegister = async () => {
  if (passwordError.value) return;
  
  loading.value = true;
  
  const result = await authStore.register({
    name: form.name,
    email: form.email,
    password: form.password,
  });
  
  if (result.success) {
    router.push('/');
  }
  
  loading.value = false;
};
</script>