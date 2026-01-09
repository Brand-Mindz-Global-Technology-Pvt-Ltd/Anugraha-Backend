import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./Routes/authroutes.js";
import adminprofileRoutes from "./Routes/adminprofileroutes.js";
import categoryRoutes from "./Routes/categoryroutes.js";
import sliderRoutes from "./Routes/sliderroutes.js";
import bannerRoutes from "./Routes/bannerroutes.js";
import inventoryRoutes from "./Routes/inventoryroutes.js";
import customerRoutes from "./Routes/customerroutes.js"
import productRoutes from "./Routes/productroutes.js"

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("trust proxy", 1);
app.use(cors({ origin: true, credentials: true }));
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminprofileRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/slider", sliderRoutes);
app.use("/api/v1/banner", bannerRoutes);
app.use("/api/v1/inventory", inventoryRoutes);
app.use("/api/v1/customers", customerRoutes);
app.use("/api/v1/products", productRoutes);

app.get("/health", (_, res) => {
  res.json({ status: "OK" });
});

export default app;
