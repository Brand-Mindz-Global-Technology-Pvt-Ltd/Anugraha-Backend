import { useEffect, useState } from "react";
import axios from "axios";
import { Search, ShoppingBasket, Plus, Eye, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
const API = `${import.meta.env.VITE_API_URL}/products/product-list`;
import ProductCreate from "../products/ProductCreate"

export default function ProductsPage() {
  // SAFE STATES
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const id = JSON.parse(localStorage.getItem("admin"))?.id;
  // Filters
  const [search, setSearch] = useState("");
  const token = localStorage.getItem("token")

  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");

  const formatPrice = (value) =>
    new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);


  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/products/categories`
      );

      const formatted = res.data.data.map((cat) => ({
        label: cat.name,
        value: cat.slug,
      }));

      setCategories(formatted);
    } catch (err) {
      console.error("Category fetch failed", err);
    }
  };

  useEffect(() => {
    if (category) {
      fetchSubCategories(category);
    } else {
      setSubCategories([]);
    }
  }, [category]);

  const fetchSubCategories = async (categorySlug) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/products/categories/${categorySlug}/subcategories`
      );

      const formatted = res.data.data.map((sub) => ({
        label: sub.name,
        value: sub.slug,
      }));

      setSubCategories(formatted);
    } catch (err) {
      console.error("Subcategory fetch failed", err);
      setSubCategories([]);
    }
  };

  // FETCH PRODUCTS (SAFE)
  const fetchProducts = async () => {
    try {
      setLoading(true);

      const res = await axios.get(API,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            page,
            limit: 8,
            category,
            subCategory,
            search,
          },
        });

      setProducts(Array.isArray(res.data?.data) ? res.data.data : []);
      setTotalPages(res.data?.pagination?.totalPages || 1);
    } catch (err) {
      console.error("Fetch failed", err);
      setProducts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, category, subCategory, search]);

  useEffect(() => {
    setPage(1);
  }, [category, subCategory, search]);


  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `${import.meta.env.VITE_API_URL}/products/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Product deleted successfully");
      fetchProducts(); // refresh list
    } catch (err) {
      console.error("Delete failed", err);
      alert("Delete failed");
    }
  };

  return (
   <>
  <div className="p-4 sm:p-6 space-y-6">

    {/* ================= FILTERS ================= */}
    <div className="bg-white p-4 rounded-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">

      {/* SEARCH */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">
          Search
        </label>

        <div className="relative h-10">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            className="border-2 border-gray-300 rounded-lg w-full h-10 pl-10 pr-3 text-sm
                       focus:outline-none focus:border-[#162A78] focus:ring-1 focus:ring-[#162A78]"
            placeholder="Search products..."
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* CATEGORY */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">
          Category
        </label>
        <Input
          select
          options={categories}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
      </div>

      {/* SUB CATEGORY */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">
          Sub Category
        </label>
        <Input
          select
          options={subCategories}
          value={subCategory}
          onChange={(e) => setSubCategory(e.target.value)}
        />
      </div>

      {/* ADD PRODUCT */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-transparent">
          Action
        </label>

        <button
          onClick={() => navigate(`/admin/products/new?id=${id}`)}
          className="group h-10 bg-[#162A78] text-white px-4 rounded-lg
                     flex items-center justify-center gap-3
                     w-full lg:w-auto"
        >
          <span className="flex items-center gap-1">
            <Plus size={18} />
            <span className="font-medium">PRODUCT</span>
          </span>

          <span className="transition-transform duration-200 group-hover:scale-125">
            <ShoppingBasket size={20} />
          </span>
        </button>
      </div>
    </div>

    {/* ================= PRODUCT GRID ================= */}
    <div className="bg-white rounded-xl p-4">

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-6">

          {products.map((p) => (
            <div
              key={p._id}
              className="group relative rounded-2xl border bg-white shadow-sm
                         hover:shadow-lg transition-all duration-300 overflow-hidden"
            >

              {/* IMAGE */}
              <div className="relative h-44 sm:h-48 overflow-hidden bg-gray-50">
                <img
                  src={p.images?.[0]}
                  alt={p.name}
                  className="w-full h-full object-cover transition-transform duration-300
                             group-hover:scale-105"
                />

                {/* ACTIONS */}
                <div className="absolute top-3 right-3 flex flex-col gap-2
                                opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => {
                      setEditingId(p._id);
                      setOpenModal(true);
                    }}
                    className="p-2 bg-white rounded-full shadow hover:bg-blue-50"
                    title="Edit"
                  >
                    <Pencil size={16} className="text-blue-600" />
                  </button>

                  <button
                    onClick={() => handleDelete(p._id)}
                    className="p-2 bg-white rounded-full shadow hover:bg-red-50"
                    title="Delete"
                  >
                    <Trash2 size={16} className="text-red-600" />
                  </button>
                </div>

                {/* STOCK BADGE */}
                <span
                  className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-semibold
                    ${p.stock > 0
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                    }`}
                >
                  {p.stock > 0 ? "In Stock" : "Out of Stock"}
                </span>
              </div>

              {/* CONTENT */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-sm sm:text-base text-gray-800 line-clamp-1">
                    {p.name}
                  </h3>
                  <p className="text-xs text-gray-500">{p.brand}</p>
                </div>

                <div className="text-xs text-gray-500">
                  {p.category}
                  {p.subCategory && <span> • {p.subCategory}</span>}
                </div>

                {/* PRICE */}
                <div className="flex items-center gap-2">
                  <span className="text-[#162A78] font-semibold text-sm sm:text-base">
                    ₹ {formatPrice(p.price)}
                  </span>

                  {p.oldPrice && (
                    <span className="text-xs line-through text-gray-400">
                      ₹ {formatPrice(p.oldPrice)}
                    </span>
                  )}
                </div>

                {/* META */}
                <div className="flex items-center justify-between text-xs text-gray-600
                                border-t pt-3">
                  <span>
                    Sales <b>{p.sales || 0}</b>
                  </span>

                  <span
                    className={`font-semibold ${p.stock > 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {p.stock} left
                  </span>
                </div>

                {/* RATING */}
                <div className="text-yellow-400 text-sm leading-none">
                  {"★".repeat(p.rating || 5)}
                  <span className="text-gray-400 ml-1">
                    ({p.rating || 5})
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !loading && (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl">
            No products found
          </div>
        )
      )}

      {/* ================= PAGINATION ================= */}
      <div className="flex items-center justify-center sm:justify-end gap-3 p-3 text-xs sm:text-sm">
  {/* PREVIOUS */}
  <button
    disabled={page === 1}
    onClick={() => setPage(page - 1)}
    className="
      h-8 w-8
      flex items-center justify-center
      rounded-full border
      text-gray-600
      hover:bg-[#162A78] hover:text-white
      transition
      disabled:opacity-40 disabled:cursor-not-allowed
    "
    aria-label="Previous page"
  >
    <ChevronLeft size={16} />
  </button>

  {/* PAGE INFO */}
  <span className="text-gray-700 whitespace-nowrap">
    Page <b>{page}</b> of <b>{totalPages}</b>
  </span>

  {/* NEXT */}
  <button
    disabled={page === totalPages}
    onClick={() => setPage(page + 1)}
    className="
      h-8 w-8
      flex items-center justify-center
      rounded-full border
      text-gray-600
      hover:bg-[#162A78] hover:text-white
      transition
      disabled:opacity-40 disabled:cursor-not-allowed
    "
    aria-label="Next page"
  >
    <ChevronRight size={16} />
  </button>
</div>

    </div>
  </div>

  {openModal && (
    <ProductCreate
      productId={editingId}
      onClose={() => {
        setOpenModal(false);
        setEditingId(null);
      }}
      onSuccess={() => {
        setOpenModal(false);
        setEditingId(null);
        fetchProducts();
      }}
    />
  )}
</>

  );
}

function Input({ label, value, onChange, select, options = [] }) {
  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>

      {select ? (
        <select
          value={value}
          onChange={onChange}
          className="w-full border rounded px-4 py-2"
        >
          <option value="">Select</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          value={value}
          onChange={onChange}
          className="w-full border rounded px-4 py-2"
        />
      )}
    </div>
  );
}