import React from "react";

export const Toast = ({ toast }) => {
    return (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-full text-sm font-medium shadow-lg transition-all ${
            toast.type === "error"
              ? "bg-red-500 text-white"
              : "bg-txt text-white"
          }`}
        >
          {toast.msg}
        </div>)
}

export const showToast = (msg, type = "success", setToast) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

export default showToast;