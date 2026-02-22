/**
 * Settings.jsx
 * Root settings page. Renders the sidebar navigation and swaps content panels.
 * Mirrors the design from the provided Figma screenshots.
 */

import { useState } from "react";
import {
  User,
  Bell,
  Users,
  MessageSquareDashed,
  FileText,
  Shield,
  Bug,
  HelpCircle,
  LogOut,
  ChevronLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import AccountSettings from "../components/settings/Accountsettings.jsx";
import NotificationSettings from "../components/settings/NotificationSettings.jsx";
import ParentalControlSettings from "../components/settings/ParentalControlSettings.jsx";

// ─── Sidebar nav item ─────────────────────────────────────────────────────────
function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
        active
          ? "bg-surface text-txt"
          : "text-txt-secondary hover:bg-surface/60"
      }`}
    >
      <span className={active ? "text-txt" : "text-txt-secondary"}>{icon}</span>
      {label}
    </button>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────
function SectionLabel({ label }) {
  return (
    <p className="px-4 pt-4 pb-1 text-sm font-bold text-txt">{label}</p>
  );
}

// ─── Static pages (Terms, Privacy, FAQs, etc.) ───────────────────────────────
function TermsAndConditions() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-txt mb-6">Terms &amp; Conditions</h1>
      <div className="space-y-6 max-w-2xl text-sm">
        {[
          {
            title: "Creating & Owning Your Account.",
            body: "To use Twimbol, you'll need an account. Keep your login secure – your account is for your personal or business use only and may not be shared with others. Any activity happening on your account is your responsibility.",
          },
          {
            title: "What's Not Allowed ?",
            body: "Post content promoting or links to offensive content, bullying, threats, hate speech, impersonation, spam, or anything that violates our community guidelines. Accounts found to be in violation may be restricted or permanently banned.",
          },
          {
            title: "Your Content, Your Control",
            body: "You own the content you create, but you allow us to show it to others by posting content to Twimbol. You can delete content and manage the app. Only post what's truly yours to share.",
          },
          {
            title: "Suspensions & Account Removal",
            body: "If you violate our terms, we reserve the right to suspend or remove your account. You can appeal suspensions by emailing us at any time from your settings.",
          },
        ].map((s) => (
          <div key={s.title}>
            <h2 className="font-bold text-purple-600 mb-1">{s.title}</h2>
            <p className="text-txt-secondary">{s.body}</p>
          </div>
        ))}
      </div>
      <button className="mt-8 px-8 py-3 rounded-xl bg-brand text-white font-semibold text-sm hover:bg-brand/90">
        I understand and accept the terms
      </button>
    </div>
  );
}

function PrivacyPolicy() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-txt mb-4">Privacy Policy</h1>
      <p className="text-txt-secondary text-sm max-w-2xl">
        Twimbol respects your privacy. We collect minimal data necessary to
        operate the platform and never sell your personal information. For full
        details, visit our <a href="https://rafidabdullahsamiweb.pythonanywhere.com/privacy-policy" className="text-brand hover:underline">website</a>.
      </p>
    </div>
  );
}

function FAQs() {
  const faqs = [
    { q: "What is Twimbol?", a: "Twimbol is a safe and fun social media platform for kids to share challenge videos, make friends, and earn rewards like toys, badges, and Twimbbucks (our in-app currency)." },
    { q: "Who can my child connect with?", a: "Kids can interact with verified friends, join community challenges, and follow creators. Parents have full control over friend approvals and privacy settings." },
    { q: "Can parents monitor their child's activity?", a: "Absolutely. Parents can view account activity, manage privacy settings, approve connections, and ensure their child's experience stays positive and safe." },
    { q: "How do I create an account for my Child?", a: "A parent or guardian must sign up using an email account. We require parental verification to ensure child safety and proper account management." },
    { q: "Is Twimbol safe for children?", a: "Yes! Twimbol is built with safety first. Parents verify every account, and kids can only use positive interactions like gifts, stickers, and emojis—no bullying, dislikes, or harmful comments are allowed." },
    { q: "What are Twimbbucks and how can my child use them?", a: "Twimbbucks are a virtual currency kids earn by posting videos, joining challenges, and receiving gifts. They can be used for profile upgrades, styling, or rewards." },
  ];

  const [open, setOpen] = useState(0);

  return (
    <div>
      <h1 className="text-3xl font-bold text-txt mb-6">Frequently Asked Questions</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {faqs.map((f, i) => (
          <div
            key={i}
            className="rounded-xl bg-surface overflow-hidden"
          >
            <button
              onClick={() => setOpen(open === i ? -1 : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left"
            >
              <span className="font-semibold text-sm text-txt">{f.q}</span>
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold ${open === i ? "bg-purple-600" : "bg-purple-600"}`}>
                {open === i ? "−" : "+"}
              </span>
            </button>
            {open === i && f.a && (
              <p className="px-5 pb-4 text-sm text-txt-secondary">{f.a}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SendFeedback() {
  const [msg, setMsg] = useState("");
  return (
    <div>
      <h1 className="text-3xl font-bold text-txt mb-4">Send Feedback</h1>
      <textarea
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        rows={5}
        placeholder="Tell us what's on your mind..."
        className="w-full max-w-lg border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand resize-none"
      />
      <br />
      <button className="mt-3 px-8 py-2.5 rounded-xl bg-brand text-white font-semibold text-sm hover:bg-brand/90">
        Submit Feedback
      </button>
    </div>
  );
}

function ReportBug() {
  const [msg, setMsg] = useState("");
  return (
    <div>
      <h1 className="text-3xl font-bold text-txt mb-4">Report a Bug</h1>
      <textarea
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        rows={5}
        placeholder="Describe the bug you encountered..."
        className="w-full max-w-lg border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand resize-none"
      />
      <br />
      <button className="mt-3 px-8 py-2.5 rounded-xl bg-brand text-white font-semibold text-sm hover:bg-brand/90">
        Submit Report
      </button>
    </div>
  );
}

// ─── Section map ──────────────────────────────────────────────────────────────
const SECTIONS = {
  account: <AccountSettings />,
  notifications: <NotificationSettings />,
  parental: <ParentalControlSettings />,
  feedback: <SendFeedback />,
  faqs: <FAQs />,
  bug: <ReportBug />,
  terms: <TermsAndConditions />,
  privacy: <PrivacyPolicy />,
};

// ─── Settings Page ────────────────────────────────────────────────────────────
export default function Settings() {
  const [active, setActive] = useState("account");
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#F0F0F0] flex items-center justify-center p-6">
      <div className="flex gap-5 w-full max-w-6xl">
        {/* ── Sidebar ── */}
        <aside className="w-72 bg-white rounded-2xl shadow-sm p-4 flex flex-col shrink-0 self-start sticky top-6">
          {/* Back */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-brand font-semibold text-sm mb-5"
          >
            <ChevronLeft size={16} /> Back
          </button>

          {/* User info */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-full bg-purple-200 overflow-hidden shrink-0">
              {user.profile_pic ? (
                <img src={user.profile_pic} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-purple-700 text-xl font-bold">
                  {user.username?.[0]?.toUpperCase() ?? "U"}
                </div>
              )}
            </div>
            <div>
              <p className="font-bold text-txt leading-tight">
                {user.first_name
                  ? `${user.first_name} ${user.last_name}`
                  : user.username}
              </p>
              <p className="text-sm text-txt-secondary capitalize">
                {user.user_type ?? "Member"}
              </p>
            </div>
          </div>

          {/* General */}
          <SectionLabel label="General" />
          <NavItem icon={<User size={16} />} label="Account" active={active === "account"} onClick={() => setActive("account")} />
          <NavItem icon={<Bell size={16} />} label="Notifications" active={active === "notifications"} onClick={() => setActive("notifications")} />
          <NavItem icon={<Users size={16} />} label="Parental Control" active={active === "parental"} onClick={() => setActive("parental")} />

          {/* Feedback */}
          <SectionLabel label="Feedback" />
          <NavItem icon={<MessageSquareDashed size={16} />} label="Send Feedback" active={active === "feedback"} onClick={() => setActive("feedback")} />
          <NavItem icon={<HelpCircle size={16} />} label="FAQs" active={active === "faqs"} onClick={() => setActive("faqs")} />
          <NavItem icon={<Bug size={16} />} label="Report a bug" active={active === "bug"} onClick={() => setActive("bug")} />
          <NavItem icon={<FileText size={16} />} label="Terms & Conditions" active={active === "terms"} onClick={() => setActive("terms")} />
          <NavItem icon={<Shield size={16} />} label="Privacy Policy" active={active === "privacy"} onClick={() => setActive("privacy")} />

          {/* Logout */}
          <div className="mt-auto pt-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-brand font-semibold text-sm px-4 py-2 hover:bg-brand/5 rounded-xl w-full"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </aside>

        {/* ── Content panel ── */}
        <main className="flex-1 bg-white rounded-2xl shadow-sm p-8 min-h-[600px]">
          {SECTIONS[active]}
        </main>
      </div>
    </div>
  );
}