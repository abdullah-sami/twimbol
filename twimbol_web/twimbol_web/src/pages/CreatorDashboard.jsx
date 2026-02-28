import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { ApplyCreator } from "./ApplyCreator";
import {
    getMyPosts,
    deletePost,
    createPost,
    createReel,
    uploadVideoToCloudinary,
    getAnalytics
} from "../api/creator";
import { thumbnail } from "@cloudinary/url-gen/actions/resize";
import { cat } from "@cloudinary/url-gen/qualifiers/focusOn";
import { useNavigate } from "react-router-dom";


/* ── helpers ── */
const fmt = (n = 0) =>
    n >= 1_000_000
        ? (n / 1_000_000).toFixed(1) + "M"
        : n >= 1_000
            ? (n / 1_000).toFixed(1) + "K"
            : String(n);

const TYPE_LABEL = { post: "Post", reel: "Reel", video: "Video" };
const TYPE_ICON = { post: "📝", reel: "🎬", video: "📹" };

/* ─────────────────────────────────────
   StatCard
───────────────────────────────────── */
function StatCard({ label, value, icon, loading }) {
    return (
        <div className="bg-white border border-black/[0.07] rounded-2xl p-5 flex items-center gap-4 hover:-translate-y-0.5 transition-transform">
            <div className="w-11 h-11 rounded-xl bg-[var(--color-brand-light)] flex items-center justify-center text-xl flex-shrink-0">
                {icon}
            </div>
            <div>
                {loading ? (
                    <>
                        <div className="h-6 w-16 bg-[var(--color-surface)] rounded animate-pulse mb-1" />
                        <div className="h-3 w-20 bg-[var(--color-surface)] rounded animate-pulse" />
                    </>
                ) : (
                    <>
                        <div className="text-2xl font-bold text-[var(--color-txt)] leading-none mb-1">
                            {fmt(value ?? 0)}
                        </div>
                        <div className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-txt-secondary)]">
                            {label}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────
   ContentRow
───────────────────────────────────── */
function ContentRow({ post, onDelete }) {
    const navigate = useNavigate();

    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!window.confirm("Delete this content permanently?")) return;
        setDeleting(true);
        try { await onDelete(post.id, post.post_type); }
        finally { setDeleting(false); }
    };

    return (
        <div className="flex items-center gap-3 px-4 py-3 bg-white border border-black/[0.07] rounded-xl hover:border-[var(--color-brand)]/30 transition-colors " >
            {/* type badge */}
            <span className="inline-flex items-center gap-1.5 bg-[var(--color-surface)] border border-black/[0.06] text-[var(--color-txt-secondary)] text-xs font-medium px-2.5 py-1 rounded-lg flex-shrink-0">
                {TYPE_ICON[post.post_type] || "📄"}
                {TYPE_LABEL[post.post_type] || post.post_type}
            </span>

            {/* info */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--color-txt)] truncate cursor-pointer" onClick={() => navigate(`/${post.post_type=="post"?"post":"reel"}/${post.id}`)}>
                    {post.post_title || post.title || "Untitled"}
                </p>
                <p className="text-xs text-[var(--color-txt-secondary)] font-light">
                    {new Date(post.created_at).toLocaleDateString("en-US", {
                        day: "numeric", month: "short", year: "numeric",
                    })}
                </p>
            </div>

            {/* stats */}
            <div className="hidden sm:flex items-center gap-4 text-xs text-[var(--color-txt-secondary)] flex-shrink-0">
                <span>♥ {fmt(post.like_count || 0)}</span>
                <span>👁 {fmt(post.view_count || 0)}</span>
            </div>

            {/* delete */}
            <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-xs font-semibold text-red-500 border border-red-200 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
                {deleting ? "…" : "Delete"}
            </button>
        </div>
    );
}

/* ── Skeleton row ── */
function SkeletonRow() {
    return (
        <div className="flex items-center gap-3 px-4 py-3 bg-white border border-black/[0.07] rounded-xl">
            <div className="w-16 h-7 bg-[var(--color-surface)] rounded-lg animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-1/2 bg-[var(--color-surface)] rounded animate-pulse" />
                <div className="h-2.5 w-1/4 bg-[var(--color-surface)] rounded animate-pulse" />
            </div>
        </div>
    );
}

