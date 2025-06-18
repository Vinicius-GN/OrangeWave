"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
exports.disconnectDB = disconnectDB;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Connect to MongoDB using the connection string from environment variables
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
// Disconnect from MongoDB
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
