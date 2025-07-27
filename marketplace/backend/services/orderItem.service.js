"use strict";

const DbMixin = require("../mixins/db.mixin");
const AuthMixin = require("../mixins/auth.mixin");
const { MoleculerError } = require("moleculer").Errors;

module.exports = {
    name: "orderItems",
    mixins: [DbMixin("order_items"), AuthMixin],

    settings: {
        // Field definitions for @moleculer/database
        fields: {
            id: { 
                type: "number", 
                primaryKey: true, 
                columnName: "id",
                columnType: "integer",
                generated: "increment"
            },
            order_id: {
                type: "number",
                required: true,
                columnName: "order_id",
                columnType: "integer"
            },
            product_id: {
                type: "number",
                required: true,
                columnName: "product_id",
                columnType: "integer"
            },
            seller_id: {
                type: "number",
                required: true,
                columnName: "seller_id",
                columnType: "integer"
            },
            quantity: {
                type: "number",
                integer: true,
                min: 1,
                required: true,
                columnName: "quantity",
                columnType: "integer"
            },
            price: {
                type: "number",
                required: true,
                columnName: "price",
                columnType: "decimal"
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
         * Create order item
         */
        create: {
            params: {
                order_id: { type: "number", integer: true },
                product_id: { type: "number", integer: true },
                seller_id: { type: "number", integer: true },
                quantity: { type: "number", integer: true, min: 1 },
                price: { type: "number", positive: true }
            },
            async handler(ctx) {
                const orderItem = await this.adapter.insert({
                    ...ctx.params,
                    created_at: new Date(),
                    updated_at: new Date()
                });

                return orderItem;
            }
        },

        /**
         * Find order items
         */
        find: {
            params: {
                query: { type: "object", optional: true }
            },
            async handler(ctx) {
                return await this.adapter.find({
                    query: ctx.params.query || {}
                });
            }
        },

        /**
         * List order items with pagination
         */
        list: {
            params: {
                page: { type: "number", integer: true, min: 1, optional: true, default: 1 },
                pageSize: { type: "number", integer: true, min: 1, max: 100, optional: true, default: 20 },
                seller_id: { type: "number", integer: true, optional: true }
            },
            async handler(ctx) {
                const { page, pageSize, seller_id } = ctx.params;

                const query = {};
                if (seller_id) query.seller_id = seller_id;

                const params = {
                    query,
                    limit: pageSize,
                    offset: (page - 1) * pageSize,
                    sort: "-created_at"
                };

                const [rows, total] = await Promise.all([
                    this.adapter.find(params),
                    this.adapter.count({ query })
                ]);

                return {
                    rows,
                    total,
                    page,
                    pageSize,
                    totalPages: Math.ceil(total / pageSize)
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