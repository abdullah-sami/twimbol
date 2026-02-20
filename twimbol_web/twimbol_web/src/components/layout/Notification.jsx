import React, { useEffect, useRef } from "react";
import { markNotificationRead, markAllNotificationsRead } from "../../api/notifications.js";
import { getImageUrl } from "../../api/api.js";
import { useNavigate } from "react-router-dom";

const TYPE_ICONS = {
  follow: "👤",
  like: "❤️",
  comment: "💬",
  new_event: "📅",
  event_reminder: "⏰",
  general: "🔔",
};

/**
 * Notification.jsx – Dropdown panel for notifications.
 *
 * Props:
 *   notifications  – array from GET /api/notifications/
 *   onClose        – called when user clicks outside or presses Escape
 *   onUpdate       – called after read status changes (triggers re-fetch)
 */
export default function Notification({ notifications = [], onClose, onUpdate }) {
  const panelRef = useRef(null);

    const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose?.();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleMarkRead = async (read, id, page, page_item_id) => {
    if (!read) {await markNotificationRead(id);}
    navigate(`/${page}/${page_item_id}`);
    onUpdate?.();
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    onUpdate?.();
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div
      ref={panelRef}
      style={{
        position: "absolute",
        top: "calc(100% + 12px)",
        right: 0,
        width: "360px",
        maxHeight: "480px",
        background: "#fff",
        borderRadius: "18px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08)",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        animation: "slideDown 0.2s ease",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .notif-item:hover { background: #f8f8f8; }
        .notif-item.unread { background: #FFF6F0; }
        .notif-item.unread:hover { background: #FFE8D6; }
      `}</style>

      {/* Header */}
      <div
        style={{
          padding: "18px 20px 14px",
          borderBottom: "1px solid #f0f0f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontWeight: "700", fontSize: "16px", color: "#1a1a1a" }}>
            Notifications
          </span>
          {unreadCount > 0 && (
            <span
              style={{
                background: "#FF6B35",
                color: "#fff",
                borderRadius: "20px",
                padding: "1px 8px",
                fontSize: "12px",
                fontWeight: "700",
              }}
            >
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            style={{
              background: "none",
              border: "none",
              color: "#FF6B35",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              padding: "2px 0",
            }}
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Notification list */}
      <div style={{ overflowY: "auto", flex: 1 }}>
        {notifications.length === 0 ? (
          <div
            style={{
              padding: "40px 20px",
              textAlign: "center",
              color: "#999",
              fontSize: "14px",
            }}
          >
            <div style={{ fontSize: "36px", marginBottom: "10px" }}>🔔</div>
            You're all caught up!
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`notif-item ${!n.is_read ? "unread" : ""}`}
              style={{
                padding: "14px 20px",
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                cursor: "pointer",
                transition: "background 0.15s ease",
                borderBottom: "1px solid #f4f4f4",
              }}
              onClick={() => handleMarkRead(n.is_read, n.id, n.page, n.page_item_id)}
            >
              {/* Icon */}
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: !n.is_read
                    ? "linear-gradient(135deg, #FF6B35, #FF9F1C)"
                    : "#f0f0f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  flexShrink: 0,
                }}
              >
                {TYPE_ICONS[n.notification_type] || "🔔"}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: "13.5px",
                    color: "#1a1a1a",
                    fontWeight: n.is_read ? "400" : "600",
                    lineHeight: 1.4,
                  }}
                >
                  {n.message}
                </p>
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: "11px",
                    color: "#aaa",
                  }}
                >
                  {formatTime(n.created_at)}
                </p>
              </div>

              {/* Unread dot */}
              {!n.is_read && (
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#FF6B35",
                    flexShrink: 0,
                    marginTop: "6px",
                  }}
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function formatTime(iso) {
  if (!iso) return "";
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}