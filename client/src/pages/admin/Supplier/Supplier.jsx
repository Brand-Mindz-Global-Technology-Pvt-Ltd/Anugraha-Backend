import { useEffect, useState } from "react";
import axios from "axios";
import {
    Plus,
    Pencil,
    Trash2,
    X,
    Star,
} from "lucide-react";

const API_URL = `${import.meta.env.VITE_API_URL}/suppliers`;

const emptyForm = {
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    rating: 0,
    status: "active",
};

export default function Supplier() {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [openModal, setOpenModal] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState(emptyForm);

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            setLoading(true);

            const res = await axios.get(API_URL);

            setSuppliers(
                Array.isArray(res.data?.data)
                    ? res.data.data
                    : []
            );
        } catch (error) {
            console.error(
                "Supplier fetch error:",
                error
            );

            alert("Failed to load suppliers");
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setEditingId(null);
        setForm(emptyForm);
        setOpenModal(true);
    };

    const openEditModal = (supplier) => {
        setEditingId(supplier._id);

        setForm({
            name: supplier.name || "",
            contactPerson:
                supplier.contactPerson || "",
            email: supplier.email || "",
            phone: supplier.phone || "",
            rating: supplier.rating || 0,
            status:
                supplier.status || "active",
        });

        setOpenModal(true);
    };

    const closeModal = () => {
        if (saving) return;

        setOpenModal(false);
        setEditingId(null);
        setForm(emptyForm);
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

        if (!form.name.trim()) {
            alert("Supplier name is required");
            return;
        }

        try {
            setSaving(true);

            const payload = {
                name: form.name.trim(),
                contactPerson:
                    form.contactPerson.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                rating: Number(form.rating) || 0,
                status: form.status,
            };

            if (editingId) {
                await axios.put(
                    `${API_URL}/${editingId}`,
                    payload
                );

                alert(
                    "Supplier updated successfully"
                );
            } else {
                await axios.post(
                    API_URL,
                    payload
                );

                alert(
                    "Supplier created successfully"
                );
            }

            closeModal();
            fetchSuppliers();
        } catch (error) {
            console.error(
                "Supplier save error:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to save supplier"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        const confirmed =
            window.confirm(
                "Are you sure you want to delete this supplier?"
            );

        if (!confirmed) return;

        try {
            await axios.delete(
                `${API_URL}/${id}`
            );

            fetchSuppliers();
        } catch (error) {
            console.error(
                "Supplier delete error:",
                error
            );

            alert(
                "Failed to delete supplier"
            );
        }
    };

    return (
        <div className="p-2 bg-slate-50 min-h-screen">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">

                {/* HEADER */}

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">
                            Supplier Management
                        </h1>

                        <p className="text-sm text-slate-500 mt-1">
                            {suppliers.length} suppliers
                        </p>
                    </div>

                    <button
                        onClick={openAddModal}
                        className="flex items-center justify-center gap-2 bg-[#d4a13f] hover:bg-[#bd8e32] text-black font-medium px-5 py-3 rounded-lg"
                    >
                        <Plus size={18} />
                        Add Supplier
                    </button>
                </div>

                {/* TABLE */}

                <div className="border rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[850px] text-sm">

                            <thead className="bg-slate-50 text-slate-600">
                                <tr>
                                    <th className="p-4 text-left">
                                        Supplier Name
                                    </th>

                                    <th className="p-4 text-left">
                                        Contact Person
                                    </th>

                                    <th className="p-4 text-left">
                                        Email & Phone
                                    </th>

                                    <th className="p-4 text-center">
                                        Rating
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
                                            colSpan="6"
                                            className="text-center py-10 text-slate-400"
                                        >
                                            Loading suppliers...
                                        </td>
                                    </tr>
                                ) : suppliers.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="text-center py-10 text-slate-400"
                                        >
                                            No suppliers found.
                                        </td>
                                    </tr>
                                ) : (
                                    suppliers.map(
                                        (supplier) => (
                                            <tr
                                                key={supplier._id}
                                                className="hover:bg-slate-50"
                                            >
                                                <td className="p-4">
                                                    <div className="font-semibold text-slate-800">
                                                        {supplier.name}
                                                    </div>
                                                </td>

                                                <td className="p-4 text-slate-600">
                                                    {supplier.contactPerson ||
                                                        "—"}
                                                </td>

                                                <td className="p-4">
                                                    <div className="text-slate-700">
                                                        {supplier.email ||
                                                            "—"}
                                                    </div>

                                                    <div className="text-xs text-slate-400 mt-1">
                                                        {supplier.phone ||
                                                            ""}
                                                    </div>
                                                </td>

                                                <td className="p-4 text-center">
                                                    <div className="inline-flex items-center gap-1">
                                                        <Star
                                                            size={15}
                                                            className="text-amber-500 fill-amber-500"
                                                        />

                                                        <span className="font-medium">
                                                            {supplier.rating ||
                                                                0}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="p-4 text-center">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${supplier.status ===
                                                                "active"
                                                                ? "bg-emerald-100 text-emerald-700"
                                                                : "bg-slate-200 text-slate-600"
                                                            }`}
                                                    >
                                                        {supplier.status}
                                                    </span>
                                                </td>

                                                <td className="p-4">
                                                    <div className="flex justify-center gap-2">

                                                        <button
                                                            onClick={() =>
                                                                openEditModal(
                                                                    supplier
                                                                )
                                                            }
                                                            className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                                                            title="Edit"
                                                        >
                                                            <Pencil
                                                                size={16}
                                                            />
                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    supplier._id
                                                                )
                                                            }
                                                            className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                                                            title="Delete"
                                                        >
                                                            <Trash2
                                                                size={16}
                                                            />
                                                        </button>

                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    )
                                )}

                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ADD / EDIT MODAL */}

            {openModal && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

                    <form
                        onSubmit={handleSave}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-xl"
                    >

                        {/* MODAL HEADER */}

                        <div className="flex items-center justify-between px-6 py-4 border-b">
                            <div>
                                <h2 className="text-xl font-semibold">
                                    {editingId
                                        ? "Edit Supplier"
                                        : "Add Supplier"}
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* FORM */}

                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Supplier Name
                                </label>

                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Enter supplier name"
                                    className="w-full border rounded-lg px-4 py-3 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Contact Person
                                </label>

                                <input
                                    name="contactPerson"
                                    value={
                                        form.contactPerson
                                    }
                                    onChange={handleChange}
                                    placeholder="Enter contact person"
                                    className="w-full border rounded-lg px-4 py-3 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Email
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="Enter email"
                                    className="w-full border rounded-lg px-4 py-3 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Phone
                                </label>

                                <input
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    placeholder="Enter phone"
                                    className="w-full border rounded-lg px-4 py-3 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Rating
                                </label>

                                <select
                                    name="rating"
                                    value={form.rating}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg px-4 py-3 outline-none"
                                >
                                    <option value="0">
                                        0
                                    </option>
                                    <option value="1">
                                        1
                                    </option>
                                    <option value="2">
                                        2
                                    </option>
                                    <option value="3">
                                        3
                                    </option>
                                    <option value="4">
                                        4
                                    </option>
                                    <option value="5">
                                        5
                                    </option>
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
                                    className="w-full border rounded-lg px-4 py-3 outline-none"
                                >
                                    <option value="active">
                                        Active
                                    </option>

                                    <option value="inactive">
                                        Inactive
                                    </option>
                                </select>
                            </div>

                        </div>

                        {/* MODAL FOOTER */}

                        <div className="flex justify-end gap-3 px-6 py-4 border-t">

                            <button
                                type="button"
                                onClick={closeModal}
                                className="border px-5 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-[#d4a13f] hover:bg-[#bd8e32] px-5 py-2.5 rounded-lg font-medium disabled:opacity-60"
                            >
                                {saving
                                    ? "Saving..."
                                    : editingId
                                        ? "Update Supplier"
                                        : "Save Supplier"}
                            </button>

                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}