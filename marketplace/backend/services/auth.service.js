"use strict";

const { MoleculerError } = require("moleculer").Errors;
const AuthMixin = require("../mixins/auth.mixin");
const bcrypt = require("bcrypt");

module.exports = {
    name: "auth",
    mixins: [AuthMixin],

    settings: {
        // Service settings
    },

    actions: {
        /**
         * Register a new user
         */
        register: {
            params: {
                email: { type: "email" },
                password: { type: "string", min: 6 },
                name: { type: "string", min: 2 }
            },
            async handler(ctx) {
                const { email, password, name } = ctx.params;

                // Check if user already exists
                const existingUser = await ctx.call("users.find", {
                    query: { email },
                    limit: 1
                });
                
                if (existingUser && existingUser.length > 0) {
                    throw new MoleculerError("Email already registered", 409, "EMAIL_EXISTS");
                }

                // Hash password
                const hashedPassword = await bcrypt.hash(password, 10);

                // Create new user
                const user = await ctx.call("users.create", {
                    email,
                    password: hashedPassword,
                    name,
                    role: "user"
                });

                // Generate JWT token
                const token = this.generateJWT(user);

                // Remove password from response
                delete user.password;

                return {
                    user,
                    token
                };
            }
        },

        /**
         * Login user
         */
        login: {
            params: {
                email: { type: "email" },
                password: { type: "string" }
            },
            async handler(ctx) {
                const { email, password } = ctx.params;

                // Find user by email
                const users = await ctx.call("users.find", {
                    query: { email },
                    limit: 1
                });

                if (!users || users.length === 0) {
                    throw new MoleculerError("Invalid credentials", 401, "INVALID_CREDENTIALS");
                }

                const user = users[0];

                // Verify password
                const isValidPassword = await bcrypt.compare(password, user.password);
                if (!isValidPassword) {
                    throw new MoleculerError("Invalid credentials", 401, "INVALID_CREDENTIALS");
                }

                // Generate JWT token
                const token = this.generateJWT(user);

                // Remove password from response
                delete user.password;

                return {
                    user,
                    token
                };
            }
        },

        /**
         * Verify JWT token
         */
        verify: {
            params: {
                token: { type: "string" }
            },
            async handler(ctx) {
                const { token } = ctx.params;

                try {
                    const decoded = this.verifyJWT(token);
                    
                    // Get fresh user data
                    const user = await ctx.call("users.get", { id: decoded.id });
                    if (!user) {
                        throw new MoleculerError("User not found", 404, "USER_NOT_FOUND");
                    }

                    return {
                        valid: true,
                        user
                    };
                } catch (error) {
                    throw new MoleculerError("Invalid token", 401, "INVALID_TOKEN");
                }
            }
        },

        /**
         * Get current user from token
         */
        me: {
            async handler(ctx) {
                const user = this.getUserFromToken(ctx);
                if (!user) {
                    throw new MoleculerError("Unauthorized", 401, "UNAUTHORIZED");
                }

                // Get fresh user data
                const currentUser = await ctx.call("users.get", { id: user.id });
                if (!currentUser) {
                    throw new MoleculerError("User not found", 404, "USER_NOT_FOUND");
                }

                return currentUser;
            }
        }
    },

    methods: {
        // Methods inherited from AuthMixin
    },

    events: {
        // Event handlers
    },

    created() {
        // Service created lifecycle event handler
    },

    async started() {
        // Service started lifecycle event handler
    },

    async stopped() {
        // Service stopped lifecycle event handler
    }
};