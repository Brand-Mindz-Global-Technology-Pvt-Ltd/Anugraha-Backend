import { useEffect, useState } from "react";
import axios from "axios";
import {
    Plus,
    X,
    Eye,
    Trash2,
} from "lucide-react";

const API_URL = `${import.meta.env.VITE_API_URL}/offline-orders`;

const emptyForm = {
    customerName: "Walk-in Customer",
    salesperson: "",
    itemsSold: "",
    totalAmount: "",
    paymentMethod: "cash",
    status: "completed",
};

const statusStyle = {
    completed: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-700",
};

export default function OfflineOrders() {
    const [orders, setOrders] = useState([]);
    const [summary, setSummary] = useState({
        todaysSales: 0,
        completed: 0,
        pending: 0,
    });

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [form, setForm] = useState(emptyForm);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);

            const res = await axios.get(API_URL);

            setOrders(res.data?.data || []);
            setSummary(
                res.data?.summary || {
                    todaysSales: 0,
                    completed: 0,
                    pending: 0,
                }
            );
        } catch (error) {
            console.error("Offline orders fetch error:", error);
            alert("Failed to load offline orders");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();

        if (!form.salesperson.trim()) {
            alert("Salesperson is required");
            return;
        }

        if (!form.itemsSold.trim()) {
            alert("Items sold is required");
            return;
        }

        if (!form.totalAmount) {
            alert("Total amount is required");
            return;
        }

        try {
            setSaving(true);

            await axios.post(API_URL, {
                customerName:
                    form.customerName.trim() || "Walk-in Customer",
                salesperson: form.salesperson.trim(),
                itemsSold: form.itemsSold.trim(),
                totalAmount: Number(form.totalAmount),
                paymentMethod: form.paymentMethod,
                status: form.status,
            });

            alert("Offline sale saved successfully");

            setForm(emptyForm);
            setShowForm(false);
            fetchOrders();
        } catch (error) {
            console.error("Offline order save error:", error);

            alert(
                error.response?.data?.message ||
                "Failed to save offline sale"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        const ok = window.confirm(
            "Are you sure you want to delete this offline order?"
        );

        if (!ok) return;

        try {
            await axios.delete(`${API_URL}/${id}`);
            fetchOrders();
        } catch (error) {
            console.error("Offline order delete error:", error);
            alert("Failed to delete offline order");
        }
    };

    const formatPrice = (value) =>
        `₹${Number(value || 0).toLocaleString("en-IN")}`;

    const formatDate = (date) =>
        date
            ? new Date(date).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            })
            : "—";

    const paymentLabel = {
        cash: "Cash",
        card: "Card",
        upi: "UPI",
        card_cash: "Card + Cash",
        advance: "Advance",
    };

    return (
        <div className="p-2 bg-slate-50 min-h-screen">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">

                {/* HEADER */}

                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            Offline / In-Store Orders
                        </h1>
                    </div>

                    <button
                        onClick={() => {
                            setForm(emptyForm);
                            setShowForm((prev) => !prev);
                        }}
                        className="flex items-center gap-2 bg-[#d4a13f] hover:bg-[#bd8e32] px-5 py-3 rounded-lg font-medium"
                    >
                        {showForm ? (
                            <>
                                <X size={18} />
                                Cancel
                            </>
                        ) : (
                            <>
                                <Plus size={18} />
                                New Sale
                            </>
                        )}
                    </button>
                </div>

                {/* NEW SALE FORM */}

                {showForm && (
                    <form
                        onSubmit={handleSave}
                        className="border rounded-xl bg-slate-50 p-6 mb-6"
                    >
                        <h2 className="text-lg font-semibold mb-5">
                            Record New In-Store Sale
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Customer Name
                                </label>

                                <input
                                    name="customerName"
                                    value={form.customerName}
                                    onChange={handleChange}
                                    className="w-full border bg-white rounded-lg px-4 py-3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Salesperson
                                </label>

                                <input
                                    name="salesperson"
                                    value={form.salesperson}
                                    onChange={handleChange}
                                    placeholder="Enter salesperson"
                                    className="w-full border bg-white rounded-lg px-4 py-3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Items Sold
                                </label>

                                <input
                                    name="itemsSold"
                                    value={form.itemsSold}
                                    onChange={handleChange}
                                    placeholder="e.g. Gold Chain, Earrings"
                                    className="w-full border bg-white rounded-lg px-4 py-3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Total Amount (₹)
                                </label>

                                <input
                                    type="number"
                                    name="totalAmount"
                                    value={form.totalAmount}
                                    onChange={handleChange}
                                    placeholder="Enter amount"
                                    className="w-full border bg-white rounded-lg px-4 py-3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Payment Method
                                </label>

                                <select
                                    name="paymentMethod"
                                    value={form.paymentMethod}
                                    onChange={handleChange}
                                    className="w-full border bg-white rounded-lg px-4 py-3"
                                >
                                    <option value="cash">Cash</option>
                                    <option value="card">Card</option>
                                    <option value="upi">UPI</option>
                                    <option value="card_cash">Card + Cash</option>
                                    <option value="advance">Advance</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Status
                                </label>

                                <select
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                    className="w-full border bg-white rounded-lg px-4 py-3"
                                >
                                    <option value="completed">
                                        Completed
                                    </option>

                                    <option value="pending">
                                        Pending
                                    </option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-[#d4a13f] hover:bg-[#bd8e32] px-5 py-2.5 rounded-lg font-medium disabled:opacity-60"
                            >
                                {saving ? "Saving..." : "Save Sale"}
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="border px-5 py-2.5 rounded-lg"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}

                {/* KPI CARDS */}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 text-center">
                        <p className="text-sm text-indigo-700">
                            Today's Sales
                        </p>

                        <h2 className="text-3xl font-bold text-indigo-800 mt-1">
                            {formatPrice(summary.todaysSales)}
                        </h2>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
                        <p className="text-sm text-emerald-700">
                            Completed
                        </p>

                        <h2 className="text-3xl font-bold text-emerald-800 mt-1">
                            {summary.completed}
                        </h2>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center">
                        <p className="text-sm text-amber-700">
                            Pending Custom
                        </p>

                        <h2 className="text-3xl font-bold text-amber-800 mt-1">
                            {summary.pending}
                        </h2>
                    </div>

                </div>

                {/* TABLE */}

                <div className="border rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[1050px] text-sm">

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

                                    <th className="p-4 text-left">
                                        Items
                                    </th>

                                    <th className="p-4 text-center">
                                        Total
                                    </th>

                                    <th className="p-4 text-center">
                                        Payment
                                    </th>

                                    <th className="p-4 text-center">
                                        Salesperson
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
                                            colSpan="9"
                                            className="text-center py-10 text-slate-400"
                                        >
                                            Loading...
                                        </td>
                                    </tr>
                                ) : orders.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="9"
                                            className="text-center py-10 text-slate-400"
                                        >
                                            No offline orders found.
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map((order) => (
                                        <tr
                                            key={order._id}
                                            className="hover:bg-slate-50"
                                        >
                                            <td className="p-4 font-semibold text-indigo-700">
                                                #{order.orderId}
                                            </td>

                                            <td className="p-4">
                                                {order.customerName}
                                            </td>

                                            <td className="p-4 text-center">
                                                {formatDate(order.createdAt)}
                                            </td>

                                            <td className="p-4">
                                                {order.itemsSold}
                                            </td>

                                            <td className="p-4 text-center font-semibold">
                                                {formatPrice(order.totalAmount)}
                                            </td>

                                            <td className="p-4 text-center">
                                                <span className="bg-slate-100 px-2 py-1 rounded text-xs">
                                                    {paymentLabel[order.paymentMethod] ||
                                                        order.paymentMethod}
                                                </span>
                                            </td>

                                            <td className="p-4 text-center">
                                                {order.salesperson}
                                            </td>

                                            <td className="p-4 text-center">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusStyle[order.status] ||
                                                        "bg-slate-100 text-slate-600"
                                                        }`}
                                                >
                                                    {order.status}
                                                </span>
                                            </td>

                                            <td className="p-4">
                                                <div className="flex justify-center gap-2">

                                                    <button
                                                        onClick={() =>
                                                            setSelectedOrder(order)
                                                        }
                                                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600"
                                                        title="View"
                                                    >
                                                        <Eye size={16} />
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            handleDelete(order._id)
                                                        }
                                                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-50 text-red-600"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>

                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}

                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* VIEW MODAL */}

            {selectedOrder && (
                <div
                    className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
                    onClick={() => setSelectedOrder(null)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-xl w-full max-w-lg"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="flex justify-between items-center border-b px-6 py-4">
                            <div>
                                <h2 className="text-xl font-semibold">
                                    Offline Order
                                </h2>

                                <p className="text-sm text-slate-400">
                                    #{selectedOrder.orderId}
                                </p>
                            </div>

                            <button
                                onClick={() => setSelectedOrder(null)}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-3 text-sm">

                            <p>
                                <b>Customer:</b>{" "}
                                {selectedOrder.customerName}
                            </p>

                            <p>
                                <b>Items:</b>{" "}
                                {selectedOrder.itemsSold}
                            </p>

                            <p>
                                <b>Total:</b>{" "}
                                {formatPrice(selectedOrder.totalAmount)}
                            </p>

                            <p>
                                <b>Payment:</b>{" "}
                                {paymentLabel[selectedOrder.paymentMethod]}
                            </p>

                            <p>
                                <b>Salesperson:</b>{" "}
                                {selectedOrder.salesperson}
                            </p>

                            <p>
                                <b>Status:</b>{" "}
                                <span className="capitalize">
                                    {selectedOrder.status}
                                </span>
                            </p>

                        </div>

                        <div className="flex justify-end border-t px-6 py-4">
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="border px-5 py-2 rounded-lg"
                            >
                                Close
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}