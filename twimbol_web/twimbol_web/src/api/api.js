import api from "./axios.js";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ─── Reels ───────────────────────────────────────────────────────────────────

export const fetchReels = async (page = 1, pageSize = 30) => {
  const { data } = await api.get("/api/reels/", {
    params: { page, page_size: pageSize },
  });
  return data;
};

export const likeReel = async (postId) => {
  const { data } = await api.post(`/api/post_likes/${postId}/`);
  return data;
};

export const unlikeReel = async (postId) => {
  await api.delete(`/api/post_likes/${postId}/`);
};

export const hideReel = async (postId) => {
  const { data } = await api.post(`/api/post_hide/${postId}/`);
  return data;
};

export const reportReel = async (postId, reason, description = "") => {
  const { data } = await api.post(`/api/post_report/${postId}/`, {
    reason,
    description,
  });
  return data;
};

// ─── Comments ────────────────────────────────────────────────────────────────

export const fetchComments = async (postId, page = 1, pageSize = 15) => {
  const { data } = await api.get(`/api/posts/${postId}/comments/`, {
    params: { page, page_size: pageSize },
  });
  return data;
};

export const postComment = async (postId, comment) => {
  const { data } = await api.post(`/api/posts/${postId}/comments/`, {
    comment,
  });
  return data;
};

export const deleteComment = async (postId, commentId) => {
  await api.delete(`/api/posts/${postId}/comments/`, {
    data: { comment_id: commentId },
  });
};

// ─── Follow & Block ───────────────────────────────────────────────────────────

export const toggleFollow = async (userId) => {
  const { data } = await api.post("/user/profile/follow/", {
    user_id: userId,
  });
  return data;
};

export const toggleBlock = async (userId) => {
  const { data } = await api.post("/user/profile/block/", {
    user_id: userId,
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

export const fetchPost = async (postId) => {
  const { data } = await api.get(`/api/posts/${postId}/`);
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