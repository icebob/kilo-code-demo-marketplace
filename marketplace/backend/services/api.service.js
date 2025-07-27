"use strict";

const ApiGateway = require("moleculer-web");
const { MoleculerError } = require("moleculer").Errors;
const jwt = require("jsonwebtoken");

module.exports = {
    name: "api",
    mixins: [ApiGateway],

    settings: {
        port: process.env.PORT || 3000,

        routes: [
            {
                path: "/api",

                whitelist: [
                    // Auth
                    "auth.register",
                    "auth.login",
                    "auth.verify",
                    "auth.me",

                    // Users
                    "users.profile",
                    "users.updateProfile",
                    "users.myProducts",
                    "users.myOrders",

                    // Products
                    "products.list",
                    "products.get",
                    "products.create",
                    "products.update",
                    "products.remove",

                    // Cart
                    "cart.list",
                    "cart.add",
                    "cart.update",
                    "cart.remove",
                    "cart.clear",

                    // Orders
                    "orders.create",
                    "orders.list",
                    "orders.get",
                    "orders.sellerOrders"
                ],

                // Enable/disable parameter merging method. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Disable-merging
                mergeParams: true,

                // Enable authentication. Implement the logic into `authenticate` method. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Authentication
                authentication: false,

                // Enable authorization. Implement the logic into `authorize` method. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Authorization
                authorization: false,

                // The auto-alias feature allows you to declare your route alias directly in your services.
                autoAliases: true,

                aliases: {
                    // Auth routes
                    "POST /auth/register": "auth.register",
                    "POST /auth/login": "auth.login",
                    "GET /auth/verify": "auth.verify",
                    "GET /auth/me": "auth.me",

                    // User routes
                    "GET /users/profile": "users.profile",
                    "PUT /users/profile": "users.updateProfile",
                    "GET /users/products": "users.myProducts",
                    "GET /users/orders": "users.myOrders",

                    // Product routes
                    "GET /products": "products.list",
                    "GET /products/:id": "products.get",
                    "POST /products": "products.create",
                    "PUT /products/:id": "products.update",
                    "DELETE /products/:id": "products.remove",

                    // Cart routes
                    "GET /cart": "cart.list",
                    "POST /cart": "cart.add",
                    "PUT /cart/:id": "cart.update",
                    "DELETE /cart/:id": "cart.remove",
                    "DELETE /cart": "cart.clear",

                    // Order routes
                    "POST /orders": "orders.create",
                    "GET /orders": "orders.list",
                    "GET /orders/:id": "orders.get",
                    "GET /orders/seller": "orders.sellerOrders"
                },

                // Disable to call not-mapped actions
                mappingPolicy: "restrict",

                // Set CORS headers
                cors: {
                    // Configures the Access-Control-Allow-Origin CORS header.
                    origin: "*",
                    // Configures the Access-Control-Allow-Methods CORS header.
                    methods: ["GET", "OPTIONS", "POST", "PUT", "DELETE"],
                    // Configures the Access-Control-Allow-Headers CORS header.
                    allowedHeaders: ["Content-Type", "Authorization"],
                    // Configures the Access-Control-Expose-Headers CORS header.
                    exposedHeaders: [],
                    // Configures the Access-Control-Allow-Credentials CORS header.
                    credentials: false,
                    // Configures the Access-Control-Max-Age CORS header.
                    maxAge: 3600
                },

                // Parse body content types
                bodyParsers: {
                    json: {
                        strict: false,
                        limit: "1MB"
                    },
                    urlencoded: {
                        extended: true,
                        limit: "1MB"
                    }
                },

                onBeforeCall(ctx, route, req, res) {
                    // Set request headers to context meta
                    ctx.meta.userAgent = req.headers["user-agent"];
                    ctx.meta.authorization = req.headers["authorization"];
                },

                onError(req, res, err) {
                    // Return with the error as JSON object
                    res.setHeader("Content-Type", "application/json; charset=utf-8");
                    res.writeHead(err.code || 500);

                    if (err.code === 422) {
                        let o = {};
                        err.data.forEach(e => {
                            let field = e.field.split(".").pop();
                            o[field] = e.message;
                        });

                        res.end(JSON.stringify({ errors: o }));
                    } else {
                        const errObj = {
                            name: err.name,
                            message: err.message,
                            code: err.code,
                            type: err.type
                        };
                        if (err.data) errObj.data = err.data;
                        res.end(JSON.stringify(errObj));
                    }
                }
            }
        ],

        // Serve assets from "public" folder
        assets: {
            folder: "public"
        }
    },

    methods: {
        /**
         * Authenticate the request
         */
        authenticate(ctx, route, req) {
            const auth = req.headers["authorization"];
            if (auth && auth.startsWith("Bearer ")) {
                const token = auth.slice(7);
                try {
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    ctx.meta.user = decoded;
                    return decoded;
                } catch (err) {
                    return null;
                }
            }
            return null;
        },

        /**
         * Authorize the request
         */
        authorize(ctx, route, req) {
            // Get the authenticated user.
            const user = ctx.meta.user;

            // It check the `auth` property in action schema.
            if (req.$action.auth === "required" && !user) {
                throw new MoleculerError("Unauthorized", 401, "UNAUTHORIZED");
            }
        }
    }
};