

// src/components/CategoryForm.jsx
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useCategoryContext } from "../../../context/CategoryContext";

const CategoryForm = ({ selectedCategory, onSuccess, onCancel }) => {
  const { categories, loading, createCategory, updateCategory } = useCategoryContext();

  const generateSlug = (value) =>
    value.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const capitalizeFirstLetter = (value = "") => {
    if (!value) return "";
    return value[0].toUpperCase() + value.slice(1);
  };

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    parentId: "",
    status: "active",
    metaTitle: "",
    image: null,
    imagePreview: "",
  });

  // Update form when selectedCategory changes
  useEffect(() => {
    if (selectedCategory) {
      setFormData({
        name: selectedCategory.name,
        slug: generateSlug(selectedCategory.name),
        parentId: selectedCategory.parentId || "",
        status: selectedCategory.status || "active",
        metaTitle: selectedCategory.metaTitle || "",
        image: null,
        imagePreview: selectedCategory.image?.url || "",
      });
    } else {
      // Reset form completely when no category is selected
      setFormData({
        name: "",
        slug: "",
        parentId: "",
        status: "active",
        metaTitle: "",
        image: null,
        imagePreview: "",
      });
    }
  }, [selectedCategory]);

  // Auto-generate slug from name (but don't trigger on initial mount)
  useEffect(() => {
    if (formData.name) {
      setFormData((prev) => ({ ...prev, slug: generateSlug(prev.name) }));
    }
  }, [formData.name]);

  // Flatten categories for dropdown
  const flattenCategories = (cats, level = 0) => {
    let result = [];
    cats.forEach((cat) => {
      result.push({ ...cat, level });
      if (cat.children?.length) {
        result = [...result, ...flattenCategories(cat.children, level + 1)];
      }
    });
    return result;
  };

  const flatCategories = flattenCategories(categories);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image" && files[0]) {
      setFormData((prev) => ({
        ...prev,
        image: files[0],
        imagePreview: URL.createObjectURL(files[0]),
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert("Category name is required");
      return;
    }

    const categoryData = {
      name: formData.name,
      slug: formData.slug,
      parentId: formData.parentId || null,
      status: formData.status,
      metaTitle: formData.metaTitle,
      image: formData.image,
    };

    let success;
    if (selectedCategory) {
      success = await updateCategory(selectedCategory._id || selectedCategory.id, categoryData);
    } else {
      success = await createCategory(categoryData);
    }

    if (success) {
      // Reset form after successful creation
      setFormData({
        name: "",
        slug: "",
        parentId: "",
        status: "active",
        metaTitle: "",
        image: null,
        imagePreview: "",
      });
      onSuccess();
    }
  };

  return (
    <section className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center gap-2 mb-6">
        <Plus className="text-blue-600 w-5 h-5" />
        <h2 className="font-semibold text-lg">
          {selectedCategory ? "Edit Category" : "Create Category"}
        </h2>
      </div>

      <div className="space-y-5 max-h-[550px] overflow-y-auto p-2">
        {/* Category Name */}
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">
            Category Name
          </label>
          <input
            name="name"
            value={formData.name}
            onChange={(e) => {
              const value = e.target.value;
              setFormData((prev) => ({
                ...prev,
                name: capitalizeFirstLetter(value),
              }));
            }}
            placeholder="e.g., Electronics"
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">
            Slug
          </label>
          <input
            value={formData.slug}
            disabled
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-slate-50 text-slate-500"
          />
        </div>

        {/* Parent Category */}
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">
            Parent Category
          </label>
          <select
            name="parentId"
            value={formData.parentId}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Create New Category</option>
            {flatCategories
              .filter((c) => c.level === 0)
              .map((c) => (
                <option
                  key={c._id || c.id}
                  value={c._id || c.id}
                  disabled={c._id === selectedCategory?._id}
                >
                  {c.name}
                </option>
              ))}
          </select>
        </div>

        {/* Image Upload */}
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">
            Image Upload
          </label>
          <label className="mt-2 flex items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-8 cursor-pointer text-slate-500 hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <input
              type="file"
              name="image"
              accept="image/*"
              className="hidden"
              onChange={handleChange}
            />
            <span className="text-sm">
              Image Upload here or{" "}
              <span className="text-blue-600 font-medium">browse</span>
            </span>
          </label>

          {formData.imagePreview && (
            <div className="mt-3 flex items-center gap-3">
              <img
                src={formData.imagePreview}
                alt="Preview"
                className="w-20 h-20 object-contain border border-slate-200 rounded-lg p-2"
              />
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    image: null,
                    imagePreview: "",
                  }))
                }
                className="text-xs text-red-500 hover:text-red-600"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Status */}
        <div className="flex items-center justify-between py-2">
          <span className="text-sm font-medium text-slate-700">Status</span>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="status"
                value="active"
                checked={formData.status === "active"}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 accent-blue-600"
              />
              <span className="text-slate-700">Active</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="status"
                value="inactive"
                checked={formData.status === "inactive"}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 accent-blue-600"
              />
              <span className="text-slate-700">Inactive</span>
            </label>
          </div>
        </div>

        {/* Meta Title */}
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">
            Meta Title
          </label>
          <input
            name="metaTitle"
            value={formData.metaTitle}
            onChange={handleChange}
            placeholder="SEO friendly title"
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors disabled:bg-blue-400"
          >
            {loading ? "Processing..." : selectedCategory ? "Update" : "Save"} Category
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-2.5 rounded-lg font-medium text-sm transition-colors disabled:bg-slate-100"
          >
            Cancel
          </button>
        </div>
      </div>
    </section>
  );
};

export default CategoryForm;