import React from "react";
import { useNavigate } from "react-router-dom";
const Landing = () => {
  const navigate = useNavigate();

  const gotoLogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-white overflow-hidden relative font-sans">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <img src="/public/logo.png" alt="Twimbol Logo" className="w-36" />
          </div>
        </div>
        <button className="border-2 border-orange-400 text-orange-400 font-semibold px-4 py-1 rounded-full hover:bg-orange-50 transition-colors cursor-pointer text-sm " onClick={gotoLogin}>
          Sign in
        </button>
      </nav>

      {/* Hero Section */}
      <main className="relative px-8 pt-8 pb-16">

        {/* Purple diagonal lines — top right */}
        <div className="absolute top-4 right-12 hidden lg:block">
          <svg width="120" height="100" viewBox="0 0 120 100" fill="none">
            {[0, 1, 2, 3, 4].map((i) => (
              <line
                key={i}
                x1={10 + i * 18} y1="10"
                x2={10 + i * 18 + 40} y2="90"
                stroke="#7C3AED" strokeWidth="3.5" strokeLinecap="round"
                opacity={0.5 + i * 0.1}
              />
            ))}
          </svg>
        </div>

        {/* Orange loop — right of headline */}
        <div className="absolute right-52 top-64 hidden lg:block">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <path
              d="M60 20 Q80 40 60 55 Q40 70 20 55 Q5 40 20 25 Q35 10 55 25"
              stroke="#F97316" strokeWidth="3" fill="none" strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Purple swirl — left */}
        <div className="absolute left-18 top-30 hidden lg:block">
          <svg width="100" height="70" viewBox="0 0 100 70" fill="none">
            <path
              d="M80 10 Q60 -5 40 15 Q20 35 40 50 Q60 65 75 50"
              stroke="#7C3AED" strokeWidth="3" fill="none" strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Orange concentric circles — bottom left */}
        <div className="absolute left-32 bottom-8 hidden lg:block">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            {[15, 25, 35, 45, 55].map((r) => (
              <circle key={r} cx="60" cy="60" r={r}
                stroke="#F97316" strokeWidth="2" fill="none" opacity="0.7" />
            ))}
          </svg>
        </div>

        {/* 3-column grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">

          {/* Left — kid at laptop */}
          <div className="hidden lg:flex justify-center items-end">
            <img src="/public/assets/boy-laptop.png" alt="" />
          </div>

          {/* Center — hero copy */}
          <div className="text-center flex flex-col items-center gap-1">
            <h1 className="text-2xl font-extrabold text-gray-800 leading-tight">
              The best place to
              <br />
              <span style={{
                fontFamily: "'Caveat', cursive",
                color: "#F97316",
                fontSize: "1.6rem",
                textDecoration: "underline",
                textDecorationColor: "#F97316",
              }}>
                LEARN
              </span>{" "}and{" "}
              <span style={{
                fontFamily: "'Caveat', cursive",
                color: "#7C3AED",
                fontSize: "1.6rem",
                textDecoration: "underline",
                textDecorationColor: "#7C3AED",
              }}>
                ENJOY
              </span>
              <br />
              for kids
            </h1>

            <p className="text-gray-500 text-sm max-w-sm leading-relaxed mt-2">
              "Ensure a safe digital space for children by promoting healthy
              content and responsible internet use. Raise awareness among
              parents and educators."
            </p>

            <button className="mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-md px-4 py-2 rounded-full flex items-center shadow-lg transition-colors cursor-pointer"  onClick={gotoLogin}>
              Get Started
              <span className="text-white-500 rounded-full w-8 h-8 flex items-center justify-center text-base font-bold">
                <p>&rarr;</p>
              </span>
            </button>
          </div>

          {/* Right — kids network */}
          <div className="hidden lg:flex justify-center items-end">
            <img src="/public/assets/kid-social.png" alt="" />
          </div>
        </div>
      </main>
    </div>
  );
};



export default Landing;