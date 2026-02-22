/**
 * NotificationSettings.jsx
 * Displays and manages notification preferences.
 * State persisted via Zustand (settingsStore) + synced with API.
 */

import { useEffect, useState } from "react";
import {
  Bell,
  BellOff,
  UserPlus,
  ThumbsUp,
  MessageCircle,
  Tag,
  CalendarPlus,
  CalendarClock,
} from "lucide-react";
import useSettingsStore from "../../store/Settingsstore";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "../../api/settings";

// ─── Toggle Row ───────────────────────────────────────────────────────────────
function ToggleRow({ icon, title, description, checked, onChange, disabled }) {
  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-xl bg-surface transition ${
        disabled ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      <span className="text-txt-secondary">{icon}</span>
      <div className="flex-1">
        <p className="font-semibold text-txt text-sm">{title}</p>
        <p className="text-xs text-txt-secondary">{description}</p>
      </div>
      {/* Custom toggle */}
      <button
        onClick={onChange}
        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
          checked ? "bg-gray-800" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
            checked ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function NotificationSettings() {
  const { notificationPrefs, setNotificationPrefs } = useSettingsStore();
  const [fetching, setFetching] = useState(true);

  // Load preferences from API on mount
  useEffect(() => {
    (async () => {
      try {
        const { data } = await getNotificationPreferences();
        setNotificationPrefs({
          all_notifications: data.all_notifications,
          follow_notifications: data.follow_notifications,
          likes_notifications: data.likes_notifications,
          comments_notifications: data.comments_notifications,
          new_events_notifications: data.new_events_notifications,
          event_reminders_notifications: data.event_reminders_notifications,
        });
      } catch {
        // Use cached Zustand values if API fails
      } finally {
        setFetching(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Toggle a single preference and patch API
  const toggle = async (key) => {
    const newValue = !notificationPrefs[key];

    // If toggling all_notifications off, disable everything
    if (key === "all_notifications" && !newValue) {
      const allOff = {
        all_notifications: false,
        follow_notifications: false,
        likes_notifications: false,
        comments_notifications: false,
        new_events_notifications: false,
        event_reminders_notifications: false,
      };
      setNotificationPrefs(allOff);
      try { await updateNotificationPreferences(allOff); } catch { /* silent */ }
      return;
    }

    const updated = { [key]: newValue };
    setNotificationPrefs(updated);
    try { await updateNotificationPreferences(updated); } catch { /* silent */ }
  };

  const allOff = !notificationPrefs.all_notifications;

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-txt mb-6">Notification Preferences</h1>

      {/* Master toggle */}
      <ToggleRow
        icon={<BellOff size={20} />}
        title="Turn off all notifications"
        description="Disable all notifications and alerts"
        checked={allOff}
        onChange={() => toggle("all_notifications")}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Social */}
        <div>
          <p className="text-sm text-txt-secondary font-semibold mb-3">Social</p>
          <div className="space-y-3">
            <ToggleRow
              icon={<UserPlus size={18} />}
              title="New Followers"
              description="Get notified when someone follows you"
              checked={notificationPrefs.follow_notifications}
              onChange={() => toggle("follow_notifications")}
              disabled={allOff}
            />
            <ToggleRow
              icon={<ThumbsUp size={18} />}
              title="Likes on my Posts"
              description="Receive alerts when someone likes your posts"
              checked={notificationPrefs.likes_notifications}
              onChange={() => toggle("likes_notifications")}
              disabled={allOff}
            />
            <ToggleRow
              icon={<MessageCircle size={18} />}
              title="Comments on my Posts"
              description="Be updated when someone writes a comment on your post"
              checked={notificationPrefs.comments_notifications}
              onChange={() => toggle("comments_notifications")}
              disabled={allOff}
            />
            <ToggleRow
              icon={<Tag size={18} />}
              title="Tags"
              description="Get alerts if someone tags you"
              checked={notificationPrefs.tags_notifications ?? true}
              onChange={() => toggle("tags_notifications")}
              disabled={allOff}
            />
          </div>
        </div>

        {/* Events */}
        <div>
          <p className="text-sm text-txt-secondary font-semibold mb-3">Events</p>
          <div className="space-y-3">
            <ToggleRow
              icon={<CalendarPlus size={18} />}
              title="New Event Announcements"
              description="Get notified about new upcoming events"
              checked={notificationPrefs.new_events_notifications}
              onChange={() => toggle("new_events_notifications")}
              disabled={allOff}
            />
            <ToggleRow
              icon={<CalendarClock size={18} />}
              title="Event Reminders"
              description="Reminders before an event starts"
              checked={notificationPrefs.event_reminders_notifications}
              onChange={() => toggle("event_reminders_notifications")}
              disabled={allOff}
            />
          </div>
        </div>
      </div>
    </div>
  );
}