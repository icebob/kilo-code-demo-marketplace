"use strict";

const DbMixin = require("../mixins/db.mixin");
const AuthMixin = require("../mixins/auth.mixin");
const { MoleculerError } = require("moleculer").Errors;
const { Product, User } = require("../models");
const { Op } = require("sequelize");

module.exports = {
    name: "products",
    mixins: [DbMixin("products"), AuthMixin],

    model: Product,

    settings: {
        // Available fields in responses
        fields: [
            "id",
            "seller_id",
            "title",
            "description",
            "price",
            "quantity",
            "image_url",
            "status",
            "created_at",
            "updated_at",
            "seller"
        ],

        // Populates
        populates: {
            "seller": {
                field: "seller_id",
                action: "users.get",
                params: {
                    fields: ["id", "name", "email"]
                }
            }
        },

        // Validator for the `create` & `update` actions
        entityValidator: {
            title: { type: "string", min: 3, max: 200 },
            description: { type: "string", min: 10 },
            price: { type: "number", positive: true },
            quantity: { type: "number", integer: true, min: 0 },
            image_url: { type: "url", optional: true },
            status: { type: "enum", values: ["active", "inactive", "sold_out"], optional: true }
        }
    },

    actions: {
        /**
         * List all products with pagination and filters
         */
        list: {
            params: {
                page: { type: "number", integer: true, min: 1, optional: true, default: 1 },
                pageSize: { type: "number", integer: true, min: 1, max: 100, optional: true, default: 20, convert: true },
                search: { type: "string", optional: true },
                seller_id: { type: "number", integer: true, optional: true },
                status: { type: "string", optional: true, default: "active" }
            },
            async handler(ctx) {
                const { page, pageSize, search, seller_id, status } = ctx.params;
                const offset = (page - 1) * pageSize;

                const where = {};
                if (status) where.status = status;
                if (seller_id) where.seller_id = seller_id;
                if (search) {
                    where[Op.or] = [
                        { title: { [Op.like]: `%${search}%` } },
                        { description: { [Op.like]: `%${search}%` } }
                    ];
                }

                const { count, rows } = await Product.findAndCountAll({
                    where,
                    limit: pageSize,
                    offset,
                    order: [["created_at", "DESC"]],
                    include: [{
                        model: User,
                        as: "seller",
                        attributes: ["id", "name", "email"]
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
         * Get a product by ID
         */
        get: {
            params: {
                id: { type: "number", integer: true, convert: true }
            },
            async handler(ctx) {
                const product = await Product.findByPk(ctx.params.id, {
                    include: [{
                        model: User,
                        as: "seller",
                        attributes: ["id", "name", "email"]
                    }]
                });

                if (!product) {
                    throw new MoleculerError("Product not found", 404, "PRODUCT_NOT_FOUND");
                }

                return product;
            }
        },

        /**
         * Create a new product
         */
        create: {
            params: {
                title: { type: "string", min: 3, max: 200 },
                description: { type: "string", min: 10 },
                price: { type: "number", positive: true },
                quantity: { type: "number", integer: true, min: 0 },
                image_url: { type: "url", optional: true }
            },
            async handler(ctx) {
                const user = this.getUserFromToken(ctx);
                if (!user) {
                    throw new MoleculerError("Unauthorized", 401, "UNAUTHORIZED");
                }

                const product = await Product.create({
                    ...ctx.params,
                    seller_id: user.id,
                    status: "active"
                });

                return product;
            }
        },

        /**
         * Update a product
         */
        update: {
            params: {
                id: { type: "number", integer: true, convert: true },
                title: { type: "string", min: 3, max: 200, optional: true },
                description: { type: "string", min: 10, optional: true },
                price: { type: "number", positive: true, optional: true },
                quantity: { type: "number", integer: true, min: 0, optional: true },
                image_url: { type: "url", optional: true },
                status: { type: "enum", values: ["active", "inactive", "sold_out"], optional: true }
            },
            async handler(ctx) {
                const user = this.getUserFromToken(ctx);
                if (!user) {
                    throw new MoleculerError("Unauthorized", 401, "UNAUTHORIZED");
                }

                const product = await Product.findOne({
                    where: {
                        id: ctx.params.id,
                        seller_id: user.id
                    }
                });

                if (!product) {
                    throw new MoleculerError("Product not found or unauthorized", 404, "PRODUCT_NOT_FOUND");
                }

                const updates = { ...ctx.params };
                delete updates.id;

                await product.update(updates);
                return product;
            }
        },

        /**
         * Delete a product
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

                const product = await Product.findOne({
                    where: {
                        id: ctx.params.id,
                        seller_id: user.id
                    }
                });

                if (!product) {
                    throw new MoleculerError("Product not found or unauthorized", 404, "PRODUCT_NOT_FOUND");
                }

                await product.destroy();
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