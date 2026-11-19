
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

// admin panel routes
import authRoutes from "./Routes/authroutes.js";
import adminprofileRoutes from "./Routes/adminprofileroutes.js";
import categoryRoutes from "./Routes/categoryroutes.js";
import sliderRoutes from "./Routes/sliderroutes.js";
import bannerRoutes from "./Routes/bannerroutes.js";
import blogRoutes from "./Routes/blogroutes.js";
import inventoryRoutes from "./Routes/inventoryroutes.js";
import productRoutes from "./Routes/productroutes.js";
import adminorderRoutes from "./Routes/adminorderroutes.js";
import supplierRoutes from "./Routes/supplierroutes.js";
import offlineOrderRoutes from "./Routes/offlineorderroutes.js";
import dashboardRoutes from "./Routes/dashboardroutes.js";

// customer routes
import wishlistRoutes from "./Routes/customer/wishlistroutes.js";
import cartRoutes from "./Routes/customer/cartroutes.js";
import addressRoutes from "./Routes/customer/addressroutes.js";
import orderRoutes from "./Routes/customer/orderroutes.js";
import settingRoutes from "./Routes/settingroutes.js";
import customerRoutes from "./Routes/customer/customerroutes.js";



const app = express();

// --- dirname setup (ESM) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("trust proxy", 1);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://anugrahafashions.com",
  "https://www.anugrahafashions.com",
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// --- security & logging ---
app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);
app.use(morgan("dev"));

// --- body parsing ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- static files ---
app.use(express.static(path.join(__dirname, "public")));
const uploadRoot =
  process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");

app.use("/uploads", express.static(uploadRoot));
// ================= ADMIN ROUTES =================
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminprofileRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/slider", sliderRoutes);
app.use("/api/v1/banner", bannerRoutes);
app.use("/api/v1/blogs", blogRoutes);
app.use("/api/v1/suppliers", supplierRoutes);
app.use("/api/v1/inventory", inventoryRoutes);
app.use("/api/v1/customers", customerRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/admin/orders", adminorderRoutes);
app.use("/api/v1/offline-orders", offlineOrderRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

app.use("/api/v1/settings", settingRoutes);
// ================= CUSTOMER ROUTES =================
app.use("/api/v1/customers/wishlist", wishlistRoutes);
app.use("/api/v1/customers/cart", cartRoutes); // Cart
app.use("/api/v1/customers/address", addressRoutes); // Addresses 
app.use("/api/v1/customers/orders", orderRoutes); // Orders



// --- health check ---
app.get("/health", (_, res) => {
  res.status(200).json({ status: "OK" });
});

export default app;
