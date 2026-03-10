import Customer from "../Models/Customer.js";

const generateCustomerId = async () => {
  const count = await Customer.countDocuments();
  const year = new Date().getFullYear();
  const padded = String(count + 1).padStart(4, "0");
  return `CUST-${year}-${padded}`;
};

export default generateCustomerId;
