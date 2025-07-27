# Minimal Marketplace Application

A minimal marketplace application built with MoleculerJS (backend), SQLite (database), Vue.js 3, and TailwindCSS (frontend).

## Features

- User registration and authentication (JWT-based)
- Users can act as both buyers and sellers
- Product management (CRUD operations for sellers)
- Shopping cart functionality
- Basic checkout process
- Order history
- Responsive design with TailwindCSS

## Tech Stack

### Backend
- **MoleculerJS** - Microservices framework
- **SQLite** - Database
- **Sequelize** - ORM
- **JWT** - Authentication
- **Express** - API Gateway

### Frontend
- **Vue.js 3** - Frontend framework
- **Vite** - Build tool
- **Vue Router** - Routing
- **Pinia** - State management
- **TailwindCSS** - Styling
- **Axios** - HTTP client

## Project Structure

```
marketplace/
├── backend/          # MoleculerJS backend
│   ├── services/     # Microservices
│   ├── models/       # Database models
│   ├── mixins/       # Reusable mixins
│   └── config/       # Configuration files
└── frontend/         # Vue.js frontend
    ├── src/
    │   ├── components/   # Vue components
    │   ├── views/        # Page components
    │   ├── stores/       # Pinia stores
    │   ├── services/     # API services
    │   └── router/       # Vue Router config
    └── public/           # Static assets
```

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd marketplace/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (already created with default values)

4. Start the backend server:
```bash
npm start
```

The backend will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd marketplace/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (already created with default values)

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Usage

1. **Register an account**: Navigate to the registration page and create a new account.

2. **Login**: Use your credentials to log in.

3. **Browse products**: View all available products on the home page.

4. **Add products (as seller)**: Go to "My Products" in the navigation menu to add new products.

5. **Add to cart**: Browse products and add them to your shopping cart.

6. **Checkout**: Review your cart and proceed to checkout with a shipping address.

7. **View orders**: Check your order history in "My Orders".

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify JWT token
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (auth required)
- `PUT /api/products/:id` - Update product (auth required)
- `DELETE /api/products/:id` - Delete product (auth required)

### Cart
- `GET /api/cart` - Get cart items
- `POST /api/cart` - Add to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove from cart
- `DELETE /api/cart` - Clear cart

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details

## Development

### Backend Development
```bash
cd marketplace/backend
npm run dev  # Runs with nodemon for auto-reload
```

### Frontend Development
```bash
cd marketplace/frontend
npm run dev  # Runs Vite dev server with HMR
```

## Notes

- The database file (`marketplace.db`) will be created automatically in the backend directory when you first run the application.
- Default JWT secret is set in `.env` - change this in production!
- Payment processing is not implemented - orders are marked as "pending" by default.
- Image uploads are not implemented - products use image URLs instead.

## License

MIT