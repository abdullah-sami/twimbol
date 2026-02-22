import { useState, useRef, useEffect } from "react";
import {
    MoreHorizontal,
    X,
    Globe,
    Heart,
    ThumbsUp,
    MessageCircle,
    Share2,
    EyeOff,
    Flag,
    Ban,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { toggleLike, hidePost, reportPost, toggleFollow, blockUser } from "../../api/posts";
import CommentsModal from "./PostComments";

const BASE_URL = "https://rafidabdullahsamiweb.pythonanywhere.com";

function formatCount(n) {
    if (!n && n !== 0) return "0";
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return String(n);
}

function formatTime(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
}

// ─── Image Grid ───────────────────────────────────────────────────────────────

function ImageGrid({ images, onImageClick }) {
    if (!images || images.length === 0) return null;

    const count = images.length;
    const visibleImages = images.slice(0, 5);
    const extra = count > 5 ? count - 5 : 0;

    if (count === 1) {
        return (
            <div
                className="rounded-xl overflow-hidden cursor-pointer"
                onClick={() => onImageClick(images, 0)}
            >
                <img
                    src={visibleImages[0]}
                    alt="Post"
                    className="w-full max-h-96 object-cover hover:scale-[1.01] transition-transform duration-300"
                />
            </div>
        );
    }

    if (count === 2) {
        return (
            <div className="grid grid-cols-2 gap-1 rounded-xl overflow-hidden">
                {visibleImages.map((src, i) => (
                    <img
                        key={i}
                        src={src}
                        alt={`Post ${i + 1}`}
                        className="w-full h-56 object-cover cursor-pointer hover:brightness-95 transition-all duration-200"
                        onClick={() => onImageClick(images, i)}
                    />
                ))}
            </div>
        );
    }

    if (count === 3) {
        return (
            <div className="grid grid-cols-2 gap-1 rounded-xl overflow-hidden">
                <img
                    src={visibleImages[0]}
                    alt="Post 1"
                    className="row-span-2 w-full h-full object-cover cursor-pointer hover:brightness-95 transition-all duration-200"
                    style={{ maxHeight: "340px" }}
                    onClick={() => onImageClick(images, 0)}
                />
                {visibleImages.slice(1).map((src, i) => (
                    <img
                        key={i}
                        src={src}
                        alt={`Post ${i + 2}`}
                        className="w-full h-[168px] object-cover cursor-pointer hover:brightness-95 transition-all duration-200"
                        onClick={() => onImageClick(images, i + 1)}
                    />
                ))}
            </div>
        );
    }

    // 4 or 5 images
    return (
        <div className="grid grid-cols-2 gap-1 rounded-xl overflow-hidden">
            {/* Top row: 2 big images */}
            {visibleImages.slice(0, 2).map((src, i) => (
                <img
                    key={i}
                    src={src}
                    alt={`Post ${i + 1}`}
                    className="w-full h-52 object-cover cursor-pointer hover:brightness-95 transition-all duration-200"
                    onClick={() => onImageClick(images, i)}
                />
            ))}
            {/* Bottom row: 3 smaller images */}
            {visibleImages.slice(2, 5).map((src, i) => {
                const isLast = i === 2 && extra > 0;
                return (
                    <div
                        key={i + 2}
                        className="relative cursor-pointer"
                        style={{ gridColumn: count === 4 && i === 0 ? "1 / -1" : "auto" }}
                        onClick={() => onImageClick(images, i + 2)}
                    >
                        <img
                            src={src}
                            alt={`Post ${i + 3}`}
                            className={`w-full object-cover hover:brightness-95 transition-all duration-200 ${count === 4 ? "h-52" : "h-40"
                                } ${isLast ? "brightness-50" : ""}`}
                        />
                        {isLast && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-white text-2xl font-bold">+{extra}</span>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({ images, startIndex, onClose }) {
    const [current, setCurrent] = useState(startIndex);

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowRight") setCurrent((i) => Math.min(i + 1, images.length - 1));
            if (e.key === "ArrowLeft") setCurrent((i) => Math.max(i - 1, 0));
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [images, onClose]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
                <X size={20} />
            </button>

            {current > 0 && (
                <button
                    onClick={() => setCurrent((i) => i - 1)}
                    className="absolute left-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
            )}

            <img
                src={images[current]}
                alt={`Image ${current + 1}`}
                className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
            />

            {current < images.length - 1 && (
                <button
                    onClick={() => setCurrent((i) => i + 1)}
                    className="absolute right-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                    <ChevronRight size={24} />
                </button>
            )}

            <div className="absolute bottom-4 flex gap-1.5">
                {images.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        className={`w-2 h-2 rounded-full transition-all ${i === current ? "bg-white w-4" : "bg-white/40"
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}

// ─── Three Dot Menu ───────────────────────────────────────────────────────────

function PostMenu({ isOpen, onHide, onReport, onBlock, menuRef }) {
    if (!isOpen) return null;

    const items = [
        { icon: EyeOff, label: "Hide post", action: onHide, color: "text-txt" },
        { icon: Flag, label: "Report post", action: onReport, color: "text-orange-500" },
        { icon: Ban, label: "Block content creator", action: onBlock, color: "text-red-500" },
    ];

    return (
        <div
            ref={menuRef}
            className="absolute right-0 top-8 z-20 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 overflow-hidden"
        >
            {items.map(({ icon: Icon, label, action, color }) => (
                <button
                    key={label}
                    onClick={action}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm ${color} hover:bg-surface transition-colors text-left`}
                >
                    <Icon size={16} className="flex-shrink-0" />
                    {label}
                </button>
            ))}
        </div>
    );
}

// ─── PostCard ─────────────────────────────────────────────────────────────────

export default function PostCard({ post, onHidden }) {
    const [liked, setLiked] = useState(post.liked_by_user || false);
    const [followed, setFollowed] = useState(post.user_profile.followed_by_user || false);
    const [likeCount, setLikeCount] = useState(post.like_count || 0);
    const [menuOpen, setMenuOpen] = useState(false);
    const [commentsOpen, setCommentsOpen] = useState(false);
    const [lightbox, setLightbox] = useState(null); // { images, index }
    const [hidden, setHidden] = useState(false);
    const menuRef = useRef(null);
    const menuBtnRef = useRef(null);

    // Close menu on outside click
    useEffect(() => {
        const handler = (e) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(e.target) &&
                !menuBtnRef.current.contains(e.target)
            ) {
                setMenuOpen(false);
            }
        };
        if (menuOpen) document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [menuOpen]);

    const handleLike = async () => {
        const next = !liked;
        setLiked(next);
        setLikeCount((c) => (next ? c + 1 : c - 1));
        try {
            await toggleLike(post.id);
        } catch {
            setLiked(!next);
            setLikeCount((c) => (next ? c - 1 : c + 1));
        }
    };

    const handleFollow = async (created_by) => {
        const next = !followed;
        setFollowed(next);
        // setLikeCount((c) => (next ? c + 1 : c - 1));
        try {
            await toggleFollow(created_by);
        } catch (err) {
            setFollowed(!next);
            //   setLikeCount((c) => (next ? c - 1 : c + 1));
        }

        
    }

        const handleHide = async () => {
            setMenuOpen(false);
            try {
                await hidePost(post.id);
                setHidden(true);
                onHidden?.(post.id);
            } catch (err) {
                console.error(err);
            }
        };

        const handleReport = async () => {
            setMenuOpen(false);
            try {
                await reportPost(post.id);
            } catch (err) {
                console.error(err);
            }
        };

        const handleBlock = async () => {
            setMenuOpen(false);
            const userId = post.created_by;
            if (!userId) return;
            try {
                await blockUser(userId);
                setHidden(true);
                onHidden?.(post.id);
            } catch (err) {
                console.error(err);
            }
        };

        const handleImageClick = (images, index) => {
            setLightbox({ images, index });
        };

        if (hidden) return null;

        // Build images array from post data
        const images = [];
        if (post.post_banner) {
            const url = post.post_banner.startsWith("http")
                ? post.post_banner
                : `${BASE_URL}${post.post_banner}`;
            images.push(url);
        }
        if (post.images?.length) {
            post.images.forEach((img) => {
                const url = typeof img === "string"
                    ? (img.startsWith("http") ? img : `${BASE_URL}${img}`)
                    : img.url || img.image || "";
                if (url) images.push(url);
            });
        }

        const profilePic = post.user_profile?.profile_pic
            ? `${BASE_URL}${post.user_profile.profile_pic}`
            : null;
        const username =
            post.username?.username ||
            post.user_profile?.username ||
            post.user_profile?.user?.username ||
            "User";
        const commentCount = post.comments?.length || post.comment_count || 0;
        const shareCount = post.share_count || 0;
        const description = post.post_description || post.post_title || "";
        const createdAt = post.created_at ? formatTime(post.created_at) : "";

        return (
            <>
                <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-start justify-between px-5 pt-5 pb-3">
                        <div className="flex items-center gap-3">
                            {/* Avatar */}
                            <div className="w-11 h-11 rounded-full bg-surface overflow-hidden flex-shrink-0 ring-2 ring-brand/10">
                                {profilePic ? (
                                    <img
                                        src={profilePic}
                                        alt={username}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-base font-bold text-brand bg-brand-light">
                                        {username[0]?.toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm text-txt">{username}</span>
                                    <span className="text-brand text-sm font-semibold cursor-pointer hover:underline" onClick={() => handleFollow(post.created_by)}>
                                        {followed ? "• Following" : "• Follow"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    {createdAt && (
                                        <span className="text-xs text-txt-secondary">{createdAt}</span>
                                    )}
                                    <Globe size={12} className="text-txt-secondary" />
                                </div>
                            </div>
                        </div>

                        {/* Right actions */}
                        <div className="flex items-center gap-1">
                            <div className="relative">
                                <button
                                    ref={menuBtnRef}
                                    onClick={() => setMenuOpen((o) => !o)}
                                    className="p-2 rounded-full hover:bg-surface transition-colors text-txt-secondary"
                                >
                                    <MoreHorizontal size={18} />
                                </button>
                                <PostMenu
                                    isOpen={menuOpen}
                                    onHide={handleHide}
                                    onReport={handleReport}
                                    onBlock={handleBlock}
                                    menuRef={menuRef}
                                />
                            </div>
                            <button
                                className="p-2 rounded-full hover:bg-surface transition-colors text-txt-secondary"
                                onClick={() => onHidden?.(post.id)}
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Description */}
                    {description && (
                        <div className="px-5 pb-3">
                            <PostDescription text={description} />
                        </div>
                    )}

                    {/* Images */}
                    {images.length > 0 && (
                        <div className="px-4 pb-3">
                            <ImageGrid images={images} onImageClick={handleImageClick} />
                        </div>
                    )}

                    {/* Stats row */}
                    <div className="px-5 py-2 flex items-center justify-between text-xs text-txt-secondary border-t border-gray-50">
                        <div className="flex items-center gap-1">
                            <div className="flex -space-x-1">
                                <span className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                                    <ThumbsUp size={10} className="text-white" />
                                </span>
                                <span className="w-5 h-5 rounded-full bg-brand flex items-center justify-center">
                                    <Heart size={10} className="text-white fill-white" />
                                </span>
                            </div>
                            <span className="ml-1">{formatCount(likeCount)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            {commentCount > 0 && <span>{commentCount} comments</span>}
                            {shareCount > 0 && <span>{formatCount(shareCount)} shares</span>}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="px-3 py-1 flex items-center border-t border-gray-100">
                        <ActionButton
                            icon={Heart}
                            label="Like"
                            active={liked}
                            onClick={handleLike}
                            activeClass="text-brand fill-brand"
                        />
                        <ActionButton
                            icon={MessageCircle}
                            label="Comment"
                            onClick={() => setCommentsOpen(true)}
                        />
                        <ActionButton icon={Share2} label="Share" />
                    </div>
                </article>

                {/* Comments Modal */}
                <CommentsModal
                    postId={post.id}
                    isOpen={commentsOpen}
                    onClose={() => setCommentsOpen(false)}
                    commentCount={commentCount}
                />

                {/* Lightbox */}
                {lightbox && (
                    <Lightbox
                        images={lightbox.images}
                        startIndex={lightbox.index}
                        onClose={() => setLightbox(null)}
                    />
                )}
            </>
        );
    }

    function ActionButton({ icon: Icon, label, active, onClick, activeClass }) {
        return (
            <button
                onClick={onClick}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-surface ${active ? activeClass || "text-brand" : "text-txt-secondary"
                    }`}
            >
                <Icon
                    size={18}
                    className={active && activeClass?.includes("fill") ? "fill-current" : ""}
                />
                {label}
            </button>
        );
    }

    function PostDescription({ text }) {
        const [expanded, setExpanded] = useState(false);
        const MAX = 140;
        const isLong = text.length > MAX;

        return (
            <p className="text-sm text-txt leading-relaxed">
                {isLong && !expanded ? (
                    <>
                        {text.slice(0, MAX)}
                        {"... "}
                        <button
                            onClick={() => setExpanded(true)}
                            className="font-semibold text-txt hover:text-brand transition-colors"
                        >
                            See more
                        </button>
                    </>
                ) : (
                    text
                )}
            </p>
        );
    }