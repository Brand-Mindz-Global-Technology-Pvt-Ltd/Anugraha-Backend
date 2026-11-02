import { Upload, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AiOutlineCloseCircle } from "react-icons/ai";

export default function ProductCreate({
  productId,
  onClose,
  onSuccess,
}) {
  const navigate = useNavigate();
  const imageRef = useRef(null);

  const isEdit = Boolean(productId);

  const [submitting, setSubmitting] = useState(false);

  const [productIds, setProductId] = useState("");
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");

  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);

  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  const [status, setStatus] = useState("Active");

  const [images, setImages] = useState([]);

  const adminId =
    JSON.parse(localStorage.getItem("admin"))?.id;

  /* ================= CATEGORY ================= */

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/products/categories`
      );

      if (!isEdit && res.data.productId) {
        setProductId(res.data.productId);
      }

      const formatted = (res.data.data || []).map(
        (cat) => ({
          label: cat.name,
          value: cat.name,
        })
      );

      setCategories(formatted);
    } catch (error) {
      console.error(
        "Category fetch failed:",
        error
      );
    }
  };

  /* ================= IMAGE ================= */

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

    setImages((prev) => [
      ...prev,
      ...newImages,
    ]);

    if (imageRef.current) {
      imageRef.current.value = "";
    }
  };

  const removeImage = (index) => {
    setImages((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  /* ================= CLOSE ================= */

  const handleClose = () => {
    if (isEdit && typeof onClose === "function") {
      onClose();
      return;
    }

    navigate(
      `/admin/products?id=${adminId || ""}`
    );
  };

  /* ================= FETCH EDIT PRODUCT ================= */

  const fetchProductById = async () => {
    try {
      const token =
        localStorage.getItem("token");

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/products/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const product = res.data.data;

      setProductId(
        product.productId || ""
      );

      setProductName(
        product.name || ""
      );

      setDescription(
        product.description || ""
      );

      setCategory(
        product.category || ""
      );

      setBrand(
        product.brand || ""
      );

      setPrice(
        product.price ?? ""
      );

      setStock(
        product.stock ?? ""
      );

      setStatus(
        product.status || "Active"
      );

      setImages(
        (product.images || []).map(
          (url) => ({
            url,
            preview: getImageUrl(url),
          })
        )
      );
    } catch (error) {
      console.error(
        "Fetch product failed:",
        error
      );

      alert("Failed to load product");
    }
  };

  useEffect(() => {
    if (isEdit && productId) {
      fetchProductById();
    }
  }, [isEdit, productId]);

  /* ================= IMAGE URL ================= */

  const getImageUrl = (image) => {
    if (!image) return "";

    if (
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("blob:")
    ) {
      return image;
    }

    const apiUrl =
      import.meta.env.VITE_API_URL ||
      "http://localhost:5000/api/v1";

    const serverUrl =
      apiUrl.replace("/api/v1", "");

    if (image.startsWith("/uploads/")) {
      return `${serverUrl}${image}`;
    }

    return `${serverUrl}/uploads/product/${image}`;
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (submitting) return;

    if (!productName.trim()) {
      alert("Product Name is required");
      return;
    }

    if (!category) {
      alert("Category is required");
      return;
    }

    if (!price) {
      alert("Price is required");
      return;
    }

    if (
      Number(price) < 0 ||
      Number(stock) < 0
    ) {
      alert(
        "Price and stock cannot be negative"
      );
      return;
    }

    if (!isEdit && images.length === 0) {
      alert(
        "Please upload at least one product image"
      );
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();

      if (!isEdit) {
        formData.append(
          "productId",
          productIds
        );
      }

      formData.append(
        "name",
        productName.trim()
      );

      formData.append(
        "description",
        description.trim()
      );

      formData.append(
        "category",
        category
      );

      formData.append(
        "brand",
        brand.trim()
      );

      formData.append(
        "price",
        String(price)
      );

      formData.append(
        "stock",
        String(stock || 0)
      );

      /*
        Status field frontend-la irukku.
        Backend Product model-la status field add pannina
        MongoDB-la save aagum.
      */
      formData.append(
        "status",
        status
      );

      const existingImages = images
        .filter((image) => !image.file)
        .map(
          (image) =>
            image.url || image.preview
        );

      formData.append(
        "existingImages",
        JSON.stringify(existingImages)
      );

      images.forEach((image) => {
        if (image.file) {
          formData.append(
            "images",
            image.file
          );
        }
      });

      const token =
        localStorage.getItem("token");

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type":
            "multipart/form-data",
        },
      };

      if (isEdit) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/products/${productId}`,
          formData,
          config
        );

        alert(
          "Product updated successfully"
        );
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/products`,
          formData,
          config
        );

        alert(
          "Product created successfully"
        );
      }

      if (
        typeof onSuccess === "function"
      ) {
        onSuccess();
      }

      navigate(
        `/admin/products?id=${adminId || ""}`
      );
    } catch (error) {
      console.error(
        "Product save error:",
        error
      );

      if (error.response) {
        alert(
          error.response.data?.message ||
          "Backend Error"
        );
      } else {
        alert(
          error.message ||
          "Unable to save product"
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white w-full h-full flex flex-col overflow-hidden">

        {/* HEADER */}

        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b bg-white">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              {isEdit
                ? "Edit Product"
                : "Add New Product"}
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              {isEdit
                ? "Update product details"
                : "Create a new Anugraha product"}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="text-red-500 hover:bg-red-50 rounded-full p-1"
          >
            <AiOutlineCloseCircle
              size={28}
            />
          </button>
        </div>

        {/* BODY */}

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto"
        >
          <div className="p-6">
            <div className="bg-slate-50 border rounded-2xl p-6">

              {/* ROW 1 */}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Product Name
                  </label>

                  <input
                    value={productName}
                    onChange={(e) =>
                      setProductName(
                        e.target.value
                      )
                    }
                    placeholder="Enter product name"
                    className="w-full border bg-white rounded-lg px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    SKU / Product ID
                  </label>

                  <input
                    value={productIds}
                    onChange={(e) =>
                      setProductId(
                        e.target.value
                      )
                    }
                    readOnly={isEdit}
                    placeholder="e.g. NK-006"
                    className={`w-full border rounded-lg px-4 py-3 outline-none ${isEdit
                        ? "bg-slate-100"
                        : "bg-white"
                      }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Category
                  </label>

                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(
                        e.target.value
                      )
                    }
                    className="w-full border bg-white rounded-lg px-4 py-3 outline-none"
                  >
                    <option value="">
                      Select Category
                    </option>

                    {categories.map(
                      (option) => (
                        <option
                          key={
                            option.value
                          }
                          value={
                            option.value
                          }
                        >
                          {option.label}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* ROW 2 */}

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Supplier / Brand
                  </label>

                  <input
                    value={brand}
                    onChange={(e) =>
                      setBrand(
                        e.target.value
                      )
                    }
                    placeholder="Enter supplier / brand"
                    className="w-full border bg-white rounded-lg px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Price (₹)
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={price}
                    onChange={(e) =>
                      setPrice(
                        e.target.value
                      )
                    }
                    placeholder="Enter price"
                    className="w-full border bg-white rounded-lg px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Status
                  </label>

                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(
                        e.target.value
                      )
                    }
                    className="w-full border bg-white rounded-lg px-4 py-3 outline-none"
                  >
                    <option value="Active">
                      Active
                    </option>

                    <option value="Inactive">
                      Inactive
                    </option>
                  </select>
                </div>

                {/* ROW 3 */}

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Stock
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={stock}
                    onChange={(e) =>
                      setStock(
                        e.target.value
                      )
                    }
                    placeholder="0"
                    className="w-full border bg-white rounded-lg px-4 py-3 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>

                  <textarea
                    rows="3"
                    value={description}
                    onChange={(e) =>
                      setDescription(
                        e.target.value
                      )
                    }
                    placeholder="Enter product description"
                    className="w-full border bg-white rounded-lg px-4 py-3 resize-none outline-none"
                  />
                </div>
              </div>

              {/* IMAGE UPLOAD */}

              <div className="mt-7">
                <label className="block text-sm font-medium mb-3">
                  Product Images
                </label>

                <div className="flex flex-wrap gap-4">

                  {images.map(
                    (image, index) => (
                      <div
                        key={index}
                        className="relative w-28 h-28"
                      >
                        <img
                          src={
                            image.preview
                          }
                          alt="Product"
                          className="w-full h-full object-cover rounded-xl border"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeImage(
                              index
                            )
                          }
                          className="absolute -top-2 -right-2 bg-red-600 text-white p-1.5 rounded-full shadow"
                        >
                          <Trash2
                            size={14}
                          />
                        </button>
                      </div>
                    )
                  )}

                  {images.length < 4 && (
                    <label className="w-28 h-28 border-2 border-dashed border-slate-300 rounded-xl bg-white flex flex-col gap-2 items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
                      <input
                        ref={imageRef}
                        type="file"
                        accept="image/*"
                        multiple
                        hidden
                        onChange={
                          handleImageChange
                        }
                      />

                      <Upload
                        size={25}
                        className="text-slate-600"
                      />

                      <span className="text-xs text-slate-500">
                        Upload
                      </span>
                    </label>
                  )}
                </div>

                <p className="text-xs text-slate-500 mt-3">
                  Minimum 1 image and maximum
                  4 images.
                </p>
              </div>

              {/* BUTTONS */}

              <div className="flex gap-3 mt-8">

                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#d4a13f] hover:bg-[#bd8e32] text-black font-medium px-6 py-3 rounded-lg disabled:opacity-60"
                >
                  {submitting
                    ? isEdit
                      ? "Updating..."
                      : "Saving..."
                    : isEdit
                      ? "Update Product"
                      : "Save Product"}
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  disabled={submitting}
                  className="border bg-white px-6 py-3 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
              </div>

            </div>
          </div>
        </form>
      </div>
    </div>
  );
}