"use strict";

const DbMixin = require("../mixins/db.mixin");
const AuthMixin = require("../mixins/auth.mixin");
const { MoleculerError } = require("moleculer").Errors;
const { CartItem, Product } = require("../models");

module.exports = {
    name: "cart",
    mixins: [DbMixin("cart"), AuthMixin],

    model: CartItem,

    settings: {
        // Available fields in responses
        fields: [
            "id",
            "user_id",
            "product_id",
            "quantity",
            "created_at",
            "updated_at",
            "product"
        ]
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

                const cartItems = await CartItem.findAll({
                    where: { user_id: user.id },
                    include: [{
                        model: Product,
                        as: "product",
                        include: [{
                            model: require("../models").User,
                            as: "seller",
                            attributes: ["id", "name"]
                        }]
                    }],
                    order: [["created_at", "DESC"]]
                });

                // Calculate total
                const total = cartItems.reduce((sum, item) => {
                    return sum + (parseFloat(item.product.price) * item.quantity);
                }, 0);

                return {
                    items: cartItems,
                    total: total.toFixed(2),
                    count: cartItems.length
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
                const product = await Product.findByPk(product_id);
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
                let cartItem = await CartItem.findOne({
                    where: {
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
                    await cartItem.update({ quantity: newQuantity });
                } else {
                    // Create new cart item
                    cartItem = await CartItem.create({
                        user_id: user.id,
                        product_id,
                        quantity
                    });
                }

                // Return cart item with product details
                return await CartItem.findByPk(cartItem.id, {
                    include: [{
                        model: Product,
                        as: "product"
                    }]
                });
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

                const cartItem = await CartItem.findOne({
                    where: {
                        id,
                        user_id: user.id
                    },
                    include: [{
                        model: Product,
                        as: "product"
                    }]
                });

                if (!cartItem) {
                    throw new MoleculerError("Cart item not found", 404, "CART_ITEM_NOT_FOUND");
                }

                // Check product availability
                if (cartItem.product.quantity < quantity) {
                    throw new MoleculerError("Insufficient product quantity", 400, "INSUFFICIENT_QUANTITY");
                }

                await cartItem.update({ quantity });
                return cartItem;
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

                const cartItem = await CartItem.findOne({
                    where: {
                        id: ctx.params.id,
                        user_id: user.id
                    }
                });

                if (!cartItem) {
                    throw new MoleculerError("Cart item not found", 404, "CART_ITEM_NOT_FOUND");
                }

                await cartItem.destroy();
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

                await CartItem.destroy({
                    where: { user_id: user.id }
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