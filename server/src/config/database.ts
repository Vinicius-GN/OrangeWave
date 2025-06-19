/**
 * @file database.ts
 * @brief Database connection utilities for MongoDB using Mongoose.
 *
 * This file provides functions to connect and disconnect from MongoDB using the connection string in environment variables.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

/**
 * @brief Connect to MongoDB using the connection string from environment variables.
 *
 * @returns Promise that resolves when the connection is established.
 */
export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("✅ MongoDB conectado");
  } catch (err) {
    console.error("❌ Erro ao conectar:", err);
    process.exit(1);
  }
}

/**
 * @brief Disconnect from MongoDB.
 *
 * @returns Promise that resolves when the connection is closed.
 */
export async function disconnectDB() {
  try {
    await mongoose.disconnect();
    console.log("✅ MongoDB desconectado");
  } catch (err) {
    console.error("❌ Erro ao desconectar:", err);
    process.exit(1);
  }
}
