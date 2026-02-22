import { useState, useEffect, useRef } from "react";
import { X, Send, Trash2, MessageCircle } from "lucide-react";
import { getComments, addComment, deleteComment } from "../../api/posts";
import { useAuthStore } from "../../store/authStore";

const BASE_URL = "https://rafidabdullahsamiweb.pythonanywhere.com";

function formatTime(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export default function CommentsModal({ postId, isOpen, onClose, commentCount }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef(null);
  const { user } = useAuthStore();
  useEffect(() => {
    if (!isOpen || !postId) return;
    setLoading(true);
    getComments(postId)
      .then((res) => setComments(Array.isArray(res.data) ? res.data : res.data.results || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isOpen, postId]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await addComment(postId, text.trim());
      setComments((prev) => [res.data, ...prev]);
      setText("");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl flex flex-col max-h-[85vh] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <MessageCircle size={18} className="text-brand" />
            <h2 className="font-semibold text-txt text-base">
              Comments
              {commentCount > 0 && (
                <span className="ml-2 text-sm text-txt-secondary font-normal">
                  {commentCount}
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-surface transition-colors"
          >
            <X size={18} className="text-txt-secondary" />
          </button>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12 text-txt-secondary">
              <MessageCircle size={36} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No comments yet. Be the first!</p>
            </div>
          ) : (
            comments.map((c) => {
              const isOwner = user?.id === (c.created_by.id);
              const profilePic = c.created_by.user?.profile_pic
                ? `${BASE_URL}${c.created_by.user.profile_pic}`
                : null;
              const username = c.created_by.user?.username || c.created_by.user.username || "User";
              const commentText = c.comment || "";

              return (
                <div key={c.id} className="flex gap-3 group">
                  <div className="w-9 h-9 rounded-full bg-surface overflow-hidden flex-shrink-0">
                    {profilePic ? (
                      <img
                        src={profilePic}
                        alt={username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-txt-secondary">
                        {username[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="bg-surface rounded-2xl px-4 py-2.5">
                      <span className="font-semibold text-sm text-txt">
                        {username}
                      </span>
                      <p className="text-sm text-txt mt-0.5 break-words">
                        {commentText}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 mt-1 px-1">
                      {c.created_at && (
                        <span className="text-xs text-txt-secondary">
                          {formatTime(c.created_at)}
                        </span>
                      )}
                    </div>
                  </div>
                  {isOwner && (
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-red-50 text-red-400 self-start mt-3"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Input */}
        <div className="px-5 py-4 border-t border-gray-100">
          <form onSubmit={handleSubmit} className="flex gap-3 items-center">
            <div className="flex-1 bg-surface rounded-full px-4 py-2.5 flex items-center gap-2">
              <input
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 bg-transparent text-sm text-txt placeholder:text-txt-secondary outline-none"
                maxLength={500}
              />
            </div>
            <button
              type="submit"
              disabled={!text.trim() || submitting}
              className="w-10 h-10 bg-brand rounded-full flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed transition-opacity flex-shrink-0"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}