/* ─────────────────────────────────────
   CreatePostModal
   Uses POST /api/posts/ — multipart/form-data
   Fields: post_title, post_description, post_banner (file)
───────────────────────────────────── */
function CreatePostModal({ onClose, onCreated }) {
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [banner, setBanner] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { user } = useAuthStore();

    const handleSubmit = async () => {
        if (!title.trim()) return setError("Title is required.");
        setLoading(true);
        setError("");
        try {
            const fd = new FormData();
            fd.append("post_title", title);
            fd.append("post_type", "post");
            fd.append("created_by", user.user.id);
            if (desc) fd.append("post_description", desc);
            if (banner) fd.append("post_banner", banner);
            await createPost(fd);
            onCreated();
        } catch (e) {
            setError(e.response?.data?.post_title?.[0] || e.response?.data?.detail || "Failed to create post.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalShell title="New Post" onClose={loading ? undefined : onClose}>
            {error && <Alert type="error">{error}</Alert>}
            <FormField label="Title *">
                <input
                    className={inputCls}
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Post title…"
                />
            </FormField>
            <FormField label="Description">
                <textarea
                    className={`${inputCls} resize-y min-h-[80px]`}
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    placeholder="Tell your story…"
                />
            </FormField>
            <FormField label="Banner Image">
                <input
                    className={inputCls}
                    type="file"
                    accept="image/*"
                    onChange={e => setBanner(e.target.files[0])}
                />
                {banner && (
                    <p className="text-xs text-[var(--color-txt-secondary)] font-light">
                        📎 {banner.name}
                    </p>
                )}
            </FormField>
            <ModalFooter
                onClose={onClose}
                onSubmit={handleSubmit}
                loading={loading}
                label="Publish Post"
            />
        </ModalShell>
    );
}

/* ─────────────────────────────────────
   UploadReelModal
   Flow: upload file → Cloudinary → receive URL →
         POST /create/api/reel/ with { video_url, title, reel_description }
───────────────────────────────────── */
function UploadReelModal({ onClose, onCreated }) {
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [file, setFile] = useState(null);
    const [progress, setProgress] = useState(0);
    const [stage, setStage] = useState("idle"); // idle | uploading | saving | done
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        if (!file) return setError("Please select a video file.");
        setError("");
        try {
            // 1 — Upload video to Cloudinary
            setStage("uploading");
            const cloud = await uploadVideoToCloudinary(file, setProgress);

            // 2 — Save reel record to backend
            setStage("saving");
            await createReel({
                video_url: cloud.secure_url,
                title: title,
                reel_description: desc,
                thumbnail_url: cloud.secure_url.replace(".mp4", ".png"),
            });

            setStage("done");
            setTimeout(onCreated, 900);
        } catch (e) {
            setError(e.response?.data?.detail || e.message || "Upload failed.");
            setStage("idle");
        }
    };

    const locked = stage !== "idle";

    return (
        <ModalShell title="Upload Reel" onClose={locked ? undefined : onClose}>
            {stage === "done" ? (
                <div className="flex flex-col items-center py-6 text-green-600 gap-3">
                    <div className="w-14 h-14 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-2xl">
                        ✓
                    </div>
                    <p className="font-semibold text-sm">Reel published!</p>
                </div>
            ) : stage === "uploading" ? (
                <ProgressBlock label="Uploading to Cloudinary…" value={progress} />
            ) : stage === "saving" ? (
                <ProgressBlock label="Saving reel…" indeterminate />
            ) : (
                <>
                    {error && <Alert type="error">{error}</Alert>}
                    <FormField label="Title">
                        <input
                            className={inputCls}
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Reel title…"
                        />
                    </FormField>
                    <FormField label="Description">
                        <textarea
                            className={`${inputCls} resize-y min-h-[70px]`}
                            value={desc}
                            onChange={e => setDesc(e.target.value)}
                            placeholder="What's this reel about?"
                        />
                    </FormField>
                    <FormField label="Video File *">
                        <input
                            className={inputCls}
                            type="file"
                            accept="video/*"
                            onChange={e => setFile(e.target.files[0])}
                        />
                        {file && (
                            <p className="text-xs text-[var(--color-txt-secondary)] font-light">
                                📎 {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)
                            </p>
                        )}
                    </FormField>
                    <ModalFooter
                        onClose={onClose}
                        onSubmit={handleSubmit}
                        loading={false}
                        label="Upload & Publish"
                        disabled={!file}
                    />
                </>
            )}
        </ModalShell>
    );
}

/* ─────────────────────────────────────
   Shared modal primitives
───────────────────────────────────── */
const inputCls =
    "w-full bg-[var(--color-surface)] border border-black/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-[var(--color-txt)] placeholder:text-[var(--color-txt-secondary)] outline-none focus:border-[var(--color-brand)]/50 transition-colors";

function FormField({ label, children }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-txt-secondary)]">
                {label}
            </label>
            {children}
        </div>
    );
}

