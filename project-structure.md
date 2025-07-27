# Project Structure

```
marketplace/
├── backend/
│   ├── services/
│   │   ├── api.service.js          # API Gateway
│   │   ├── auth.service.js         # Authentication
│   │   ├── user.service.js         # User management
│   │   ├── product.service.js      # Product CRUD
│   │   ├── cart.service.js         # Shopping cart
│   │   └── order.service.js        # Order processing
│   ├── models/
│   │   ├── user.model.js
│   │   ├── product.model.js
│   │   ├── cart.model.js
│   │   └── order.model.js
│   ├── mixins/
│   │   ├── db.mixin.js            # Database mixin
│   │   └── auth.mixin.js          # Authentication mixin
│   ├── config/
│   │   └── database.js            # Database configuration
│   ├── moleculer.config.js        # Moleculer configuration
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── Navbar.vue
    │   │   │   └── Footer.vue
    │   │   ├── product/
    │   │   │   ├── ProductCard.vue
    │   │   │   ├── ProductList.vue
    │   │   │   └── ProductForm.vue
    │   │   ├── cart/
    │   │   │   ├── CartItem.vue
    │   │   │   └── CartSummary.vue
    │   │   └── common/
    │   │       ├── LoadingSpinner.vue
    │   │       └── ErrorMessage.vue
    │   ├── views/
    │   │   ├── Home.vue
    │   │   ├── Login.vue
    │   │   ├── Register.vue
    │   │   ├── ProductDetail.vue
    │   │   ├── SellerDashboard.vue
    │   │   ├── Cart.vue
    │   │   ├── Checkout.vue
    │   │   └── Orders.vue
    │   ├── stores/
    │   │   ├── auth.js              # Authentication store
    │   │   ├── product.js           # Product store
    │   │   ├── cart.js              # Cart store
    │   │   └── order.js             # Order store
    │   ├── services/
    │   │   └── api.js               # API service
    │   ├── router/
    │   │   └── index.js             # Vue Router config
    │   ├── assets/
    │   │   └── styles/
    │   │       └── main.css         # TailwindCSS imports
    │   ├── App.vue
    │   └── main.js
    ├── public/
    │   └── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── .gitignore
```

## Key Implementation Details

### Backend Services

Each MoleculerJS service will follow this pattern:

```javascript
module.exports = {
    name: "service-name",
    mixins: [DbMixin("model-name")],
    settings: {
        // Service-specific settings
    },
    actions: {
        // Service actions
    },
    methods: {
        // Private methods
    },
    events: {
        // Event handlers
    }
};
```

### Frontend State Management

Using Pinia stores for state management:

```javascript
export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        token: null,
        isAuthenticated: false
    }),
    actions: {
        async login(credentials) { /* ... */ },
        async register(userData) { /* ... */ },
        logout() { /* ... */ }
    }
});
```

### API Communication

Centralized API service with interceptors:

```javascript
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor for auth token
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
```

### Environment Variables

Backend (.env):
```
NODE_ENV=development
PORT=3000
JWT_SECRET=your-secret-key
DATABASE_URL=./marketplace.db
```

Frontend (.env):
```
VITE_API_URL=http://localhost:3000/api