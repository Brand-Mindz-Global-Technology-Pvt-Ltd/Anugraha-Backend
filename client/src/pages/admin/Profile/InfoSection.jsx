import { useState, useEffect } from "react";
import {
  Pencil,
  Save,
  X,
  User,
  Mail,
  Phone,
  Camera,
  ShieldCheck,
} from "lucide-react";
import { useProfile } from "../../../context/ProfileContext";

const DEFAULT_AVATAR = "https://randomuser.me/api/portraits/men/32.jpg";

const FIELD_TEMPLATE = [
  { key: "profileImage", label: "Profile Image", type: "image", value: "" },
  { key: "firstName", label: "First Name", value: "", icon: User, required: true },
  { key: "lastName", label: "Last Name", value: "", icon: User },
  { key: "email", label: "Email Address", value: "", icon: Mail, readOnly: true },
  { key: "phone", label: "Phone Number (optional)", value: "", icon: Phone },
];

export default function InfoSection({ title = "Personal Information" }) {
  const { profile, email, updateProfile, loading } = useProfile();
  const [editMode, setEditMode] = useState(false);
  const [fields, setFields] = useState(FIELD_TEMPLATE);

  useEffect(() => {
    setFields((prev) =>
      prev.map((field) => {
        let value = "";
        if (field.key === "profileImage") {
          value = profile?.profileImage?.url || "";
        } else if (field.key === "email") {
          value = email || "";
        } else if (field.key in (profile || {})) {
          value = profile[field.key] || "";
        }
        return { ...field, value, file: null };
      })
    );
  }, [profile, email]);

  const handleChange = (index, value) => {
    setFields((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], value };
      return updated;
    });
  };

  const handleImageChange = (index, file) => {
    if (!file || !file.type.startsWith("image/")) return;

    setFields((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        value: URL.createObjectURL(file),
        file,
      };
      return updated;
    });
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      const formData = new FormData();

      fields.forEach((field) => {
        if (field.key === "profileImage" && field.file) {
          formData.append("profileImage", field.file);
        } else if (field.key !== "email" && field.key !== "profileImage") {
          formData.append(field.key, field.value || "");
        }
      });

      const result = await updateProfile(formData);

      // After a successful save, immediately sync the image field from the
      // updated profile returned by the server (resolves browser caching and
      // stale blob-URL issues). The context normalizeProfile already made the
      // URL absolute with a cache-bust timestamp, so read from context.profile.
      // Also check the raw API response as a fallback.
      const updatedImageUrl =
        result?.data?.profile?.profileImage?.url ||
        result?.data?.profileImage?.url ||
        null;

      setFields((prev) =>
        prev.map((field) => {
          if (field.key === "profileImage" && updatedImageUrl) {
            return { ...field, value: updatedImageUrl, file: null };
          }
          return { ...field, file: null };
        })
      );

      setEditMode(false);
      alert("Profile updated successfully");
    } catch (err) {
      alert(err.message || "Failed to update profile");
    }
  };

  const handleCancel = () => {
    setFields((prev) =>
      prev.map((field) => {
        let value = "";
        if (field.key === "profileImage") {
          value = profile?.profileImage?.url || "";
        } else if (field.key === "email") {
          value = email || "";
        } else if (field.key in (profile || {})) {
          value = profile[field.key] || "";
        }
        return { ...field, value, file: null };
      })
    );
    setEditMode(false);
  };

  return (
    <section className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200/80">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-6 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Update your account details and contact information
          </p>
        </div>

        <div>
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-[#b8860b] border border-[#d4a13f] hover:bg-[#d4a13f]/10 transition"
            >
              <Pencil size={15} /> Edit Profile
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-100 transition"
              >
                <X size={15} /> Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-lg px-5 py-2 text-sm font-semibold text-slate-950 bg-[#d4a13f] hover:bg-[#bd8334] shadow-sm transition disabled:opacity-60"
              >
                <Save size={15} />
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* FORM BODY */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {fields.map((field, idx) => {
            const Icon = field.icon;

            if (field.type === "image") {
              return (
                <div
                  key={field.key}
                  className="md:col-span-2 p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between flex-wrap gap-4"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={field.value || DEFAULT_AVATAR}
                      alt="Profile Preview"
                      className="w-16 h-16 rounded-full object-cover ring-2 ring-[#d4a13f]/40 border-2 border-white shadow-sm bg-white"
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_AVATAR;
                      }}
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {field.label}
                      </p>
                      <p className="text-xs text-slate-400">
                        Square format recommended (JPG, PNG, max 5MB)
                      </p>
                    </div>
                  </div>

                  {editMode && (
                    <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#d4a13f] text-[#b8860b] hover:bg-[#d4a13f]/10 text-xs font-semibold cursor-pointer transition">
                      <Camera size={14} />
                      Upload New Photo
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) =>
                          handleImageChange(idx, e.target.files[0])
                        }
                      />
                    </label>
                  )}
                </div>
              );
            }

            return (
              <div key={field.key} className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>

                <div className="relative">
                  {Icon && (
                    <Icon
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  )}
                  <input
                    type={field.key === "email" ? "email" : "text"}
                    value={field.value}
                    readOnly={!editMode || field.readOnly}
                    onChange={(e) => handleChange(idx, e.target.value)}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    className={`w-full rounded-lg border px-3.5 py-2.5 text-sm transition outline-none ${
                      Icon ? "pl-10" : ""
                    } ${
                      field.readOnly
                        ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed"
                        : editMode
                        ? "bg-white border-slate-300 text-slate-900 focus:border-[#d4a13f] focus:ring-2 focus:ring-[#d4a13f]/20"
                        : "bg-slate-50 text-slate-700 border-slate-200 cursor-default"
                    }`}
                  />
                  {field.readOnly && (
                    <ShieldCheck
                      size={16}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  )}
                </div>

                {field.readOnly && (
                  <p className="text-[11px] text-slate-400">
                    Primary email is locked for account security
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* BOTTOM SAVE BUTTON WHEN IN EDIT MODE */}
        {editMode && (
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-slate-950 bg-[#d4a13f] hover:bg-[#bd8334] shadow-sm transition disabled:opacity-60"
            >
              <Save size={16} />
              {loading ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        )}
      </form>
    </section>
  );
}
