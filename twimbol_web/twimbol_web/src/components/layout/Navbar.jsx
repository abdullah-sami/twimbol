import React, { useState, useEffect, useRef } from "react";
import Notification from "../layout/Notification.jsx";
import Menu from "../layout/Menu.jsx";
import { fetchProfile, fetchNotifications, getImageUrl } from "../../api/api.js";
import { onNotifications, startNotificationPolling } from "../../api/notifications.js";

const NAV_LINKS = [
    { label: "Home", href: "/home" },
    { label: "Posts", href: "/posts" },
    { label: "Reels", href: "/reels" },
    { label: "Events", href: "/events" },
];

/**
 * NavBar – Top navigation bar for Twimbol.
 * Handles active tab highlighting, notification bell with badge,
 * and profile avatar with dropdown menu.
 *
 * Props:
 *   activePage – one of "Home" | "Posts" | "Reels" | "Events"
 */
export default function NavBar({ activePage = "Reels" }) {
    const [notifications, setNotifications] = useState([]);
    const [profile, setProfile] = useState(null);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const notifRef = useRef(null);
    const menuRef = useRef(null);

    // Load profile
    useEffect(() => {
        fetchProfile()
            .then((data) => setProfile(Array.isArray(data) ? data[0] : data))
            .catch(() => { });
    }, []);

    // Subscribe to notification polling
    useEffect(() => {
        startNotificationPolling();
        const unsub = onNotifications((notifs) => setNotifications(notifs));
        return unsub;
    }, []);

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    const profilePicUrl =
        profile?.user?.profile_pic ? getImageUrl(profile.user.profile_pic) : null;
    const displayName =
        [profile?.user?.first_name, profile?.user?.last_name]
            .filter(Boolean)
            .join(" ") || profile?.user?.username || "";

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        .nav-link {
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 500;
          color: #444;
          text-decoration: none;
          padding: 8px 14px;
          border-radius: 30px;
          transition: color 0.2s, background 0.2s;
        }
        .nav-link:hover { color: #FF6B35; background: #fff4ef; }
        .nav-link.active {
          background: #FF6B35;
          color: #fff !important;
          font-weight: 700;
        }
        .icon-btn {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: #f5f5f5;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
        }
        .icon-btn:hover { background: #ffe9de; transform: scale(1.08); }
      `}</style>

            <nav
                style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 100,
                    background: "rgba(255,255,255,0.92)",
                    backdropFilter: "blur(14px)",
                    borderBottom: "1px solid rgba(0,0,0,0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 32px",
                    height: "66px",
                    fontFamily: "'DM Sans', sans-serif",
                }}
            >
                {/* Logo */}
                <a href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>

                        <div className="flex items-center gap-1">
                            <img src="/public/logo.png" alt="Twimbol Logo" className="w-24" />
                        </div>

                    </div>
                </a>

                {/* Nav links */}
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    {NAV_LINKS.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            className={`nav-link ${activePage === link.label ? "active" : ""}`}
                        >
                            {link.label}
                        </a>
                    ))}
                </div>

                {/* Right side: notification + profile */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {/* Notification bell */}
                    <div ref={notifRef} style={{ position: "relative" }}>
                        <button
                            className="icon-btn"
                            onClick={() => {
                                setShowNotifications((v) => !v);
                                setShowMenu(false);
                            }}
                            aria-label="Notifications"
                        >
                            <BellIcon />
                            {unreadCount > 0 && (
                                <span
                                    style={{
                                        position: "absolute",
                                        top: "4px",
                                        right: "4px",
                                        width: "18px",
                                        height: "18px",
                                        background: "#FF6B35",
                                        borderRadius: "50%",
                                        border: "2px solid #fff",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "#fff",
                                        fontSize: "10px",
                                        fontWeight: "700",
                                        lineHeight: 1,
                                    }}
                                >
                                    {unreadCount > 9 ? "9+" : unreadCount}
                                </span>
                            )}
                        </button>

                        {showNotifications && (
                            <Notification
                                notifications={notifications}
                                onClose={() => setShowNotifications(false)}
                                onUpdate={() => {
                                    fetchNotifications()
                                        .then(setNotifications)
                                        .catch(() => { });
                                }}
                            />
                        )}
                    </div>

                    {/* Profile avatar */}
                    <div ref={menuRef} style={{ position: "relative" }}>
                        <button
                            className="icon-btn"
                            onClick={() => {
                                setShowMenu((v) => !v);
                                setShowNotifications(false);
                            }}
                            style={{ padding: 0, overflow: "hidden" }}
                            aria-label="Profile menu"
                        >
                            {profilePicUrl ? (
                                <img
                                    src={profilePicUrl}
                                    alt={displayName}
                                    style={{
                                        width: "42px",
                                        height: "42px",
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                    }}
                                />
                            ) : (
                                <UserIcon />
                            )}
                        </button>

                        {showMenu && (
                            <Menu
                                profile={profile}
                                onClose={() => setShowMenu(false)}
                            />
                        )}
                    </div>
                </div>
            </nav>
        </>
    );
}

function BellIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
    );
}

function UserIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    );
}