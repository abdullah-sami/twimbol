import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchReels,
  likeReel,
  unlikeReel,
  hideReel,
  reportReel,
  toggleBlock,
  getImageUrl,
} from "../api/api.js";
import CommentsCard from "../components/reel/ReelComments.jsx";
import DescriptionCard from "../components/reel/ReelDescription.jsx";


// ── helpers ──────────────────────────────────────────────────────────────────
const fmt = (s) => {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

const fmtCount = (n) => {
  if (!n && n !== 0) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
};

// ── Three-dot menu ────────────────────────────────────────────────────────────
function ReelMenu({ reel, onHide, onReport, onBlock, onClose }) {
  return (
    <div className="reel-menu">
      <button className="reel-menu-close" onClick={onClose}>✕</button>
      <button onClick={() => { onHide(reel.post); onClose(); }} className="reel-menu-item">
        <span>🚫</span> Hide Post
      </button>
      <button onClick={() => { onReport(reel.post); onClose(); }} className="reel-menu-item">
        <span>⚑</span> Report Post
      </button>
      <button onClick={() => { onBlock(reel.created_by); onClose(); }} className="reel-menu-item danger">
        <span>⊘</span> Block Creator
      </button>
    </div>
  );
}

// ── Report modal ──────────────────────────────────────────────────────────────
function ReportModal({ postId, onClose }) {
  const [reason, setReason] = useState("spam");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      await reportReel(postId, reason, description);
      setDone(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3>Report Post</h3>
        {done ? (
          <p className="modal-success">Report submitted. Thank you!</p>
        ) : (
          <>
            <select value={reason} onChange={(e) => setReason(e.target.value)}>
              {["spam", "abuse", "false", "hate", "nsfw", "other"].map((r) => (
                <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
              ))}
            </select>
            <textarea
              placeholder="Additional details (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="modal-actions">
              <button onClick={onClose} className="btn-ghost">Cancel</button>
              <button onClick={submit} className="btn-primary" disabled={loading}>
                {loading ? "Sending…" : "Submit"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Single reel slide ─────────────────────────────────────────────────────────
function ReelSlide({
  reel,
  isActive,
  liked,
  likeCount,
  onToggleLike,
  onShare,
  onMenuOpen,
  onOpenComments,
  onOpenDescription,
  sidePanelOpen,
  activeSidePanel,
}) {
  const videoRef = useRef(null);
  const progressRef = useRef(null);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [showPulse, setShowPulse] = useState(false);

  // play / pause when slide becomes active or inactive
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isActive) {
      setProgress(0);
      setCurrentTime(0);
      video.currentTime = 0;
      video.play().catch(() => {});
      setPlaying(true);
    } else {
      video.pause();
    }
  }, [isActive]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isActive) {
      if (playing) video.play().catch(() => {});
      else video.pause();
    }
  }, [playing]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTime = () => {
      if (!dragging) {
        setCurrentTime(video.currentTime);
        setProgress((video.currentTime / video.duration) * 100 || 0);
      }
    };
    const onLoaded = () => setDuration(video.duration);
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("loadedmetadata", onLoaded);
    return () => {
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("loadedmetadata", onLoaded);
    };
  }, [dragging]);

  const handleVideoClick = () => {
    setPlaying((p) => !p);
    if (playing) {
      setShowPulse(true);
      setTimeout(() => setShowPulse(false), 600);
    }
  };

  const seekTo = (e) => {
    const bar = progressRef.current;
    const video = videoRef.current;
    if (!bar || !video) return;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    video.currentTime = pct * duration;
    setProgress(pct * 100);
  };

  const commentCount = reel.comments ?? 0;
  const avatarSrc = getImageUrl(reel.user_profile?.profile_pic);

  return (
    <div className="reel-slide">
      {/* ── Video ─────────────────────────────────────────────────────────── */}
      <video
        ref={videoRef}
        src={reel.video_url}
        className="reel-video"
        muted={muted}
        loop
        playsInline
        poster={reel.thumbnail_url}
        onClick={handleVideoClick}
      />

      {/* Pause pulse */}
      {showPulse && (
        <div className="reel-pulse">
          <div className="reel-pulse-icon">⏸</div>
        </div>
      )}

      {/* Top gradient overlay */}
      <div className="reel-grad-top" />

      {/* Bottom gradient overlay */}
      <div className="reel-grad-bottom" />

      {/* ── Top bar ───────────────────────────────────────────────────────── */}
      <div className="reel-topbar">
        <span className="reel-topbar-title">Reels</span>
        <button className="reel-icon-btn" onClick={onMenuOpen}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="1.6" />
            <circle cx="12" cy="12" r="1.6" />
            <circle cx="12" cy="19" r="1.6" />
          </svg>
        </button>
      </div>

      {/* ── Right actions ─────────────────────────────────────────────────── */}
      <div className="reel-actions">
        {/* Like */}
        <button className={`reel-action-btn ${liked ? "liked" : ""}`} onClick={onToggleLike}>
          <div className="reel-action-icon">
            <svg viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <span>{fmtCount(likeCount)}</span>
        </button>

        {/* Comments */}
        <button
          className={`reel-action-btn ${activeSidePanel === "comments" ? "active" : ""}`}
          onClick={onOpenComments}
        >
          <div className="reel-action-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <span>{fmtCount(commentCount)}</span>
        </button>

        {/* Share */}
        <button className="reel-action-btn" onClick={onShare}>
          <div className="reel-action-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </div>
          <span>Share</span>
        </button>

        {/* Mute */}
        <button className="reel-action-btn" onClick={() => setMuted((m) => !m)}>
          <div className="reel-action-icon">
            {muted ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            )}
          </div>
          <span>{muted ? "Unmute" : "Mute"}</span>
        </button>

        {/* Info */}
        <button
          className={`reel-action-btn ${activeSidePanel === "description" ? "active" : ""}`}
          onClick={onOpenDescription}
        >
          <div className="reel-action-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <span>Info</span>
        </button>
      </div>

      {/* ── Bottom info ───────────────────────────────────────────────────── */}
      <div className="reel-bottom">
        {/* Creator row */}
        <div className="reel-creator-row">
          {avatarSrc ? (
            <img src={avatarSrc} alt="avatar" className="reel-avatar" />
          ) : (
            <div className="reel-avatar-ph">
              {(reel.user_profile?.username || "?")[0].toUpperCase()}
            </div>
          )}
          <div className="reel-creator-meta">
            <span className="reel-creator-name">
              {reel.user_profile?.first_name || reel.user_profile?.username || "Creator"}
            </span>
            {reel.user_profile?.user_type && (
              <span className="reel-creator-type">{reel.user_profile.user_type}</span>
            )}
          </div>
          <button className="reel-follow-btn">Follow +</button>
        </div>

        {/* Caption */}
        {reel.title && <p className="reel-caption">{reel.title}</p>}

        {/* Progress bar */}
        <div className="reel-progress-row">
          <span className="reel-time">{fmt(currentTime)}</span>
          <div
            className="reel-progress-bar"
            ref={progressRef}
            onMouseDown={(e) => { setDragging(true); seekTo(e); }}
            onMouseMove={(e) => { if (dragging) seekTo(e); }}
            onMouseUp={() => setDragging(false)}
            onMouseLeave={() => setDragging(false)}
            onClick={seekTo}
          >
            <div className="reel-progress-track">
              <div className="reel-progress-fill" style={{ width: `${progress}%` }} />
              <div className="reel-progress-thumb" style={{ left: `${progress}%` }} />
            </div>
          </div>
          <span className="reel-time">{fmt(duration)}</span>
        </div>
      </div>
    </div>
  );
}

