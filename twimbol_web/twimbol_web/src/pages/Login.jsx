import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { useAuthStore } from "../store/authStore";

const ConcentricCircles = ({ className, color = "#FF6E42" }) => (
  <svg
    viewBox="0 0 300 300"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {[20, 45, 70, 95, 120, 145, 170].map((r, i) => (
      <circle
        key={r}
        cx="150"
        cy="150"
        r={r}
        stroke={color}
        strokeWidth="12"
        fill="none"
        opacity={0.18 + i * 0.1}
      />
    ))}
  </svg>
);

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await login(email, password);
      if (data.access) localStorage.setItem('access_token', data.access);
      if (data.refresh) localStorage.setItem('refresh_token', data.refresh);
      if (data.user) localStorage.setItem('user', JSON.stringify(data.user));

      await setAuth(data.access, data.refresh);

      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex flex-col">
      

      {/* Navbar */}
      <nav className="px-8 py-4">
        <img src="/public/logo.png" alt="Twimbol Logo" className="w-36" />
      </nav>

      {/* Decorative circles — top right (partial) */}
      <ConcentricCircles
        className="absolute -top-20 -right-20 w-72 h-72 opacity-80"
        color="#FF6E42"
      />

      {/* Decorative circles — bottom left (partial) */}
      <ConcentricCircles
        className="absolute -bottom-16 -left-24 w-96 h-96 opacity-70"
        color="#FF6E42"
      />

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {/* Card with orange shadow offset */}
        <div className="relative w-full max-w-md">
          {/* Orange shadow card behind */}
          <div className="absolute inset-0 translate-x-4 translate-y-4 bg-[#FF6E42] rounded-lg" />

          {/* White form card */}
          <div className="relative bg-white border border-gray-200 rounded-lg px-10 py-12 shadow-sm">
            {/* Title */}
            <h1
              className="text-center font-extrabold tracking-wide mb-10"
              style={{ color: "#FF6E42", fontSize: "2.8rem" }}
            >
              LOGIN
            </h1>

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              {/* Email field */}
              <div className="flex items-center gap-3 border border-gray-300 rounded-md px-4 py-3 bg-white focus-within:border-[#FF6E42] transition-colors">
                {/* Mail icon */}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#7D7D7D"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <input
                  type="text"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 outline-none text-[#121212] placeholder-[#7D7D7D] bg-transparent text-sm"
                  required
                />
              </div>

              {/* Password field */}
              <div className="flex items-center gap-3 border border-gray-300 rounded-md px-4 py-3 bg-white focus-within:border-[#FF6E42] transition-colors">
                {/* Lock icon */}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#7D7D7D"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 outline-none text-[#121212] placeholder-[#7D7D7D] bg-transparent text-sm"
                  required
                />
              </div>

              {/* Forgot password */}
              <div className="flex justify-end -mt-1">
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium"
                  style={{ color: "#FF6E42" }}
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Login button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-4 w-3/4 mx-auto py-3 rounded-lg text-white font-bold text-lg tracking-wide transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: "#FF6E42" }}
              >
                {loading ? 'Signing in...' : 'Login'}
              </button>
              {error && (
                <p className="text-center text-sm text-red-600 mt-2">{error}</p>
              )}
            </form>

            {/* Sign up link */}
            <p className="text-center mt-6 text-sm text-[#7D7D7D]">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-semibold"
                style={{ color: "#FF6E42" }}
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;