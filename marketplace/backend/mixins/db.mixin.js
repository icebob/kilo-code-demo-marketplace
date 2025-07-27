"use strict";

const DbService = require("@moleculer/database").Service;
const { Adapters } = require("@moleculer/database");
const path = require("path");

module.exports = function(tableName) {
    const schema = {
        mixins: [
            DbService({
                adapter: new Adapters.Knex({
                    knex: {
                        client: "sqlite3",
                        connection: {
                            filename: path.join(__dirname, "..", process.env.DATABASE_URL || "./marketplace.db")
                        },
                        useNullAsDefault: true
                    },
                    tableName: tableName
                })
            })
        ],

        settings: {
            // Default settings for the service
            fields: {
                id: {
                    type: "number",
                    primaryKey: true,
                    columnName: "id",
                    columnType: "integer",
                    generated: "increment"
                },
                created_at: {
                    type: "date",
                    columnName: "created_at",
                    onCreate: () => new Date()
                },
                updated_at: {
                    type: "date",
                    columnName: "updated_at",
                    onUpdate: () => new Date()
                }
            }
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
                    const params = ctx.params || {};
                    const query = params.query || {};
                    return await this.adapter.count({ query });
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
            // The adapter should be available from the parent DbService
            // Let's try to access it after a small delay to ensure it's initialized
            await new Promise(resolve => setTimeout(resolve, 100));
            
            if (!this.adapter) {
                this.logger.error(`Adapter not initialized for table '${tableName}'`);
                // Try to get adapter from the service
                const adapter = this.getAdapter ? await this.getAdapter() : null;
                if (adapter) {
                    this.adapter = adapter;
                    this.logger.info(`Adapter retrieved for table '${tableName}'`);
                } else {
                    this.logger.error(`Failed to get adapter for table '${tableName}'`);
                    return;
                }
            }

            // Create table if not exists
            if (this.adapter && this.adapter.createTable) {
                try {
                    await this.adapter.createTable();
                    this.logger.info(`Table '${tableName}' is ready.`);
                } catch (err) {
                    this.logger.warn(`Unable to create table '${tableName}'.`, err);
                }
            }

            // Check the count of items in the DB
            if (this.adapter) {
                try {
                    const count = await this.adapter.count();
                    this.logger.info(`Connected to database. Table '${tableName}' has ${count} items.`);
                } catch (err) {
                    this.logger.warn("Database connection is not established.", err);
                }
            }
        }
    };

    return schema;
};