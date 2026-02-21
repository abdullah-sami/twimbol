import React, { useState, useEffect, useCallback, useRef } from "react";
import NavBar from "../components/layout/Navbar.jsx";
import ReelCard from "../components/reel/ReelCard.jsx";
import { fetchReels } from "../api/api.js";
import Spinner from "../components/ui/Spinner.jsx";

/**
 * Home.jsx – Twimbol Reels home page.
 * Displays a responsive masonry-style grid of ReelCards.
 * Supports infinite scroll / load more.
 */
export default function Home() {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const loaderRef = useRef(null);

  const loadReels = useCallback(async (pageNum = 1) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const data = await fetchReels(pageNum, 10);
      const results = data.results || [];

      setReels((prev) => (pageNum === 1 ? results : [...prev, ...results]));
      setTotalPages(data.total_pages || 1);
      setPage(pageNum);
    } catch (err) {
      setError("Failed to load reels. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadReels(1);
  }, [loadReels]);

  // Infinite scroll with IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && page < totalPages && !loadingMore) {
          loadReels(page + 1);
        }
      },
      { threshold: 0.5 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [page, totalPages, loadingMore, loadReels]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fafafa",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .reels-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
        }

        @media (max-width: 1200px) {
          .reels-grid { grid-template-columns: repeat(4, 1fr); }
        }
        @media (max-width: 900px) {
          .reels-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 600px) {
          .reels-grid { grid-template-columns: repeat(2, 1fr); }
        }

        .reel-card-wrapper {
          animation: fadeUp 0.4s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .skeleton {
          background: linear-gradient(90deg, #e8e8e8 25%, #f5f5f5 50%, #e8e8e8 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 16px;
          aspect-ratio: 9/16;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .load-more-btn {
          background: linear-gradient(135deg, #FF6B35, #FF9F1C);
          color: #fff;
          border: none;
          border-radius: 30px;
          padding: 12px 32px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .load-more-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(255,107,53,0.4);
        }
        .load-more-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
      `}</style>

      <NavBar activePage="Home" />

      <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px 24px" }}>
        {/* Page title */}
        <div style={{ marginBottom: "28px" }}>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "800",
              color: "#1a1a1a",
              letterSpacing: "-0.5px",
            }}
          >
            Reels
          </h1>
          <p style={{ color: "#888", fontSize: "14px", marginTop: "4px" }}>
            Discover trending short videos from creators
          </p>
        </div>

        {/* Error state */}
        {error && (
          <div
            style={{
              background: "#fff0ee",
              border: "1px solid #ffcdc4",
              borderRadius: "12px",
              padding: "16px 20px",
              color: "#c0392b",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span style={{ fontSize: "20px" }}>⚠️</span>
            {error}
            <button
              onClick={() => { setError(null); loadReels(1); }}
              style={{
                marginLeft: "auto",
                background: "#FF6B35",
                color: "#fff",
                border: "none",
                borderRadius: "20px",
                padding: "6px 16px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "600",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Skeleton loading */}
        {loading ? (
          <div className="reels-grid">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ animationDelay: `${i * 0.05}s` }} />
            ))}
          </div>
        ) : (
          <>
            {reels.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "80px 20px",
                  color: "#aaa",
                }}
              >
                <div style={{ fontSize: "56px", marginBottom: "16px" }}>🎬</div>
                <p style={{ fontSize: "18px", fontWeight: "600", color: "#666" }}>
                  No reels yet
                </p>
                <p style={{ fontSize: "14px", marginTop: "6px" }}>
                  Check back soon for fresh content!
                </p>
              </div>
            ) : (
              <div className="reels-grid">
                {reels.map((reel, i) => (
                  <div
                    key={reel.post || i}
                    className="reel-card-wrapper"
                    style={{ animationDelay: `${(i % 10) * 0.05}s` }}
                  >
                    <ReelCard
                      reel={reel}
                      onClick={() => {
                        // Navigate to reel detail page
                        window.location.href = `/reel/${reel.post}`;
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Infinite scroll trigger */}
            {page < totalPages && (
              <div
                ref={loaderRef}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "40px 0 20px",
                }}
              >
                {loadingMore ? (
                  <Spinner />
                ) : (
                  <button
                    className="load-more-btn"
                    onClick={() => loadReels(page + 1)}
                  >
                    Load more
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

