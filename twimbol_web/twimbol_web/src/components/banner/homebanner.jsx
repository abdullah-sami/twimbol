import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// simple array of banner data; add/adjust as necessary
const bannerItems = [
  {
    id: 1,
    title: "erqw",
    description: "rqw",
    img: "https://res.cloudinary.com/ducr0o0wa/image/upload/v1772301372/jr-startup_qkqt81.png",
    route: "/post/137",
  },
  {
    id: 2,
    title: "",
    description: "",
    img: "https://res.cloudinary.com/ducr0o0wa/image/upload/v1772301374/jr-talent_oj4xml.png",
    route: "/post/141",
  },
//   {
//     id: 3,
//     title: "Become a Creator",
//     description: "Apply to join our creator program today.",
//     img: "/assets/boy-laptop.png",
//     route: "/creator/apply",
//   },
];

export const HomeBanner = () => {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  // cycle banners every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % bannerItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleClick = (route) => {
    navigate(route);
  };

  const { title, description, img, route } = bannerItems[current];

  return (
    <>
    
    <div
      className="home-banner"
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "10px",
        marginBottom: "30px",
        cursor: "pointer",
        // border: "3px solid #333",
        // backgroundColor: "#000",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      }}
      onClick={() => handleClick(route)}
    >
      <img
        src={img}
        alt={title}
        style={{
          width: "100%",
          display: "block",
          objectFit: "cover",
          height: "300px",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.1)",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          textAlign: "left",
          padding: "20px",
        }}
      >
        {/* <h1 style={{ fontSize: "1.3rem", color: "#000" }}>{title}</h1>
        <p style={{ fontSize: "1rem", color: "#000" }}>{description}</p> */}
      </div>
      {/* dots */}
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "6px",
        }}
      >
        {bannerItems.map((_, idx) => (
          <span
            key={idx}
            onClick={(e) => { e.stopPropagation(); setCurrent(idx); }}
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: idx === current ? "#fff" : "rgba(255,255,255,0.5)",
              cursor: "pointer",
            }}
          />
        ))}
      </div>
    </div>
    </>
  );
};

export default HomeBanner;

