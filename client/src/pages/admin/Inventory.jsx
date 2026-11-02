import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Pencil,
  X,
} from "lucide-react";
import { useInventory } from "../../context/InventoryContext.jsx";
import { useState } from "react";

const API_URL = "http://localhost:5000/api/v1";

/* Default reorder level.
   Current MongoDB Product model-la reorderLevel field illa,
   so old MySQL value madhiri 10 use pannrom. */
const DEFAULT_REORDER_LEVEL = 10;

const getReorderLevel = (item) =>
  Number(item.reorderLevel ?? item.reorder_level ?? DEFAULT_REORDER_LEVEL);

const getStockStatus = (item) => {
  const stock = Number(item.stock || 0);
  const reorderLevel = getReorderLevel(item);

  if (stock <= 0) return "Out of Stock";
  if (stock <= reorderLevel) return "Low Stock";
  return "In Stock";
};

const statusStyle = {
  "In Stock": "bg-emerald-100 text-emerald-700",
  "Low Stock": "bg-amber-100 text-amber-700",
  "Out of Stock": "bg-red-100 text-red-700",
};

const TableSkeleton = ({ rows = 5 }) => {
  return Array.from({ length: rows }).map((_, i) => (
    <tr key={i} className="animate-pulse">
      <td className="p-4">
        <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
        <div className="h-3 bg-slate-200 rounded w-1/2" />
      </td>

      <td className="p-4 text-center">
        <div className="h-4 bg-slate-200 rounded w-16 mx-auto" />
      </td>

      <td className="p-4 text-center">
        <div className="h-4 bg-slate-200 rounded w-16 mx-auto" />
      </td>

      <td className="p-4 text-center">
        <div className="h-4 bg-slate-200 rounded w-16 mx-auto" />
      </td>

      <td className="p-4 text-center">
        <div className="h-4 bg-slate-200 rounded w-20 mx-auto" />
      </td>

      <td className="p-4 text-center">
        <div className="h-8 bg-slate-200 rounded w-28 mx-auto" />
      </td>
    </tr>
  ));
};

export default function Inventory() {
  const {
    data,
    categories,
    loading,
    exporting,
    searchTerm,
    filterCategory,
    filterStatus,
    currentPage,
    totalPages,
    totalProducts,
    setSearchTerm,
    setFilterCategory,
    setFilterStatus,
    setCurrentPage,
    exportInventory,
  } = useInventory();

  const [editingItem, setEditingItem] = useState(null);
  const [stockValue, setStockValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  /* KPI COUNTS */
  const inStockCount = data.filter(
    (item) => getStockStatus(item) === "In Stock"
  ).length;

  const lowStockCount = data.filter(
    (item) => getStockStatus(item) === "Low Stock"
  ).length;

  const outOfStockCount = data.filter(
    (item) => getStockStatus(item) === "Out of Stock"
  ).length;

  const openStockModal = (item) => {
    setEditingItem(item);
    setStockValue(String(item.stock ?? 0));
    setMessage("");
  };

  const closeStockModal = () => {
    if (saving) return;

    setEditingItem(null);
    setStockValue("");
    setMessage("");
  };

  const handleStockUpdate = async (e) => {
    e.preventDefault();

    const newStock = Number(stockValue);

    if (
      stockValue.trim() === "" ||
      !Number.isInteger(newStock) ||
      newStock < 0
    ) {
      setMessage("Enter a valid stock quantity.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/inventory/${editingItem._id}/stock`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? {
                Authorization: `Bearer ${token}`,
              }
              : {}),
          },
          body: JSON.stringify({
            stock: newStock,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to update stock."
        );
      }

      /*
        Simple refresh so InventoryContext fetches fresh MongoDB data.
        Later we can optimise this without full page refresh.
      */
      window.location.reload();
    } catch (error) {
      setMessage(
        error.message || "Unable to update stock."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-2 bg-slate-50 min-h-screen">
      {/* HEADER */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              Inventory Management
            </h1>

            <p className="text-sm text-slate-500">
              {totalProducts} products available
            </p>
          </div>

          <button
            onClick={exportInventory}
            disabled={exporting}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${exporting
                ? "bg-slate-400 cursor-not-allowed text-white"
                : "bg-slate-900 hover:bg-slate-800 text-white"
              }`}
          >
            <Download size={16} />
            {exporting ? "Exporting..." : "Export"}
          </button>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {/* IN STOCK */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle
                size={24}
                className="text-emerald-700"
              />
            </div>

            <div>
              <p className="text-sm font-medium text-emerald-700">
                In Stock
              </p>

              <p className="text-2xl font-bold text-emerald-800">
                {inStockCount}
              </p>
            </div>
          </div>

          {/* LOW STOCK */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertTriangle
                size={24}
                className="text-amber-700"
              />
            </div>

            <div>
              <p className="text-sm font-medium text-amber-700">
                Low Stock
              </p>

              <p className="text-2xl font-bold text-amber-800">
                {lowStockCount}
              </p>
            </div>
          </div>

          {/* OUT OF STOCK */}
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle
                size={24}
                className="text-red-700"
              />
            </div>

            <div>
              <p className="text-sm font-medium text-red-700">
                Out of Stock
              </p>

              <p className="text-2xl font-bold text-red-800">
                {outOfStockCount}
              </p>
            </div>
          </div>
        </div>

        {/* FILTERS */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-3 text-slate-400"
              size={18}
            />

            <input
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border"
              placeholder="Search product..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <select
            className="rounded-lg border px-4 py-2.5"
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">
              All Categories
            </option>

            {categories.map((c) => (
              <option
                key={c._id}
                value={c.slug}
              >
                {c.name}
              </option>
            ))}
          </select>

          <select
            className="rounded-lg border px-4 py-2.5"
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">
              All Status
            </option>

            <option value="Low">
              Low Stock
            </option>

            <option value="Medium">
              In Stock
            </option>

            <option value="High">
              High Stock
            </option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="p-4 text-left">
                  Product
                </th>

                <th className="p-4 text-center">
                  SKU
                </th>

                <th className="p-4 text-center">
                  Current Stock
                </th>

                <th className="p-4 text-center">
                  Reorder Level
                </th>

                <th className="p-4 text-center">
                  Status
                </th>

                <th className="p-4 text-center">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {loading ? (
                <TableSkeleton rows={5} />
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-10 text-slate-400"
                  >
                    No products found
                  </td>
                </tr>
              ) : (
                data.map((item) => {
                  const status =
                    getStockStatus(item);

                  const reorderLevel =
                    getReorderLevel(item);

                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-slate-50"
                    >
                      {/* PRODUCT */}
                      <td className="p-4">
                        <div className="font-medium text-slate-900">
                          {item.name}
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="p-4 text-center text-slate-500">
                        {item.productId || "—"}
                      </td>

                      {/* STOCK */}
                      <td className="p-4 text-center font-semibold text-slate-800">
                        {item.stock ?? 0}
                      </td>

                      {/* REORDER LEVEL */}
                      <td className="p-4 text-center">
                        {reorderLevel}
                      </td>

                      {/* STATUS */}
                      <td className="p-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${statusStyle[status]}`}
                        >
                          {status === "In Stock" && (
                            <CheckCircle size={13} />
                          )}

                          {status === "Low Stock" && (
                            <AlertTriangle size={13} />
                          )}

                          {status ===
                            "Out of Stock" && (
                              <XCircle size={13} />
                            )}

                          {status}
                        </span>
                      </td>

                      {/* ACTION */}
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            openStockModal(item)
                          }
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium transition"
                        >
                          <Pencil size={15} />
                          Update Stock
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex justify-between items-center p-4 bg-slate-50 text-sm">
          <span className="text-slate-500">
            Page {currentPage} of{" "}
            {totalPages || 1}
          </span>

          <div className="flex gap-2">
            <button
              onClick={() =>
                setCurrentPage((p) =>
                  Math.max(p - 1, 1)
                )
              }
              disabled={currentPage === 1}
              className="p-2 rounded-lg border bg-white disabled:opacity-50"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              onClick={() =>
                setCurrentPage((p) =>
                  Math.min(
                    p + 1,
                    totalPages || 1
                  )
                )
              }
              disabled={
                currentPage >= (totalPages || 1)
              }
              className="p-2 rounded-lg border bg-white disabled:opacity-50"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* UPDATE STOCK MODAL */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleStockUpdate}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
          >
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-xl font-semibold">
                  Update Stock
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  {editingItem.name}
                </p>
              </div>

              <button
                type="button"
                onClick={closeStockModal}
                disabled={saving}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {message && (
              <div className="mb-4 rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">
                {message}
              </div>
            )}

            <label className="block text-sm font-medium text-slate-700 mb-2">
              Stock Quantity
            </label>

            <input
              type="number"
              min="0"
              step="1"
              value={stockValue}
              onChange={(e) =>
                setStockValue(e.target.value)
              }
              className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              required
            />

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={closeStockModal}
                disabled={saving}
                className="px-4 py-2 rounded-lg border hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {saving
                  ? "Updating..."
                  : "Save Stock"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}