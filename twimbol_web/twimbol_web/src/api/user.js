import api from "./axios";

// ─── Profile ──────────────────────────────────────────────────────────────────

export const getProfile = () =>
  api.get("/user/api/profile/");

export const updateProfile = (id, formData) =>
  api.patch(`/user/api/update/${id}/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deactivateAccount = (id) =>
  api.post(`/user/api/deactivate/${id}/`);

export const deleteAccount = () =>
  api.post("/user/delete/");

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const login = (username, password) =>
  api.post("/user/login/", { username, password });

export const logout = () =>
  api.post("/user/logout/");

export const register = (data) =>
  api.post("/user/api/register/", data);

// ─── Password ─────────────────────────────────────────────────────────────────

export const changePassword = (oldPassword, newPassword) =>
  api.put("/user/change-password/", {
    old_password: oldPassword,
    new_password: newPassword,
  });

export const forgotPassword = (email) =>
  api.post("/user/forgot-password/", { email });

export const resetPasswordConfirm = (email, code, newPassword) =>
  api.post("/user/reset-password-confirm/", {
    email,
    code,
    new_password: newPassword,
  });

// ─── Creator Application ──────────────────────────────────────────────────────

export const getCreatorApplication = () =>
  api.get("/user/api/creator-application/");

export const applyForCreator = () =>
  api.post("/user/api/creator-application/");

// ─── Follow & Block ───────────────────────────────────────────────────────────

export const toggleFollow = (userId) =>
  api.post("/user/profile/follow/", { user_id: userId });

export const blockUser = (userId) =>
  api.post("/user/profile/block/", { user_id: userId });