"use strict";

const { ServiceBroker } = require("moleculer");
const config = require("./moleculer.config");
const { syncDatabase } = require("./models");

// Load environment variables
require("dotenv").config();

async function startBroker() {
    // Create broker
    const broker = new ServiceBroker(config);

    // Load services
    broker.loadServices("./services", "*.service.js");

    // Sync database before starting
    try {
        console.log("Synchronizing database...");
        await syncDatabase(false); // Set to true to drop and recreate tables
        console.log("Database synchronized successfully!");
    } catch (error) {
        console.error("Failed to sync database:", error);
        process.exit(1);
    }

    // Start broker
    try {
        await broker.start();
        console.log("Moleculer broker started successfully!");
        console.log(`API Gateway running at http://localhost:${process.env.PORT || 3000}`);
    } catch (error) {
        console.error("Failed to start broker:", error);
        process.exit(1);
    }
}

// Start the application
startBroker();

// Graceful shutdown
process.on("SIGTERM", async () => {
    console.log("SIGTERM signal received: closing broker");
    await broker.stop();
    process.exit(0);
});

process.on("SIGINT", async () => {
    console.log("SIGINT signal received: closing broker");
    await broker.stop();
    process.exit(0);
});