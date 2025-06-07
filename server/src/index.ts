import express from "express";
import cors from "cors";
import { connectDB } from "./config/database";
import routes from "./routes";

const app = express();
app.use(cors());
app.use(express.json());

// prefixo “/api” para todas as rotas
app.use("/api", routes);

(async () => {
  await connectDB();
  app.listen(process.env.PORT, () =>
    console.log(`🚀 Server em http://localhost:${process.env.PORT}`)
  );
})();
