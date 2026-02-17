document.querySelector("#reels-feed").focus();


const options = {
    root: null,
    threshold: 0.6 // 60% visible
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
    if (entry.isIntersecting) {
        const videoId = entry.target.getAttribute("data-video-id");
        const newUrl = `/reel/${videoId}`;

        // Only update if not already on this URL
        if (window.location.pathname !== newUrl) {
        window.history.replaceState(null, null, newUrl);
        }
    }
    });
}, options);

// Start observing each video section
document.querySelectorAll(".reel-player").forEach(section => {
    observer.observe(section);
});

function reactToVideo(videoId) {
    console.log(`Reacted to video: ${videoId}`);
    // Optionally send to backend using fetch/AJAX
}

function toggleCommentBox(videoId) {
    const box = document.getElementById(`comment-box-${videoId}`);

    box.style.display = box.style.display === 'none' ? 'block' : 'none';
}

function submitComment(videoId) {
    const input = document.getElementById(`comment-input-${videoId}`);
    const comment = input.value.trim();
    if (comment) {
    console.log(`Commented on video ${videoId}: ${comment}`);
    // Optionally send to backend using fetch/AJAX
    input.value = '';
    }
}

function shareVideo(videoId) {
    const url = `${window.location.origin}/reel\/${videoId}`;
    navigator.clipboard.writeText(url).then(() => {
    alert("Video URL copied to clipboard!");
    });
}









let players = {};

  // Called automatically by the YouTube API
  function onYouTubeIframeAPIReady() {
    const iframes = document.querySelectorAll('.youtube_player');

    iframes.forEach((iframe, index) => {
      const id = iframe.id;
      players[id] = new YT.Player(id);
    });

    setupObserver();
  }

  function setupObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const iframe = entry.target;
        const player = players[iframe.id];

        if (!player || typeof player.playVideo !== "function") return;

        if (entry.isIntersecting) {
          // Pause all others
          Object.values(players).forEach(p => {
            if (p !== player) p.pauseVideo();
          });

          player.playVideo();
        } else {
          player.pauseVideo();
        }
      });
    }, { threshold: 0.7 });

    document.querySelectorAll('.youtube_player').forEach(iframe => {
      observer.observe(iframe);
    });
  }