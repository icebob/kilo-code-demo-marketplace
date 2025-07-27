"use strict";

const { MoleculerError } = require("moleculer").Errors;
const { User } = require("../models");
const AuthMixin = require("../mixins/auth.mixin");

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
                const existingUser = await User.findOne({ where: { email } });
                if (existingUser) {
                    throw new MoleculerError("Email already registered", 409, "EMAIL_EXISTS");
                }

                // Create new user
                const user = await User.create({
                    email,
                    password,
                    name
                });

                // Generate JWT token
                const token = this.generateJWT(user);

                return {
                    user: user.toJSON(),
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
                const user = await User.findOne({ where: { email } });
                if (!user) {
                    throw new MoleculerError("Invalid credentials", 401, "INVALID_CREDENTIALS");
                }

                // Verify password
                const isValidPassword = await user.comparePassword(password);
                if (!isValidPassword) {
                    throw new MoleculerError("Invalid credentials", 401, "INVALID_CREDENTIALS");
                }

                // Generate JWT token
                const token = this.generateJWT(user);

                return {
                    user: user.toJSON(),
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
                    const user = await User.findByPk(decoded.id);
                    if (!user) {
                        throw new MoleculerError("User not found", 404, "USER_NOT_FOUND");
                    }

                    return {
                        valid: true,
                        user: user.toJSON()
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
                const currentUser = await User.findByPk(user.id);
                if (!currentUser) {
                    throw new MoleculerError("User not found", 404, "USER_NOT_FOUND");
                }

                return currentUser.toJSON();
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