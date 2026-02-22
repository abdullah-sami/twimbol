
/**
 * ParentalControlSettings.jsx
 * Screens:
 *  1. Link Parent Account – enter email → Send OTP
 *  2. Verify OTP
 *  3. Parental Controls dashboard (Settings & Controls | Watch History | Blocked Users)
 *  4. Settings & Controls sub-page (Daily Time Limits · Content Filters · Bedtime Restrictions)
 *
 * All persistent state lives in Zustand (settingsStore) → localStorage.
 */

import { useState } from "react";
import {
  Settings,
  Tv2,
  Ban,
  ArrowLeft,
  Clock,
  ScanSearch,
  Moon,
} from "lucide-react";
import useSettingsStore from "../../store/Settingsstore.js";
import { requestParentOtp, verifyParentOtp } from "../../api/settings";

// ─── Shared Toggle ────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
        checked ? "bg-gray-700" : "bg-gray-300"
      }`}
    >
      <span
        className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? "translate-x-6" : "translate-x-0"
        }`}
      />
    </button>
  );
}

// ─── Shared row for label + input ─────────────────────────────────────────────
function SettingRow({ label, children }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm text-txt">{label}</span>
      {children}
    </div>
  );
}

// ─── Small pill input (number / time) ────────────────────────────────────────
function PillInput({ type = "text", value, onChange, disabled, className = "" }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-center outline-none focus:border-brand w-20 disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    />
  );
}

// ─── Section card wrapper ─────────────────────────────────────────────────────
function SectionCard({ icon, title, children }) {
  return (
    <div className="bg-surface rounded-2xl p-5 border-l-4 border-brand">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-txt">{icon}</span>
        <h2 className="font-bold text-lg text-txt">{title}</h2>
      </div>
      {children}
    </div>
  );
}

// ─── 4. Settings & Controls sub-page ─────────────────────────────────────────
function SettingsAndControls({ onBack }) {
  const { parentalSettings, setParentalSettings } = useSettingsStore();

  // Local draft state – only committed to store on Save
  const [timeLimit, setTimeLimit] = useState({
    enabled: parentalSettings.timeLimitEnabled,
    minutes: parentalSettings.dailyLimitMinutes,
  });
  const [filters, setFilters] = useState(parentalSettings.contentFilters);
  const [bedtime, setBedtime] = useState({
    enabled: parentalSettings.bedtimeEnabled,
    start: parentalSettings.bedtimeStart,
    stop: parentalSettings.bedtimeStop,
  });

  const [saving, setSaving] = useState({ time: false, filters: false, bedtime: false });
  const [saved, setSaved] = useState({ time: false, filters: false, bedtime: false });

  const flash = (key) => {
    setSaved((s) => ({ ...s, [key]: true }));
    setTimeout(() => setSaved((s) => ({ ...s, [key]: false })), 2000);
  };

  const saveTimeLimits = async () => {
    setSaving((s) => ({ ...s, time: true }));
    try {
      setParentalSettings({
        timeLimitEnabled: timeLimit.enabled,
        dailyLimitMinutes: Number(timeLimit.minutes),
      });
      // TODO: wire to API endpoint when available
      flash("time");
    } finally {
      setSaving((s) => ({ ...s, time: false }));
    }
  };

  const saveContentFilters = async () => {
    setSaving((s) => ({ ...s, filters: true }));
    try {
      setParentalSettings({ contentFilters: filters });
      // TODO: wire to API endpoint when available
      flash("filters");
    } finally {
      setSaving((s) => ({ ...s, filters: false }));
    }
  };

  const saveBedtime = async () => {
    setSaving((s) => ({ ...s, bedtime: true }));
    try {
      setParentalSettings({
        bedtimeEnabled: bedtime.enabled,
        bedtimeStart: bedtime.start,
        bedtimeStop: bedtime.stop,
      });
      // TODO: wire to API endpoint when available
      flash("bedtime");
    } finally {
      setSaving((s) => ({ ...s, bedtime: false }));
    }
  };

  return (
    <div>
      {/* Header */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-brand font-semibold text-sm mb-4"
      >
        <ArrowLeft size={16} /> Back
      </button>
      <h1 className="text-3xl font-bold text-txt mb-6">Settings &amp; Controls</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* ── Daily Time Limits ── */}
        <SectionCard icon={<Clock size={20} />} title="Daily Time Limits">
          <SettingRow label="Enable Time Limits">
            <Toggle
              checked={timeLimit.enabled}
              onChange={() => setTimeLimit((t) => ({ ...t, enabled: !t.enabled }))}
            />
          </SettingRow>
          <SettingRow label="Daily limit (Minutes)">
            <PillInput
              type="number"
              value={timeLimit.minutes}
              onChange={(e) => setTimeLimit((t) => ({ ...t, minutes: e.target.value }))}
              disabled={!timeLimit.enabled}
            />
          </SettingRow>
          <button
            onClick={saveTimeLimits}
            disabled={saving.time}
            className="mt-4 w-full py-2.5 rounded-xl bg-brand text-white font-semibold text-sm hover:bg-brand/90 disabled:opacity-60 transition"
          >
            {saving.time ? "Saving..." : saved.time ? "✓ Saved!" : "Save Time Limits"}
          </button>
        </SectionCard>

        {/* ── Content Filters ── */}
        <SectionCard icon={<ScanSearch size={20} />} title="Content Filters">
          <p className="text-sm text-txt-secondary mb-3">
            Enter keywords to filter out content (separated by commas)
          </p>
          <textarea
            rows={3}
            value={filters}
            onChange={(e) => setFilters(e.target.value)}
            placeholder="Inappropriate, violence, scary"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand resize-none"
          />
          <button
            onClick={saveContentFilters}
            disabled={saving.filters}
            className="mt-4 w-full py-2.5 rounded-xl bg-brand text-white font-semibold text-sm hover:bg-brand/90 disabled:opacity-60 transition"
          >
            {saving.filters ? "Saving..." : saved.filters ? "✓ Saved!" : "Save Content Filters"}
          </button>
        </SectionCard>

        {/* ── Bedtime Restrictions ── */}
        <SectionCard icon={<Moon size={20} />} title="Bedtime Restrictions">
          <SettingRow label="Enable Bedtime Mode">
            <Toggle
              checked={bedtime.enabled}
              onChange={() => setBedtime((b) => ({ ...b, enabled: !b.enabled }))}
            />
          </SettingRow>
          <SettingRow label="Bedtime Start">
            <PillInput
              type="time"
              value={bedtime.start}
              onChange={(e) => setBedtime((b) => ({ ...b, start: e.target.value }))}
              disabled={!bedtime.enabled}
              className="w-28"
            />
          </SettingRow>
          <SettingRow label="Bedtime Stops">
            <PillInput
              type="time"
              value={bedtime.stop}
              onChange={(e) => setBedtime((b) => ({ ...b, stop: e.target.value }))}
              disabled={!bedtime.enabled}
              className="w-28"
            />
          </SettingRow>
          <button
            onClick={saveBedtime}
            disabled={saving.bedtime}
            className="mt-4 w-full py-2.5 rounded-xl bg-brand text-white font-semibold text-sm hover:bg-brand/90 disabled:opacity-60 transition"
          >
            {saving.bedtime ? "Saving..." : saved.bedtime ? "✓ Saved!" : "Save Bedtime Settings"}
          </button>
        </SectionCard>
      </div>
    </div>
  );
}

