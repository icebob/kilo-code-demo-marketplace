"use strict";

const DbMixin = require("../mixins/db.mixin");
const AuthMixin = require("../mixins/auth.mixin");
const { MoleculerError } = require("moleculer").Errors;
const { Order, OrderItem, CartItem, Product, User } = require("../models");
const sequelize = require("../config/database");

module.exports = {
    name: "orders",
    mixins: [DbMixin("orders"), AuthMixin],

    model: Order,

    settings: {
        // Available fields in responses
        fields: [
            "id",
            "buyer_id",
            "total_amount",
            "status",
            "shipping_address",
            "created_at",
            "updated_at",
            "items"
        ]
    },

    actions: {
        /**
         * Create order from cart
         */
        create: {
            params: {
                shipping_address: { type: "string", min: 10 }
            },
            async handler(ctx) {
                const user = this.getUserFromToken(ctx);
                if (!user) {
                    throw new MoleculerError("Unauthorized", 401, "UNAUTHORIZED");
                }

                const { shipping_address } = ctx.params;

                // Start transaction
                const transaction = await sequelize.transaction();

                try {
                    // Get cart items
                    const cartItems = await CartItem.findAll({
                        where: { user_id: user.id },
                        include: [{
                            model: Product,
                            as: "product"
                        }],
                        transaction
                    });

                    if (cartItems.length === 0) {
                        throw new MoleculerError("Cart is empty", 400, "EMPTY_CART");
                    }

                    // Validate product availability and calculate total
                    let totalAmount = 0;
                    const orderItems = [];

                    for (const cartItem of cartItems) {
                        const product = cartItem.product;

                        // Check if product is still available
                        if (product.status !== "active") {
                            throw new MoleculerError(`Product "${product.title}" is no longer available`, 400, "PRODUCT_NOT_AVAILABLE");
                        }

                        // Check quantity
                        if (product.quantity < cartItem.quantity) {
                            throw new MoleculerError(`Insufficient quantity for product "${product.title}"`, 400, "INSUFFICIENT_QUANTITY");
                        }

                        // Calculate item total
                        const itemTotal = parseFloat(product.price) * cartItem.quantity;
                        totalAmount += itemTotal;

                        // Prepare order item
                        orderItems.push({
                            product_id: product.id,
                            seller_id: product.seller_id,
                            quantity: cartItem.quantity,
                            price: product.price
                        });

                        // Update product quantity
                        await product.update({
                            quantity: product.quantity - cartItem.quantity,
                            status: product.quantity - cartItem.quantity === 0 ? "sold_out" : product.status
                        }, { transaction });
                    }

                    // Create order
                    const order = await Order.create({
                        buyer_id: user.id,
                        total_amount: totalAmount.toFixed(2),
                        status: "pending",
                        shipping_address
                    }, { transaction });

                    // Create order items
                    for (const item of orderItems) {
                        await OrderItem.create({
                            order_id: order.id,
                            ...item
                        }, { transaction });
                    }

                    // Clear cart
                    await CartItem.destroy({
                        where: { user_id: user.id },
                        transaction
                    });

                    // Commit transaction
                    await transaction.commit();

                    // Return order with items
                    return await Order.findByPk(order.id, {
                        include: [{
                            model: OrderItem,
                            as: "items",
                            include: [{
                                model: Product,
                                as: "product",
                                attributes: ["id", "title", "image_url"]
                            }]
                        }]
                    });

                } catch (error) {
                    // Rollback transaction
                    await transaction.rollback();
                    throw error;
                }
            }
        },

        /**
         * Get user's orders
         */
        list: {
            params: {
                page: { type: "number", integer: true, min: 1, optional: true, default: 1, convert: true },
                pageSize: { type: "number", integer: true, min: 1, max: 100, optional: true, default: 20, convert: true, convert: true }
            },
            async handler(ctx) {
                const user = this.getUserFromToken(ctx);
                if (!user) {
                    throw new MoleculerError("Unauthorized", 401, "UNAUTHORIZED");
                }

                const { page, pageSize } = ctx.params;
                const offset = (page - 1) * pageSize;

                const { count, rows } = await Order.findAndCountAll({
                    where: { buyer_id: user.id },
                    limit: pageSize,
                    offset,
                    order: [["created_at", "DESC"]],
                    include: [{
                        model: OrderItem,
                        as: "items",
                        include: [{
                            model: Product,
                            as: "product",
                            attributes: ["id", "title", "image_url"]
                        }]
                    }]
                });

                return {
                    rows,
                    total: count,
                    page,
                    pageSize,
                    totalPages: Math.ceil(count / pageSize)
                };
            }
        },

        /**
         * Get order by ID
         */
        get: {
            params: {
                id: { type: "number", integer: true, convert: true }
            },
            async handler(ctx) {
                const user = this.getUserFromToken(ctx);
                if (!user) {
                    throw new MoleculerError("Unauthorized", 401, "UNAUTHORIZED");
                }

                const order = await Order.findOne({
                    where: {
                        id: ctx.params.id,
                        buyer_id: user.id
                    },
                    include: [{
                        model: OrderItem,
                        as: "items",
                        include: [{
                            model: Product,
                            as: "product",
                            attributes: ["id", "title", "image_url", "description"]
                        }, {
                            model: User,
                            as: "seller",
                            attributes: ["id", "name", "email"]
                        }]
                    }]
                });

                if (!order) {
                    throw new MoleculerError("Order not found", 404, "ORDER_NOT_FOUND");
                }

                return order;
            }
        },

        /**
         * Get seller's orders
         */
        sellerOrders: {
            params: {
                page: { type: "number", integer: true, min: 1, optional: true, default: 1, convert: true },
                pageSize: { type: "number", integer: true, min: 1, max: 100, optional: true, default: 20, convert: true }
            },
            async handler(ctx) {
                const user = this.getUserFromToken(ctx);
                if (!user) {
                    throw new MoleculerError("Unauthorized", 401, "UNAUTHORIZED");
                }

                const { page, pageSize } = ctx.params;
                const offset = (page - 1) * pageSize;

                // Get order items where user is the seller
                const { count, rows } = await OrderItem.findAndCountAll({
                    where: { seller_id: user.id },
                    limit: pageSize,
                    offset,
                    order: [["created_at", "DESC"]],
                    include: [{
                        model: Order,
                        as: "order",
                        include: [{
                            model: User,
                            as: "buyer",
                            attributes: ["id", "name", "email"]
                        }]
                    }, {
                        model: Product,
                        as: "product",
                        attributes: ["id", "title", "image_url"]
                    }]
                });

                return {
                    rows,
                    total: count,
                    page,
                    pageSize,
                    totalPages: Math.ceil(count / pageSize)
                };
            }
        }
    },

    methods: {
        // Methods inherited from mixins
    },

    events: {
        // Event handlers
    }
};