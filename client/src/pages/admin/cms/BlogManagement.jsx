import { useCallback, useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { ArrowLeft, ImagePlus, Pencil, Plus, Search, Trash2 } from "lucide-react";
import {
  createBlog,
  deleteBlog,
  fetchAdminBlogs,
  updateBlog,
  updateBlogStatus,
} from "../../../api/blogapi";

const toolbarModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote", "link"],
    [{ align: [] }],
    ["clean"],
  ],
};

const localDateTime = (date = new Date()) => {
  const local = new Date(date);
  local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
  return local.toISOString().slice(0, 16);
};

const emptyBlog = () => ({
  title: "",
  slug: "",
  imageAltText: "",
  category: "",
  shortDescription: "",
  content: "",
  author: "",
  publishDate: localDateTime(),
  status: "draft",
  featuredImage: "",
  metaTitle: "",
  metaDescription: "",
  focusKeyword: "",
  openGraphImage: "",
});

const slugFromTitle = (title) =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const getServerImageUrl = (image) => {
  if (!image || /^https?:\/\//i.test(image)) return image;
  const serverUrl = (import.meta.env.VITE_API_URL || "").replace(/\/api\/v1\/?$/, "");
  return image.startsWith("/") ? `${serverUrl}${image}` : `${serverUrl}/${image}`;
};

const displayDate = (date) => {
  if (!date) return "—";
  const value = new Date(date);
  return Number.isNaN(value.getTime())
    ? "—"
    : value.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
};

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#162A78] focus:ring-2 focus:ring-[#162A78]/10";
const labelClass = "block text-sm font-medium text-slate-700";

export default function BlogManagement() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [form, setForm] = useState(emptyBlog);
  const [featuredImageFile, setFeaturedImageFile] = useState(null);
  const [openGraphImageFile, setOpenGraphImageFile] = useState(null);
  const [featuredPreview, setFeaturedPreview] = useState("");
  const [openGraphPreview, setOpenGraphPreview] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadBlogs = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setBlogs(await fetchAdminBlogs());
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load blogs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBlogs();
  }, [loadBlogs]);

  useEffect(
    () => () => {
      if (featuredPreview.startsWith("blob:")) URL.revokeObjectURL(featuredPreview);
    },
    [featuredPreview]
  );

  useEffect(
    () => () => {
      if (openGraphPreview.startsWith("blob:")) URL.revokeObjectURL(openGraphPreview);
    },
    [openGraphPreview]
  );

  const openNewBlog = () => {
    setEditingBlog(null);
    setForm(emptyBlog());
    setFeaturedImageFile(null);
    setOpenGraphImageFile(null);
    setFeaturedPreview("");
    setOpenGraphPreview("");
    setError("");
    setNotice("");
    setEditorOpen(true);
  };

  const openEditBlog = (blog) => {
    setEditingBlog(blog);
    setForm({
      ...emptyBlog(),
      ...blog,
      publishDate: blog.publishDate ? localDateTime(blog.publishDate) : "",
      metaTitle: blog.seo?.metaTitle || "",
      metaDescription: blog.seo?.metaDescription || "",
      focusKeyword: blog.seo?.focusKeyword || "",
      openGraphImage: blog.seo?.openGraphImage || "",
    });
    setFeaturedImageFile(null);
    setOpenGraphImageFile(null);
    setFeaturedPreview(getServerImageUrl(blog.featuredImage));
    setOpenGraphPreview(getServerImageUrl(blog.seo?.openGraphImage || ""));
    setError("");
    setNotice("");
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditingBlog(null);
    setFeaturedImageFile(null);
    setOpenGraphImageFile(null);
    setFeaturedPreview("");
    setOpenGraphPreview("");
  };

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "title" &&
      (!current.slug || current.slug === slugFromTitle(current.title))
        ? { slug: slugFromTitle(value) }
        : {}),
    }));
  };

  const selectImage = (event, type) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (type === "featured") {
      setFeaturedImageFile(file);
      setFeaturedPreview(URL.createObjectURL(file));
    } else {
      setOpenGraphImageFile(file);
      setOpenGraphPreview(URL.createObjectURL(file));
    }
  };

  const submitBlog = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    if (
      form.status === "published" &&
      !form.content.replace(/<[^>]*>/g, "").trim()
    ) {
      setError("Add blog content before publishing.");
      return;
    }
    if (form.status === "published" && !featuredImageFile && !form.featuredImage) {
      setError("Add a featured image before publishing.");
      return;
    }

    const formData = new FormData();
    [
      "title",
      "slug",
      "imageAltText",
      "category",
      "shortDescription",
      "content",
      "author",
      "publishDate",
      "status",
      "metaTitle",
      "metaDescription",
      "focusKeyword",
    ].forEach((field) => formData.append(field, form[field] || ""));
    if (featuredImageFile) formData.append("featuredImage", featuredImageFile);
    if (openGraphImageFile) formData.append("openGraphImage", openGraphImageFile);

    try {
      setSaving(true);
      if (editingBlog) {
        await updateBlog(editingBlog._id, formData);
        setNotice("Blog updated successfully.");
      } else {
        await createBlog(formData);
        setNotice("Blog created successfully.");
      }
      closeEditor();
      await loadBlogs();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to save this blog.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (blog) => {
    const status = blog.status === "published" ? "draft" : "published";
    setError("");
    setNotice("");
    try {
      await updateBlogStatus(blog._id, status);
      setNotice(status === "published" ? "Blog published." : "Blog moved to drafts.");
      await loadBlogs();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to change blog status.");
    }
  };

  const handleDelete = async (blog) => {
    if (!window.confirm(`Delete "${blog.title}"? This cannot be undone.`)) return;
    setError("");
    setNotice("");
    try {
      await deleteBlog(blog._id);
      setBlogs((current) => current.filter((item) => item._id !== blog._id));
      setNotice("Blog deleted.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to delete this blog.");
    }
  };

  const filteredBlogs = blogs.filter((blog) =>
    `${blog.title} ${blog.category} ${blog.slug}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  if (editorOpen) {
    return (
      <div className="mx-auto max-w-6xl space-y-5 p-3 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={closeEditor}
              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
              aria-label="Back to blogs"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                {editingBlog ? "Edit Blog" : "Add Blog"}
              </h1>
              <p className="text-sm text-slate-500">Manage blog content and search settings</p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeEditor}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>

        {error && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={submitBlog} className="space-y-5">
          <section className="rounded-xl bg-white p-4 shadow-sm sm:p-6">
            <h2 className="mb-5 text-lg font-semibold text-slate-900">Blog Details</h2>
            <div className="grid gap-5 md:grid-cols-2">
              <label className={labelClass}>
                Blog Title *
                <input
                  className={inputClass}
                  value={form.title}
                  onChange={(event) => updateField("title", event.target.value)}
                  maxLength={200}
                  required
                />
              </label>
              <label className={labelClass}>
                URL Slug *
                <input
                  className={inputClass}
                  value={form.slug}
                  onChange={(event) => updateField("slug", event.target.value)}
                  maxLength={180}
                  required
                />
              </label>
              <label className={labelClass}>
                Blog Category *
                <input
                  className={inputClass}
                  value={form.category}
                  onChange={(event) => updateField("category", event.target.value)}
                  maxLength={100}
                  required
                />
              </label>
              <label className={labelClass}>
                Author
                <input
                  className={inputClass}
                  value={form.author}
                  onChange={(event) => updateField("author", event.target.value)}
                  maxLength={100}
                />
              </label>
              <label className={labelClass}>
                Publish Date
                <input
                  type="datetime-local"
                  className={inputClass}
                  value={form.publishDate}
                  onChange={(event) => updateField("publishDate", event.target.value)}
                />
              </label>
              <label className={labelClass}>
                Status
                <select
                  className={inputClass}
                  value={form.status}
                  onChange={(event) => updateField("status", event.target.value)}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </label>
              <label className={`${labelClass} md:col-span-2`}>
                Short Description
                <textarea
                  className={inputClass}
                  rows={3}
                  maxLength={500}
                  value={form.shortDescription}
                  onChange={(event) => updateField("shortDescription", event.target.value)}
                />
              </label>
            </div>
          </section>

          <section className="rounded-xl bg-white p-4 shadow-sm sm:p-6">
            <h2 className="mb-5 text-lg font-semibold text-slate-900">Featured Image</h2>
            <div className="grid gap-5 md:grid-cols-2">
              <label className={labelClass}>
                Upload Featured Image
                <span className="mt-1 flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 p-4 text-center text-sm text-slate-500 hover:border-[#162A78]">
                  <ImagePlus size={22} className="mb-2" />
                  Choose an image (max 5 MB)
                  <input
                    className="sr-only"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                    onChange={(event) => selectImage(event, "featured")}
                  />
                </span>
                {featuredPreview && (
                  <img
                    src={featuredPreview}
                    alt={form.imageAltText || "Featured image preview"}
                    className="mt-3 h-40 w-full rounded-lg object-cover"
                  />
                )}
              </label>
              <label className={labelClass}>
                Image Alt Text
                <input
                  className={inputClass}
                  value={form.imageAltText}
                  onChange={(event) => updateField("imageAltText", event.target.value)}
                  maxLength={200}
                />
              </label>
            </div>
          </section>

          <section className="rounded-xl bg-white p-4 shadow-sm sm:p-6">
            <h2 className="mb-2 text-lg font-semibold text-slate-900">Blog Content</h2>
            <p className="mb-4 text-sm text-slate-500">Format the article using the editor toolbar.</p>
            <ReactQuill
              theme="snow"
              value={form.content}
              onChange={(value) => updateField("content", value)}
              modules={toolbarModules}
              className="blog-content-editor"
            />
          </section>

          <section className="rounded-xl bg-white p-4 shadow-sm sm:p-6">
            <h2 className="mb-5 text-lg font-semibold text-slate-900">SEO Settings</h2>
            <div className="grid gap-5 md:grid-cols-2">
              <label className={labelClass}>
                Meta Title
                <input
                  className={inputClass}
                  value={form.metaTitle}
                  onChange={(event) => updateField("metaTitle", event.target.value)}
                  maxLength={200}
                />
              </label>
              <label className={labelClass}>
                Focus Keyword
                <input
                  className={inputClass}
                  value={form.focusKeyword}
                  onChange={(event) => updateField("focusKeyword", event.target.value)}
                  maxLength={100}
                />
              </label>
              <label className={`${labelClass} md:col-span-2`}>
                Meta Description
                <textarea
                  className={inputClass}
                  rows={3}
                  value={form.metaDescription}
                  onChange={(event) => updateField("metaDescription", event.target.value)}
                  maxLength={500}
                />
              </label>
              <label className={`${labelClass} md:col-span-2`}>
                SEO-friendly Slug
                <input
                  className={inputClass}
                  value={form.slug}
                  onChange={(event) => updateField("slug", event.target.value)}
                  maxLength={180}
                />
                <span className="mt-1 block font-normal text-slate-500">
                  This is the same public URL slug shown above: /blogs/{form.slug || "your-blog-slug"}
                </span>
              </label>
              <div>
                <span className={labelClass}>Open Graph Image</span>
                <label className="mt-1 flex min-h-24 cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 p-4 text-sm text-slate-500 hover:border-[#162A78]">
                  <ImagePlus size={20} />
                  Choose an image (max 5 MB)
                  <input
                    className="sr-only"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                    onChange={(event) => selectImage(event, "openGraph")}
                  />
                </label>
                {openGraphPreview && (
                  <img
                    src={openGraphPreview}
                    alt="Open Graph preview"
                    className="mt-3 h-32 w-full rounded-lg object-cover"
                  />
                )}
              </div>
            </div>
          </section>

          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={closeEditor}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#162A78] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#10215f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : editingBlog ? "Save Changes" : "Save Blog"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-3 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Blog Management</h1>
          <p className="mt-1 text-sm text-slate-500">Create and manage customer-facing blog posts.</p>
        </div>
        <button
          type="button"
          onClick={openNewBlog}
          className="inline-flex items-center gap-2 rounded-lg bg-[#162A78] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#10215f]"
        >
          <Plus size={18} />
          Add Blog
        </button>
      </div>

      {notice && (
        <div role="status" className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {notice}
        </div>
      )}
      {error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
          <h2 className="font-semibold text-slate-900">All Blogs <span className="text-sm font-normal text-slate-500">({blogs.length})</span></h2>
          <label className="relative w-full sm:max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#162A78]"
              placeholder="Search title, category or slug"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Blog</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Publish Date</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="5" className="px-4 py-10 text-center text-slate-500">Loading blogs...</td></tr>
              ) : filteredBlogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-10 text-center text-slate-500">
                    {blogs.length ? "No blogs match your search." : "No blogs yet. Add your first blog to get started."}
                  </td>
                </tr>
              ) : (
                filteredBlogs.map((blog) => (
                  <tr key={blog._id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {blog.featuredImage ? (
                          <img
                            src={getServerImageUrl(blog.featuredImage)}
                            alt={blog.imageAltText || ""}
                            className="h-12 w-16 rounded-md object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-16 items-center justify-center rounded-md bg-slate-100 text-slate-400">
                            <ImagePlus size={18} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-900">{blog.title}</p>
                          <p className="truncate text-xs text-slate-500">/blogs/{blog.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{blog.category}</td>
                    <td className="px-4 py-3 text-slate-600">{displayDate(blog.publishDate)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        blog.status === "published"
                          ? "bg-green-50 text-green-700"
                          : "bg-amber-50 text-amber-700"
                      }`}>
                        {blog.status === "published" ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(blog)}
                          className="rounded-md px-2.5 py-2 text-xs font-medium text-[#162A78] hover:bg-blue-50"
                        >
                          {blog.status === "published" ? "Move to Draft" : "Publish"}
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditBlog(blog)}
                          className="rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-[#162A78]"
                          aria-label={`Edit ${blog.title}`}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(blog)}
                          className="rounded-md p-2 text-red-600 hover:bg-red-50"
                          aria-label={`Delete ${blog.title}`}
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
      </section>
    </div>
  );
}
