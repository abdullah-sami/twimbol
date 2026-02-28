/**
 * ReelError.jsx
 * Standalone error/empty-state screen for the Reels player.
 *
 * Props:
 *   type     – "network" | "server" | "empty"
 *   onRetry  – callback to retry the failed fetch (not shown for "empty")
 *   onBack   – callback to navigate back
 */

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap');

  .re-root {
    height: 100dvh;
    background: #0a0a0f;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: 'DM Sans', sans-serif;
    color: #fff;
    position: relative;
    overflow: hidden;
  }
  .re-root::before {
    content: '';
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -60%);
    width: 340px; height: 340px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(247,168,74,0.07) 0%, transparent 70%);
    pointer-events: none;
  }
  .re-back {
    position: absolute; top: 18px; left: 18px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12);
    color: #fff; width: 38px; height: 38px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; backdrop-filter: blur(8px);
    transition: background 0.2s, transform 0.15s;
  }
  .re-back:hover { background: rgba(255,255,255,0.14); transform: scale(1.06); }
  .re-back svg { width: 18px; height: 18px; }
  .re-icon-wrap {
    width: 88px; height: 88px; border-radius: 28px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 24px;
    animation: reIconIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }
  .re-icon-wrap--network { background: rgba(255,100,100,0.12); border: 1px solid rgba(255,100,100,0.2); }
  .re-icon-wrap--server  { background: rgba(247,168,74,0.1);   border: 1px solid rgba(247,168,74,0.2); }
  .re-icon-wrap--empty   { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); }
  .re-icon-wrap svg { width: 40px; height: 40px; }
  @keyframes reIconIn {
    from { transform: scale(0.5); opacity: 0; }
    to   { transform: scale(1);   opacity: 1; }
  }
  .re-title {
    font-family: 'Syne', sans-serif; font-size: 1.35rem; font-weight: 700;
    margin: 0 0 10px; text-align: center;
    animation: reFadeUp 0.4s 0.1s ease both;
  }
  .re-subtitle {
    font-size: 0.9rem; color: rgba(255,255,255,0.5);
    text-align: center; max-width: 280px; line-height: 1.55;
    margin: 0 0 32px;
    animation: reFadeUp 0.4s 0.18s ease both;
  }
  @keyframes reFadeUp {
    from { transform: translateY(10px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }
  .re-actions {
    display: flex; gap: 12px;
    animation: reFadeUp 0.4s 0.26s ease both;
  }
  .re-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 11px 22px; border-radius: 24px;
    font-family: 'DM Sans', sans-serif; font-size: 0.88rem; font-weight: 500;
    cursor: pointer; border: none;
    transition: transform 0.15s, opacity 0.2s;
  }
  .re-btn:hover { transform: scale(1.04); }
  .re-btn:active { transform: scale(0.97); }
  .re-btn--primary { background: #f7a84a; color: #000; font-weight: 600; }
  .re-btn--ghost {
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.14);
    color: rgba(255,255,255,0.8);
  }
  .re-btn svg { width: 16px; height: 16px; flex-shrink: 0; }
  .re-status {
    position: absolute; bottom: 28px;
    display: flex; align-items: center; gap: 6px;
    font-size: 0.75rem; color: rgba(255,255,255,0.3);
    animation: reFadeUp 0.4s 0.35s ease both;
  }
  .re-status-dot { width: 7px; height: 7px; border-radius: 50%; }
  .re-status-dot--offline { background: #ff6b6b; box-shadow: 0 0 6px rgba(255,107,107,0.5); }
  .re-status-dot--online  { background: #6fcf97; box-shadow: 0 0 6px rgba(111,207,151,0.5); }
`;

const NetworkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="1" y1="1" x2="23" y2="23" />
    <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
    <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
    <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
    <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="2.5" />
  </svg>
);

const ServerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2.5" />
  </svg>
);

const EmptyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="4" />
    <path d="M10 8l6 4-6 4V8z" />
  </svg>
);

const CONFIGS = {
  network: {
    iconClass: "re-icon-wrap--network",
    iconColor: "#ff6b6b",
    Icon: NetworkIcon,
    title: "No Internet Connection",
    subtitle: "Check your Wi-Fi or mobile data and try again.",
    showRetry: true,
  },
  server: {
    iconClass: "re-icon-wrap--server",
    iconColor: "#f7a84a",
    Icon: ServerIcon,
    title: "Something Went Wrong",
    subtitle: "We couldn't load your reels. Our servers might be having a moment.",
    showRetry: true,
  },
  empty: {
    iconClass: "re-icon-wrap--empty",
    iconColor: "rgba(255,255,255,0.35)",
    Icon: EmptyIcon,
    title: "No Reels Yet",
    subtitle: "There's nothing to watch right now. Check back soon for new content.",
    showRetry: false,
  },
};

export default function ReelError({ type = "server", onRetry, onBack }) {
  const cfg = CONFIGS[type] || CONFIGS.server;
  const { Icon } = cfg;
  const isOffline = !navigator.onLine;

  return (
    <>
      <style>{CSS}</style>
      <div className="re-root">

        {onBack && (
          <button className="re-back" onClick={onBack} aria-label="Go back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M5 12l7-7M5 12l7 7" />
            </svg>
          </button>
        )}

        <div className={`re-icon-wrap ${cfg.iconClass}`} style={{ color: cfg.iconColor }}>
          <Icon />
        </div>

        <h2 className="re-title">{cfg.title}</h2>
        <p className="re-subtitle">{cfg.subtitle}</p>

        <div className="re-actions">
          {cfg.showRetry && onRetry && (
            <button className="re-btn re-btn--primary" onClick={onRetry}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 .49-3.51" />
              </svg>
              Try Again
            </button>
          )}
          {onBack && (
            <button className="re-btn re-btn--ghost" onClick={onBack}>
              Go Back
            </button>
          )}
        </div>

        <div className="re-status">
          <span className={`re-status-dot ${isOffline ? "re-status-dot--offline" : "re-status-dot--online"}`} />
          {isOffline ? "You are offline" : "Connected"}
        </div>

      </div>
    </>
  );
}