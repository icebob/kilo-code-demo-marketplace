"use strict";

const DbMixin = require("../mixins/db.mixin");
const AuthMixin = require("../mixins/auth.mixin");
const { MoleculerError } = require("moleculer").Errors;

module.exports = {
    name: "users",
    mixins: [DbMixin("users"), AuthMixin],

    settings: {
        // Field definitions for @moleculer/database
        fields: {
            id: {
                type: "number",
                primaryKey: true,
                columnName: "id",
                generated: "increment"
            },
            email: {
                type: "string",
                required: true,
                columnName: "email",
                columnType: "string"
            },
            name: {
                type: "string",
                min: 2,
                required: true,
                columnName: "name"
            },
            password: {
                type: "string",
                min: 6,
                columnName: "password",
                hidden: true // Hide password in responses
            },
            role: {
                type: "string",
                columnName: "role",
                default: "user"
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
         * Find users
         */
        find: {
            params: {
                query: { type: "object", optional: true },
                limit: { type: "number", optional: true }
            },
            async handler(ctx) {
                const params = {
                    query: ctx.params.query || {},
                    limit: ctx.params.limit
                };
                return await this.adapter.find(params);
            }
        },

        /**
         * Create user
         */
        create: {
            params: {
                email: { type: "email" },
                password: { type: "string", min: 6 },
                name: { type: "string", min: 2 },
                role: { type: "string", optional: true, default: "user" }
            },
            async handler(ctx) {
                const user = await this.adapter.insert({
                    ...ctx.params,
                    created_at: new Date(),
                    updated_at: new Date()
                });
                return user;
            }
        },

        /**
         * Get user by ID (used for population)
         */
        get: {
            params: {
                id: { type: "number", integer: true, convert: true }
            },
            async handler(ctx) {
                const user = await this.adapter.findById(ctx.params.id);
                if (!user) {
                    throw new MoleculerError("User not found", 404, "USER_NOT_FOUND");
                }
                // Remove password from response
                delete user.password;
                return user;
            }
        },

        /**
         * Get user profile
         */
        profile: {
            async handler(ctx) {
                const user = this.getUserFromToken(ctx);
                if (!user) {
                    throw new MoleculerError("Unauthorized", 401, "UNAUTHORIZED");
                }

                const profile = await this.adapter.findById(user.id);

                if (!profile) {
                    throw new MoleculerError("User not found", 404, "USER_NOT_FOUND");
                }

                // Remove password from response
                delete profile.password;
                return profile;
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
                    const existingUser = await this.adapter.findOne({
                        query: {
                            email: updates.email,
                            id: { $ne: user.id }
                        }
                    });
                    if (existingUser) {
                        throw new MoleculerError("Email already taken", 409, "EMAIL_EXISTS");
                    }
                }

                updates.updated_at = new Date();
                const updatedUser = await this.adapter.updateById(user.id, updates);
                
                // Remove password from response
                delete updatedUser.password;
                return updatedUser;
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

                // Call products service to get user's products
                return await ctx.call("products.list", {
                    page,
                    pageSize,
                    seller_id: user.id
                });
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

                // Call orders service to get user's orders
                return await ctx.call("orders.list", {
                    page,
                    pageSize
                });
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