function Alert({ type, children }) {
    const cls =
        type === "error"
            ? "bg-red-50 border-red-200 text-red-600"
            : "bg-green-50 border-green-200 text-green-700";
    return (
        <div className={`flex items-center gap-2 border text-sm px-4 py-3 rounded-xl ${cls}`}>
            {type === "error" ? "⚠" : "✓"} {children}
        </div>
    );
}

function ProgressBlock({ label, value, indeterminate }) {
    return (
        <div className="py-4 text-center space-y-3">
            <p className="text-sm text-[var(--color-txt-secondary)]">{label}</p>
            <div className="h-1.5 bg-[var(--color-surface)] rounded-full overflow-hidden">
                {indeterminate ? (
                    <div
                        className="h-full w-2/5 bg-[var(--color-brand)] rounded-full"
                        style={{ animation: "indeterminate 1.2s linear infinite" }}
                    />
                ) : (
                    <div
                        className="h-full bg-[var(--color-brand)] rounded-full transition-all duration-300"
                        style={{ width: `${value}%` }}
                    />
                )}
            </div>
            {!indeterminate && (
                <p className="text-xs text-[var(--color-txt-secondary)]">{value}%</p>
            )}
            <style>{`
        @keyframes indeterminate {
          0%   { transform: translateX(-150%); }
          100% { transform: translateX(350%); }
        }
      `}</style>
        </div>
    );
}

function ModalShell({ title, onClose, children }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-3xl border border-black/[0.07] shadow-xl w-full max-w-md overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="h-1 bg-[var(--color-brand)]" />
                <div className="px-6 pt-5 pb-1 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-[var(--color-txt)]">{title}</h3>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="w-7 h-7 flex items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-txt-secondary)] text-sm hover:text-[var(--color-txt)] transition-colors"
                        >
                            ✕
                        </button>
                    )}
                </div>
                <div className="px-6 py-5 flex flex-col gap-4">{children}</div>
            </div>
        </div>
    );
}

function ModalFooter({ onClose, onSubmit, loading, label, disabled }) {
    return (
        <div className="flex gap-2.5 justify-end pt-1">
            <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-[var(--color-surface)] border border-black/[0.08] text-sm text-[var(--color-txt-secondary)] font-medium hover:text-[var(--color-txt)] transition-colors"
            >
                Cancel
            </button>
            <button
                onClick={onSubmit}
                disabled={loading || disabled}
                className="px-5 py-2.5 rounded-xl bg-[var(--color-brand)] text-white text-sm font-bold hover:bg-[var(--color-brand)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
                {loading && (
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                )}
                {label}
            </button>
        </div>
    );
}

