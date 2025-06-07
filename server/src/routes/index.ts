import { Router } from "express";
import assetRoutes from "./assetRoutes";
import authRoutes from "./authRoutes";
import newsRoutes from "./newsRoutes";
import orderRoutes from "./orderRoutes";
import portfolioRoutes from "./portfolioRoutes";
import priceRoutes from "./priceRoutes";
import walletRoutes from "./walletRoutes";
import userRoutes from "./userRoutes";
import portfolioHistoryRoutes from "./portfolioHistoryRoutes"; // <— import

const router = Router();

router.use("/auth", authRoutes);
router.use("/assets", assetRoutes);
router.use("/news", newsRoutes);
router.use("/orders", orderRoutes);
router.use("/portfolio", portfolioRoutes);
router.use("/prices", priceRoutes);
router.use("/wallet", walletRoutes);
router.use("/users", userRoutes);
router.use("/portfolio-history", portfolioHistoryRoutes); // <— nova rota

export default router;
