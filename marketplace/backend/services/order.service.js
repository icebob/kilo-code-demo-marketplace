"use strict";

const DbMixin = require("../mixins/db.mixin");
const AuthMixin = require("../mixins/auth.mixin");
const { MoleculerError } = require("moleculer").Errors;

module.exports = {
    name: "orders",
    mixins: [DbMixin("orders"), AuthMixin],

    settings: {
        // Field definitions for @moleculer/database
        fields: {
            id: {
                type: "number",
                primaryKey: true,
                columnName: "id",
                generated: "increment"
            },
            buyer_id: {
                type: "number",
                required: true,
                columnName: "buyer_id",
                columnType: "integer",
                populate: {
                    action: "users.get",
                    params: {
                        fields: ["id", "name", "email"]
                    }
                }
            },
            total_amount: {
                type: "number",
                required: true,
                columnName: "total_amount",
                columnType: "decimal"
            },
            status: {
                type: "string",
                enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
                default: "pending",
                columnName: "status",
                columnType: "string"
            },
            shipping_address: {
                type: "string",
                required: true,
                columnName: "shipping_address"
            },
            created_at: {
                type: "date",
                columnName: "created_at",
                readonly: true,
                onCreate: () => new Date()
            },
            updated_at: {
                type: "date",
                columnName: "updated_at",
                readonly: true,
                onUpdate: () => new Date()
            }
        }
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

                // Get cart items
                const cartItems = await ctx.call("cart.list");
                
                if (!cartItems.items || cartItems.items.length === 0) {
                    throw new MoleculerError("Cart is empty", 400, "EMPTY_CART");
                }

                // Validate product availability and calculate total
                let totalAmount = 0;
                const orderItems = [];

                for (const cartItem of cartItems.items) {
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
                }

                // Create order
                const order = await this.adapter.insert({
                    buyer_id: user.id,
                    total_amount: totalAmount.toFixed(2),
                    status: "pending",
                    shipping_address,
                    created_at: new Date(),
                    updated_at: new Date()
                });

                // Create order items (we'll need a separate service for this)
                const createdItems = [];
                for (const item of orderItems) {
                    const orderItem = await ctx.call("orderItems.create", {
                        order_id: order.id,
                        ...item
                    });
                    createdItems.push(orderItem);
                }

                // Update product quantities
                for (const cartItem of cartItems.items) {
                    const newQuantity = cartItem.product.quantity - cartItem.quantity;
                    await ctx.call("products.update", {
                        id: cartItem.product_id,
                        quantity: newQuantity,
                        status: newQuantity === 0 ? "sold_out" : cartItem.product.status
                    });
                }

                // Clear cart
                await ctx.call("cart.clear");

                // Return order with items
                order.items = createdItems;
                return order;
            }
        },

        /**
         * Get user's orders
         */
        list: {
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

                const params = {
                    query: { buyer_id: user.id },
                    limit: pageSize,
                    offset: (page - 1) * pageSize,
                    sort: "-created_at"
                };

                const [rows, total] = await Promise.all([
                    this.adapter.find(params),
                    this.adapter.count({ query: { buyer_id: user.id } })
                ]);

                // Get order items for each order
                const ordersWithItems = await Promise.all(rows.map(async (order) => {
                    const items = await ctx.call("orderItems.find", {
                        query: { order_id: order.id }
                    });
                    
                    // Get product details for each item
                    const itemsWithProducts = await Promise.all(items.map(async (item) => {
                        const product = await ctx.call("products.get", { id: item.product_id });
                        return { ...item, product };
                    }));
                    
                    return { ...order, items: itemsWithProducts };
                }));

                return {
                    rows: ordersWithItems,
                    total,
                    page,
                    pageSize,
                    totalPages: Math.ceil(total / pageSize)
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

                const order = await this.adapter.findOne({
                    query: {
                        id: ctx.params.id,
                        buyer_id: user.id
                    }
                });

                if (!order) {
                    throw new MoleculerError("Order not found", 404, "ORDER_NOT_FOUND");
                }

                // Get order items
                const items = await ctx.call("orderItems.find", {
                    query: { order_id: order.id }
                });

                // Get product and seller details for each item
                const itemsWithDetails = await Promise.all(items.map(async (item) => {
                    const [product, seller] = await Promise.all([
                        ctx.call("products.get", { id: item.product_id }),
                        ctx.call("users.get", { id: item.seller_id })
                    ]);
                    return { ...item, product, seller };
                }));

                return { ...order, items: itemsWithDetails };
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

                // Get order items where user is the seller
                const orderItems = await ctx.call("orderItems.list", {
                    page,
                    pageSize,
                    seller_id: user.id
                });

                // Get order and product details for each item
                const itemsWithDetails = await Promise.all(orderItems.rows.map(async (item) => {
                    const [order, product] = await Promise.all([
                        this.adapter.findById(item.order_id),
                        ctx.call("products.get", { id: item.product_id })
                    ]);
                    
                    // Get buyer details
                    const buyer = await ctx.call("users.get", { id: order.buyer_id });
                    
                    return {
                        ...item,
                        order: { ...order, buyer },
                        product
                    };
                }));

                return {
                    rows: itemsWithDetails,
                    total: orderItems.total,
                    page: orderItems.page,
                    pageSize: orderItems.pageSize,
                    totalPages: orderItems.totalPages
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