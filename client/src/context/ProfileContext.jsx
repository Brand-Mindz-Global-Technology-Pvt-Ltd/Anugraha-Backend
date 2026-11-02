import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { profileAPI } from "../api/profileapi.js";

const SERVER_ORIGIN = import.meta.env.VITE_API_URL
  ? new URL(import.meta.env.VITE_API_URL).origin
  : "";

/**
 * Ensure relative image URLs are absolute so <img> resolves against the
 * API server origin (e.g. http://localhost:5000), not the frontend dev
 * server (e.g. http://localhost:5173).
 * Also appends a cache-bust timestamp so the browser fetches the new image
 * instead of showing the old cached version.
 */
function normalizeProfile(profile, bustCache = false) {
  if (!profile) return {};
  const img = profile.profileImage;
  if (img?.url && img.url.startsWith("/")) {
    const cacheSuffix = bustCache ? `?t=${Date.now()}` : "";
    return {
      ...profile,
      profileImage: {
        ...img,
        url: `${SERVER_ORIGIN}${img.url}${cacheSuffix}`,
      },
    };
  }
  return profile;
}

const ProfileContext = createContext(null);
export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error("useProfile must be used within ProfileProvider");
    }
    return context;
};
export const ProfileProvider = ({ children }) => {
    const [profile, setProfile] = useState({});
    const [email, setEmail] = useState("");
    const [role, setrole] = useState("");
    const [username, setusername] = useState("")
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Get admin info from localStorage
    const getAdminInfo = () => {
        const adminRaw = localStorage.getItem("admin");
        const token = localStorage.getItem("token");
        const admin = adminRaw ? JSON.parse(adminRaw) : null;
        return { adminId: admin?.id, token };
    };

    // Fetch profile data
    const fetchProfile = useCallback(async () => {
        const { adminId, token } = getAdminInfo();
        if (!adminId || !token) return;

        try {
            setLoading(true);
            setError(null);
            const data = await profileAPI.getProfile(adminId);
            setProfile(normalizeProfile(data.profile || {}));
            setEmail(data.email || "");
            setrole(data.role || "")
            setusername(data.profile?.firstName + " " + data.profile?.lastName || "")
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch profile");
            console.error("Profile fetch error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Update profile
    const updateProfile = async (formData) => {
        const { adminId } = getAdminInfo();
        if (!adminId) throw new Error("Admin ID not found");

        try {
            setLoading(true);
            setError(null);
            const data = await profileAPI.updateProfile(adminId, formData);
            // Normalize image URL and bust cache so browser fetches the new image
            setProfile(normalizeProfile(data.profile || {}, true));
            setEmail(data.email || email);
            return { success: true, data };
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to update profile";
            setError(errorMsg);
            throw new Error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // Change password
    const changePassword = async (passwordData) => {
        const { adminId } = getAdminInfo();
        if (!adminId) throw new Error("Admin ID not found");

        try {
            setLoading(true);
            setError(null);
            await profileAPI.changePassword(adminId, passwordData);
            await fetchProfile(); 
            return { success: true };
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to change password";
            setError(errorMsg);
            throw new Error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const value = {
        profile,
        email,
        loading,
        error,
        role,
        username,
        fetchProfile,
        updateProfile,
        changePassword,
    };

    return (
        <ProfileContext.Provider value={value}>
            {children}
        </ProfileContext.Provider>
    );
};
