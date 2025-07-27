"use strict";

const DbMixin = require("../mixins/db.mixin");
const AuthMixin = require("../mixins/auth.mixin");
const { MoleculerError } = require("moleculer").Errors;
const { User, Product, Order } = require("../models");

module.exports = {
    name: "users",
    mixins: [DbMixin("users"), AuthMixin],

    model: User,

    settings: {
        // Available fields in responses
        fields: [
            "id",
            "email",
            "name",
            "role",
            "createdAt",
            "updatedAt"
        ],

        // Validator for the `create` & `update` actions
        entityValidator: {
            email: { type: "email" },
            name: { type: "string", min: 2 },
            password: { type: "string", min: 6, optional: true }
        }
    },

    actions: {
        /**
         * Get user profile
         */
        profile: {
            async handler(ctx) {
                const user = this.getUserFromToken(ctx);
                if (!user) {
                    throw new MoleculerError("Unauthorized", 401, "UNAUTHORIZED");
                }

                const profile = await User.findByPk(user.id, {
                    attributes: { exclude: ["password"] }
                });

                if (!profile) {
                    throw new MoleculerError("User not found", 404, "USER_NOT_FOUND");
                }

                return profile.toJSON();
            }
        },

        /**
         * Update user profile
         */
        updateProfile: {
            params: {
                name: { type: "string", min: 2, optional: true },
                email: { type: "email", optional: true }
            },
            async handler(ctx) {
                const user = this.getUserFromToken(ctx);
                if (!user) {
                    throw new MoleculerError("Unauthorized", 401, "UNAUTHORIZED");
                }

                const updates = {};
                if (ctx.params.name) updates.name = ctx.params.name;
                if (ctx.params.email) updates.email = ctx.params.email;

                // Check if email is already taken
                if (updates.email) {
                    const existingUser = await User.findOne({
                        where: { 
                            email: updates.email,
                            id: { [require("sequelize").Op.ne]: user.id }
                        }
                    });
                    if (existingUser) {
                        throw new MoleculerError("Email already taken", 409, "EMAIL_EXISTS");
                    }
                }

                await User.update(updates, {
                    where: { id: user.id }
                });

                const updatedUser = await User.findByPk(user.id);
                return updatedUser.toJSON();
            }
        },

        /**
         * Get user's products (as seller)
         */
        myProducts: {
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

                const { count, rows } = await Product.findAndCountAll({
                    where: { seller_id: user.id },
                    limit: pageSize,
                    offset,
                    order: [["created_at", "DESC"]]
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
         * Get user's orders (as buyer)
         */
        myOrders: {
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

                const { count, rows } = await Order.findAndCountAll({
                    where: { buyer_id: user.id },
                    limit: pageSize,
                    offset,
                    order: [["created_at", "DESC"]],
                    include: [{
                        model: require("../models").OrderItem,
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
        }
    },

    methods: {
        // Methods inherited from mixins
    },

    events: {
        // Event handlers
    }
};