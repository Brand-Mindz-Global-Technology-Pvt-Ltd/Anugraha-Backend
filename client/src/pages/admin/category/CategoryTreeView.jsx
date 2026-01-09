
// src/components/CategoryTreeView.jsx
import { useState } from "react";
import { ChevronDown, FolderTree } from "lucide-react";
import { useCategoryContext } from "../../../context/CategoryContext";
import CategoryTreeItem from "./CategoryTreeItem";

const CategoryTreeView = ({ onSelectCategory, selectedCategory }) => {
  const { categories, deleteCategory } = useCategoryContext();
  const [expandedParents, setExpandedParents] = useState({});

  const toggleParent = (id) => {
    setExpandedParents((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDelete = async (cat, e) => {
    e?.stopPropagation();
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${cat.name}"?`
    );
    if (!confirmDelete) return;
    await deleteCategory(cat._id || cat.id);
  };

  return (
    <section className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
      <div className="flex items-center gap-2 mb-4">
        <FolderTree className="text-blue-600 w-5 h-5" />
        <h2 className="font-semibold text-lg">Category Tree View</h2>
      </div>

      <div className="bg-slate-50 rounded-lg px-3 py-2.5 flex justify-between items-center mb-3">
        <span className="text-sm font-medium text-slate-700">All Categories</span>
        <ChevronDown size={16} className="text-slate-400" />
      </div>

      <div className="max-h-[550px] overflow-y-auto pr-2">
        {categories.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No categories found. Create your first category!
          </div>
        ) : (
          <ul className="space-y-1">
            {categories.map((cat) => (
              <CategoryTreeItem
                key={cat._id || cat.id}
                cat={cat}
                expandedParents={expandedParents}
                toggleParent={toggleParent}
                onSelect={onSelectCategory}
                onDelete={handleDelete}
                selectedCategory={selectedCategory}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default CategoryTreeView;