function EmptyState({ icon, text }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-[var(--color-txt-secondary)]">
            <span className="text-4xl mb-3">{icon}</span>
            <p className="text-sm">{text}</p>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   MAIN DASHBOARD
   
   Analytics are derived client-side from getMyPosts() until
   /create/api/analytics/me/ and /create/api/manage-contents/
   are registered on the backend.

   Endpoints used:
     GET  /create/api/creator/my-posts/   — list posts
     POST /api/posts/                     — create post (multipart)
     DELETE /api/posts/{id}/              — delete post
     POST /create/api/reel/               — save reel after Cloudinary
═══════════════════════════════════════════════════════════ */
export default function CreatorDashboard() {

    const { user } = useAuthStore();
    const userGroup = user.user.user_group || [];
    const isCreator = userGroup.includes("creator");
    const isAdmin = userGroup.includes("admin");

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null); // null | 'post' | 'reel'
    const [tab, setTab] = useState("overview");

    // Analytics derived from posts list
    const [totalFollows, setTotalFollows] = useState(0);
    const [total_likes, setTotalLikes] = useState(0);
    const [total_views, setTotalViews] = useState(0);
    const [total_posts, setTotalPosts] = useState(0);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const rawAnalytics = await getAnalytics();
                // console.log("Raw analytics data:", rawAnalytics);
                if (rawAnalytics && rawAnalytics.data) {
                    setTotalPosts(rawAnalytics.data.total_posts || 0);
                    setTotalLikes(rawAnalytics.data.total_likes || 0);
                    setTotalViews(rawAnalytics.data.total_views || 0);
                    setTotalFollows(rawAnalytics.data.total_followers || 0);
                }
            } catch (e) {
                // Optionally handle error
            }
        };
        fetchAnalytics();
    }, []);




    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await getMyPosts({ page_size: 100 });
            // response may be paginated: { results: [...] } or a plain array
            const list = Array.isArray(res.data)
                ? res.data
                : res.data.results ?? [];
            setPosts(list);
        } catch {
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isCreator || isAdmin) fetchPosts();
    }, [isCreator, isAdmin]);

    const handleDelete = async (postId, post_type) => {
        await deletePost(postId, post_type);
        setPosts(prev => prev.filter(p => p.id !== postId));
    };

    const handleCreated = () => {
        setModal(null);
        fetchPosts();
    };

    // Non-creator/admin → show apply page
    if (!isCreator && !isAdmin) return <ApplyCreator />;

    return (
        <div className="min-h-screen bg-[var(--color-surface)] px-4 py-8 sm:px-8">

            {/* ── Header ── */}
            <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-txt-secondary)] mb-1">
                        {isAdmin ? "Admin" : "Creator"} Studio
                    </p>
                    <h1 className="text-3xl font-bold text-[var(--color-txt)]">
                        Welcome back, {user.user?.first_name || user.user?.username || "Creator"} 👋
                    </h1>
                    <button className="mt-2 text-sm text-[var(--color-brand)] hover:underline" onClick={() => window.location.href = '/'}>{"< Back to Home"}</button>
                </div>
                <div className="flex gap-2.5 flex-wrap">
                    <button
                        onClick={() => setModal("post")}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-black/[0.08] text-sm font-semibold text-[var(--color-txt)] hover:border-[var(--color-brand)]/40 transition-colors"
                    >
                        ✏️ New Post
                    </button>
                    <button
                        onClick={() => setModal("reel")}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-brand)] text-white text-sm font-bold hover:bg-[var(--color-brand)]/90 transition-colors"
                    >
                        🎬 Upload Reel
                    </button>
                </div>
            </div>

            {/* ── Tabs ── */}
            <div className="inline-flex gap-1 bg-white border border-black/[0.07] rounded-xl p-1 mb-7">
                {["overview", "contents"].map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${tab === t
                            ? "bg-[var(--color-brand)] text-white shadow-sm"
                            : "text-[var(--color-txt-secondary)] hover:text-[var(--color-txt)]"
                            }`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {/* ── Overview ── */}
            {tab === "overview" && (
                <>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                        <StatCard
                            label="Total Posts"
                            value={total_posts}
                            icon="📄"
                            loading={loading}
                        />
                        <StatCard
                            label="Total Likes"
                            value={total_likes}
                            icon="♥"
                            loading={loading}
                        />
                        <StatCard
                            label="Total Views"
                            value={total_views}
                            icon="👁"
                            loading={loading}
                        />
                        <StatCard
                            label="Followers"
                            value={totalFollows}
                            icon="👁"
                            loading={loading}
                        />
                    </div>

                    <div className="flex items-center justify-between mb-3">
                        <h2 className="font-bold text-[var(--color-txt)]">Recent Content</h2>
                        <button
                            onClick={() => setTab("contents")}
                            className="text-xs font-semibold text-[var(--color-brand)] hover:underline"
                        >
                            View all →
                        </button>
                    </div>
                    <div className="space-y-2">
                        {loading
                            ? [1, 2, 3].map(i => <SkeletonRow key={i} />)
                            : posts.length === 0
                                ? <EmptyState icon="🎨" text="No content yet. Create your first post or reel!" />
                                : posts.slice(0, 5).map(p => (
                                    <ContentRow key={p.id} post={p} onDelete={handleDelete} />
                                ))
                        }
                    </div>
                </>
            )}

            {/* ── Contents ── */}
            {tab === "contents" && (
                <>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="font-bold text-[var(--color-txt)]">All Content</h2>
                        <span className="text-xs text-[var(--color-txt-secondary)] bg-white border border-black/[0.07] px-3 py-1 rounded-full">
                            {total_posts} posts · {fmt(total_likes)} likes
                        </span>
                    </div>
                    <div className="space-y-2">
                        {loading
                            ? [1, 2, 3, 4].map(i => <SkeletonRow key={i} />)
                            : posts.length === 0
                                ? <EmptyState icon="📭" text="No content yet. Start creating!" />
                                : posts.map(p => (
                                    <ContentRow key={p.id} post={p} onDelete={handleDelete} />
                                ))
                        }
                    </div>
                </>
            )}

            {/* ── Modals ── */}
            {modal === "post" && (
                <CreatePostModal onClose={() => setModal(null)} onCreated={handleCreated} />
            )}
            {modal === "reel" && (
                <UploadReelModal onClose={() => setModal(null)} onCreated={handleCreated} />
            )}
        </div>
    );
}