// ── Main ReelWatch ────────────────────────────────────────────────────────────
export default function ReelWatch() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [reels, setReels] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // ui
  const [showMenu, setShowMenu] = useState(false);
  const [reportPostId, setReportPostId] = useState(null);
  const [sidePanel, setSidePanel] = useState(null);
  const [likedMap, setLikedMap] = useState({});
  const [likeCountMap, setLikeCountMap] = useState({});

  const stackRef = useRef(null);
  const touchStartY = useRef(null);
  const touchStartTime = useRef(null);

  const currentReel = reels[currentIndex];

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const loadReels = useCallback(async (pageNum = 1) => {
    try {
      const data = await fetchReels(pageNum, 30);
      const results = data.results || [];
      setHasMore(!!data.next);

      if (pageNum === 1) {
        if (id) {
          const first = results.find((r) => String(r.post) === String(id));
          const rest = results.filter((r) => String(r.post) !== String(id));
          setReels(first ? [first, ...rest] : results);
        } else {
          setReels(results);
        }
      } else {
        setReels((prev) => {
          const seen = new Set(prev.map((r) => r.post));
          return [...prev, ...results.filter((r) => !seen.has(r.post))];
        });
      }
    } catch (err) {
      console.error("Failed to fetch reels:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadReels(1); }, [loadReels]);

  // ── Sync URL ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentReel) return;
    navigate(`/reel/${currentReel.post}`, { replace: true });
  }, [currentIndex, currentReel]);

  // ── Pre-populate like state from API data ──────────────────────────────────
  useEffect(() => {
    if (reels.length === 0) return;
    setLikedMap((prev) => {
      const next = { ...prev };
      reels.forEach((r) => { if (!(r.post in next)) next[r.post] = r.liked_by_user || false; });
      return next;
    });
    setLikeCountMap((prev) => {
      const next = { ...prev };
      reels.forEach((r) => { if (!(r.post in next)) next[r.post] = r.like_count ?? 0; });
      return next;
    });
  }, [reels]);

  // ── Load more near end ─────────────────────────────────────────────────────
  useEffect(() => {
    if (reels.length > 0 && currentIndex >= reels.length - 3 && hasMore) {
      const next = page + 1;
      setPage(next);
      loadReels(next);
    }
  }, [currentIndex, reels.length, hasMore]);

  // ── Navigation with animation lock ────────────────────────────────────────
  const goTo = useCallback((nextIndex) => {
    if (isTransitioning) return;
    if (nextIndex < 0 || nextIndex >= reels.length) return;
    setIsTransitioning(true);
    setCurrentIndex(nextIndex);
    setTimeout(() => setIsTransitioning(false), 380);
  }, [isTransitioning, reels.length]);

  const goNext = useCallback(() => goTo(currentIndex + 1), [goTo, currentIndex]);
  const goPrev = useCallback(() => goTo(currentIndex - 1), [goTo, currentIndex]);

  // ── Keyboard ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") goNext();
      if (e.key === "ArrowUp"   || e.key === "ArrowLeft")  goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev]);

  // ── Touch / swipe on the player column ────────────────────────────────────
  const onTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
  };

  const onTouchEnd = (e) => {
    if (touchStartY.current === null) return;
    const dy = touchStartY.current - e.changedTouches[0].clientY;
    const dt = Date.now() - touchStartTime.current;
    const velocity = Math.abs(dy) / dt; // px/ms
    // fast flick (>0.3 px/ms) OR slow drag (>80px)
    if (velocity > 0.3 || Math.abs(dy) > 80) {
      if (dy > 0) goNext();
      else goPrev();
    }
    touchStartY.current = null;
  };

  // ── Wheel scroll (desktop) ─────────────────────────────────────────────────
  const wheelAccum = useRef(0);
  const wheelTimer = useRef(null);
  const onWheel = useCallback((e) => {
    e.preventDefault();
    wheelAccum.current += e.deltaY;
    clearTimeout(wheelTimer.current);
    wheelTimer.current = setTimeout(() => {
      if (wheelAccum.current > 60) goNext();
      else if (wheelAccum.current < -60) goPrev();
      wheelAccum.current = 0;
    }, 80);
  }, [goNext, goPrev]);

  useEffect(() => {
    const el = stackRef.current;
    if (!el) return;
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [onWheel]);

  // ── Like ───────────────────────────────────────────────────────────────────
  const toggleLike = async (postId) => {
    const nowLiked = !likedMap[postId];
    setLikedMap((prev) => ({ ...prev, [postId]: nowLiked }));
    setLikeCountMap((prev) => ({
      ...prev,
      [postId]: (prev[postId] ?? 0) + (nowLiked ? 1 : -1),
    }));
    try {
      if (nowLiked) await likeReel(postId);
      else await unlikeReel(postId);
    } catch {
      setLikedMap((prev) => ({ ...prev, [postId]: !nowLiked }));
      setLikeCountMap((prev) => ({
        ...prev,
        [postId]: (prev[postId] ?? 0) + (nowLiked ? -1 : 1),
      }));
    }
  };

  // ── Share ──────────────────────────────────────────────────────────────────
  const handleShare = (reel) => {
    const url = `${window.location.origin}/reel/${reel.post}`;
    if (navigator.share) navigator.share({ title: reel.title, url });
    else navigator.clipboard.writeText(url).then(() => alert("Link copied!"));
  };

  // ── Hide / Block ───────────────────────────────────────────────────────────
  const handleHide = async (postId) => {
    try {
      await hideReel(postId);
      setReels((prev) => prev.filter((r) => r.post !== postId));
    } catch (err) { console.error(err); }
  };

  const handleBlock = async (userId) => {
    if (!window.confirm("Block this creator?")) return;
    try {
      await toggleBlock(userId);
      setReels((prev) => prev.filter((r) => r.created_by !== userId));
    } catch (err) { console.error(err); }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="rw-loading">
        <div className="rw-spinner" />
        <p>Loading reels…</p>
      </div>
    );
  }

  if (!currentReel) {
    return <div className="rw-loading"><p>No reels found.</p></div>;
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="rw-root">

        {/* Back button — outside the player */}
        <button className="rw-back-btn" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M5 12l7-7M5 12l7 7" />
          </svg>
        </button>

        {/* ── Player column ────────────────────────────────────────────────── */}
        <div
          className={`rw-player-col ${sidePanel ? "panel-open" : ""}`}
          ref={stackRef}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Prev ghost (peek above) */}
          {currentIndex > 0 && (
            <div
              className="reel-ghost reel-ghost-prev"
              onClick={goPrev}
            >
              <video
                src={reels[currentIndex - 1]?.video_url}
                className="reel-ghost-video"
                muted
                playsInline
                poster={reels[currentIndex - 1]?.thumbnail_url}
              />
              <div className="reel-ghost-overlay">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="reel-ghost-arrow">
                  <path d="M18 15l-6-6-6 6" />
                </svg>
              </div>
            </div>
          )}

          {/* Active reel */}
          <div className="reel-active-wrap">
            <ReelSlide
              key={currentReel.post}
              reel={currentReel}
              isActive={true}
              liked={likedMap[currentReel.post] || false}
              likeCount={likeCountMap[currentReel.post] ?? currentReel.like_count ?? 0}
              onToggleLike={() => toggleLike(currentReel.post)}
              onShare={() => handleShare(currentReel)}
              onMenuOpen={() => setShowMenu(true)}
              onOpenComments={() => setSidePanel(sidePanel === "comments" ? null : "comments")}
              onOpenDescription={() => setSidePanel(sidePanel === "description" ? null : "description")}
              sidePanelOpen={!!sidePanel}
              activeSidePanel={sidePanel}
            />

            {/* Three-dot menu */}
            {showMenu && (
              <ReelMenu
                reel={currentReel}
                onHide={handleHide}
                onReport={(pid) => { setReportPostId(pid); setShowMenu(false); }}
                onBlock={handleBlock}
                onClose={() => setShowMenu(false)}
              />
            )}
          </div>

          {/* Next ghost (peek below) */}
          {currentIndex < reels.length - 1 && (
            <div
              className="reel-ghost reel-ghost-next"
              onClick={goNext}
            >
              <video
                src={reels[currentIndex + 1]?.video_url}
                className="reel-ghost-video"
                muted
                playsInline
                poster={reels[currentIndex + 1]?.thumbnail_url}
              />
              <div className="reel-ghost-overlay">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="reel-ghost-arrow">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </div>
          )}

          {/* Scroll dot indicators */}
          <div className="rw-dots">
            {reels.slice(Math.max(0, currentIndex - 3), currentIndex + 4).map((r, i) => {
              const realIdx = Math.max(0, currentIndex - 3) + i;
              return (
                <div
                  key={r.post}
                  className={`rw-dot ${realIdx === currentIndex ? "active" : ""}`}
                  onClick={() => goTo(realIdx)}
                />
              );
            })}
          </div>
        </div>

        {/* ── Side panel ───────────────────────────────────────────────────── */}
        {sidePanel && (
          <div className="rw-side-panel">
            <button className="rw-panel-close" onClick={() => setSidePanel(null)}>✕</button>
            {sidePanel === "comments" && <CommentsCard postId={currentReel.post} />}
            {sidePanel === "description" && <DescriptionCard reel={currentReel} />}
          </div>
        )}
      </div>

      {reportPostId && (
        <ReportModal postId={reportPostId} onClose={() => setReportPostId(null)} />
      )}
    </>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── Root layout ── */
  .rw-root {
    display: flex;
    align-items: stretch;
    height: 100dvh;
    background: #0a0a0f;
    font-family: 'DM Sans', sans-serif;
    color: #fff;
    overflow: hidden;
    position: relative;
  }

  /* ── Back button ── */
  .rw-back-btn {
    position: fixed;
    top: 18px;
    left: 18px;
    z-index: 100;
    background: rgba(0,0,0,0.45);
    border: 1px solid rgba(255,255,255,0.15);
    color: #fff;
    width: 38px; height: 38px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    backdrop-filter: blur(8px);
    transition: background 0.2s, transform 0.15s;
  }
  .rw-back-btn:hover { background: rgba(255,255,255,0.15); transform: scale(1.08); }
  .rw-back-btn svg { width: 18px; height: 18px; }

  /* ── Player column ── */
  .rw-player-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    overflow: hidden;
    position: relative;
    transition: flex 0.3s ease;
    gap: 12px;
    padding: 20px 0;
  }
  .rw-player-col.panel-open { flex: 0 0 min(52vw, 460px); }

  /* ── Active reel wrapper — enforces 9:16 ── */
  .reel-active-wrap {
    position: relative;
    /* height drives the size; width is derived from aspect-ratio */
    height: min(calc(100dvh - 80px), calc((100dvw - 80px) * 16 / 9));
    aspect-ratio: 9 / 16;
    border-radius: 18px;
    overflow: hidden;
    flex-shrink: 0;
    box-shadow: 0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06);
    transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1),
                opacity 0.35s ease;
  }
  /* Shrink active reel slightly when side panel is open */
  .rw-player-col.panel-open .reel-active-wrap {
    height: min(calc(100dvh - 80px), calc((min(52vw, 460px) - 100px) * 16 / 9));
  }

  /* ── Ghost reels (peek) ── */
  .reel-ghost {
    position: relative;
    width: calc(var(--reel-w, 240px) * 0.72);
    aspect-ratio: 9 / 16;
    border-radius: 14px;
    overflow: hidden;
    flex-shrink: 0;
    cursor: pointer;
    opacity: 0.45;
    transition: opacity 0.25s, transform 0.25s;
    box-shadow: 0 8px 30px rgba(0,0,0,0.5);
  }
  .reel-ghost:hover { opacity: 0.7; transform: scale(1.03); }
  .reel-ghost-video { width: 100%; height: 100%; object-fit: cover; }
  .reel-ghost-overlay {
    position: absolute; inset: 0;
    background: rgba(0,0,0,0.35);
    display: flex; align-items: center; justify-content: center;
  }
  .reel-ghost-arrow { width: 28px; height: 28px; color: rgba(255,255,255,0.8); }
  .reel-ghost-prev { order: -1; }
  .reel-ghost-next { order: 1; }

  /* ── Reel slide (fills active-wrap) ── */
  .reel-slide {
    width: 100%;
    height: 100%;
    position: relative;
    background: #000;
  }

  .reel-video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    cursor: pointer;
    display: block;
  }

  /* Gradient overlays */
  .reel-grad-top {
    position: absolute; top: 0; left: 0; right: 0;
    height: 30%;
    background: linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 100%);
    pointer-events: none;
  }
  .reel-grad-bottom {
    position: absolute; bottom: 0; left: 0; right: 0;
    height: 55%;
    background: linear-gradient(to top, rgba(0,0,0,0.82) 0%, transparent 100%);
    pointer-events: none;
  }

  /* ── Pause pulse ── */
  .reel-pulse {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    pointer-events: none; z-index: 5;
  }
  .reel-pulse-icon {
    font-size: 48px;
    animation: pulseOut 0.55s ease forwards;
    opacity: 0.9;
  }
  @keyframes pulseOut {
    0%   { transform: scale(0.6); opacity: 0.9; }
    50%  { transform: scale(1.1); opacity: 0.9; }
    100% { transform: scale(1.4); opacity: 0; }
  }

  /* ── Top bar ── */
  .reel-topbar {
    position: absolute; top: 0; left: 0; right: 0;
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 16px;
    z-index: 10;
  }
  .reel-topbar-title {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 1rem;
    letter-spacing: 0.04em;
  }
  .reel-icon-btn {
    background: rgba(0,0,0,0.3);
    border: none; color: #fff; cursor: pointer;
    padding: 7px;
    border-radius: 50%;
    display: flex; align-items: center;
    backdrop-filter: blur(4px);
    transition: background 0.2s;
  }
  .reel-icon-btn:hover { background: rgba(255,255,255,0.2); }
  .reel-icon-btn svg { width: 18px; height: 18px; }

  /* ── Right action sidebar ── */
  .reel-actions {
    position: absolute;
    right: 12px;
    bottom: 110px;
    display: flex;
    flex-direction: column;
    gap: 18px;
    z-index: 10;
  }
  .reel-action-btn {
    display: flex; flex-direction: column;
    align-items: center; gap: 4px;
    background: none; border: none;
    color: #fff; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.68rem; font-weight: 500;
    transition: transform 0.15s;
  }
  .reel-action-btn:hover { transform: scale(1.12); }
  .reel-action-icon {
    width: 44px; height: 44px;
    background: rgba(0,0,0,0.35);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    backdrop-filter: blur(6px);
    border: 1px solid rgba(255,255,255,0.1);
    transition: background 0.2s, border-color 0.2s;
  }
  .reel-action-btn:hover .reel-action-icon { background: rgba(255,255,255,0.15); }
  .reel-action-btn.liked .reel-action-icon { background: rgba(255,77,109,0.2); border-color: rgba(255,77,109,0.4); }
  .reel-action-btn.liked { color: #ff4d6d; }
  .reel-action-btn.liked svg { stroke: #ff4d6d; fill: #ff4d6d; }
  .reel-action-btn.active .reel-action-icon { background: rgba(247,168,74,0.2); border-color: rgba(247,168,74,0.4); }
  .reel-action-btn.active { color: #f7a84a; }
  .reel-action-btn.active svg { stroke: #f7a84a; }
  .reel-action-btn svg { width: 20px; height: 20px; }

  /* ── Bottom info ── */
  .reel-bottom {
    position: absolute; bottom: 0; left: 0; right: 64px;
    padding: 0 14px 14px;
    z-index: 10;
  }
  .reel-creator-row {
    display: flex; align-items: center; gap: 9px;
    margin-bottom: 7px;
  }
  .reel-avatar {
    width: 36px; height: 36px;
    border-radius: 50%; object-fit: cover;
    border: 2px solid rgba(255,255,255,0.55);
    flex-shrink: 0;
  }
  .reel-avatar-ph {
    width: 36px; height: 36px; flex-shrink: 0;
    border-radius: 50%;
    background: linear-gradient(135deg, #f7a84a, #e55d3c);
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 0.9rem; color: #fff;
    border: 2px solid rgba(255,255,255,0.3);
  }
  .reel-creator-meta { flex: 1; min-width: 0; }
  .reel-creator-name {
    display: block;
    font-family: 'Syne', sans-serif; font-weight: 600; font-size: 0.88rem;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .reel-creator-type {
    font-size: 0.68rem; color: rgba(255,255,255,0.55);
    text-transform: capitalize;
  }
  .reel-follow-btn {
    background: rgba(255,255,255,0.12);
    border: 1px solid rgba(255,255,255,0.35);
    color: #fff;
    font-family: 'DM Sans', sans-serif; font-size: 0.75rem; font-weight: 500;
    padding: 4px 12px; border-radius: 20px;
    cursor: pointer; transition: background 0.2s;
    backdrop-filter: blur(6px); flex-shrink: 0;
  }
  .reel-follow-btn:hover { background: rgba(255,255,255,0.28); }
  .reel-caption {
    font-size: 0.83rem; color: rgba(255,255,255,0.88);
    margin-bottom: 8px; line-height: 1.4;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* ── Progress bar ── */
  .reel-progress-row { display: flex; align-items: center; gap: 7px; }
  .reel-time { font-size: 0.68rem; color: rgba(255,255,255,0.65); white-space: nowrap; min-width: 30px; }
  .reel-progress-bar {
    flex: 1; height: 18px;
    display: flex; align-items: center; cursor: pointer;
  }
  .reel-progress-track {
    position: relative; width: 100%; height: 3px;
    background: rgba(255,255,255,0.22); border-radius: 2px;
  }
  .reel-progress-fill {
    height: 100%; background: #f7a84a; border-radius: 2px;
    transition: width 0.1s linear;
  }
  .reel-progress-thumb {
    position: absolute; top: 50%; transform: translate(-50%, -50%);
    width: 11px; height: 11px; background: #fff; border-radius: 50%;
    box-shadow: 0 0 0 2px rgba(247,168,74,0.5);
    transition: left 0.1s linear;
  }

  /* ── Three-dot menu ── */
  .reel-menu {
    position: absolute; top: 50px; right: 10px;
    background: rgba(15,15,25,0.96);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 14px; padding: 6px;
    z-index: 50; min-width: 185px;
    backdrop-filter: blur(14px);
    animation: menuIn 0.15s ease;
  }
  @keyframes menuIn { from { opacity: 0; transform: translateY(-6px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
  .reel-menu-close {
    position: absolute; top: 7px; right: 9px;
    background: none; border: none; color: rgba(255,255,255,0.4);
    cursor: pointer; font-size: 0.8rem;
  }
  .reel-menu-item {
    display: flex; align-items: center; gap: 10px;
    width: 100%; background: none; border: none; color: #fff;
    font-family: 'DM Sans', sans-serif; font-size: 0.88rem;
    padding: 10px 12px; border-radius: 8px;
    cursor: pointer; text-align: left; transition: background 0.15s;
  }
  .reel-menu-item:hover { background: rgba(255,255,255,0.08); }
  .reel-menu-item.danger { color: #ff6b6b; }
  .reel-menu-item.danger:hover { background: rgba(255,107,107,0.1); }

  /* ── Dot indicators ── */
  .rw-dots {
    position: absolute;
    right: -28px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    gap: 6px;
    z-index: 20;
  }
  .rw-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: rgba(255,255,255,0.25);
    cursor: pointer;
    transition: background 0.2s, transform 0.2s;
  }
  .rw-dot.active {
    background: #f7a84a;
    transform: scale(1.4);
  }
  .rw-dot:hover { background: rgba(255,255,255,0.6); }

  /* ── Side panel ── */
  .rw-side-panel {
    width: min(44vw, 400px);
    height: 100%;
    background: #111118;
    border-left: 1px solid rgba(255,255,255,0.06);
    display: flex; flex-direction: column;
    overflow: hidden; position: relative;
    animation: panelIn 0.25s cubic-bezier(0.4,0,0.2,1);
  }
  @keyframes panelIn { from { opacity: 0; transform: translateX(32px); } to { opacity: 1; transform: translateX(0); } }
  .rw-panel-close {
    position: absolute; top: 14px; right: 14px;
    background: rgba(255,255,255,0.07); border: none; color: #fff;
    cursor: pointer; border-radius: 50%;
    width: 30px; height: 30px; font-size: 0.85rem;
    display: flex; align-items: center; justify-content: center; z-index: 10;
    transition: background 0.2s;
  }
  .rw-panel-close:hover { background: rgba(255,255,255,0.15); }

  /* ── Loading ── */
  .rw-loading {
    height: 100dvh;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 16px;
    background: #0a0a0f; color: rgba(255,255,255,0.45);
    font-family: 'DM Sans', sans-serif;
  }
  .rw-spinner {
    width: 40px; height: 40px;
    border: 3px solid rgba(255,255,255,0.08);
    border-top-color: #f7a84a;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Report modal ── */
  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.72);
    display: flex; align-items: center; justify-content: center;
    z-index: 200; backdrop-filter: blur(4px);
  }
  .modal-card {
    background: #1a1a25;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 18px; padding: 28px;
    width: min(90vw, 380px);
    display: flex; flex-direction: column; gap: 14px;
    font-family: 'DM Sans', sans-serif;
    animation: menuIn 0.18s ease;
  }
  .modal-card h3 { font-family: 'Syne', sans-serif; font-size: 1.1rem; }
  .modal-card select, .modal-card textarea {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 10px; color: #fff;
    padding: 10px 12px;
    font-family: 'DM Sans', sans-serif; font-size: 0.9rem; resize: none;
  }
  .modal-card textarea { min-height: 80px; }
  .modal-card select option { background: #1a1a25; }
  .modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
  .btn-ghost {
    background: none; border: 1px solid rgba(255,255,255,0.2);
    color: rgba(255,255,255,0.7); padding: 8px 18px;
    border-radius: 20px; cursor: pointer; font-family: 'DM Sans', sans-serif;
  }
  .btn-primary {
    background: #f7a84a; border: none; color: #000;
    font-weight: 600; padding: 8px 18px;
    border-radius: 20px; cursor: pointer; font-family: 'DM Sans', sans-serif;
    transition: opacity 0.2s;
  }
  .btn-primary:disabled { opacity: 0.5; cursor: default; }
  .modal-success { color: #6fcf97; font-size: 0.95rem; }

  /* ── Mobile: side panel goes full screen ── */
  @media (max-width: 640px) {
    .rw-player-col.panel-open { display: none; }
    .rw-back-btn { display: none; }
    .rw-side-panel { width: 100vw; position: fixed; inset: 0; z-index: 150; }
    .reel-ghost { display: none; }
    .rw-dots { right: 8px; }
  }
`;