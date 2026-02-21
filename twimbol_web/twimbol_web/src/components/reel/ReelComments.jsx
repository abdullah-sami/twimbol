import { useState, useEffect } from "react";
import { fetchComments, postComment, getImageUrl } from "../../api/api.js";

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function ReelComments({ postId }) {
  const [comments, setComments] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const loadComments = async (p = 1) => {
    setLoading(p === 1);
    try {
      const data = await fetchComments(postId, p, 15);
      setHasMore(!!data.next);
      setComments((prev) =>
        p === 1 ? (data.results || []) : [...prev, ...(data.results || [])]
      );
    } catch (err) {
      console.error("Failed to load comments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setComments([]);
    setPage(1);
    setHasMore(true);
    loadComments(1);
  }, [postId]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    loadComments(next);
  };

  const sendComment = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      const data = await postComment(postId, text.trim());
      setComments((prev) => [data, ...prev]);
      setText("");
    } catch (err) {
      console.error("Failed to post comment:", err);
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendComment();
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="cc-root">
        <div className="cc-header">
          <h3 className="cc-heading">Comments</h3>
          <span className="cc-count">{comments.length}</span>
        </div>

        <div className="cc-list">
          {loading ? (
            <div className="cc-loading"><div className="cc-spinner" /></div>
          ) : comments.length === 0 ? (
            <div className="cc-empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <p>No comments yet.<br />Be the first to comment!</p>
            </div>
          ) : (
            <>
              {comments.map((c) => {
                const profile = c.created_by?.user || {};
                const pic = getImageUrl(profile.profile_pic);
                return (
                  <div key={c.id} className="cc-item">
                    <div className="cc-avatar-wrap">
                      {pic ? (
                        <img src={pic} alt={profile.username} className="cc-avatar" />
                      ) : (
                        <div className="cc-avatar-ph">
                          {(profile.username || "?")[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="cc-body">
                      <div className="cc-meta">
                        <span className="cc-user">{profile.username || "User"}</span>
                        <span className="cc-time">{timeAgo(c.created_at)}</span>
                      </div>
                      <p className="cc-text">{c.comment}</p>
                    </div>
                  </div>
                );
              })}
              {hasMore && (
                <button className="cc-load-more" onClick={loadMore}>
                  Load more
                </button>
              )}
            </>
          )}
        </div>

        <div className="cc-input-row">
          <textarea
            className="cc-textarea"
            placeholder="Add a comment…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
          />
          <button
            className="cc-send-btn"
            onClick={sendComment}
            disabled={sending || !text.trim()}
          >
            {sending ? (
              <div className="cc-send-spinner" />
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </>
  );
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap');

  .cc-root { display: flex; flex-direction: column; height: 100%; background: #111118; font-family: 'DM Sans', sans-serif; color: #e8e8f0; }

  .cc-header { display: flex; align-items: center; gap: 10px; padding: 20px 20px 14px; border-bottom: 1px solid rgba(255,255,255,0.06); }
  .cc-heading { font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 700; color: #fff; }
  .cc-count { background: rgba(247,168,74,0.15); color: #f7a84a; font-size: 0.72rem; font-weight: 600; padding: 2px 8px; border-radius: 20px; }

  .cc-list { flex: 1; overflow-y: auto; padding: 12px 0; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.1) transparent; }
  .cc-list::-webkit-scrollbar { width: 4px; }
  .cc-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

  .cc-loading { display: flex; justify-content: center; padding: 40px; }
  .cc-spinner { width: 30px; height: 30px; border: 2px solid rgba(255,255,255,0.1); border-top-color: #f7a84a; border-radius: 50%; animation: ccspin 0.8s linear infinite; }
  @keyframes ccspin { to { transform: rotate(360deg); } }

  .cc-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 60px 20px; color: rgba(255,255,255,0.3); text-align: center; }
  .cc-empty svg { width: 40px; height: 40px; }
  .cc-empty p { font-size: 0.88rem; line-height: 1.6; }

  .cc-item { display: flex; gap: 12px; padding: 10px 20px; transition: background 0.15s; }
  .cc-item:hover { background: rgba(255,255,255,0.03); }

  .cc-avatar-wrap { flex-shrink: 0; }
  .cc-avatar { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; }
  .cc-avatar-ph {
    width: 36px; height: 36px; border-radius: 50%;
    background: linear-gradient(135deg, #f7a84a, #e55d3c);
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 0.9rem; color: #fff;
  }

  .cc-body { flex: 1; min-width: 0; }
  .cc-meta { display: flex; align-items: baseline; gap: 8px; margin-bottom: 4px; }
  .cc-user { font-weight: 600; font-size: 0.85rem; color: #fff; }
  .cc-time { font-size: 0.72rem; color: rgba(255,255,255,0.35); }
  .cc-text { font-size: 0.88rem; color: rgba(255,255,255,0.8); line-height: 1.5; word-break: break-word; }

  .cc-load-more {
    display: block; margin: 8px auto;
    background: rgba(255,255,255,0.06); border: none;
    color: rgba(255,255,255,0.5); font-family: 'DM Sans', sans-serif;
    font-size: 0.82rem; padding: 6px 20px; border-radius: 20px; cursor: pointer; transition: background 0.2s;
  }
  .cc-load-more:hover { background: rgba(255,255,255,0.12); color: #fff; }

  .cc-input-row { display: flex; align-items: flex-end; gap: 10px; padding: 12px 16px; border-top: 1px solid rgba(255,255,255,0.06); background: #111118; }
  .cc-textarea {
    flex: 1; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 18px; color: #fff; font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem; padding: 10px 14px; resize: none; outline: none;
    max-height: 100px; line-height: 1.4; transition: border-color 0.2s;
  }
  .cc-textarea::placeholder { color: rgba(255,255,255,0.3); }
  .cc-textarea:focus { border-color: rgba(247,168,74,0.4); }

  .cc-send-btn {
    width: 40px; height: 40px; flex-shrink: 0;
    background: #f7a84a; border: none; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: #000; transition: opacity 0.2s, transform 0.15s;
  }
  .cc-send-btn:hover:not(:disabled) { transform: scale(1.08); }
  .cc-send-btn:disabled { opacity: 0.4; cursor: default; }
  .cc-send-btn svg { width: 18px; height: 18px; }
  .cc-send-spinner { width: 16px; height: 16px; border: 2px solid rgba(0,0,0,0.2); border-top-color: #000; border-radius: 50%; animation: ccspin 0.8s linear infinite; }
`;