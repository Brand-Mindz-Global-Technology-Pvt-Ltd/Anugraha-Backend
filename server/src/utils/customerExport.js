import { Parser } from "json2csv";
import ExcelJS from "exceljs";

/**
 * CSV Export
 */
export const exportToCSV = (data) => {
  const fields = [
    "customerId",
    "name",
    "email",
    "phone",
    "country",
    "status",
    "createdAt",
  ];

  const parser = new Parser({ fields });
  return parser.parse(data);
};

/**
 * Excel Export
 */
export const exportToExcel = async (data) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Customers");

  worksheet.columns = [
    { header: "Customer ID", key: "customerId", width: 20 },
    { header: "Name", key: "name", width: 20 },
    { header: "Email", key: "email", width: 25 },
    { header: "Phone", key: "phone", width: 18 },
    { header: "Country", key: "country", width: 15 },
    { header: "Status", key: "status", width: 12 },
    { header: "Created At", key: "createdAt", width: 20 },
  ];

  data.forEach((item) => {
    worksheet.addRow({
      ...item,
      createdAt: new Date(item.createdAt).toLocaleString(),
    });
  });

  return workbook;
};
