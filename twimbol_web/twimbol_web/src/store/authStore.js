// src/store/authStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const BASE_URL = "https://rafidabdullahsamiweb.pythonanywhere.com";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // ─── State ───────────────────────────────────────────────
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null,

      // ─── Called by Login.jsx after successful login ───────────
      // Pass the tokens from the login response, store fetches the full profile
      setAuth: async (accessToken, refreshToken) => {
        set({ accessToken, refreshToken, isLoading: true, error: null });
        await get().fetchProfile(accessToken);
      },

      // ─── Fetch Profile ────────────────────────────────────────
      fetchProfile: async (tokenOverride) => {
        const token = tokenOverride ?? get().accessToken;
        if (!token) return;

        set({ isLoading: true, error: null });
        try {
          const res = await fetch(`${BASE_URL}/user/api/profile/`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!res.ok) {
            if (res.status === 401) {
              const refreshed = await get().refreshAccessToken();
              if (refreshed) return get().fetchProfile();
              get().logout();
              return;
            }
            throw new Error("Failed to fetch profile");
          }

          const data = await res.json();
          const profile = Array.isArray(data) ? data[0] : data;
          set({ user: profile, isLoading: false });
        } catch (err) {
          set({ isLoading: false, error: err.message });
        }
      },

      // ─── Refresh Access Token ─────────────────────────────────
      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return false;

        try {
          const res = await fetch(`${BASE_URL}/api/token/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh: refreshToken }),
          });

          if (!res.ok) { get().logout(); return false; }

          const data = await res.json();
          set({ accessToken: data.access });
          return true;
        } catch {
          get().logout();
          return false;
        }
      },

      // ─── Logout ───────────────────────────────────────────────
      logout: () => set({ user: null, accessToken: null, refreshToken: null, error: null }),

      // ─── Helpers ──────────────────────────────────────────────
      isAuthenticated: () => !!get().accessToken,
      clearError: () => set({ error: null }),
    }),

    {
      name: "twimbol-auth",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);