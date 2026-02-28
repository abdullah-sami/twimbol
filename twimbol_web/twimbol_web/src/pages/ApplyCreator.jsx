import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { applyForCreator, getCreatorApplication } from "../api/creator";
import {useAuthStore} from "../store/authStore.js";



const instructions = [
  {
    icon: "👤",
    title: "Complete your profile",
    desc: "Add your name, profile picture and bio so we can verify your identity.",
  },
  {
    icon: "🔗",
    title: "Add social media links",
    desc: "Link your Facebook, Twitter/X, or YouTube in your profile settings.",
  },
  {
    icon: "📧",
    title: "Verify your email address",
    desc: "Confirm your email so we can send the application decision.",
  },
  {
    icon: "📋",
    title: "Review creator guidelines",
    desc: "Creators must post original content that follows our community standards.",
  },
];

export const ApplyCreator = () => {
  const { user, fetchProfile, accessToken } = useAuthStore();
  const [application, setApplication] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState("");
  const [success, setSuccess]         = useState("");

  const userGroup = user?.user_group || [];
  const isCreator = userGroup.includes("creator");
  const isAdmin   = userGroup.includes("admin");

  useEffect(() => {
    (async () => {
      try {
        const res = await getCreatorApplication(user.user.id);
            // console.log("Application response:", res.data[0].id);

        if (res.data?.length > 0) setApplication(res.data[0]);
        if (res.data[0].id) {
            fetchProfile(accessToken);
        }
      } catch (e) {
        // no application yet — that's fine
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleApply = async () => {
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      const res = await applyForCreator(user.user.id);
      setApplication(res.data?.data || { application_status: "0" });
      setSuccess("Application submitted! We'll review it shortly.");
    } catch (e) {
      setError(
        e.response?.data?.detail || "Failed to submit. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Creator/admin: parent component handles routing
  if (isCreator || isAdmin) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-surface)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--color-brand)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        <div className="bg-white rounded-3xl shadow-sm border border-black/[0.07] overflow-hidden">

          {/* top accent stripe */}
          <div className="h-1 bg-[var(--color-brand)]" />

          <div className="p-8 sm:p-10">

            {/* badge */}
            <div className="inline-flex items-center gap-2 bg-[var(--color-brand-light)] text-[var(--color-brand)] text-[10px] font-bold uppercase tracking-[0.12em] px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand)] animate-pulse" />
              Creator Program
            </div>

            {/* ── Pending state ── */}
            {application ? (
              <div className="text-center py-4">
                <div className="w-20 h-20 rounded-full bg-[var(--color-brand-light)] border border-[var(--color-brand)]/20 flex items-center justify-center text-4xl mx-auto mb-5">
                  ⏳
                </div>
                <h2 className="text-2xl font-bold text-[var(--color-txt)] mb-2">
                  Application Submitted
                </h2>
                <p className="text-[var(--color-txt-secondary)] text-sm leading-relaxed max-w-xs mx-auto">
                  Your application is under review. We'll notify you once a
                  decision is made — usually within 2–5 business days.
                </p>
                <div className="inline-flex items-center gap-2 mt-5 bg-[var(--color-brand-light)] text-[var(--color-brand)] text-sm font-semibold px-5 py-2 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-brand)] animate-pulse" />
                  Approval Pending
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-[2rem] font-bold text-[var(--color-txt)] leading-tight mb-2">
                  Become a Creator
                </h1>
                <p className="text-[var(--color-txt-secondary)] text-sm leading-relaxed mb-8">
                  Share your content with the world. Complete the checklist
                  below before submitting your application.
                </p>

                {/* checklist */}
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-txt-secondary)] mb-3">
                  Before you apply
                </p>
                <ul className="space-y-2 mb-8">
                  {instructions.map(item => (
                    <li
                      key={item.title}
                      className="flex items-start gap-3 p-3.5 rounded-xl bg-[var(--color-surface)] border border-black/[0.06] hover:border-[var(--color-brand)]/40 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-light)] flex items-center justify-center text-sm flex-shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--color-txt)]">
                          {item.title}
                        </p>
                        <p className="text-xs text-[var(--color-txt-secondary)] font-light mt-0.5 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="h-px bg-black/[0.06] mb-6" />

                {/* legal */}
                <p className="text-xs text-[var(--color-txt-secondary)] flex flex-wrap items-center gap-1 mb-6">
                  By applying you agree to our
                  <Link to="/terms" className="text-[var(--color-brand)] font-medium hover:underline">
                    Terms & Conditions
                  </Link>
                  <span className="text-black/20">·</span>
                  <Link to="/privacy" className="text-[var(--color-brand)] font-medium hover:underline">
                    Privacy Policy
                  </Link>
                </p>

                {/* alerts */}
                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
                    <span>⚠</span> {error}
                  </div>
                )}
                {success && (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-4">
                    <span>✓</span> {success}
                  </div>
                )}

                {/* submit */}
                <button
                  onClick={handleApply}
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 bg-[var(--color-brand)] hover:bg-[var(--color-brand)]/90 active:scale-[0.99] text-white font-bold text-sm rounded-xl py-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Application →"
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApplyCreator;