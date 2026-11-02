import React, { useEffect } from "react";
import { useOrders } from "../../../context/OrderContext";
import {
  Download,
  RefreshCw,
  Package,
  AlertCircle,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

const STATUS_LABEL = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_STYLE = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

const PAYMENT_STATUS_STYLE = {
  pending: "text-amber-600",
  captured: "text-emerald-600",
  failed: "text-red-600",
  refunded: "text-purple-600",
};

const fmt = {
  date: (d) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—",

  currency: (n) =>
    n != null
      ? `₹${Number(n).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : "—",

  payment: (m) => {
    if (m === "cod") return "COD";
    if (m === "razorpay") return "Online";
    return m || "—";
  },

  address: (a) => {
    if (!a || typeof a === "string") return a || "—";
    return [a.line1, a.city, a.state, a.pincode]
      .filter(Boolean)
      .join(", ");
  },
};

function CancelModal({ orderId, onConfirm, onClose }) {
  const [reason, setReason] = React.useState("");

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-bold text-gray-800">
          Cancel Order
        </h3>

        <p className="text-sm text-gray-500">
          Order{" "}
          <span className="font-semibold text-gray-700">
            #{orderId}
          </span>{" "}
          will be cancelled.
        </p>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for cancellation (optional)"
          rows={3}
          className="w-full border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-200"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
          >
            Go Back
          </button>

          <button
            onClick={() => onConfirm(reason)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
          >
            Confirm Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OrderList() {
  const {
    orders,
    loading,
    error,
    activeTab,
    page,
    totalPages,
    total,
    openOrder,
    cancelTarget,
    updatingId,
    toast,
    setPage,
    setOpenOrder,
    setCancelTarget,
    loadOrders,
    handleStatusChange,
    handleCancelOrder,
    fetchOrderDetails,
    exportOrders,
    handleTabChange,
  } = useOrders();

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    document.body.style.overflow =
      openOrder || cancelTarget ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [openOrder, cancelTarget]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") {
        setCancelTarget(null);
        setOpenOrder(null);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setCancelTarget, setOpenOrder]);

  const handleCancelConfirm = async (reason) => {
    const orderId = cancelTarget;
    setCancelTarget(null);
    await handleCancelOrder(orderId, reason);
  };

  /*
    KPI values:
    total uses backend total.
    Status counts are calculated from currently loaded orders.
  */
  const pendingCount = orders.filter(
    (o) => o.orderStatus === "pending"
  ).length;

  const shippedCount = orders.filter(
    (o) => o.orderStatus === "shipped"
  ).length;

  const deliveredCount = orders.filter(
    (o) => o.orderStatus === "delivered"
  ).length;

  return (
    <div className="p-3 sm:p-6 bg-slate-50 min-h-screen relative">
      {/* TOAST */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[70] px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
            toast.type === "error"
              ? "bg-red-600 text-white"
              : "bg-green-600 text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-7">
          {/* HEADER */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Online Orders
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Manage customer orders
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={
                  activeTab === "All"
                    ? "All"
                    : activeTab
                }
                onChange={(e) =>
                  handleTabChange(e.target.value)
                }
                className="h-11 border border-slate-300 rounded-lg px-4 bg-white text-sm outline-none"
              >
                <option value="All">All Status</option>
                {ORDER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABEL[status]}
                  </option>
                ))}
              </select>

              <button
                onClick={loadOrders}
                disabled={loading}
                className="h-11 w-11 flex items-center justify-center border rounded-lg bg-white hover:bg-slate-50 disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw
                  size={17}
                  className={loading ? "animate-spin" : ""}
                />
              </button>

              <button
                onClick={exportOrders}
                className="h-11 flex items-center gap-2 bg-blue-600 text-white px-4 rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                <Download size={16} />
                Export CSV
              </button>
            </div>
          </div>

          {/* KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
            <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-5 text-center">
              <p className="text-sm font-medium text-indigo-700">
                Total Orders
              </p>
              <p className="text-3xl font-bold text-indigo-800 mt-1">
                {total || 0}
              </p>
            </div>

            <div className="rounded-xl bg-amber-50 border border-amber-100 p-5 text-center">
              <p className="text-sm font-medium text-amber-700">
                Pending
              </p>
              <p className="text-3xl font-bold text-amber-800 mt-1">
                {pendingCount}
              </p>
            </div>

            <div className="rounded-xl bg-blue-50 border border-blue-100 p-5 text-center">
              <p className="text-sm font-medium text-blue-700">
                Shipped
              </p>
              <p className="text-3xl font-bold text-blue-800 mt-1">
                {shippedCount}
              </p>
            </div>

            <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-5 text-center">
              <p className="text-sm font-medium text-emerald-700">
                Delivered
              </p>
              <p className="text-3xl font-bold text-emerald-800 mt-1">
                {deliveredCount}
              </p>
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mt-6 flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 text-sm">
              <AlertCircle size={17} />
              <span className="flex-1">{error}</span>

              <button
                onClick={loadOrders}
                className="underline text-xs"
              >
                Retry
              </button>
            </div>
          )}

          {/* TABLE */}
          <div className="mt-7 border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="p-4 text-left">
                      Order ID
                    </th>
                    <th className="p-4 text-left">
                      Customer
                    </th>
                    <th className="p-4 text-center">
                      Date
                    </th>
                    <th className="p-4 text-center">
                      Items
                    </th>
                    <th className="p-4 text-center">
                      Total
                    </th>
                    <th className="p-4 text-center">
                      Payment
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
                    <tr>
                      <td
                        colSpan="8"
                        className="py-14 text-center text-slate-400"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw
                            size={18}
                            className="animate-spin"
                          />
                          Loading orders...
                        </div>
                      </td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="py-16 text-center text-slate-400"
                      >
                        <Package
                          size={45}
                          className="mx-auto mb-3 opacity-30"
                        />
                        <p className="font-medium">
                          No orders found
                        </p>
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => {
                      const isBusy =
                        updatingId === order.orderId;

                      return (
                        <tr
                          key={order.orderId}
                          className={`hover:bg-slate-50 ${
                            isBusy
                              ? "opacity-60 pointer-events-none"
                              : ""
                          }`}
                        >
                          <td className="p-4 font-semibold text-indigo-700">
                            #{order.orderId}
                          </td>

                          <td className="p-4">
                            <div className="font-semibold text-slate-800">
                              {order.customerId?.name ||
                                "—"}
                            </div>

                            <div className="text-xs text-slate-400 mt-0.5">
                              {order.customerId?.email ||
                                ""}
                            </div>
                          </td>

                          <td className="p-4 text-center text-slate-600">
                            {fmt.date(order.createdAt)}
                          </td>

                          <td className="p-4 text-center font-medium">
                            {order.items?.reduce(
                              (sum, item) =>
                                sum +
                                Number(
                                  item.qty || 0
                                ),
                              0
                            ) || 0}
                          </td>

                          <td className="p-4 text-center font-semibold">
                            {fmt.currency(
                              order.totalAmount
                            )}
                          </td>

                          <td className="p-4 text-center">
                            <div className="font-medium text-slate-700">
                              {fmt.payment(
                                order.payment?.method
                              )}
                            </div>

                            <div
                              className={`text-xs capitalize ${
                                PAYMENT_STATUS_STYLE[
                                  order.payment?.status
                                ] || "text-slate-400"
                              }`}
                            >
                              {order.payment?.status ||
                                ""}
                            </div>
                          </td>

                          <td className="p-4 text-center">
                            <select
                              value={order.orderStatus}
                              disabled={
                                order.orderStatus ===
                                  "cancelled" ||
                                isBusy
                              }
                              onChange={(e) =>
                                handleStatusChange(
                                  order.orderId,
                                  e.target.value
                                )
                              }
                              className={`px-3 py-1.5 rounded-full text-xs font-semibold border-0 outline-none capitalize ${
                                STATUS_STYLE[
                                  order.orderStatus
                                ] ||
                                "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {ORDER_STATUSES.map(
                                (status) => (
                                  <option
                                    key={status}
                                    value={status}
                                  >
                                    {
                                      STATUS_LABEL[
                                        status
                                      ]
                                    }
                                  </option>
                                )
                              )}
                            </select>
                          </td>

                          <td className="p-4 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                fetchOrderDetails(
                                  order
                                )
                              }
                              className="inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-indigo-50 text-indigo-600"
                              title="View Order"
                            >
                              <Eye size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-end items-center gap-3 mt-5">
              <button
                onClick={() =>
                  setPage((p) =>
                    Math.max(1, p - 1)
                  )
                }
                disabled={
                  page === 1 || loading
                }
                className="w-9 h-9 flex items-center justify-center border rounded-lg disabled:opacity-40 hover:bg-slate-50"
              >
                <ChevronLeft size={17} />
              </button>

              <span className="text-sm text-slate-500">
                Page{" "}
                <span className="font-semibold">
                  {page}
                </span>{" "}
                of{" "}
                <span className="font-semibold">
                  {totalPages}
                </span>
              </span>

              <button
                onClick={() =>
                  setPage((p) =>
                    Math.min(
                      totalPages,
                      p + 1
                    )
                  )
                }
                disabled={
                  page === totalPages ||
                  loading
                }
                className="w-9 h-9 flex items-center justify-center border rounded-lg disabled:opacity-40 hover:bg-slate-50"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ORDER DETAILS MODAL */}
      {openOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpenOrder(null)}
        >
          <div
            className="bg-white w-full max-w-2xl rounded-xl shadow-xl overflow-hidden"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="flex justify-between items-center px-6 py-4 border-b bg-slate-50">
              <div>
                <h2 className="text-base font-bold text-slate-800">
                  Order Details
                </h2>

                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  #{openOrder.orderId}
                </p>
              </div>

              <button
                onClick={() =>
                  setOpenOrder(null)
                }
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-100 hover:text-red-600"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-slate-400 uppercase mb-1">
                    Customer
                  </p>

                  <p className="font-semibold">
                    {openOrder.customerId
                      ?.name || "—"}
                  </p>

                  <p className="text-xs text-slate-400">
                    {openOrder.customerId
                      ?.email || ""}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400 uppercase mb-1">
                    Order Date
                  </p>

                  <p className="font-semibold">
                    {fmt.date(
                      openOrder.createdAt
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400 uppercase mb-1">
                    Payment
                  </p>

                  <p className="font-semibold">
                    {fmt.payment(
                      openOrder.payment?.method
                    )}
                  </p>

                  <p
                    className={`text-xs capitalize ${
                      PAYMENT_STATUS_STYLE[
                        openOrder.payment?.status
                      ] || "text-slate-400"
                    }`}
                  >
                    {openOrder.payment?.status ||
                      "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400 uppercase mb-1">
                    Shipping Address
                  </p>

                  <p className="text-slate-700">
                    {fmt.address(
                      openOrder.shippingAddress
                    )}
                  </p>
                </div>
              </div>

              <div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                    STATUS_STYLE[
                      openOrder.orderStatus
                    ] ||
                    "bg-slate-100 text-slate-600"
                  }`}
                >
                  {STATUS_LABEL[
                    openOrder.orderStatus
                  ] ||
                    openOrder.orderStatus}
                </span>
              </div>

              <div>
                <p className="text-xs text-slate-400 uppercase mb-2">
                  Items (
                  {openOrder.items?.length ||
                    0}
                  )
                </p>

                <div className="space-y-2">
                  {(openOrder.items || []).map(
                    (item, idx) => (
                      <div
                        key={idx}
                        className="flex gap-3 items-center border rounded-lg p-3"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {item.name}
                          </p>

                          <p className="text-xs text-slate-400">
                            Qty: {item.qty}
                          </p>
                        </div>

                        <div className="text-sm font-semibold">
                          {fmt.currency(
                            item.price *
                              item.qty
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 text-sm space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>
                    {fmt.currency(
                      openOrder.subtotal
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span>
                    {openOrder.shipping === 0
                      ? "Free"
                      : fmt.currency(
                          openOrder.shipping
                        )}
                  </span>
                </div>

                <div className="flex justify-between font-bold text-slate-800 border-t pt-2">
                  <span>Total</span>
                  <span>
                    {fmt.currency(
                      openOrder.totalAmount
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center px-6 py-4 border-t bg-slate-50">
              <div>
                {openOrder.orderStatus !==
                  "cancelled" &&
                  openOrder.orderStatus !==
                    "delivered" && (
                    <button
                      onClick={() => {
                        setOpenOrder(null);
                        setCancelTarget(
                          openOrder.orderId
                        );
                      }}
                      className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50"
                    >
                      Cancel Order
                    </button>
                  )}
              </div>

              <button
                onClick={() =>
                  setOpenOrder(null)
                }
                className="px-4 py-2 border rounded-lg text-sm hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL MODAL */}
      {cancelTarget && (
        <CancelModal
          orderId={cancelTarget}
          onConfirm={handleCancelConfirm}
          onClose={() =>
            setCancelTarget(null)
          }
        />
      )}
    </div>
  );
}
