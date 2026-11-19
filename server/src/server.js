import app from "./app.js";
import { connectDB } from "./Config/db.js";
import { ENV } from "./Config/env.js";
import "./Config/firebase.js";
import "./utils/jobs/lowStockMonitor.js";

connectDB();

app.listen(ENV.PORT, () => {
  console.log(`Server running on port ${ENV.PORT}`);
});
