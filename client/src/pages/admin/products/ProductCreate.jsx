import { X, Upload, Cloud, Plus, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";


export default function ProductCreate({ productId, onClose, onSuccess }) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [rating, setRating] = useState(1);

  const [ramValue, setRamValue] = useState("");
  const [rams, setRams] = useState([]);

  const [sizeValue, setSizeValue] = useState("");
  const [sizes, setSizes] = useState([]);

  const [weightValue, setWeightValue] = useState("");
  const [weightUnit, setWeightUnit] = useState("grams");

  const [images, setImages] = useState([]);
  const imageRef = useRef(null);

  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [stock, setStock] = useState("");
  const [brand, setBrand] = useState("");
  const [discount, setDiscount] = useState("");
  const [description, setDescription] = useState("");


  const isEdit = Boolean(productId);


  const [productName, setProductName] = useState("");
  const [slug, setSlug] = useState("");
  const generateSlug = (name) => {
    const baseSlug = name
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const randomNumber = Math.floor(1000 + Math.random() * 9000); // 1000–9999

    return `${baseSlug}-${randomNumber}`;
  };

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

  const handleAddSize = () => {
    if (!sizeValue) return;
    setSizes([...sizes, sizeValue]);
    setSizeValue("");
  };

  const id = JSON.parse(localStorage.getItem("admin"))?.id;
  const handleClose = () => {
    if (isEdit) {
      // 🔹 EDIT MODE → just close modal
      onClose();
    } else {
      // 🔹 CREATE MODE → navigate if you want
      navigate(`/admin/products?id=${id}`);
    }
  };


  /* ================= IMAGE HANDLER ================= */
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (images.length + files.length > 4) {
      alert("Maximum 4 images allowed");
      return;
    }

    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages([...images, ...newImages]);
    imageRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (submitting) return;

    try {
      setSubmitting(true);

      const formData = new FormData();

      formData.append("name", productName || " ");
      formData.append("description", description || "");
      formData.append("category", category || "");
      formData.append("subCategory", subCategory || "");
      formData.append("price", price || "");
      formData.append("oldPrice", oldPrice || "");
      formData.append("stock", stock || "");
      formData.append("brand", brand || "");
      formData.append("discount", discount || "");
      formData.append("rating", rating || 1);
      formData.append("weightValue", weightValue || "");
      formData.append("weightUnit", weightUnit || "");
      formData.append("rams", JSON.stringify(rams || []));
      formData.append("sizes", JSON.stringify(sizes || []));

      // ✅ VERY IMPORTANT
      const existingImages = images
        .filter((img) => !img.file)
        .map((img) => img.url || img.preview);

      formData.append(
        "existingImages",
        JSON.stringify(existingImages)
      );

      // ✅ NEW images
      images.forEach((img) => {
        if (img.file) {
          formData.append("images", img.file);
        }
      });

      const token = localStorage.getItem("token");

      if (isEdit) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/products/${productId}`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        alert("Product updated successfully");
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/products`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        alert("Product created successfully");
      }

      if (typeof onSuccess === "function") {
        onSuccess();
      }
    } catch (err) {
      console.error(err);
      alert("Save failed");
    } finally {
      setSubmitting(false);
    }
    navigate(`/admin/products?id=${id}`);
  };


  const fetchProductById = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/products/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const p = res.data.data;

      setProductName(p.name || "");
      setSlug(p.slug || "");
      setDescription(p.description || "");

      setCategory(p.category || "");
      setSubCategory(p.subCategory || "");

      setPrice(p.price || "");
      setOldPrice(p.oldPrice || "");
      setStock(p.stock || "");
      setBrand(p.brand || "");
      setDiscount(p.discount || "");
      setRating(p.rating || 1);

      setWeightValue(p.weight?.value || "");
      setWeightUnit(p.weight?.unit || "grams");

      setRams(p.rams || []);
      setSizes(p.sizes || []);

      setImages(
        (p.images || []).map((url) => ({
          preview: url,
        }))
      );
    } catch (err) {
      console.error("Fetch product failed", err);
      alert("Failed to load product");
    }
  };


  useEffect(() => {
    if (isEdit && productId) {
      fetchProductById();
    }
  }, [isEdit, productId]);



  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[9999]">
      <div className="
        bg-white
        w-full
        max-w-[95%]
        sm:max-w-[90%]
        lg:max-w-6xl
        h-[95vh]
        sm:h-[90vh]
        rounded-xl
        shadow-xl
        flex
        flex-col
        overflow-hidden
      ">


        {/* ================= HEADER ================= */}

        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b bg-slate-50">

          <h2 className="text-lg font-semibold">
            {isEdit ? "Edit Product" : "Add Product"}
          </h2>

          <button onClick={handleClose} className="p-2 hover:bg-gray-200 rounded">
            <X size={22} />
          </button>
        </div>

        {/* ================= BODY ================= */}
        <div className="
          flex-1
          overflow-y-auto
          px-4
          sm:px-6
          py-4
          sm:py-6
          space-y-6
        ">


          {/* NAME */}
          <div>
            <label className="block text-sm mb-1">Product Name</label>

            <input
              value={productName}
              onChange={(e) => {
                const value = e.target.value;
                setProductName(value);

                // only generate slug in CREATE mode
                if (!isEdit) {
                  setSlug(generateSlug(value));
                }
              }}

              placeholder="Enter product name"
              className="
                    w-full
                    border
                    rounded
                    px-3
                    sm:px-4
                    py-2
                    text-sm
                    sm:text-base
                  "
            />

            {/* SLUG DISPLAY */}
            {slug && (
              <p className="text-xs text-gray-500 mt-1">
                Slug: <span className="text-blue-600">{slug}</span>
              </p>
            )}
          </div>


          {/* DESCRIPTION */}
          <div>
            <label className="block text-sm mb-1">Product Description</label>
            <textarea
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded px-4 py-2 resize-none"
              placeholder="Enter product description"
            />
          </div>

          {/* ================= GRID 3×3 ================= */}
          <div className="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            gap-4
            sm:gap-6
          ">

            <Input
              label="Product Category"
              select
              options={categories}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />


            <Input
              label="Product Sub Category"
              select
              options={subCategories}
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
            />


            <Input
              label="Product Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />

            <Input
              label="Product Old Price"
              value={oldPrice}
              onChange={(e) => setOldPrice(e.target.value)}
            />

            <Input
              label="Product Stock"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />

            <Input
              label="Product Brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />

            <Input
              label="Product Discount"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />


            {/* RAMS */}
            <div>
              <label className="block text-sm mb-1">Product RAMS</label>
              <div className="flex gap-2">
                <input
                  value={ramValue}
                  onChange={(e) => setRamValue(e.target.value)}
                  placeholder="Ex: 8GB"
                  className="flex-1 border rounded px-4 py-2"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!ramValue) return;
                    setRams([...rams, ramValue]);
                    setRamValue("");
                  }}
                  className="bg-[#162A78] text-white px-3 rounded"
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mt-2 max-w-full">

                {rams.map((ram) => (
                  <span key={ram} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                    {ram}
                    <button
                      onClick={() => setRams(rams.filter((r) => r !== ram))}
                      className="ml-1 text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* WEIGHT */}
            <div className="w-full">
              <label className="block text-sm mb-1">Product Weight</label>

              <div className="
                  flex
                  flex-col
                  md:flex-row
                  w-full
                ">
                {/* INPUT */}
                <input
                  type="number"
                  value={weightValue}
                  onChange={(e) => setWeightValue(e.target.value)}
                  placeholder="Enter weight"
                  className="
                    w-full
                    border
                    px-4
                    py-2
                    text-sm
                    rounded-t
                    md:rounded-l
                    md:rounded-t-none
                    md:flex-1
                  "
                />

                {/* SELECT */}
                <select
                  value={weightUnit}
                  onChange={(e) => setWeightUnit(e.target.value)}
                  className="
                    w-full
                    md:w-[120px]
                    border
                    border-t-0
                    md:border-t
                    md:border-l-0
                    px-4
                    py-2
                    text-sm
                    bg-[#162A78]
                    text-white
                    rounded-b
                    md:rounded-r
                    md:rounded-b-none
                  "
                >
                  <option value="grams">grams</option>
                  <option value="kgs">kgs</option>
                  <option value="liters">liters</option>
                  <option value="meters">meters</option>
                  <option value="pieces">pieces</option>
                </select>
              </div>
            </div>


            {/* SIZE (2 COLS) */}
            <div>
              <label className="block text-sm mb-1">Product Size</label>

              <div className="flex gap-2">
                <input
                  value={sizeValue}
                  onChange={(e) => setSizeValue(e.target.value)}
                  placeholder="Ex: S, M, L, XL or 42"
                  className="flex-1 border rounded px-4 py-2"
                />

                <button
                  type="button"
                  onClick={handleAddSize}
                  className="bg-[#162A78] text-white px-3 rounded"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* SHOW VALUES HERE */}
              <div className="flex flex-wrap gap-2 mt-2">
                {sizes.map((s) => (
                  <span
                    key={s}
                    className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => setSizes(sizes.filter((x) => x !== s))}
                      className="text-red-500 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>


            {/* RATING */}
            <div>
              <label className="block text-sm mb-2">Product Rating</label>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={i}
                    onClick={() => setRating(i)}
                    className={`cursor-pointer text-2xl ${i <= rating ? "text-yellow-400" : "text-gray-300"
                      }`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* ================= MEDIA ================= */}
          <div>
            <h3 className="font-semibold mb-3">Media & Images</h3>

            <div className="flex flex-wrap gap-4">
              {images.map((img, i) => (
                <div className="
                    relative
                    w-24 h-24
                    sm:w-28 sm:h-28
                    lg:w-32 lg:h-32
                  ">

                  <img src={img.preview} className="w-full h-full object-cover rounded-lg" />
                  <button
                    onClick={() => setImages(images.filter((_, x) => x !== i))}
                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              {images.length < 4 && (
                <label className="
                    w-24 h-24
                    sm:w-28 sm:h-28
                    lg:w-32 lg:h-32
                    border-2
                    border-dashed
                    rounded-lg
                    flex
                    items-center
                    justify-center
                    cursor-pointer
                  ">

                  <input
                    ref={imageRef}
                    type="file"
                    multiple
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <Upload />
                </label>
              )}
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Upload minimum <b>1</b> image and maximum <b>4</b> images
            </p>
          </div>
        </div>

        {/* ================= FOOTER ================= */}
        <div className="sticky bottom-0 border-t bg-white px-6 py-4">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`
              w-full
              bg-blue-600
              text-white
              py-2.5
              sm:py-3
              rounded-lg
              text-sm
              sm:text-base
              flex
              items-center
              justify-center
              gap-2
              ${submitting ? "opacity-70 cursor-not-allowed" : ""}
            `}
          >
            {submitting ? (
              <>
                {/* Spinner */}
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {isEdit ? "UPDATING..." : "PUBLISHING..."}
              </>
            ) : (
              <>
                <Cloud size={18} />
                {isEdit ? "UPDATE PRODUCT" : "PUBLISH AND VIEW"}
              </>
            )}
          </button>

        </div>

      </div>
    </div>
  );
}

/* ================= INPUT ================= */
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

