function Spinner() {
  return (
    <div
      style={{
        width: "36px",
        height: "36px",
        border: "3px solid #f0f0f0",
        borderTopColor: "#FF6B35",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
      }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default Spinner;