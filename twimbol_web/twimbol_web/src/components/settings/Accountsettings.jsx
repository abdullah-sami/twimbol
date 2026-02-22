/**
 * AccountSettings.jsx
 * Handles Change Password, Deactivate Account, and Delete Account.
 */

import { useState } from "react";
import { Lock, Pause, Trash2, Eye, EyeOff, X } from "lucide-react";
import { changePassword, deactivateAccount, deleteAccount } from "../../api/settings";

// ─── Small reusable card ─────────────────────────────────────────────────────
function SettingCard({ icon, title, description, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-xl bg-surface text-left transition hover:brightness-95 active:scale-[.99] ${
        danger ? "border border-red-100" : ""
      }`}
    >
      <span className={`text-xl ${danger ? "text-red-500" : "text-brand"}`}>
        {icon}
      </span>
      <div className="flex-1">
        <p className={`font-semibold ${danger ? "text-red-500" : "text-txt"}`}>
          {title}
        </p>
        <p className="text-sm text-txt-secondary">{description}</p>
      </div>
      <span className="text-txt-secondary text-lg">›</span>
    </button>
  );
}

// ─── Password Field (defined at module level to avoid remount on each keystroke) ──
function PasswordField({ label, field, value, onChange, show, onToggleShow }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-txt mb-1">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(field, e.target.value)}
          placeholder={`Enter ${label.toLowerCase()}`}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-sm outline-none focus:border-brand"
        />
        <button
          type="button"
          onClick={() => onToggleShow(field)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-secondary"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

// ─── Change Password Panel ────────────────────────────────────────────────────
function ChangePasswordPanel({ onClose }) {
  const [form, setForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [show, setShow] = useState({
    old_password: false,
    new_password: false,
    confirm_password: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const toggle = (field) =>
    setShow((s) => ({ ...s, [field]: !s[field] }));

  const handleChange = (field, value) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (form.new_password !== form.confirm_password) {
      setError("New passwords do not match.");
      return;
    }
    if (form.new_password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await changePassword({
        old_password: form.old_password,
        new_password: form.new_password,
      });
      setSuccess("Password changed successfully!");
      setForm({ old_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      const msg =
        err.response?.data?.old_password?.[0] ||
        err.response?.data?.detail ||
        "Something went wrong.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 border-2 border-brand">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-txt">Change Password</h2>
          <button onClick={onClose} className="text-txt-secondary hover:text-txt">
            <X size={20} />
          </button>
        </div>

        <PasswordField label="Current Password" field="old_password" value={form.old_password} onChange={handleChange} show={show.old_password} onToggleShow={toggle} />
        <PasswordField label="New Password" field="new_password" value={form.new_password} onChange={handleChange} show={show.new_password} onToggleShow={toggle} />
        <PasswordField label="Confirm New Password" field="confirm_password" value={form.confirm_password} onChange={handleChange} show={show.confirm_password} onToggleShow={toggle} />

        <div className="bg-gray-50 rounded-lg p-3 mb-4 text-xs text-txt-secondary">
          <p className="font-medium mb-1">Password Requirements:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>At least 8 characters long</li>
            <li>Must be different from last password</li>
          </ul>
        </div>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-3">{success}</p>}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border-2 border-brand text-brand font-semibold text-sm hover:bg-brand/5"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg bg-brand text-white font-semibold text-sm hover:bg-brand/90 disabled:opacity-60"
          >
            {loading ? "Saving..." : "Change Password"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({ title, message, confirmLabel, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <h2 className="text-xl font-bold text-txt mb-2">{title}</h2>
        <p className="text-txt-secondary text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-lg border border-gray-200 text-txt-secondary font-semibold text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg bg-red-500 text-white font-semibold text-sm hover:bg-red-600 disabled:opacity-60"
          >
            {loading ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AccountSettings() {
  const [modal, setModal] = useState(null); // null | "changePassword" | "deactivate" | "delete"
  const [loading, setLoading] = useState(false);

  // Get user id from localStorage (set during login)
  const userId = JSON.parse(localStorage.getItem("user") || "{}").id;

  const handleDeactivate = async () => {
    setLoading(true);
    try {
      await deactivateAccount(userId);
      localStorage.clear();
      window.location.href = "/login";
    } catch {
      setLoading(false);
      setModal(null);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteAccount();
      localStorage.clear();
      window.location.href = "/login";
    } catch {
      setLoading(false);
      setModal(null);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-txt mb-6">Account Settings</h1>

      {/* Security */}
      <p className="text-xs font-semibold tracking-widest text-txt-secondary uppercase mb-3">
        Security
      </p>
      <SettingCard
        icon={<Lock size={22} />}
        title="Change Password"
        description="Update your account Password"
        onClick={() => setModal("changePassword")}
      />

      {/* Account Management */}
      <p className="text-xs font-semibold tracking-widest text-txt-secondary uppercase mb-3 mt-6">
        Account Management
      </p>
      <div className="space-y-3">
        <SettingCard
          icon={<Pause size={22} />}
          title="Deactivate Account"
          description="Temporarily disable your account"
          onClick={() => setModal("deactivate")}
          danger
        />
        <SettingCard
          icon={<Trash2 size={22} />}
          title="Delete Account"
          description="Permanently delete your account and data."
          onClick={() => setModal("delete")}
          danger
        />
      </div>

      {/* Modals */}
      {modal === "changePassword" && (
        <ChangePasswordPanel onClose={() => setModal(null)} />
      )}
      {modal === "deactivate" && (
        <ConfirmDialog
          title="Deactivate Account?"
          message="Your account will be temporarily disabled. You can reactivate it by logging in again."
          confirmLabel="Deactivate"
          onConfirm={handleDeactivate}
          onCancel={() => setModal(null)}
          loading={loading}
        />
      )}
      {modal === "delete" && (
        <ConfirmDialog
          title="Delete Account?"
          message="This action is permanent and cannot be undone. All your data will be erased."
          confirmLabel="Delete Permanently"
          onConfirm={handleDelete}
          onCancel={() => setModal(null)}
          loading={loading}
        />
      )}
    </div>
  );
}