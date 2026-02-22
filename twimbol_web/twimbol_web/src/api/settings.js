/**
 * settings.js
 * API functions for Account Settings, Notification Preferences, and Parental Controls.
 * Endpoints sourced from readme.md
 */

import api from "./axios";

// ─── Account Settings ─────────────────────────────────────────────────────────

/**
 * PUT /user/change-password/
 * Change the authenticated user's password.
 * @param {{ old_password: string, new_password: string }} payload
 */
export const changePassword = (payload) =>
  api.put("/user/change-password/", payload);

/**
 * POST /user/api/deactivate/{id}/
 * Temporarily deactivate the authenticated user's account.
 * @param {number} userId
 */
export const deactivateAccount = (userId) =>
  api.post(`/user/api/deactivate/${userId}/`);

/**
 * POST /user/delete/
 * Permanently delete the authenticated user's account.
 */
export const deleteAccount = () => api.post("/user/delete/");

// ─── Notification Preferences ─────────────────────────────────────────────────

/**
 * GET /api/notifications/preferences/
 * Fetch current notification preferences.
 */
export const getNotificationPreferences = () =>
  api.get("/api/notifications/preferences/");

/**
 * PATCH /api/notifications/preferences/
 * Update notification preferences (partial update).
 * @param {object} payload – any subset of preference fields
 */
export const updateNotificationPreferences = (payload) =>
  api.patch("/api/notifications/preferences/", payload);

// ─── Parental Controls ────────────────────────────────────────────────────────

/**
 * POST /api/parent/request_otp/
 * Send a 6-digit OTP to a parent's email to initiate account linking.
 * @param {{ child_id: number, parent_email: string }} payload
 */
export const requestParentOtp = (payload) =>
  api.post("/api/parent/request_otp/", payload);

/**
 * POST /api/parent/verify-_tp/
 * Verify OTP and complete parent-child account linking.
 * @param {{ child_id: number, parent_email: string, otp_code: string }} payload
 */
export const verifyParentOtp = (payload) =>
  api.post("/api/parent/verify_otp/", payload);