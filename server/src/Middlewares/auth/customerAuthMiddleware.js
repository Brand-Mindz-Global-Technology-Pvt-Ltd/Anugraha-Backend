import jwt from "jsonwebtoken";
import { ENV } from "../../Config/env.js";

const customerAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    const decoded = jwt.verify(token, ENV.Customer_JWT_SECRET);

    if (decoded.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
export default customerAuthMiddleware;