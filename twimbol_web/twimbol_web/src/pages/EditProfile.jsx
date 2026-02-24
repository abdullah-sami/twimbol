import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, updateProfile, logout as logoutUser } from "../api/user.js";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function EditProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    user_phone: "",
    email: "",
    user_address: "",
    user_social_fb: "",
    user_social_twt: "",
    user_social_yt: "",
  });

  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [profilePicFile, setProfilePicFile] = useState(null);

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile();
        const data = Array.isArray(res.data) ? res.data[0] : res.data;
        const user = data.user;
        setProfile(data);
        setUserId(user.id);
        setForm({
          first_name: user.first_name || "",
          last_name: user.last_name || "",
          username: user.username || "",
          user_phone: user.user_phone || "",
          email: user.email || "",
          user_address: user.user_address || "",
          user_social_fb: user.user_social_fb || "",
          user_social_twt: user.user_social_twt || "",
          user_social_yt: user.user_social_yt || "",
        });
        if (user.profile_pic) {
          setProfilePicPreview(
            user.profile_pic.startsWith("http")
              ? user.profile_pic
              : `${BASE_URL}${user.profile_pic}`
          );
        }
        // BASE_URL used above comes from import.meta.env.VITE_API_BASE_URL
      } catch (err) {
        setError("Failed to load profile. Please log in again.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfilePicFile(file);
    setProfilePicPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("first_name", form.first_name);
      formData.append("last_name", form.last_name);
      formData.append("user_phone", form.user_phone);
      formData.append("user_address", form.user_address);
      formData.append("user_social_fb", form.user_social_fb);
      formData.append("user_social_twt", form.user_social_twt);
      formData.append("user_social_yt", form.user_social_yt);
      if (profilePicFile) {
        formData.append("profile_pic", profilePicFile);
      }

      await updateProfile(userId, formData);

      setSuccess("Profile updated successfully!");
      setProfilePicFile(null);
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        const messages = Object.values(data).flat().join(" ");
        setError(messages || "Failed to save changes.");
      } else {
        setError("Failed to save changes. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    if (profile?.user) {
      const user = profile.user;
      setForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        username: user.username || "",
        user_phone: user.user_phone || "",
        email: user.email || "",
        user_address: user.user_address || "",
        user_social_fb: user.user_social_fb || "",
        user_social_twt: user.user_social_twt || "",
        user_social_yt: user.user_social_yt || "",
      });
      setProfilePicFile(null);
      if (user.profile_pic) {
        setProfilePicPreview(
          user.profile_pic.startsWith("http")
            ? user.profile_pic
            : `${BASE_URL}${user.profile_pic}`
        );
      }
    }
    setError("");
    setSuccess("");
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (_) {}
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  const userGroup = profile?.user?.user_group || [];
  const isCreator =
    userGroup.includes("creator") || profile?.user?.user_type === "creator";
  const isAdmin = userGroup.includes("admin");

  if (loading) {
    return (
      <div style={styles.loadingWrapper}>
        <div style={styles.spinner} />
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* ── Left Sidebar ── */}
      <aside style={styles.sidebar}>
        {/* Back to Home */}
        <div style={styles.backRow}>
          <button style={styles.backLink} onClick={() => navigate("/")}>
            ‹ Back to Home
          </button>
        </div>
        {/* Avatar */}
        <div style={styles.avatarSection}>
          <div
            style={styles.avatarWrapper}
            onClick={() => fileInputRef.current?.click()}
            title="Click to change profile picture"
          >
            {profilePicPreview ? (
              <img
                src={profilePicPreview}
                alt="Profile"
                style={styles.avatarImg}
              />
            ) : (
              <div style={styles.avatarPlaceholder}>
                <svg width="56" height="56" viewBox="0 0 24 24" fill="#aaa">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                </svg>
              </div>
            )}
            <div style={styles.avatarOverlay}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M12 15.5A3.5 3.5 0 018.5 12 3.5 3.5 0 0112 8.5a3.5 3.5 0 013.5 3.5 3.5 3.5 0 01-3.5 3.5m7.43-2.92c.04-.36.07-.73.07-1.08s-.03-.73-.07-1.09l2.34-1.83c.21-.16.27-.46.14-.7l-2.22-3.84c-.14-.24-.42-.32-.66-.24l-2.76 1.11c-.58-.44-1.19-.8-1.88-1.07L14 2.42C13.96 2.18 13.74 2 13.5 2h-3c-.24 0-.46.18-.49.42l-.44 2.94c-.69.27-1.3.63-1.88 1.07L4.93 5.32c-.24-.08-.52 0-.66.24L2.05 9.4c-.13.24-.07.54.14.7l2.34 1.83C4.47 12.27 4.44 12.63 4.44 13s.03.73.07 1.08L2.17 15.91c-.21.16-.27.46-.14.7l2.22 3.84c.14.24.42.32.66.24l2.76-1.11c.58.44 1.19.8 1.88 1.07l.44 2.94c.03.24.25.42.49.42h3c.24 0 .46-.18.49-.42l.44-2.94c.69-.27 1.3-.63 1.88-1.07l2.76 1.11c.24.08.52 0 .66-.24l2.22-3.84c.13-.24.07-.54-.14-.7l-2.34-1.83z" />
              </svg>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handlePicChange}
          />
          <h2 style={styles.sidebarName}>
            {form.first_name || form.last_name
              ? `${form.first_name} ${form.last_name}`.trim()
              : form.username || "User"}
          </h2>
          <p style={styles.sidebarRole}>{isAdmin ? "Admin" : isCreator ? "Creator" : "Visitor"}</p>
        </div>

        {/* Nav Items */}
        <nav style={styles.nav}>
          <button style={{ ...styles.navItem, ...styles.navItemActive }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
            Edit Profile
          </button>

          <button
            style={styles.navItem}
            onClick={() => navigate("/creator/dashboard/")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              <path d="M16 3l1.5 1.5L21 1" />
            </svg>
            {isAdmin ? "Creator Dashboard" : isCreator ? "Creator Dashboard" : "Apply for Creator"}
          </button>

          <button
            style={styles.navItem}
            onClick={() =>
              window.open(
                "https://rafidabdullahsamiweb.pythonanywhere.com/privacy-policy/",
                "_blank"
              )
            }
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Privacy &amp; Policy
          </button>

          <button
            style={styles.navItem}
            onClick={() => navigate("/settings/")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
            Settings
          </button>
        </nav>

        {/* Logout */}
        <button style={styles.logoutBtn} onClick={handleLogout}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>
      </aside>

      {/* ── Main Panel ── */}
      <main style={styles.main}>
        {/* Alerts */}
        {error && <div style={styles.alertError}>{error}</div>}
        {success && <div style={styles.alertSuccess}>{success}</div>}

        {/* Personal Information */}
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Personal Information</h3>
          <div style={styles.grid2}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>First Name</label>
              <input
                style={styles.input}
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                placeholder="Enter first name"
              />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Last Name</label>
              <input
                style={styles.input}
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                placeholder="Enter last name"
              />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Username</label>
              <input
                style={{ ...styles.input, ...styles.inputDisabled }}
                name="username"
                value={form.username}
                disabled
                title="Username cannot be changed"
              />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Phone Number</label>
              <input
                style={styles.input}
                name="user_phone"
                value={form.user_phone}
                onChange={handleChange}
                placeholder="e.g. +8801XXXXXXXXX"
              />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                style={{ ...styles.input, ...styles.inputDisabled }}
                name="email"
                value={form.email}
                disabled
                title="Email cannot be changed here"
              />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Address</label>
              <input
                style={styles.input}
                name="user_address"
                value={form.user_address}
                onChange={handleChange}
                placeholder="Enter address"
              />
            </div>
          </div>
        </section>

        {/* Social Media */}
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Social Media</h3>
          <div style={styles.grid3}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Facebook</label>
              <input
                style={styles.input}
                name="user_social_fb"
                value={form.user_social_fb}
                onChange={handleChange}
                placeholder="facebook.com/yourprofile"
              />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Twitter</label>
              <input
                style={styles.input}
                name="user_social_twt"
                value={form.user_social_twt}
                onChange={handleChange}
                placeholder="twitter.com/yourhandle"
              />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Youtube</label>
              <input
                style={styles.input}
                name="user_social_yt"
                value={form.user_social_yt}
                onChange={handleChange}
                placeholder="youtube.com/yourchannel"
              />
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <div style={styles.actions}>
          <button
            style={styles.btnDiscard}
            onClick={handleDiscard}
            disabled={saving}
          >
            Discard Changes
          </button>
          <button
            style={{ ...styles.btnSave, opacity: saving ? 0.7 : 1 }}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        
      </main>
    </div>
  );
}

/* ── Styles ── */
const styles = {
  page: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f0f0f0",
    fontFamily: "'Segoe UI', sans-serif",
    padding: "32px 24px",
    gap: "24px",
    boxSizing: "border-box",
  },
  loadingWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
  },
  spinner: {
    width: 40,
    height: 40,
    border: "4px solid #e0e0e0",
    borderTop: "4px solid #f97316",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },

  // Sidebar
  sidebar: {
    width: 240,
    minWidth: 220,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: "28px 20px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    height: "fit-content",
  },
  avatarSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 28,
  },
  avatarWrapper: {
    width: 90,
    height: 90,
    borderRadius: "50%",
    border: "3px solid #7c3aed",
    overflow: "hidden",
    cursor: "pointer",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e5e7eb",
    marginBottom: 12,
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  avatarPlaceholder: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0,
    transition: "opacity 0.2s",
    // hover handled via CSS class in real app; using title attr for accessibility
  },
  sidebarName: {
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
    color: "#1a1a1a",
    textAlign: "center",
  },
  sidebarRole: {
    margin: "4px 0 0",
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    flex: 1,
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 14px",
    borderRadius: 10,
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
    color: "#374151",
    textAlign: "left",
    transition: "background 0.15s",
  },
  navItemActive: {
    backgroundColor: "#fff7ed",
    border: "1px solid #fed7aa",
    color: "#f97316",
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 14px",
    marginTop: 20,
    borderRadius: 10,
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
    color: "#f97316",
    textAlign: "left",
  },

  // Main
  main: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    border: "2px solid #3b82f6",
    padding: "32px 36px",
    display: "flex",
    flexDirection: "column",
    gap: 32,
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
  },
  section: {},
  sectionTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: "#1a1a1a",
    margin: "0 0 20px",
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px 24px",
  },
  grid3: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "16px 24px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: 500,
    color: "#374151",
  },
  input: {
    padding: "10px 14px",
    borderRadius: 8,
    border: "none",
    backgroundColor: "#e9e9e9",
    fontSize: 14,
    color: "#1a1a1a",
    outline: "none",
    transition: "background 0.15s",
  },
  inputDisabled: {
    backgroundColor: "#f3f4f6",
    color: "#9ca3af",
    cursor: "not-allowed",
  },

  // Actions
  actions: {
    display: "flex",
    gap: 16,
  },
  btnDiscard: {
    flex: 1,
    padding: "14px",
    borderRadius: 12,
    border: "2px solid #7c3aed",
    backgroundColor: "#fff",
    color: "#7c3aed",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
    transition: "background 0.15s",
  },
  btnSave: {
    flex: 1,
    padding: "14px",
    borderRadius: 12,
    border: "none",
    backgroundColor: "#f97316",
    color: "#fff",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
    transition: "opacity 0.15s",
  },

  // Back
  backRow: {
    display: "flex",
    justifyContent: "flex-start",
    marginBottom: 20,
  },
  backLink: {
    background: "none",
    border: "none",
    color: "#f97316",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },

  // Alerts
  alertError: {
    backgroundColor: "#fef2f2",
    border: "1px solid #fca5a5",
    color: "#dc2626",
    borderRadius: 8,
    padding: "12px 16px",
    fontSize: 14,
  },
  alertSuccess: {
    backgroundColor: "#f0fdf4",
    border: "1px solid #86efac",
    color: "#16a34a",
    borderRadius: 8,
    padding: "12px 16px",
    fontSize: 14,
  },
};