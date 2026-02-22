import { useState, useEffect, useCallback, useRef } from "react";
import { getPosts } from "../api/posts";
import PostCard from "../components/post/PostCard";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import NavBar from "../components/layout/Navbar.jsx";

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [ordering, setOrdering] = useState("-created_at");
  const [showFilters, setShowFilters] = useState(false);
  const loaderRef = useRef(null);
  const searchTimeout = useRef(null);

  const fetchPosts = useCallback(
    async (pageNum = 1, replace = false) => {
      try {
        pageNum === 1 ? setLoading(true) : setLoadingMore(true);
        const res = await getPosts({
          page: pageNum,
          page_size: 10,
          search: search || undefined,
          ordering,
        });
        const data = res.data;
        const results = data.results || [];
        setTotalPages(data.total_pages || 1);
        setPosts((prev) => (replace ? results : [...prev, ...results]));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [search, ordering]
  );

  // Initial + filter change
  useEffect(() => {
    setPage(1);
    fetchPosts(1, true);
  }, [search, ordering]);

  // Infinite scroll
  useEffect(() => {
    if (!loaderRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && page < totalPages) {
          const next = page + 1;
          setPage(next);
          fetchPosts(next, false);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [page, totalPages, loadingMore, fetchPosts]);

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setSearch(e.target.value);
    }, 400);
  };

  const handleHidden = (postId) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  return (
    <div className="min-h-screen bg-surface">
        <NavBar activePage="Posts" />
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Search + Filter bar */}
        <div className="mb-6 flex gap-2 items-center">
          <div className="flex-1 flex items-center gap-2 bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100">
            <Search size={16} className="text-txt-secondary flex-shrink-0" />
            <input
              type="text"
              value={searchInput}
              onChange={handleSearchChange}
              placeholder="Search posts..."
              className="flex-1 text-sm text-txt placeholder:text-txt-secondary outline-none bg-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters((f) => !f)}
            className={`p-3 rounded-2xl border shadow-sm transition-colors ${
              showFilters
                ? "bg-brand text-white border-brand"
                : "bg-white text-txt-secondary border-gray-100 hover:bg-surface"
            }`}
          >
            <SlidersHorizontal size={16} />
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="mb-5 bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex flex-wrap gap-2 items-center">
            <span className="text-xs font-semibold text-txt-secondary uppercase tracking-wide mr-2">
              Sort by
            </span>
            {[
              { label: "Newest", value: "-created_at" },
              { label: "Oldest", value: "created_at" },
              { label: "Type", value: "post_type" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setOrdering(opt.value)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  ordering === opt.value
                    ? "bg-brand text-white"
                    : "bg-surface text-txt-secondary hover:bg-brand-light hover:text-brand"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* Posts feed */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {[...Array(3)].map((_, i) => (
              <PostSkeleton key={i} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search size={28} className="text-txt-secondary opacity-50" />
            </div>
            <p className="text-txt-secondary text-sm">No posts found</p>
            {search && (
              <button
                onClick={() => {
                  setSearchInput("");
                  setSearch("");
                }}
                className="mt-3 text-brand text-sm hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onHidden={handleHidden} />
            ))}
          </div>
        )}

        {/* Infinite scroll sentinel */}
        <div ref={loaderRef} className="flex justify-center py-6">
          {loadingMore && (
            <Loader2 size={24} className="animate-spin text-brand" />
          )}
          {!loadingMore && page >= totalPages && posts.length > 0 && (
            <p className="text-xs text-txt-secondary">You're all caught up ✨</p>
          )}
        </div>
      </div>
    </div>
  );
}

function PostSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-full bg-surface" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-surface rounded w-32" />
          <div className="h-2.5 bg-surface rounded w-16" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-surface rounded w-full" />
        <div className="h-3 bg-surface rounded w-4/5" />
      </div>
      <div className="grid grid-cols-2 gap-1 rounded-xl overflow-hidden mb-4">
        <div className="h-48 bg-surface" />
        <div className="h-48 bg-surface" />
      </div>
      <div className="flex gap-2">
        <div className="flex-1 h-9 bg-surface rounded-xl" />
        <div className="flex-1 h-9 bg-surface rounded-xl" />
        <div className="flex-1 h-9 bg-surface rounded-xl" />
      </div>
    </div>
  );
}