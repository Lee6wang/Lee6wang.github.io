/* ----------------------
   Meteor Animation
   ---------------------- */
document.addEventListener("DOMContentLoaded", function () {
  function createMeteor() {
    var meteor = document.createElement("div");

    var thickness = Math.random() * 1.5 + 1;
    var length = Math.random() * 140 + 100;
    var startX = Math.random() * window.innerWidth;
    var startY = -80;
    var duration = Math.random() * 1500 + 1200;

    meteor.style.position = "fixed";
    meteor.style.top = startY + "px";
    meteor.style.left = startX + "px";
    meteor.style.width = length + "px";
    meteor.style.height = thickness + "px";
    meteor.style.background =
      "linear-gradient(90deg, rgba(255,255,255,0.9), rgba(255,255,255,0))";
    meteor.style.borderRadius = "999px";
    meteor.style.pointerEvents = "none";
    meteor.style.zIndex = 0;
    meteor.style.transform = "rotate(315deg)";

    document.body.appendChild(meteor);

    var endX = startX + 320;
    var endY = startY + 320;
    var startTime = performance.now();

    function animate(now) {
      var t = (now - startTime) / duration;
      if (t >= 1) {
        document.body.removeChild(meteor);
        return;
      }

      var currentX = startX + (endX - startX) * t;
      var currentY = startY + (endY - startY) * t;

      meteor.style.left = currentX + "px";
      meteor.style.top = currentY + "px";
      meteor.style.opacity = 1 - t;

      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }

  setInterval(createMeteor, 2500);
});
