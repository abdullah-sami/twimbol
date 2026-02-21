import { getImageUrl } from "../../api/api.js";

function StatPill({ icon, label, value }) {
  return (
    <div className="desc-stat">
      <span className="desc-stat-icon">{icon}</span>
      <div>
        <div className="desc-stat-value">{value}</div>
        <div className="desc-stat-label">{label}</div>
      </div>
    </div>
  );
}

function formatDate(str) {
  if (!str) return "";
  return new Date(str).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function fmtNum(n) {
  if (!n && n !== 0) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export default function ReelDescription({ reel }) {
  const profile = reel?.user_profile || {};
  const picSrc = getImageUrl(profile.profile_pic);

  const displayName =
    [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
    profile.username ||
    "Creator";

  return (
    <>
      <style>{CSS}</style>
      <div className="desc-root">
        <div className="desc-inner">

          {reel?.thumbnail_url && (
            <div className="desc-thumb-wrap">
              <img src={reel.thumbnail_url} alt={reel.title} className="desc-thumb" />
              <div className="desc-thumb-overlay" />
            </div>
          )}

          <div className="desc-section">
            <h2 className="desc-title">{reel?.title || "Untitled Reel"}</h2>
            <p className="desc-date">{formatDate(reel?.created_at)}</p>
          </div>

          <div className="desc-stats-row">
            <StatPill icon="❤️" label="Likes" value={fmtNum(reel?.like_count)} />
            <StatPill icon="💬" label="Comments" value={fmtNum(reel?.comments)} />
            <StatPill icon="👁️" label="Views" value={fmtNum(reel?.view_count)} />
          </div>

          {reel?.reel_description && (
            <div className="desc-section">
              <h4 className="desc-sub-heading">About this reel</h4>
              <p className="desc-body">{reel.reel_description}</p>
            </div>
          )}

          <div className="desc-creator-card">
            <div className="desc-creator-left">
              {picSrc ? (
                <img src={picSrc} alt={displayName} className="desc-creator-avatar" />
              ) : (
                <div className="desc-creator-ph">{displayName[0].toUpperCase()}</div>
              )}
              <div>
                <p className="desc-creator-name">{displayName}</p>
                {profile.username && <p className="desc-creator-handle">@{profile.username}</p>}
                {profile.user_type && <span className="desc-creator-badge">{profile.user_type}</span>}
              </div>
            </div>
          </div>

          {(profile.user_social_fb || profile.user_social_twt || profile.user_social_yt) && (
            <div className="desc-section">
              <h4 className="desc-sub-heading">Creator links</h4>
              <div className="desc-socials">
                {profile.user_social_fb && (
                  <a href={profile.user_social_fb} target="_blank" rel="noreferrer" className="desc-social-link fb">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                    Facebook
                  </a>
                )}
                {profile.user_social_twt && (
                  <a href={profile.user_social_twt} target="_blank" rel="noreferrer" className="desc-social-link twt">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" /></svg>
                    Twitter / X
                  </a>
                )}
                {profile.user_social_yt && (
                  <a href={profile.user_social_yt} target="_blank" rel="noreferrer" className="desc-social-link yt">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.97C18.88 4 12 4 12 4s-6.88 0-8.59.45A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.97C5.12 20 12 20 12 20s6.88 0 8.59-.45a2.78 2.78 0 0 0 1.95-1.97A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#111118" />
                    </svg>
                    YouTube
                  </a>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  .desc-root { height: 100%; overflow-y: auto; background: #111118; font-family: 'DM Sans', sans-serif; color: #e8e8f0; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.08) transparent; }
  .desc-root::-webkit-scrollbar { width: 4px; }
  .desc-root::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }

  .desc-inner { padding: 56px 0 32px; display: flex; flex-direction: column; }

  .desc-thumb-wrap { position: relative; width: 100%; aspect-ratio: 9/5; overflow: hidden; margin-bottom: 4px; }
  .desc-thumb { width: 100%; height: 100%; object-fit: cover; }
  .desc-thumb-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 40%, #111118 100%); }

  .desc-section { padding: 14px 22px; }

  .desc-title { font-family: 'Syne', sans-serif; font-size: 1.2rem; font-weight: 800; color: #fff; line-height: 1.3; margin-bottom: 4px; }
  .desc-date { font-size: 0.78rem; color: rgba(255,255,255,0.35); }

  .desc-stats-row { display: flex; padding: 12px 16px; border-top: 1px solid rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.05); }
  .desc-stat { flex: 1; display: flex; align-items: center; gap: 8px; padding: 6px; }
  .desc-stat:not(:last-child) { border-right: 1px solid rgba(255,255,255,0.06); }
  .desc-stat-icon { font-size: 1.1rem; }
  .desc-stat-value { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.95rem; color: #fff; line-height: 1.2; }
  .desc-stat-label { font-size: 0.68rem; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.04em; }

  .desc-sub-heading { font-family: 'Syne', sans-serif; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.35); margin-bottom: 8px; }
  .desc-body { font-size: 0.9rem; color: rgba(255,255,255,0.75); line-height: 1.65; }

  .desc-creator-card { margin: 4px 16px; padding: 16px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; }
  .desc-creator-left { display: flex; align-items: center; gap: 12px; }
  .desc-creator-avatar { width: 52px; height: 52px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(247,168,74,0.4); }
  .desc-creator-ph {
    width: 52px; height: 52px; border-radius: 50%;
    background: linear-gradient(135deg, #f7a84a, #e55d3c);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.2rem; font-weight: 700; color: #fff; border: 2px solid rgba(247,168,74,0.3);
  }
  .desc-creator-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.95rem; color: #fff; }
  .desc-creator-handle { font-size: 0.78rem; color: rgba(255,255,255,0.4); margin-bottom: 4px; }
  .desc-creator-badge { background: rgba(247,168,74,0.15); color: #f7a84a; font-size: 0.68rem; font-weight: 600; text-transform: capitalize; padding: 2px 8px; border-radius: 20px; }

  .desc-socials { display: flex; flex-direction: column; gap: 8px; }
  .desc-social-link { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 12px; font-size: 0.88rem; font-weight: 500; text-decoration: none; transition: background 0.15s; }
  .desc-social-link svg { width: 18px; height: 18px; flex-shrink: 0; }
  .desc-social-link.fb { background: rgba(24,119,242,0.12); color: #4e9af0; }
  .desc-social-link.fb:hover { background: rgba(24,119,242,0.22); }
  .desc-social-link.twt { background: rgba(29,161,242,0.10); color: #5bb8f5; }
  .desc-social-link.twt:hover { background: rgba(29,161,242,0.2); }
  .desc-social-link.yt { background: rgba(255,0,0,0.10); color: #ff6b6b; }
  .desc-social-link.yt:hover { background: rgba(255,0,0,0.18); }
`;