"use strict";

const DbService = require("moleculer-db");
const SqlAdapter = require("moleculer-db-adapter-sequelize");
const sequelize = require("../config/database");

module.exports = function(collection) {
    const schema = {
        mixins: [DbService],
        adapter: new SqlAdapter(sequelize),
        model: {
            name: collection,
            define: {},
            options: {}
        },

        actions: {
            /**
             * Get count of entities
             */
            count: {
                cache: {
                    keys: []
                },
                async handler(ctx) {
                    return await this.adapter.count(ctx.params);
                }
            }
        },

        methods: {
            /**
             * Clear the cache & call the parent entity changed method
             */
            async entityChanged(type, json, ctx) {
                await this.clearCache();
                const eventName = `${this.name}.entity.${type}`;
                this.broker.emit(eventName, { meta: ctx.meta, entity: json });
            }
        },

        async started() {
            // Check the count of items in the DB
            try {
                const count = await this.adapter.count();
                this.logger.info(`Connected to database. Collection '${collection}' has ${count} items.`);
            } catch (err) {
                this.logger.warn("Database connection is not established.", err);
            }
        }
    };

    return schema;
};