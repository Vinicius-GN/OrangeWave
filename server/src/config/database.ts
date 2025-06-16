import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("✅ MongoDB conectado");
  } catch (err) {
    console.error("❌ Erro ao conectar:", err);
    process.exit(1);
  }
}

// Função para desconectar do banco de dados
export async function disconnectDB() {
  try {
    await mongoose.disconnect();
    console.log("✅ MongoDB desconectado");
  } catch (err) {
    console.error("❌ Erro ao desconectar:", err);
    process.exit(1);
  }
}
