import React, { useEffect, useState } from "react";
import {
  Search,
  Download,
  Filter,
  Printer,
  FileText,
  ChevronDown
} from "lucide-react";

/* ================= SAMPLE DATA ================= */
const orders = [
  {
    id: "246522111",
    customer: "Danial Donald",
    date: "26 Jan, 2023",
    payment: "Credit card",
    status: "Pending",
    note: "Please process before 22 Mar, 24",
    products: [
      {
        name: "Nike Air Jordan Reflex",
        price: "₹ 10,000.00",
        color: "Black",
        size: "23",
        qty: 2,
        image:
          "https://5.imimg.com/data5/TQ/MM/JI/IOS-77803457/product-jpeg.png",
      },
    ],
  },
  {
    id: "246522112",
    customer: "Donald",
    date: "20 Jan, 2025",
    payment: "UPI",
    status: "Processing",
    note: "Please process before 22 Jan, 25",
    products: [
      {
        name: "Havlou Earhook",
        price: "₹ 5,000.00",
        color: "Black",
        size: "Null",
        qty: 2,
        image:
          "https://acdn-us.mitiendanube.com/stores/477/775/products/2we0sdvfjwsgvjngwepg-37a7a1cd11a6a4930d17534479042928-1024-1024.webp",
      },
    ],
  },
  {
    id: "246522113",
    customer: "Danial Donald",
    date: "26 Jan, 2023",
    payment: "Credit card",
    status: "Shipping",
    note: "Please process before 22 Mar, 24",
    products: [
      {
        name: "Nike Air Jordan Reflex",
        price: "₹ 10,000.00",
        color: "Black",
        size: "23",
        qty: 2,
        image:
          "https://5.imimg.com/data5/TQ/MM/JI/IOS-77803457/product-jpeg.png",
      },
    ],
  },
  {
    id: "246522114",
    customer: "Danial Donald",
    date: "26 Jan, 2023",
    payment: "Credit card",
    status: "Refund",
    note: "Please ship before 22 Mar, 24",
    products: [
      {
        name: "2.5wt Black Table Lamp",
        price: "₹ 1,000.00",
        color: "Black",
        size: "23",
        qty: 2,
        image:
          "https://m.media-amazon.com/images/I/519eRpewYnL._SX342_SY445_QL70_FMwebp_.jpg",
      },
    ],
  },
  {
    id: "246522115",
    customer: "Danial Donald",
    date: "26 Jan, 2023",
    payment: "Credit card",
    status: "Complete",
    note: "Estimated delivery by 22 Mar, 24",
    products: [
      {
        name: "Havlou Solar RS2",
        price: "₹ 3,000.00",
        color: "Black",
        size: "23",
        qty: 2,
        image:
          "https://haylou.info/images/haylou-solar-neo-14.webp",
      },
    ],
  },
];

const ORDER_STATUSES = [
  "Pending",
  "Processing",
  "Shipping",
  "Complete",
  "Refund",
];

const statusStyles = {
  Pending: "bg-orange-100 text-orange-600",
  Processing: "bg-blue-100 text-blue-600",
  Shipping: "bg-yellow-100 text-orange-600",
  Complete: "bg-green-100 text-green-600",
  Refund: "bg-red-100 text-red-600",
};


