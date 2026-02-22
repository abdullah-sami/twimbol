// src/components/pages/Signup.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, register } from "../api/auth";
import { useAuthStore } from "../store/authStore";


// ── Reusable concentric-circles decoration (same as Login) ──
const ConcentricCircles = ({ className }) => (
    <svg viewBox="0 0 300 300" fill="none" className={className}>
        {[20, 45, 70, 95, 120, 145, 170].map((r, i) => (
            <circle
                key={r}
                cx="150" cy="150" r={r}
                stroke="#FF6E42"
                strokeWidth="12"
                fill="none"
                opacity={0.18 + i * 0.1}
            />
        ))}
    </svg>
);

// ── Icon components ──────────────────────────────────────────
const MailIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="#7D7D7D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
);

const UserIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="#7D7D7D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
);

const CalendarIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="#7D7D7D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
);

const LockIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="#7D7D7D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

// ── Input field wrapper ──────────────────────────────────────
const InputField = ({ icon, ...props }) => (
    <div className="flex items-center gap-3 border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus-within:border-[#FF6E42] focus-within:bg-white transition-colors">
        <span className="shrink-0">{icon}</span>
        <input
            className="flex-1 outline-none bg-transparent text-[#121212] placeholder-[#7D7D7D] text-sm"
            {...props}
        />
    </div>
);

// ── Main Component ───────────────────────────────────────────
const Signup = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        username: "",
        birthday: "",
        password: "",
        confirmPassword: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const { setAuth } = useAuthStore();


    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        // Clear field-level error on edit
        setFieldErrors((prev) => ({ ...prev, [e.target.name]: null }));
        setError(null);
    };

    const validate = () => {
        const errs = {};
        if (!form.email) errs.email = "Email is required";
        if (!form.username) errs.username = "Username is required";
        if (!form.birthday) errs.birthday = "Date of birth is required";
        if (!form.password) errs.password = "Password is required";
        if (form.password !== form.confirmPassword)
            errs.confirmPassword = "Passwords do not match";
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setFieldErrors({});

        const errs = validate();
        if (Object.keys(errs).length) {
            setFieldErrors(errs);
            return;
        }

        setIsLoading(true);
        try {
            // POST /user/api/register/
            const {r_data} = await register({
                email: form.email,
                username: form.username,
                birthday: form.birthday,
                password: form.password,
            });


            try {
                console.log("Registration successful, logging in...", r_data, form.username, form.password);
                const { data } = await login(form.username, form.password);
                if (data.access) localStorage.setItem('access_token', data.access);
                if (data.refresh) localStorage.setItem('refresh_token', data.refresh);
                if (data.user) localStorage.setItem('user', JSON.stringify(data.user));

                await setAuth(data.access, data.refresh);

                navigate('/home');
            } catch (err) {
                setError(err.response?.data?.detail || 'Login failed');

            }


        } catch (err) {
            // Handle Django field-level validation errors
            const data = err.response?.data;
            if (data && typeof data === "object") {
                const mapped = {};
                if (data.username) mapped.username = data.username[0];
                if (data.email) mapped.email = data.email[0];
                if (data.password) mapped.password = data.password[0];
                if (Object.keys(mapped).length) {
                    setFieldErrors(mapped);
                } else {
                    setError(data.detail || "Registration failed. Please try again.");
                }
            } else {
                setError("Something went wrong. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white relative overflow-hidden flex flex-col">

            {/* Navbar */}
            <nav className="px-8 py-4">
                <img src="/logo.png" alt="Twimbol Logo" className="w-36" />
            </nav>

            {/* Decorative circles — top right */}
            <ConcentricCircles className="absolute -top-20 -right-20 w-72 h-72 opacity-80" />

            {/* Decorative circles — bottom left */}
            <ConcentricCircles className="absolute -bottom-16 -left-24 w-96 h-96 opacity-70" />

            {/* Main content */}
            <main className="flex-1 flex items-center justify-center px-4 py-10">
                <div className="relative w-full max-w-lg">
                    {/* Orange offset shadow */}
                    <div className="absolute inset-0 translate-x-4 translate-y-4 bg-[#FF6E42] rounded-2xl" />

                    {/* White card */}
                    <div className="relative bg-white border border-gray-200 rounded-2xl px-10 py-10 shadow-sm">
                        {/* Title */}
                        <h1
                            className="text-center font-extrabold mb-8"
                            style={{ color: "#FF6E42", fontSize: "2.8rem" }}
                        >
                            Sign-Up
                        </h1>

                        {/* Global error */}
                        {error && (
                            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <form className="flex flex-col gap-3">
                            {/* Email */}
                            <div>
                                <InputField
                                    icon={<MailIcon />}
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                />
                                {fieldErrors.email && (
                                    <p className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.email}</p>
                                )}
                            </div>

                            {/* Username */}
                            <div>
                                <InputField
                                    icon={<UserIcon />}
                                    type="text"
                                    name="username"
                                    placeholder="Username"
                                    value={form.username}
                                    onChange={handleChange}
                                    required
                                />
                                {fieldErrors.username && (
                                    <p className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.username}</p>
                                )}
                            </div>

                            {/* Date of Birth */}
                            <div>
                                <InputField
                                    icon={<CalendarIcon />}
                                    type="date"
                                    name="birthday"
                                    placeholder="Date of birth"
                                    value={form.birthday}
                                    onChange={handleChange}
                                    required
                                />
                                {fieldErrors.birthday && (
                                    <p className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.birthday}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <InputField
                                    icon={<LockIcon />}
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                />
                                {fieldErrors.password && (
                                    <p className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.password}</p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <InputField
                                    icon={<LockIcon />}
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirm Password"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                                {fieldErrors.confirmPassword && (
                                    <p className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.confirmPassword}</p>
                                )}
                            </div>

                            {/* Terms */}
                            <p className="text-center text-sm text-[#7D7D7D] mt-2">
                                By registering, you agree to our{" "}
                                <Link to="/terms" className="font-bold text-[#7C3AED] hover:underline">
                                    Terms of Service
                                </Link>{" "}
                                and{" "}
                                <Link to="/privacy" className="font-bold text-[#7C3AED] hover:underline">
                                    Privacy Policy
                                </Link>
                            </p>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="mt-2 w-3/4 mx-auto py-3 rounded-xl text-white font-bold text-lg tracking-wide transition-opacity hover:opacity-90 disabled:opacity-60 cursor-pointer"
                                style={{ backgroundColor: "#FF6E42" }}
                                onClick={handleSubmit}
                            >
                                {isLoading ? "Creating account..." : "Sign Up"}
                            </button>
                        </form>

                        {/* Login link */}
                        <p className="text-center mt-5 text-sm text-[#7D7D7D]">
                            Already have an account?{" "}
                            <Link to="/login" className="font-semibold" style={{ color: "#FF6E42" }}>
                                Login
                            </Link>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Signup;