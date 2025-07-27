"use strict";

const DbMixin = require("../mixins/db.mixin");
const AuthMixin = require("../mixins/auth.mixin");
const { MoleculerError } = require("moleculer").Errors;

module.exports = {
    name: "cart",
    mixins: [DbMixin("cart_items"), AuthMixin],

    settings: {
        // Field definitions for @moleculer/database
        fields: {
            id: {
                type: "number",
                primaryKey: true,
                columnName: "id",
                generated: "increment"
            },
            user_id: {
                type: "number",
                required: true,
                columnName: "user_id",
                columnType: "integer"
            },
            product_id: {
                type: "number",
                required: true,
                columnName: "product_id",
                columnType: "integer",
                populate: {
                    action: "products.get",
                    params: {
                        fields: ["id", "title", "price", "image_url", "quantity", "status", "seller_id"]
                    }
                }
            },
            quantity: {
                type: "number",
                integer: true,
                min: 1,
                required: true,
                columnName: "quantity",
                columnType: "integer"
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
         * Get user's cart items
         */
        list: {
            async handler(ctx) {
                const user = this.getUserFromToken(ctx);
                if (!user) {
                    throw new MoleculerError("Unauthorized", 401, "UNAUTHORIZED");
                }

                const cartItems = await this.adapter.find({
                    query: { user_id: user.id },
                    sort: "-created_at"
                });

                // Get product details for each cart item
                const itemsWithProducts = await Promise.all(cartItems.map(async (item) => {
                    const product = await ctx.call("products.get", { id: item.product_id });
                    return { ...item, product };
                }));

                // Calculate total
                const total = itemsWithProducts.reduce((sum, item) => {
                    return sum + (parseFloat(item.product.price) * item.quantity);
                }, 0);

                return {
                    items: itemsWithProducts,
                    total: total.toFixed(2),
                    count: itemsWithProducts.length
                };
            }
        },

        /**
         * Add item to cart
         */
        add: {
            params: {
                product_id: { type: "number", integer: true, convert: true },
                quantity: { type: "number", integer: true, min: 1, optional: true, default: 1 }
            },
            async handler(ctx) {
                const user = this.getUserFromToken(ctx);
                if (!user) {
                    throw new MoleculerError("Unauthorized", 401, "UNAUTHORIZED");
                }

                const { product_id, quantity } = ctx.params;

                // Check if product exists and is available
                const product = await ctx.call("products.get", { id: product_id });
                if (!product) {
                    throw new MoleculerError("Product not found", 404, "PRODUCT_NOT_FOUND");
                }

                if (product.status !== "active") {
                    throw new MoleculerError("Product is not available", 400, "PRODUCT_NOT_AVAILABLE");
                }

                if (product.quantity < quantity) {
                    throw new MoleculerError("Insufficient product quantity", 400, "INSUFFICIENT_QUANTITY");
                }

                // Check if item already in cart
                let cartItem = await this.adapter.findOne({
                    query: {
                        user_id: user.id,
                        product_id
                    }
                });

                if (cartItem) {
                    // Update quantity
                    const newQuantity = cartItem.quantity + quantity;
                    if (product.quantity < newQuantity) {
                        throw new MoleculerError("Insufficient product quantity", 400, "INSUFFICIENT_QUANTITY");
                    }
                    cartItem = await this.adapter.updateById(cartItem.id, {
                        quantity: newQuantity,
                        updated_at: new Date()
                    });
                } else {
                    // Create new cart item
                    cartItem = await this.adapter.insert({
                        user_id: user.id,
                        product_id,
                        quantity,
                        created_at: new Date(),
                        updated_at: new Date()
                    });
                }

                // Return cart item with product details
                cartItem.product = product;
                return cartItem;
            }
        },

        /**
         * Update cart item quantity
         */
        update: {
            params: {
                id: { type: "number", integer: true, convert: true },
                quantity: { type: "number", integer: true, min: 1 }
            },
            async handler(ctx) {
                const user = this.getUserFromToken(ctx);
                if (!user) {
                    throw new MoleculerError("Unauthorized", 401, "UNAUTHORIZED");
                }

                const { id, quantity } = ctx.params;

                const cartItem = await this.adapter.findOne({
                    query: {
                        id,
                        user_id: user.id
                    }
                });

                if (!cartItem) {
                    throw new MoleculerError("Cart item not found", 404, "CART_ITEM_NOT_FOUND");
                }

                // Get product to check availability
                const product = await ctx.call("products.get", { id: cartItem.product_id });
                
                // Check product availability
                if (product.quantity < quantity) {
                    throw new MoleculerError("Insufficient product quantity", 400, "INSUFFICIENT_QUANTITY");
                }

                const updatedItem = await this.adapter.updateById(id, {
                    quantity,
                    updated_at: new Date()
                });
                
                updatedItem.product = product;
                return updatedItem;
            }
        },

        /**
         * Remove item from cart
         */
        remove: {
            params: {
                id: { type: "number", integer: true, convert: true }
            },
            async handler(ctx) {
                const user = this.getUserFromToken(ctx);
                if (!user) {
                    throw new MoleculerError("Unauthorized", 401, "UNAUTHORIZED");
                }

                const cartItem = await this.adapter.findOne({
                    query: {
                        id: ctx.params.id,
                        user_id: user.id
                    }
                });

                if (!cartItem) {
                    throw new MoleculerError("Cart item not found", 404, "CART_ITEM_NOT_FOUND");
                }

                await this.adapter.removeById(ctx.params.id);
                return { success: true };
            }
        },

        /**
         * Clear entire cart
         */
        clear: {
            async handler(ctx) {
                const user = this.getUserFromToken(ctx);
                if (!user) {
                    throw new MoleculerError("Unauthorized", 401, "UNAUTHORIZED");
                }

                await this.adapter.removeMany({
                    user_id: user.id
                });

                return { success: true };
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