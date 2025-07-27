"use strict";

const sequelize = require("../config/database");
const UserModel = require("./user.model");
const ProductModel = require("./product.model");
const CartModel = require("./cart.model");
const OrderModel = require("./order.model");
const OrderItemModel = require("./order-item.model");

// Initialize models
const User = UserModel(sequelize);
const Product = ProductModel(sequelize);
const CartItem = CartModel(sequelize);
const Order = OrderModel(sequelize);
const OrderItem = OrderItemModel(sequelize);

// Create model associations
const models = {
    User,
    Product,
    CartItem,
    Order,
    OrderItem
};

// Run associations
Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
        models[modelName].associate(models);
    }
});

// Sync database
const syncDatabase = async (force = false) => {
    try {
        await sequelize.sync({ force });
        console.log("Database synchronized successfully");
    } catch (error) {
        console.error("Error synchronizing database:", error);
        throw error;
    }
};

module.exports = {
    sequelize,
    models,
    syncDatabase,
    ...models
};