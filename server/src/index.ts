/**
 * @file server.ts
 * @brief Main entry point for the Express application.
 *
 * Configures and starts the Express server, connects to the database,
 * and applies middlewares and routes.
 */

import express from "express";
import cors from "cors";
import { connectDB } from "./config/database";
import routes from "./routes";

const app = express();

/**
 * @brief Enable CORS for all routes.
 */
app.use(cors());

/**
 * @brief Parse incoming JSON requests.
 */
app.use(express.json());

/**
 * @brief Apply the "/api" prefix to all routes.
 */
app.use("/api", routes);

/**
 * @brief Immediately-invoked async function to connect to the database and start the server.
 */
(async () => {
  await connectDB();
  app.listen(process.env.PORT, () =>
    console.log(`🚀 Server em http://localhost:${process.env.PORT}`)
  );
})();

/**
 * @brief Export the app instance for testing purposes.
 */
export default app;
