<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <Navbar />
    <main class="container mx-auto px-4 py-8">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import Navbar from './components/layout/Navbar.vue';
</script>

<style>
/* Global styles can go here */
</style>
