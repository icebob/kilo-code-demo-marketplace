import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/Home.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/Login.vue'),
    meta: { guest: true },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/Register.vue'),
    meta: { guest: true },
  },
  {
    path: '/products/:id',
    name: 'product-detail',
    component: () => import('../views/ProductDetail.vue'),
  },
  {
    path: '/seller/dashboard',
    name: 'seller-dashboard',
    component: () => import('../views/SellerDashboard.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/cart',
    name: 'cart',
    component: () => import('../views/Cart.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: () => import('../views/Checkout.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/orders',
    name: 'orders',
    component: () => import('../views/Orders.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/orders/:id',
    name: 'order-detail',
    component: () => import('../views/OrderDetail.vue'),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  // Check if route requires authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!authStore.isAuthenticated) {
      next({
        name: 'login',
        query: { redirect: to.fullPath },
      });
    } else {
      next();
    }
  }
  // Check if route is for guests only
  else if (to.matched.some(record => record.meta.guest)) {
    if (authStore.isAuthenticated) {
      next({ name: 'home' });
    } else {
      next();
    }
  }
  // No restrictions
  else {
    next();
  }
});

export default router;