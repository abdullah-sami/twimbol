import {react } from "react";
import NavBar from "../components/layout/Navbar.jsx";

export default function Events() {
  return (
    <div>
      <NavBar activePage="Events"/>
      <main style={{ marginTop:100, padding: 20, textAlign: "center" }}>
        <h1 style={{ fontSize: "2rem", color: "#333" }}>Coming Soon!</h1>
        <p style={{ color: "#666" }}>We are working on this feature. Please check back later!</p>

        {/* Back to Home */}
        <div style={{ marginTop: 20 }}>
          <button onClick={() => window.history.back()} className="bg-brand" style={{ background: "none", border: "none", cursor: "pointer" }}>
            ‹ Back to Home
          </button>
        </div>
      </main>
    </div>
  );
}

