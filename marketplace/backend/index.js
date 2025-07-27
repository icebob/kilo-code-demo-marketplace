"use strict";

const { ServiceBroker } = require("moleculer");
const config = require("./moleculer.config");

// Load environment variables
require("dotenv").config();

let broker;

async function startBroker() {
    // Create broker
    broker = new ServiceBroker(config);

    // Load services
    broker.loadServices("./services", "*.service.js");

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
    if (broker) {
        await broker.stop();
    }
    process.exit(0);
});

process.on("SIGINT", async () => {
    console.log("SIGINT signal received: closing broker");
    if (broker) {
        await broker.stop();
    }
    process.exit(0);
});