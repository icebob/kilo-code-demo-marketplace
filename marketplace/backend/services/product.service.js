"use strict";

const DbMixin = require("../mixins/db.mixin");
const AuthMixin = require("../mixins/auth.mixin");
const { MoleculerError } = require("moleculer").Errors;

module.exports = {
    name: "products",
    mixins: [DbMixin("products"), AuthMixin],

    settings: {
        // Field definitions for @moleculer/database
        fields: {
            id: {
                type: "number",
                primaryKey: true,
                columnName: "id",
                generated: "increment"
            },
            seller_id: {
                type: "number",
                columnName: "seller_id",
                columnType: "integer",
                required: true,
                populate: {
                    action: "users.get",
                    params: {
                        fields: ["id", "name", "email"]
                    }
                }
            },
            title: {
                type: "string",
                min: 3,
                max: 200,
                required: true,
                columnName: "title"
            },
            description: {
                type: "string",
                min: 10,
                required: true,
                columnName: "description"
            },
            price: {
                type: "number",
                positive: true,
                required: true,
                columnName: "price",
                columnType: "decimal"
            },
            quantity: {
                type: "number",
                integer: true,
                min: 0,
                required: true,
                columnName: "quantity",
                columnType: "integer"
            },
            image_url: {
                type: "string",
                columnName: "image_url"
            },
            status: {
                type: "string",
                enum: ["active", "inactive", "sold_out"],
                default: "active",
                columnName: "status",
                columnType: "string"
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
        },

        // Default scopes
        scopes: {
            active: { status: "active" }
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

                const query = {};
                if (status) query.status = status;
                if (seller_id) query.seller_id = seller_id;
                
                // For search, we'll need to use raw query with Knex
                let searchQuery = null;
                if (search) {
                    searchQuery = {
                        $raw: {
                            condition: "(title LIKE ? OR description LIKE ?)",
                            bindings: [`%${search}%`, `%${search}%`]
                        }
                    };
                }

                const params = {
                    query: searchQuery ? { ...query, ...searchQuery } : query,
                    limit: pageSize,
                    offset: (page - 1) * pageSize,
                    sort: "-created_at",
                    populate: ["seller"]
                };

                const [rows, total] = await Promise.all([
                    this.adapter.find(params),
                    this.adapter.count({ query: searchQuery ? { ...query, ...searchQuery } : query })
                ]);

                // Manually populate seller data
                const populatedRows = await Promise.all(rows.map(async (product) => {
                    if (product.seller_id) {
                        const seller = await ctx.call("users.get", { id: product.seller_id });
                        return { ...product, seller };
                    }
                    return product;
                }));

                return {
                    rows: populatedRows,
                    total,
                    page,
                    pageSize,
                    totalPages: Math.ceil(total / pageSize)
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
                const product = await this.adapter.findById(ctx.params.id);

                if (!product) {
                    throw new MoleculerError("Product not found", 404, "PRODUCT_NOT_FOUND");
                }

                // Populate seller
                if (product.seller_id) {
                    const seller = await ctx.call("users.get", { id: product.seller_id });
                    product.seller = seller;
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

                const product = await this.adapter.insert({
                    ...ctx.params,
                    seller_id: user.id,
                    status: "active",
                    created_at: new Date(),
                    updated_at: new Date()
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

                // Check if product exists and belongs to user
                const product = await this.adapter.findOne({
                    query: {
                        id: ctx.params.id,
                        seller_id: user.id
                    }
                });

                if (!product) {
                    throw new MoleculerError("Product not found or unauthorized", 404, "PRODUCT_NOT_FOUND");
                }

                const updates = { ...ctx.params };
                delete updates.id;
                updates.updated_at = new Date();

                const updatedProduct = await this.adapter.updateById(ctx.params.id, updates);
                return updatedProduct;
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

                // Check if product exists and belongs to user
                const product = await this.adapter.findOne({
                    query: {
                        id: ctx.params.id,
                        seller_id: user.id
                    }
                });

                if (!product) {
                    throw new MoleculerError("Product not found or unauthorized", 404, "PRODUCT_NOT_FOUND");
                }

                await this.adapter.removeById(ctx.params.id);
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