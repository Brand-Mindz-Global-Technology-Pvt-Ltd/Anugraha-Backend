import {
  Search,
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";

/* -------------------- API BASE URLS -------------------- */

const INVENTORY_API = "http://localhost:5000/api/v1/inventory";

/* -------------------- STYLES -------------------- */

const badgeStyle = {
  electronics: "bg-blue-100 text-blue-700",
  fashion: "bg-purple-100 text-purple-700",
  home: "bg-green-100 text-green-700",
};

const statusStyle = {
  Low: "bg-red-100 text-red-700 ring-1 ring-red-200",
  Medium: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
  High: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
};

const getStockStatus = (stock) => {
  if (stock < 100) return "Low";
  if (stock < 200) return "Medium";
  return "High";
};

/* -------------------- COMPONENT -------------------- */

export default function Inventory() {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [exporting, setExporting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const limit = 5;

  /* -------------------- API CALLS -------------------- */

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await axios.get(
        `${INVENTORY_API}/products`,
        {
          params: {
            page: currentPage,
            limit,
            search: searchTerm,
            category: filterCategory,
            status: filterStatus,
          },
        }
      );

      if (res.success) {
        setData(res.data);
        setTotalPages(res.pagination.totalPages);
        setTotalProducts(res.pagination.totalProducts);
      }
    } catch (error) {
      console.error("Inventory fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, filterCategory, filterStatus]);

  const fetchCategories = useCallback(async () => {
    try {
      const { data: res } = await axios.get(`${INVENTORY_API}/getcategory`);

      if (res.success) {
        setCategories(res.data);
      }
    } catch (error) {
      console.error("Category fetch error:", error);
    }
  }, []);
  const handleExport = async () => {
    try {
      setExporting(true);

      const response = await axios.get(
        `${INVENTORY_API}/export`,
        {
          params: {
            search: searchTerm,
            category: filterCategory,
            status: filterStatus,
          },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "inventory-export.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setExporting(false);
    }
  };



  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  /* -------------------- UI -------------------- */

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
      {/* HEADER */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold">
              Inventory Management
            </h1>
            <p className="text-sm text-slate-500">
              {totalProducts} products available
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedItems.length > 0 && (
              <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2">
                <Trash2 size={16} />
                Delete ({selectedItems.length})
              </button>
            )}
            <button
              onClick={handleExport}
              disabled={exporting}
              className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition
    ${exporting
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-slate-900 hover:bg-slate-800 text-white"
                }`}
            >
              {exporting ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Exporting…
                </>
              ) : (
                <>
                  <Download size={16} />
                  Export
                </>
              )}
            </button>

          </div>
        </div>

        {/* FILTERS */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <input
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900"
              placeholder="Search product..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* CATEGORY FILTER */}
          <select
            className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* STATUS FILTER */}
          <select
            className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Status</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="px-3 py-3 sm:px-6 sm:py-4">
                  <input type="checkbox" />
                </th>
                <th className="px-3 py-3 sm:px-6 sm:py-4 text-left">
                  Product
                </th>
                <th className="px-3 py-3 sm:px-6 sm:py-4">Category</th>
                <th className="px-3 py-3 sm:px-6 sm:py-4">SubCategory</th>
                <th className="px-3 py-3 sm:px-6 sm:py-4">Price</th>
                <th className="px-3 py-3 sm:px-6 sm:py-4">Stock</th>
                <th className="px-3 py-3 sm:px-6 sm:py-4">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    Loading inventory...
                  </td>
                </tr>
              ) : (
                data.map((item) => {
                  const status = getStockStatus(item.stock);

                  return (
                    <tr key={item._id} className="hover:bg-slate-50">
                      <td className="px-3 py-3 sm:px-6 sm:py-4">
                        <input type="checkbox" />
                      </td>

                      <td className="px-3 py-3 sm:px-6 sm:py-4">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-slate-400">
                          {item.slug}
                        </div>
                      </td>

                      <td className="px-3 py-3 sm:px-6 sm:py-4 text-center">
                        <span
                          className={`px-2 py-1 rounded-md text-xs font-medium ${badgeStyle[item.category] || "bg-slate-100 text-slate-600"}`}
                        >
                          {item.category}
                        </span>
                      </td>

                      <td className="px-3 py-3 sm:px-6 sm:py-4 text-center">
                        <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs">
                          {item.subCategory}
                        </span>
                      </td>

                      <td className="px-3 py-3 sm:px-6 sm:py-4 font-semibold">
                        ₹{item.price.toLocaleString()}
                      </td>

                      <td className="px-3 py-3 sm:px-6 sm:py-4">
                        {item.stock}
                      </td>

                      <td className="px-3 py-3 sm:px-6 sm:py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyle[status]}`}
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center px-4 sm:px-6 py-4 bg-slate-50">
          <span className="text-sm text-slate-500">
            Page {currentPage} of {totalPages}
          </span>

          <div className="flex gap-2 self-end">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border bg-white hover:bg-slate-100 disabled:opacity-50"
            >
              <ChevronLeft />
            </button>
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(p + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border bg-white hover:bg-slate-100 disabled:opacity-50"
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
