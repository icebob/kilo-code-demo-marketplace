import { createApp } from 'vue';
import { createPinia } from 'pinia';
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import './assets/main.css';
import App from './App.vue';
import router from './router';

const app = createApp(App);

// Create Pinia instance
const pinia = createPinia();

// Toast options
const toastOptions = {
  position: 'top-right',
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false,
};

// Use plugins
app.use(pinia);
app.use(router);
app.use(Toast, toastOptions);

// Mount app
app.mount('#app');
