"use strict";
/**
 * @file database.ts
 * @brief Database connection utilities for MongoDB using Mongoose.
 *
 * This file provides functions to connect and disconnect from MongoDB using the connection string in environment variables.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
exports.disconnectDB = disconnectDB;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
/**
 * @brief Connect to MongoDB using the connection string from environment variables.
 *
 * @returns Promise that resolves when the connection is established.
 */
async function connectDB() {
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log("✅ MongoDB conectado");
    }
    catch (err) {
        console.error("❌ Erro ao conectar:", err);
        process.exit(1);
    }
}
/**
 * @brief Disconnect from MongoDB.
 *
 * @returns Promise that resolves when the connection is closed.
 */
async function disconnectDB() {
    try {
        await mongoose_1.default.disconnect();
        console.log("✅ MongoDB desconectado");
    }
    catch (err) {
        console.error("❌ Erro ao desconectar:", err);
        process.exit(1);
    }
}