/* ================= COMPONENT ================= */
export default function OrderList() {
  const [activeTab, setActiveTab] = useState("All");
  const [openOrder, setOpenOrder] = useState(null);

  const [orderStatus, setOrderStatus] = useState(
    orders.reduce((acc, o) => {
      acc[o.id] = o.status;
      return acc;
    }, {})
  );

  /* ===== Disable background scroll when modal open ===== */
  useEffect(() => {
    document.body.style.overflow = openOrder ? "hidden" : "auto";
  }, [openOrder]);

  /* ===== ESC key close ===== */
  useEffect(() => {
    const esc = (e) => e.key === "Escape" && setOpenOrder(null);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, []);

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "All") return true;

    if (activeTab === "Processing") {
      return orderStatus[order.id] === "Processing";
    }

    if (activeTab === "Shipping") {
      return orderStatus[order.id] === "Shipping";
    }

    if (activeTab === "Refund") {
      return orderStatus[order.id] === "Refund";
    }

    return true;
  });


  return (
    <div className="p-6 bg-white min-h-screen rounded-lg">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div className="flex flex-wrap gap-4 text-sm">
            {["All", "Processing", "Shipping", "Refund"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-full ${activeTab === tab
                  ? "bg-blue-100 text-blue-600 font-semibold"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
            <Download size={16} />
            Export Order List
          </button>
        </div>

        {/* FILTER BAR */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[260px]">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              placeholder="Search by ID, name, status"
              className="w-full pl-9 pr-4 py-2 border rounded-md text-sm"
            />
          </div>

          <select className="px-3 py-2 border rounded-md text-sm">
            <option>Sort By: New Order</option>
          </select>

          <button className="flex items-center gap-2 px-3 py-2 border rounded-md text-sm">
            <Filter size={16} />
            Filter
          </button>
        </div>

        {/* ORDER LIST */}
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white border-2 border-gray-300 rounded-lg border-dashed"
            >
              {/* ORDER HEADER */}
              <div className="flex justify-between items-center px-4 py-3 border-b text-sm">
                <div className="text-gray-600">
                  Customer{" "}
                  <span className="font-medium text-gray-800">
                    {order.customer}
                  </span>{" "}
                  • Date{" "}
                  <span className="font-medium text-gray-800">
                    {order.date}
                  </span>
                </div>
                <div className="text-gray-500">
                  Order ID{" "}
                  <span className="font-medium">{order.id}</span>
                </div>
              </div>

              {/* PRODUCTS */}
              {order.products.map((p) => (
                <div
                  key={`${order.id}-${p.name}`}
                  className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 items-center border-b last:border-b-0"
                >
                  {/* PRODUCT */}
                  <div className="flex gap-3 md:col-span-2">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-14 h-14 rounded-md object-cover"
                    />
                    <div>
                      <p className="font-medium text-sm">{p.name}</p>
                      <p className="text-xs text-gray-500">
                        Color: {p.color} • Size: {p.size}
                      </p>
                      <p className="text-xs text-gray-500">
                        Quantity: {p.qty}
                      </p>
                    </div>
                  </div>

                  {/* PRICE */}
                  <div className="text-sm font-medium">{p.price}</div>

                  {/* PAYMENT */}
                  <div className="text-sm text-gray-600">
                    {order.payment}
                  </div>

                  {/* STATUS */}
                  <div className="flex flex-col gap-1">
                    <div className="relative inline-block w-fit">

                      <select
                        value={orderStatus[order.id]}
                        onChange={(e) =>
                          setOrderStatus((prev) => ({
                            ...prev,
                            [order.id]: e.target.value,
                          }))
                        }
                        className={`
                          px-4 pr-8 py-1 rounded-full text-xs font-medium
                          border cursor-pointer appearance-none
                          ${statusStyles[orderStatus[order.id]]}
                          focus:outline-none
                        `}
                      >
                        {ORDER_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>

                      {/* DROPDOWN ARROW */}
                      <ChevronDown
                        size={14}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-current pointer-events-none"
                      />
                    </div>

                    <p className="text-xs text-gray-400">
                      {order.note}
                    </p>
                  </div>

                  {/* ACTION */}
                  <div className="flex flex-col gap-2">
                    {orderStatus[order.id] !== "Shipped" ? (
                      <button className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs">
                        <Printer size={14} />
                        Print Label
                      </button>
                    ) : (
                      <button className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs">
                        <FileText size={14} />
                        Invoice
                      </button>
                    )}
                    <button className="border border-red-300 text-red-600 px-3 py-1.5 rounded-md text-xs hover:bg-red-50">
                      Cancel Order
                    </button>
                  </div>
                </div>
              ))}

              {/* SHOW MORE */}
              <div
                className="px-4 py-2 text-sm text-blue-600"
              >
                <span className="cursor-pointer hover:underline" onClick={() => setOpenOrder(order)}> Show more </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {openOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpenOrder(null)}
        >
          <div
            className="bg-white w-full max-w-3xl rounded-xl shadow-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">Order Details</h2>
              <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-red-400 hover:text-white"
                onClick={() => setOpenOrder(null)}>✕</button>
            </div>

            {/* BODY */}
            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Customer</p>
                  <p className="font-medium">{openOrder.customer}</p>
                </div>
                <div>
                  <p className="text-gray-500">Order ID</p>
                  <p className="font-medium">{openOrder.id}</p>
                </div>
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="font-medium">{openOrder.date}</p>
                </div>
                <div>
                  <p className="text-gray-500">Payment</p>
                  <p className="font-medium">{openOrder.payment}</p>
                </div>
              </div>

              <div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium
                    ${statusStyles[orderStatus[openOrder.id]]}`}
                >
                  {orderStatus[openOrder.id]}
                </span>

                <p className="text-xs text-gray-400 mt-1">
                  {openOrder.note}
                </p>
              </div>


              <div className="space-y-4">
                {openOrder.products.map((p) => (
                  <div
                    key={p.name}
                    className="flex gap-4 items-center border rounded-lg p-3"
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-16 h-16 rounded-md object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-gray-500">
                        Color: {p.color} • Size: {p.size}
                      </p>
                      <p className="text-xs text-gray-500">
                        Qty: {p.qty}
                      </p>
                    </div>
                    <div className="font-medium">{p.price}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t">
              <button
                onClick={() => setOpenOrder(null)}
                className="px-4 py-2 border rounded-md text-sm"
              >
                Close
              </button>
              {openOrder.status !== "Shipped" && (
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">
                  Print Label
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
