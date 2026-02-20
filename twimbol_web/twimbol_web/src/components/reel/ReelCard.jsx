import React, { useState } from "react";
import { getImageUrl } from "../../api/api.js";

const formatCount = (n) => {
  if (!n && n !== 0) return "0";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
};

/**
 * ReelCard – matches the Twimbol Reels grid design.
 *
 * Props:
 *   reel – a single item from GET /api/reels/ results array
 *   onClick – optional handler when card is clicked
 */
export default function ReelCard({ reel, onClick }) {
  const [hovered, setHovered] = useState(false);

  const thumbnail = reel.thumbnail_url || null;
  const views = reel.view_count ? formatCount(reel.view_count) : "0";
  const profilePic = reel.user_profile.user?.profile_pic
    ? getImageUrl(reel.user_profile.user.profile_pic)
    : null;
    
  const username =
    reel.user_profile?.username ||
    reel.user_profile?.user?.username ||
    "Creator";
  const description = reel.reel_description || reel.title || "";

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        borderRadius: "16px",
        overflow: "hidden",
        cursor: "pointer",
        background: "#1a1a1a",
        aspectRatio: "9/16",
        width: "100%",
        boxShadow: hovered
          ? "0 12px 40px rgba(0,0,0,0.5)"
          : "0 4px 16px rgba(0,0,0,0.3)",
        transition: "box-shadow 0.25s ease, transform 0.25s ease",
        transform: hovered ? "translateY(-4px) scale(1.01)" : "none",
      }}
    >
      {/* Thumbnail */}
      {thumbnail ? (
        <img
          src={thumbnail}
          alt={reel.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            transition: "transform 0.4s ease",
            transform: hovered ? "scale(1.05)" : "scale(1)",
          }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%)",
          }}
        />
      )}

      {/* Gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 50%)",
          pointerEvents: "none",
        }}
      />

      {/* View count – top right */}
      <div
        style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          display: "flex",
          alignItems: "center",
          gap: "5px",
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(8px)",
          borderRadius: "20px",
          padding: "4px 10px",
          color: "#fff",
          fontSize: "13px",
          fontWeight: "600",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <PlayIcon />
        {views}
      </div>

      {/* Creator info – bottom */}
      <div
        style={{
          position: "absolute",
          bottom: "14px",
          left: "12px",
          right: "12px",
          display: "flex",
          alignItems: "center",
          gap: "9px",
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "50%",
            overflow: "hidden",
            flexShrink: 0,
            border: "2px solid rgba(255,255,255,0.6)",
            background: "#333",
          }}
        >
          {profilePic ? (
            <img
              src={profilePic}
              alt={username}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <DefaultAvatar name={username} />
          )}
        </div>

        {/* Name + description */}
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              color: "#fff",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: "700",
              fontSize: "13px",
              lineHeight: 1.2,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {username}
          </p>
          {description && (
            <p
              style={{
                margin: 0,
                color: "rgba(255,255,255,0.75)",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: "400",
                fontSize: "11px",
                lineHeight: 1.2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
      <path d="M2 1.5L10 6L2 10.5V1.5Z" />
    </svg>
  );
}

function DefaultAvatar({ name }) {
  const initials = (name || "?")[0].toUpperCase();
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #FF6B35, #FF9F1C)",
        color: "#fff",
        fontWeight: "700",
        fontSize: "14px",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {initials}
    </div>
  );
}