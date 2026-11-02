import { memo, useState } from "react";
import {
  Pencil,
  X,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";
import { useProfile } from "../../../context/ProfileContext";

const DEFAULT_AVATAR = "https://randomuser.me/api/portraits/men/32.jpg";

function ProfileCard({ title = "Profile Overview" }) {
  const { profile, email, changePassword, loading } = useProfile();

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChangePassword = async (e) => {
    if (e) e.preventDefault();
    if (!password || !confirmPassword) {
      alert("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      await changePassword({ newPassword: password, confirmPassword });
      alert("Password updated successfully");
      setPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
    } catch (err) {
      alert(err.message || "Failed to update password");
    }
  };

  const {
    firstName = "",
    lastName = "",
    profileImage,
  } = profile || {};

  const profileImageUrl = profileImage?.url || DEFAULT_AVATAR;
  const fullName = `${firstName} ${lastName}`.trim() || "Administrator";

  return (
    <aside className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
        <h2 className="text-base font-semibold text-slate-800">{title}</h2>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-[#b8860b] border border-[#d4a13f]/30">
          <CheckCircle2 size={12} />
          Active
        </span>
      </div>

      <div className="flex flex-col items-center text-center">
        <div className="relative mb-3">
          <img
            src={profileImageUrl}
            alt="Profile"
            className="h-24 w-24 rounded-full ring-4 ring-[#d4a13f]/30 ring-offset-2 object-cover shadow-sm bg-slate-50"
            onError={(e) => {
              e.currentTarget.src = DEFAULT_AVATAR;
            }}
          />
        </div>

        <h3 className="text-lg font-bold text-slate-800">{fullName}</h3>
        <p className="text-xs font-medium text-[#b8860b] mt-0.5">Anugraha Admin</p>

        <div className="w-full mt-5 pt-4 border-t border-slate-100 space-y-2.5 text-left text-sm">
          <div className="flex items-center gap-2.5 text-slate-600">
            <User size={16} className="text-[#d4a13f] shrink-0" />
            <span className="truncate">{fullName}</span>
          </div>

          <div className="flex items-center gap-2.5 text-slate-600">
            <Mail size={16} className="text-[#d4a13f] shrink-0" />
            <span className="truncate">{email || "admin@anugraha.com"}</span>
          </div>
        </div>
      </div>

      {/* CHANGE PASSWORD */}
      <div className="mt-6 pt-5 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Lock size={15} className="text-[#d4a13f]" /> Change Password
          </span>

          <button
            onClick={() => setShowPasswordForm((p) => !p)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
            aria-label="Toggle change password form"
          >
            {showPasswordForm ? <X size={16} /> : <Pencil size={16} />}
          </button>
        </div>

        {showPasswordForm && (
          <form onSubmit={handleChangePassword} className="mt-4 space-y-3">
            <PasswordInput
              value={password}
              onChange={setPassword}
              show={showPassword}
              toggle={() => setShowPassword((p) => !p)}
              placeholder="New password (min 6 chars)"
            />

            <PasswordInput
              value={confirmPassword}
              onChange={setConfirmPassword}
              show={showConfirmPassword}
              toggle={() => setShowConfirmPassword((p) => !p)}
              placeholder="Confirm new password"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#d4a13f] hover:bg-[#bd8334] py-2 text-sm text-slate-950 font-semibold shadow-sm transition disabled:opacity-60"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </aside>
  );
}

export default memo(ProfileCard);

const PasswordInput = memo(({ value, onChange, show, toggle, placeholder }) => (
  <div className="relative">
    <input
      type={show ? "text" : "password"}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm pr-10 outline-none focus:border-[#d4a13f] focus:ring-2 focus:ring-[#d4a13f]/20 bg-slate-50 focus:bg-white transition"
    />
    <button
      type="button"
      onClick={toggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
      aria-label="Toggle password visibility"
    >
      {show ? <Eye size={16} /> : <EyeOff size={16} />}
    </button>
  </div>
));
