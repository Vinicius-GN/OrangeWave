"use strict";
/**
 * @file server.ts
 * @brief Main entry point for the Express application.
 *
 * Configures and starts the Express server, connects to the database,
 * and applies middlewares and routes.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const database_1 = require("./config/database");
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
/**
 * @brief Enable CORS for all routes.
 */
app.use((0, cors_1.default)());
/**
 * @brief Parse incoming JSON requests.
 */
app.use(express_1.default.json());
/**
 * @brief Apply the "/api" prefix to all routes.
 */
app.use("/api", routes_1.default);
/**
 * @brief Immediately-invoked async function to connect to the database and start the server.
 */
(async () => {
    await (0, database_1.connectDB)();
    app.listen(process.env.PORT, () => console.log(`🚀 Server em http://localhost:${process.env.PORT}`));
})();
/**
 * @brief Export the app instance for testing purposes.
 */
exports.default = app;
