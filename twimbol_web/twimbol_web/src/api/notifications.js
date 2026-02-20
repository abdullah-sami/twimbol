/**
 * notifications.js
 * Background notification polling service using setInterval.
 * Call startNotificationPolling() to begin, stopNotificationPolling() to stop.
 */

import {
    fetchNotifications,
    markNotificationRead,
    markAllNotificationsRead
} from "./api.js";

const POLL_INTERVAL_MS = 30000; // poll every 30 seconds

// Re-export so consumers don't need to import from api.js separately
export {
    markNotificationRead,
    markAllNotificationsRead
};

let intervalId = null;
let listeners = [];
let lastNotificationIds = new Set();

/**
 * Register a callback to be called whenever new notifications arrive.
 * @param {(notifications: Array) => void} callback
 * @returns {() => void} unsubscribe function
 */
export const onNotifications = (callback) => {
    listeners.push(callback);
    return () => {
        listeners = listeners.filter((l) => l !== callback);
    };
};

const notifyListeners = (notifications) => {
    listeners.forEach((cb) => cb(notifications));
};

const poll = async () => {
    try {
        // axios interceptor handles auth token attachment and 401 refresh automatically
        const notifications = await fetchNotifications();

        // detect brand-new notifications since last poll
        const newOnes = notifications.filter(
            (n) => !lastNotificationIds.has(n.id)
        );

        // update the seen set
        lastNotificationIds = new Set(notifications.map((n) => n.id));

        // always notify listeners with full list
        notifyListeners(notifications);

        // browser push notification for truly new items
        if (newOnes.length > 0 && "Notification" in window) {
            if (Notification.permission === "granted") {
                newOnes.forEach((n) => {
                    if (n.is_read) return; // only notify for unread items
                    new Notification("Twimbol", {
                        body: n.message,
                        icon: "/favicon.ico",
                    });
                });
            }
        }
    } catch (err) {
        console.warn("[notifications.js] polling error:", err);
    }
};

/**
 * Start polling for notifications in the background.
 * Safe to call multiple times – won't create duplicate intervals.
 */
export const startNotificationPolling = () => {
    if (intervalId !== null) return;

    // Request browser notification permission (best-effort)
    if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
    }

    // Kick off immediately, then on schedule
    poll();
    intervalId = setInterval(poll, POLL_INTERVAL_MS);
};

/**
 * Stop background polling.
 */
export const stopNotificationPolling = () => {
    if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
    }
    listeners = [];
    lastNotificationIds = new Set();
};