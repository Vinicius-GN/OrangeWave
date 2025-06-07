"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const database_1 = require("./config/database");
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// prefixo “/api” para todas as rotas
app.use("/api", routes_1.default);
(async () => {
    await (0, database_1.connectDB)();
    app.listen(process.env.PORT, () => console.log(`🚀 Server em http://localhost:${process.env.PORT}`));
})();
