/**
 * settingsStore.js
 * Zustand store for settings state with localStorage persistence.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useSettingsStore = create(
  persist(
    (set) => ({
      // ─── Notification Preferences ──────────────────────────────────────
      notificationPrefs: {
        all_notifications: true,
        follow_notifications: true,
        likes_notifications: true,
        comments_notifications: true,
        new_events_notifications: true,
        event_reminders_notifications: true,
        tags_notifications: true,
      },

      setNotificationPrefs: (prefs) =>
        set((state) => ({
          notificationPrefs: { ...state.notificationPrefs, ...prefs },
        })),

      // ─── Parental Control – link / OTP flow ───────────────────────────
      parentalControl: {
        isLinked: false,
        parentEmail: null,
        otpStep: "email", // "email" | "otp" | "done"
      },

      setParentalControl: (data) =>
        set((state) => ({
          parentalControl: { ...state.parentalControl, ...data },
        })),

      // ─── Parental Control – Settings & Controls ────────────────────────
      // Persisted locally; submitted to API when the user hits Save.
      parentalSettings: {
        // Daily Time Limits
        timeLimitEnabled: false,
        dailyLimitMinutes: 180,

        // Content Filters
        contentFilters: "Inappropriate, violence, scary",

        // Bedtime Restrictions
        bedtimeEnabled: false,
        bedtimeStart: "21:00",
        bedtimeStop: "05:00",
      },

      setParentalSettings: (data) =>
        set((state) => ({
          parentalSettings: { ...state.parentalSettings, ...data },
        })),

      // ─── UI / misc ─────────────────────────────────────────────────────
      activeSection: "account",
      setActiveSection: (section) => set({ activeSection: section }),
    }),
    {
      name: "twimbol-settings",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useSettingsStore;