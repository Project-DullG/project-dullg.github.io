"use strict";
const video = document.getElementById("guide-video");
document.querySelectorAll("[data-seek]").forEach(button => {
  button.addEventListener("click", () => {
    const seek = () => { video.currentTime = Number(button.dataset.seek); video.focus(); };
    if (video.readyState >= 1) seek();
    else { video.addEventListener("loadedmetadata", seek, {once:true}); video.load(); }
  });
});
