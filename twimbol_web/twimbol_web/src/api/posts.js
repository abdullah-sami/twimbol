import api from "./axios";

// ─── Posts ────────────────────────────────────────────────────────────────────

export const getPosts = (params = {}) =>
  api.get("/api/posts/", { params });

export const getPost = (id) =>
  api.get(`/api/posts/${id}/`);

export const createPost = (formData) =>
  api.post("/api/posts/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// ─── Post Interactions ────────────────────────────────────────────────────────

export const toggleLike = (postId) =>
  api.post(`/api/post_likes/${postId}/`);

export const hidePost = (postId) =>
  api.post(`/api/posts/${postId}/hide/`);

export const reportPost = (postId, reason = "") =>
  api.post(`/api/posts/${postId}/report/`, { reason });

// ─── Comments ─────────────────────────────────────────────────────────────────

export const getComments = (postId) =>
  api.get(`/api/posts/${postId}/comments/`);

export const addComment = (postId, comment) =>
  api.post(`/api/posts/${postId}/comments/`, { comment });

export const deleteComment = (commentId) =>
  api.delete("/api/posts/comments/delete/", {
    data: { comment_id: commentId },
  });

// ─── Follow & Block ───────────────────────────────────────────────────────────

export const toggleFollow = (userId) =>
  api.post("/user/profile/follow/", { user_id: userId });

export const blockUser = (userId) =>
  api.post("/user/profile/block/", { user_id: userId });