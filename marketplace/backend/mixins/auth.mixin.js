"use strict";

const jwt = require("jsonwebtoken");

module.exports = {
    methods: {
        /**
         * Generate a JWT token
         */
        generateJWT(user) {
            const payload = {
                id: user.id,
                email: user.email,
                name: user.name
            };
            return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
        },

        /**
         * Verify a JWT token
         */
        verifyJWT(token) {
            return jwt.verify(token, process.env.JWT_SECRET);
        },

        /**
         * Get user from JWT token in context meta
         */
        getUserFromToken(ctx) {
            if (ctx.meta.user) {
                return ctx.meta.user;
            }
            return null;
        },

        /**
         * Check if user is authenticated
         */
        isAuthenticated(ctx) {
            return !!ctx.meta.user;
        }
    },

    hooks: {
        before: {
            "*": function(ctx) {
                // Skip auth for certain actions
                const skipAuth = ["auth.login", "auth.register", "auth.verify"];
                if (skipAuth.includes(ctx.action.name)) {
                    return;
                }

                // Extract token from Authorization header
                const auth = ctx.meta.authorization || ctx.meta.Authorization;
                if (auth && auth.startsWith("Bearer ")) {
                    const token = auth.slice(7);
                    try {
                        const decoded = this.verifyJWT(token);
                        ctx.meta.user = decoded;
                    } catch (err) {
                        // Invalid token, but don't throw error here
                        // Let individual actions decide if auth is required
                    }
                }
            }
        }
    }
};