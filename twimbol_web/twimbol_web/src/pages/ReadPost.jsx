import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import {
  getPost,
  likePost,
  unlikePost,
  getPostComments,
  addComment,
  deleteComment,
  followUser,
  reportPost,
  hidePost,
} from "../api/readpost";
import {useAuthStore} from "../store/authStore";
import NavBar from "../components/layout/Navbar";
import {showToast, Toast} from "../components/ui/Toast";

const BASE_URL = "https://rafidabdullahsamiweb.pythonanywhere.com";

// ─── Helpers ────────────────────────────────────────────────────────────────

function fullUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path}`;
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// Converts plain text with URLs into clickable links, handles **bold**, newlines
function FormattedText({ text }) {
  if (!text) return null;

  const urlRegex = /(https?:\/\/[^\s]+)/g;

  const lines = text.split("\n");

  return (
    <>
      {lines.map((line, li) => {
        const parts = line.split(urlRegex);
        const rendered = parts.map((part, i) => {
          if (urlRegex.test(part)) {
            urlRegex.lastIndex = 0;
            return (
              <a
                key={i}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand underline underline-offset-2 hover:text-brand/80 break-all"
              >
                {part}
              </a>
            );
          }
          // handle **bold**
          const boldParts = part.split(/\*\*(.*?)\*\*/g);
          return boldParts.map((bp, j) =>
            j % 2 === 1 ? (
              <strong key={j} className="font-semibold text-txt">
                {bp}
              </strong>
            ) : (
              bp
            )
          );
        });
        return (
          <span key={li}>
            {rendered}
            {li < lines.length - 1 && <br />}
          </span>
        );
      })}
    </>
  );
}

// ─── Image Gallery ───────────────────────────────────────────────────────────

function ImageGallery({ images }) {
  const [lightbox, setLightbox] = useState(null);
  const [slideIdx, setSlideIdx] = useState(0);

  const imgList = Array.isArray(images) ? images : images ? [images] : [];
  if (!imgList.length) return null;

  const count = imgList.length;

  const gridClass =
    count === 1
      ? "grid-cols-1"
      : count === 2
      ? "grid-cols-2"
      : count === 3
      ? "grid-cols-3"
      : count === 4
      ? "grid-cols-2"
      : "grid-cols-3";

  const openLightbox = (idx) => {
    setSlideIdx(idx);
    setLightbox(true);
  };

  const closeLightbox = () => setLightbox(false);

  const prev = (e) => {
    e.stopPropagation();
    setSlideIdx((i) => (i - 1 + count) % count);
  };
  const next = (e) => {
    e.stopPropagation();
    setSlideIdx((i) => (i + 1) % count);
  };

  return (
    <>
      <div className={`grid ${gridClass} gap-1.5 rounded-xl overflow-hidden`}>
        {imgList.map((src, i) => (
          <div
            key={i}
            className={`relative overflow-hidden cursor-zoom-in group bg-surface ${
              count === 3 && i === 0 ? "row-span-2" : ""
            } ${count === 1 ? "max-h-[560px]" : "aspect-square"}`}
            onClick={() => openLightbox(i)}
          >
            <img
              src={fullUrl(src)}
              alt={`Image ${i + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
            {count > 5 && i === 4 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  +{count - 5}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white text-3xl font-light z-10"
            onClick={closeLightbox}
          >
            ×
          </button>
          {count > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-4xl z-10 px-2"
                onClick={prev}
              >
                ‹
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-4xl z-10 px-2"
                onClick={next}
              >
                ›
              </button>
            </>
          )}
          <img
            src={fullUrl(imgList[slideIdx])}
            alt={`Image ${slideIdx + 1}`}
            className="max-w-[90vw] max-h-[90vh] object-contain select-none"
            onClick={(e) => e.stopPropagation()}
          />
          {count > 1 && (
            <div className="absolute bottom-4 flex gap-1.5">
              {imgList.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSlideIdx(i);
                  }}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    i === slideIdx ? "bg-white" : "bg-white/40"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

// ─── Avatar ──────────────────────────────────────────────────────────────────

function Avatar({ src, name, size = "md" }) {
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-12 h-12 text-base" };
  const initials = name ? name.slice(0, 2).toUpperCase() : "?";
  return src ? (
    <img
      src={fullUrl(src)}
      alt={name}
      className={`${sizes[size]} rounded-full object-cover shrink-0`}
    />
  ) : (
    <div
      className={`${sizes[size]} rounded-full bg-brand/20 text-brand font-semibold flex items-center justify-center shrink-0`}
    >
      {initials}
    </div>
  );
}

// ─── Three-dot Menu ──────────────────────────────────────────────────────────

function ThreeDotMenu({ post, isOwner, onHide, onReport, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="cursor-pointer p-2 rounded-full hover:bg-surface text-txt-secondary hover:text-txt transition-colors"
        aria-label="Post options"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <circle cx="10" cy="4" r="1.5" />
          <circle cx="10" cy="10" r="1.5" />
          <circle cx="10" cy="16" r="1.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-black/5 py-1 z-50 text-sm">
          {!isOwner && (
            <>
              <button
                className="w-full text-left px-4 py-2.5 hover:bg-surface text-txt transition-colors flex items-center gap-2"
                onClick={() => { onHide(); setOpen(false); }}
              >
                <span>🙈</span> Hide post
              </button>
              <button
                className="w-full text-left px-4 py-2.5 hover:bg-surface text-txt transition-colors flex items-center gap-2"
                onClick={() => { onReport(); setOpen(false); }}
              >
                <span>🚩</span> Report
              </button>
            </>
          )}
          {isOwner && (
            <button
              className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-500 transition-colors flex items-center gap-2"
              onClick={() => { onDelete(); setOpen(false); }}
            >
              <span>🗑</span> Delete post
            </button>
          )}
          <button
            className="w-full text-left px-4 py-2.5 hover:bg-surface text-txt transition-colors flex items-center gap-2"
            onClick={() => { navigator.clipboard.writeText(window.location.href); setOpen(false); }}
          >
            <span>🔗</span> Copy link
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Comment ─────────────────────────────────────────────────────────────────

function Comment({ comment, currentUserId, onDelete }) {
  const user = comment.created_by?.user;
  const username = user?.username || "Unknown";
  const profilePic = user?.profile_pic;
  const canDelete = currentUserId && comment.created_by?.id === currentUserId;
    
  return (
    <div className="flex gap-3 group">
      <Avatar src={profilePic} name={username} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="bg-surface rounded-2xl px-3.5 py-2.5">
          <span className="font-semibold text-txt text-sm mr-1.5">{username}</span>
          <span className="text-txt text-sm leading-relaxed break-words">
            <FormattedText text={comment.comment} />
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1 ml-1">
          <span className="text-xs text-txt-secondary">{timeAgo(comment.created_at)}</span>
          {canDelete && (
            <button
              onClick={() => onDelete(comment.id)}
              className="text-xs text-txt-secondary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Report Modal ─────────────────────────────────────────────────────────────

const REPORT_REASONS = [
  { value: "spam", label: "Spam" },
  { value: "abuse", label: "Abuse / Harassment" },
  { value: "false", label: "False information" },
  { value: "hate", label: "Hate speech" },
  { value: "nsfw", label: "NSFW content" },
  { value: "other", label: "Other" },
];

function ReportModal({ onClose, onSubmit }) {
  const [reason, setReason] = useState("spam");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    await onSubmit({ reason, description: desc });
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[90] bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-txt mb-4">Report Post</h3>
        <div className="space-y-2 mb-4">
          {REPORT_REASONS.map((r) => (
            <label key={r.value} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="reason"
                value={r.value}
                checked={reason === r.value}
                onChange={() => setReason(r.value)}
                className="accent-brand"
              />
              <span className="text-txt text-sm">{r.label}</span>
            </label>
          ))}
        </div>
        <textarea
          placeholder="Additional details (optional)"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={3}
          className="w-full border border-black/10 rounded-xl px-3 py-2 text-sm text-txt focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none bg-surface"
        />
        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-black/10 text-txt-secondary text-sm hover:bg-surface transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand/90 disabled:opacity-50 transition-colors"
          >
            {loading ? "Reporting…" : "Report"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ReadPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuthStore();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // interactions
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);

  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // comments
  const [comments, setComments] = useState([]);
  const [commentPage, setCommentPage] = useState(1);
  const [commentTotal, setCommentTotal] = useState(0);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // modals
  const [showReport, setShowReport] = useState(false);
  const [toast, setToast] = useState(null);

  

  // ── Fetch post ────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getPost(id);
        setPost(data);
        setLiked(data.liked_by_user || false);
        setLikeCount(data.like_count || 0);
        setFollowing(data.user_profile?.followed_by_user || false);
      } catch (e) {
        setError("Failed to load post.");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  // ── Fetch comments ────────────────────────────────────────────────────
  const fetchComments = useCallback(
    async (page = 1, append = false) => {
      setCommentsLoading(true);
      try {
        const data = await getPostComments(id, { page, page_size: 10 });
        setCommentTotal(data.count || 0);
        setComments((prev) => (append ? [...prev, ...data.results] : data.results));
      } catch {
        showToast("Could not load comments.", "error", setToast);
      } finally {
        setCommentsLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    fetchComments(1, false);
  }, [fetchComments]);

  // ── Like / Unlike ──────────────────────────────────────────────────────
  const handleLike = async () => {
    if (!authUser) return showToast("Log in to like posts.", "error", setToast);
    setLikeLoading(true);
    try {
      if (liked) {
        await unlikePost(id);
        setLiked(false);
        setLikeCount((c) => c - 1);
      } else {
        await likePost(id);
        setLiked(true);
        setLikeCount((c) => c + 1);
      }
    } catch {
      showToast("Action failed. Try again.", "error", setToast);
    } finally {
      setLikeLoading(false);
    }
  };

  // ── Follow / Unfollow ─────────────────────────────────────────────────
  const handleFollow = async () => {
    if (!authUser) return showToast("Log in to follow users.", "error", setToast);
    setFollowLoading(true);
    try {
      const res = await followUser(post.created_by);
      setFollowing((v) => !v);
      showToast(res?.detail || "Done!", "success", setToast);
    } catch {
      showToast("Could not follow. Try again.", "error", setToast);
    } finally {
      setFollowLoading(false);
    }
  };

  // ── Comment ───────────────────────────────────────────────────────────
  const handleComment = async (e) => {
    e?.preventDefault();
    if (!commentInput.trim()) return;
    if (!authUser) return showToast("Log in to comment.", "error", setToast);
    setSubmittingComment(true);
    try {
      await addComment(id, { comment: commentInput.trim() });
      setCommentInput("");
      await fetchComments(1, false);
      setCommentPage(1);
      showToast("Comment added!", "success", setToast);
    } catch {
      showToast("Could not add comment.", "error", setToast);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await deleteComment(id, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setCommentTotal((t) => t - 1);
      showToast("Comment deleted.", "success", setToast);
    } catch {
      showToast("Could not delete comment.", "error", setToast);
    }
  };

  // ── Load more comments ─────────────────────────────────────────────────
  const loadMoreComments = () => {
    const nextPage = commentPage + 1;
    setCommentPage(nextPage);
    fetchComments(nextPage, true);
  };

  // ── Hide ───────────────────────────────────────────────────────────────
  const handleHide = async () => {
    if (!authUser) return showToast("Log in first.", "error", setToast);
    try {
      await hidePost(id);
      showToast("Post hidden from your feed.", "success", setToast);
      navigate(-1);
    } catch {
      showToast("Could not hide post.", "error", setToast);
    }
  };

  // ── Report ─────────────────────────────────────────────────────────────
  const handleReport = async (payload) => {
    try {
      await reportPost(id, payload);
      showToast("Post reported. Thank you.", "success", setToast);
    } catch {
      showToast("Could not report. Try again.", "error", setToast);
    }
  };

  // ── Share ──────────────────────────────────────────────────────────────
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.post_title || "Post",
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast("Link copied!", "success", setToast);
    }
  };

  // ── Derived ─────────────────────────────────────────────────────────────
  const postUser = post?.username || {};
  const username = postUser?.username || "Unknown";
  const userProfile = post?.user_profile || {};
  const profilePic = userProfile?.profile_pic || userProfile?.user?.profile_pic;
  const isOwner = authUser && post?.created_by === authUser.id;
  const hasMoreComments = comments.length < commentTotal;

  // Collect images: post_banner could be single or multiple
  const images = (() => {
    if (!post) return [];
    if (post.images && Array.isArray(post.images)) return post.images;
    if (post.post_banner) return [post.post_banner];
    return [];
  })();

  // ── Render ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-brand/30 border-t-brand rounded-full animate-spin" />
          <span className="text-txt-secondary text-sm">Loading post…</span>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (<>
      <div className=" bg-surface flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl mb-2">😕</p>
          <p className="text-txt font-semibold">{error || "Post not found."}</p>
          <button
            onClick={() => navigate(-1)}
            className="cursor-pointer mt-4 px-5 py-2 bg-brand text-white rounded-full text-sm hover:bg-brand/90"
          >
            Go back
          </button>
        </div>
      </div></>
    );
  }
  
  return (<>
      <NavBar activePage="Posts"/>
    <div className="min-h-screen bg-surface">
      {/* Toast */}
      {toast && (
        <Toast toast={toast} />
      )}

      {/* Report Modal */}
      {showReport && (
        <ReportModal
          onClose={() => setShowReport(false)}
          onSubmit={handleReport}
        />
      )}

      <div className="max-w-2xl mx-auto px-4 py-6 pb-16">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="cursor-pointer flex items-center gap-1 text-txt-secondary hover:text-txt text-sm mb-3 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Card */}
        <article className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-5 pt-5 pb-0">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar src={profilePic} name={username} size="lg" />
              <div className="min-w-0">
                <p className="font-semibold text-txt leading-tight truncate">{username}</p>
                <p className="text-xs text-txt-secondary mt-0.5">{timeAgo(post.created_at)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Follow button — only shown if not owner */}
              {!isOwner && (
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`cursor-pointer px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                    following
                      ? "border border-black/15 text-txt-secondary hover:border-black/30 bg-white"
                      : "bg-brand text-white hover:bg-brand/90"
                  } disabled:opacity-50`}
                >
                  {followLoading ? "…" : following ? "Following" : "Follow"}
                </button>
              )}

              <ThreeDotMenu
                post={post}
                isOwner={isOwner}
                onHide={handleHide}
                onReport={() => setShowReport(true)}
                onDelete={() => {
                  // Placeholder: implement delete via your API
                  showToast("Delete not implemented here.", "error");
                }}
              />
            </div>
          </div>

          {/* ── Title ── */}
          {post.post_title && (
            <div className="px-5 pt-4">
              <h1 className="text-xl font-bold text-txt leading-snug">
                {post.post_title}
              </h1>
            </div>
          )}

          {/* ── Description ── */}
          {post.post_description && (
            <div className="px-5 pt-3 pb-1">
              <p className="text-[15px] text-txt leading-relaxed">
                <FormattedText text={post.post_description} />
              </p>
            </div>
          )}

          {/* ── Image Gallery ── */}
          {images.length > 0 && (
            <div className="mt-4 px-0">
              <ImageGallery images={images} />
            </div>
          )}

          {/* ── Stats row ── */}
          <div className="flex items-center justify-between px-5 py-3 text-sm text-txt-secondary border-t border-black/5 mt-3">
            <span>
              {likeCount} {likeCount === 1 ? "like" : "likes"}
            </span>
            <span>
              {commentTotal} {commentTotal === 1 ? "comment" : "comments"}
            </span>
          </div>

          {/* ── Actions ── */}
          <div className="flex border-t border-b border-black/5 mx-0">
            {[
              {
                label: liked ? "Liked" : "Like",
                icon: (
                  <svg
                    className={`w-5 h-5 transition-transform ${liked ? "scale-110" : ""}`}
                    fill={liked ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth={liked ? 0 : 2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                ),
                active: liked,
                loading: likeLoading,
                onClick: handleLike,
              },
              {
                label: "Comment",
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                ),
                onClick: () => document.getElementById("comment-input")?.focus(),
              },
              {
                label: "Share",
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                ),
                onClick: handleShare,
              },
            ].map((action) => (
              <button
                key={action.label}
                onClick={action.onClick}
                disabled={action.loading}
                className={`cursor-pointer flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                  action.active
                    ? "text-brand"
                    : "text-txt-secondary hover:text-txt hover:bg-surface"
                } disabled:opacity-50`}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>

          {/* ── Comment Input ── */}
          {authUser && (
            <div className="px-5 py-4 flex gap-3 items-start">
              <Avatar
                src={authUser?.user.profile_pic}
                name={authUser?.username}
                size="sm"
              />
              <div className="flex-1 flex gap-2">
                <textarea
                  id="comment-input"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleComment();
                    }
                  }}
                  placeholder="Write a comment…"
                  rows={1}
                  className="flex-1 bg-surface rounded-2xl px-4 py-2.5 text-sm text-txt placeholder:text-txt-secondary resize-none focus:outline-none focus:ring-2 focus:ring-brand/30 leading-relaxed"
                  style={{ minHeight: "40px" }}
                />
                <button
                  onClick={handleComment}
                  disabled={submittingComment || !commentInput.trim()}
                  className="cursor-pointer shrink-0 px-4 py-2 bg-brand text-white rounded-2xl text-sm font-semibold disabled:opacity-40 hover:bg-brand/90 transition-colors self-end"
                >
                  {submittingComment ? "…" : "Post"}
                </button>
              </div>
            </div>
          )}

          {/* ── Comments List ── */}
          <div className="px-5 pb-5 space-y-4">
            {comments.length === 0 && !commentsLoading && (
              <p className="text-sm text-txt-secondary text-center py-4">
                No comments yet. Be the first!
              </p>
            )}

            {comments.map((comment) => (
              <Comment
                key={comment.id}
                comment={comment}
                currentUserId={authUser?.id}
                onDelete={handleDeleteComment}
              />
            ))}

            {commentsLoading && (
              <div className="flex justify-center py-3">
                <div className="w-5 h-5 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
              </div>
            )}

            {hasMoreComments && !commentsLoading && (
              <button
                onClick={loadMoreComments}
                className="w-full py-2 text-sm text-brand font-medium hover:underline"
              >
                Load more comments
              </button>
            )}
          </div>
        </article>
      </div>
    </div>
    </>
  );
}