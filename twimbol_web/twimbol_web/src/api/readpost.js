import axios from "./axios";

// ─── Posts ───────────────────────────────────────────────────────────────────

export const getPosts = (params = {}) =>
  axios.get("/api/posts/", { params }).then((r) => r.data);

export const getPost = (id) =>
  axios.get(`/api/posts/${id}/`).then((r) => r.data);

// ─── Post Interactions ────────────────────────────────────────────────────────

export const likePost = (postId) =>
  axios.post(`/api/post_likes/${postId}/`).then((r) => r.data);

export const unlikePost = (postId) =>
  axios.delete(`/api/post_likes/${postId}/`).then((r) => r.data);

export const hidePost = (postId) =>
  axios.post(`/api/post_hide/${postId}/`).then((r) => r.data);

export const unhidePost = (postId) =>
  axios.delete(`/api/post_hide/${postId}/`).then((r) => r.data);

export const reportPost = (postId, payload) =>
  axios.post(`/api/post_report/${postId}/`, payload).then((r) => r.data);

export const unreportPost = (postId) =>
  axios.delete(`/api/post_report/${postId}/`).then((r) => r.data);

// ─── Comments ─────────────────────────────────────────────────────────────────

export const getPostComments = (postId, params = {}) =>
  axios.get(`/api/posts/${postId}/comments/`, { params }).then((r) => r.data);

export const addComment = (postId, payload) =>
  axios.post(`/api/posts/${postId}/comments/`, payload).then((r) => r.data);

export const deleteComment = (postId, commentId) =>
  axios
    .delete(`/api/posts/${postId}/comments/`, { data: { comment_id: commentId } })
    .then((r) => r.data);

// ─── Follow ───────────────────────────────────────────────────────────────────

export const followUser = (userId) =>
  axios.post("/user/profile/follow/", { user_id: userId }).then((r) => r.data);

export const blockUser = (userId) =>
  axios.post("/user/profile/block/", { user_id: userId }).then((r) => r.data);