// ─── 3. Controls Dashboard ────────────────────────────────────────────────────
function ControlsDashboard({ onBack, onNavigate }) {
  const cards = [
    {
      id: "settingsControls",
      icon: <Settings size={22} />,
      title: "Settings & Controls",
      description: "Time limits, restrictions, content filters.",
    },
    {
      id: "watchHistory",
      icon: <Tv2 size={22} />,
      title: "Watch History",
      description: "View your child's activity.",
    },
    {
      id: "blockedUsers",
      icon: <Ban size={22} className="text-red-500" />,
      title: "Blocked Users",
      description: "Manage blocked accounts.",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-txt mb-6">Parental Controls</h1>
      <div className="space-y-4 max-w-lg">
        {cards.map((c) => (
          <button
            key={c.id}
            onClick={() => onNavigate(c.id)}
            className="w-full flex items-center gap-4 p-4 rounded-xl bg-surface border-l-4 border-brand text-left hover:brightness-95 transition"
          >
            <span className="text-txt-secondary">{c.icon}</span>
            <div className="flex-1">
              <p className="font-semibold text-txt">{c.title}</p>
              <p className="text-sm text-txt-secondary">{c.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── 1. Link Email Step ───────────────────────────────────────────────────────
function LinkEmailStep({ onSent }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const userId = JSON.parse(localStorage.getItem("user") || "{}").id;

  const handleSend = async () => {
    if (!email) { setError("Please enter an email address."); return; }
    setError("");
    setLoading(true);
    try {
      await requestParentOtp({ child_id: userId, parent_email: email });
      onSent(email);
    } catch (err) {
      setError(
        err.response?.data?.non_field_errors?.[0] ||
          err.response?.data?.detail ||
          "Failed to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto text-center mt-10">
      <h2 className="text-3xl font-bold text-txt mb-2">Link Parent Account</h2>
      <p className="text-txt-secondary text-sm mb-8">
        Please enter your email address to receive an{" "}
        <span className="text-brand font-semibold">OTP</span> for verification
      </p>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter parent email address"
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand mb-3"
      />
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
      <button
        onClick={handleSend}
        disabled={loading}
        className="w-full py-3 rounded-xl bg-gray-400 text-white font-semibold hover:bg-brand transition disabled:opacity-60"
      >
        {loading ? "Sending..." : "Send OTP"}
      </button>
      <p className="text-xs text-txt-secondary mt-4 italic">
        An OTP will be sent to your email for verification
      </p>
    </div>
  );
}

// ─── 2. Verify OTP Step ───────────────────────────────────────────────────────
function VerifyOtpStep({ parentEmail, onVerified, onChangeEmail }) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const userId = JSON.parse(localStorage.getItem("user") || "{}").id;

  const handleVerify = async () => {
    if (otp.length !== 6) { setError("Please enter the 6-digit OTP."); return; }
    setError("");
    setLoading(true);
    try {
      await verifyParentOtp({ child_id: userId, parent_email: parentEmail, otp_code: otp });
      onVerified();
    } catch (err) {
      setError(
        err.response?.data?.non_field_errors?.[0] ||
          err.response?.data?.detail ||
          "Invalid OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try { await requestParentOtp({ child_id: userId, parent_email: parentEmail }); }
    catch { /* silent */ }
    finally { setResending(false); }
  };

  return (
    <div className="max-w-md mx-auto text-center mt-10">
      <h2 className="text-3xl font-bold text-txt mb-2">Verify OTP</h2>
      <p className="text-txt-secondary text-sm mb-8">
        Please enter the 6-digit OTP sent to{" "}
        <span className="font-semibold">{parentEmail}</span>
      </p>
      <input
        type="text"
        maxLength={6}
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
        placeholder="Enter 6-digit OTP"
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] outline-none focus:border-brand mb-3"
      />
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
      <button
        onClick={handleVerify}
        disabled={loading}
        className="w-full py-3 rounded-xl bg-gray-400 text-white font-semibold hover:bg-brand transition disabled:opacity-60 mb-4"
      >
        {loading ? "Verifying..." : "Verify OTP"}
      </button>
      <div className="flex gap-3">
        <button
          onClick={onChangeEmail}
          className="flex-1 py-2.5 rounded-xl border-2 border-brand text-brand font-semibold text-sm hover:bg-brand/5"
        >
          Change Email
        </button>
        <button
          onClick={handleResend}
          disabled={resending}
          className="flex-1 py-2.5 rounded-xl border-2 border-brand text-brand font-semibold text-sm hover:bg-brand/5 disabled:opacity-60"
        >
          {resending ? "Sending..." : "Resend OTP"}
        </button>
      </div>
    </div>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────
export default function ParentalControlSettings() {
  const { parentalControl, setParentalControl } = useSettingsStore();
  const { isLinked, parentEmail, otpStep } = parentalControl;

  // Sub-page within the controls dashboard ("dashboard" | "settingsControls" | "watchHistory" | "blockedUsers")
  const [subPage, setSubPage] = useState("dashboard");

  // OTP flow
  if (!isLinked) {
    if (otpStep === "otp") {
      return (
        <VerifyOtpStep
          parentEmail={parentEmail}
          onVerified={() => setParentalControl({ isLinked: true, otpStep: "done" })}
          onChangeEmail={() => setParentalControl({ otpStep: "email", parentEmail: null })}
        />
      );
    }
    return (
      <LinkEmailStep
        onSent={(email) => setParentalControl({ parentEmail: email, otpStep: "otp" })}
      />
    );
  }

  // Sub-pages inside the dashboard
  if (subPage === "settingsControls") {
    return <SettingsAndControls onBack={() => setSubPage("dashboard")} />;
  }

  // Watch History / Blocked Users – placeholder panels
  if (subPage === "watchHistory") {
    return (
      <div>
        <button onClick={() => setSubPage("dashboard")} className="flex items-center gap-1 text-brand font-semibold text-sm mb-4">
          <ArrowLeft size={16} /> Back
        </button>
        <h1 className="text-3xl font-bold text-txt mb-4">Watch History</h1>
        <p className="text-txt-secondary text-sm">No watch history available yet.</p>
      </div>
    );
  }

  if (subPage === "blockedUsers") {
    return (
      <div>
        <button onClick={() => setSubPage("dashboard")} className="flex items-center gap-1 text-brand font-semibold text-sm mb-4">
          <ArrowLeft size={16} /> Back
        </button>
        <h1 className="text-3xl font-bold text-txt mb-4">Blocked Users</h1>
        <p className="text-txt-secondary text-sm">No blocked users yet.</p>
      </div>
    );
  }

  // Default: controls dashboard
  return (
    <ControlsDashboard
      onBack={() => setParentalControl({ isLinked: false, otpStep: "email" })}
      onNavigate={setSubPage}
    />
  );
}