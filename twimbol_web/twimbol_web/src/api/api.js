import api from "./axios.js";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ─── Reels ───────────────────────────────────────────────────────────────────

export const fetchReels = async (page = 1, pageSize = 30) => {
  const { data } = await api.get("/api/reels/", {
    params: { page, page_size: pageSize },
  });
  return data;
};

// ─── Notifications ────────────────────────────────────────────────────────────

export const fetchNotifications = async () => {
  const { data } = await api.get("/api/notifications/");
  return data;
};

export const markNotificationRead = async (id) => {
  const { data } = await api.post(`/api/notifications/${id}/mark-read/`);
  return data;
};

export const markAllNotificationsRead = async () => {
  const { data } = await api.post("/api/notifications/mark-all-read/");
  return data;
};

// ─── Profile ──────────────────────────────────────────────────────────────────

export const fetchProfile = async () => {
  const { data } = await api.get("/user/api/profile/");
  return data;
};

export const updateProfile = async (userId, formData) => {
  const { data } = await api.patch(`/user/api/update/${userId}/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const logout = async () => {
//   try {
//     await api.post("/user/logout/");
//   } finally {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
//   }
};

// ─── Posts ────────────────────────────────────────────────────────────────────

export const fetchPosts = async (page = 1, pageSize = 10) => {
  const { data } = await api.get("/api/posts/", {
    params: { page, page_size: pageSize },
  });
  return data;
};

export const likePost = async (postId) => {
  const { data } = await api.post(`/api/post_likes/${postId}/`);
  return data;
};

export const unlikePost = async (postId) => {
  await api.delete(`/api/post_likes/${postId}/`);
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Resolve a relative media path to an absolute URL.
 * Absolute URLs (Cloudinary, etc.) are returned as-is.
 */
export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path}`;
};