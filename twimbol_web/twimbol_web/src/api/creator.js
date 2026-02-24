import api from "./axios";

// ── Creator Application ──────────────────────────────────────────
export const applyForCreator = () =>
  api.post("/create/api/apply-for-creator/", {
    headers: { "Content-Type": "application/json" },
  });

export const getCreatorApplication = () =>
  api.get("/user/api/creator-application/");



export const getAnalytics = () =>
  api.get("/create/api/analytics/me/");



// ── My Posts (used for both content list + deriving analytics) ───
// GET /create/api/creator/my-posts/
export const getMyPosts = (params = {}) =>
  api.get("/create/api/creator/my-posts/", { params });

// ── Create Post ──────────────────────────────────────────────────
// POST /api/posts/ — multipart/form-data
// Fields: post_title (required), post_description, post_banner (file)
export const createPost = (formData) =>
  api.post("/api/posts/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// ── Delete Post ──────────────────────────────────────────────────
// DELETE /api/posts/{id}/
export const deletePost = (postId, post_type) =>{
    console.log("Deleting post with ID:", postId, "and type:", post_type);
    if (post_type === "reel"){ 
        return api.delete(`/create/api/reel/${postId}/`);
    }
    else if (post_type === "youtube_reel"){
        return api.delete(`/create/api/reel/${postId}/`);
        
    }
    else{
        return api.delete(`/api/posts/${postId}/`);
}
}

// ── Create Reel (after Cloudinary upload) ────────────────────────
// POST /create/api/reel/
// Body: { video_url, thumbnail_url?, title?, reel_description? }
export const createReel = (data) =>
  api.post("/create/api/reel/", data);

// ── Create Video (after Cloudinary upload) ───────────────────────
// POST /create/api/video/
export const createVideo = (data) =>
  api.post("/create/api/video/", data);

// ── Upload video to Cloudinary (with live progress callback) ─────
export const uploadVideoToCloudinary = (file, onProgress) => {
  const formData = new FormData();
  formData.append("file", file);
  // Unsigned uploads REQUIRE the upload_preset
  formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
  // Optional: If your preset allows it, you can specify the folder here
  formData.append("folder", "reels");

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        const errorRes = JSON.parse(xhr.responseText || "{}");
        reject(new Error(errorRes.error?.message || `Cloudinary upload failed (${xhr.status})`));
      }
    });

    xhr.addEventListener("error", () =>
      reject(new Error("Network error during upload"))
    );

    // CRITICAL: Notice the "/video/upload" in the URL. 
    // This tells Cloudinary to expect a video file.
    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${
        import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
      }/video/upload`
    );
    
    xhr.send(formData);
  });
};

// ── Upload image to Cloudinary (post banners) ────────────────────
export const uploadImageToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
  formData.append("api_key", import.meta.env.VITE_CLOUDINARY_API_KEY);
  formData.append("folder", "posts");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${
      import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    }/image/upload`,
    { method: "POST", body: formData }
  );
  if (!res.ok) throw new Error("Image upload failed");
  return res.json();
};