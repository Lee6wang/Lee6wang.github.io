/* ----------------------
   Meteor Animation
   ---------------------- */
document.addEventListener("DOMContentLoaded", function () {
  var maxMeteors = 12;
  var activeMeteors = 0;
  var currentMode = detectMode();

  function detectMode() {
    var htmlMode = document.documentElement.getAttribute("data-mode");
    if (htmlMode === "dark" || htmlMode === "light") return htmlMode;

    var stored = null;
    try {
      stored = localStorage.getItem("mode");
    } catch (e) {
      stored = null;
    }
    if (stored === "dark" || stored === "light") return stored;

    var prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  }

  function setModeFromSource() {
    currentMode = detectMode();
  }

  if (window.matchMedia) {
    var mql = window.matchMedia("(prefers-color-scheme: dark)");
    if (mql.addEventListener) {
      mql.addEventListener("change", setModeFromSource);
    } else if (mql.addListener) {
      mql.addListener(setModeFromSource);
    }
  }

  var htmlObserver = new MutationObserver(setModeFromSource);
  htmlObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-mode"],
  });

  function colorForMode() {
    if (currentMode === "dark") {
      return {
        head: "rgba(255,245,200,0.95)",
        tail: "rgba(255,245,200,0)",
        glow: "rgba(255,245,200,0.5)",
      };
    }
    return {
      head: "rgba(80,140,255,0.95)",
      tail: "rgba(80,140,255,0)",
      glow: "rgba(80,140,255,0.35)",
    };
  }

  function createMeteor() {
    if (activeMeteors >= maxMeteors) return;
    activeMeteors += 1;

    var meteor = document.createElement("div");
    var thickness = Math.random() * 1.5 + 1.2;
    var length = Math.random() * 160 + 120;
    var startX = Math.random() * (window.innerWidth + 200) - 100;
    var startY = Math.random() * -140 - 40;
    var duration = Math.random() * 1200 + 1500;
    var angleDeg = 65 + Math.random() * 15; // down-right direction
    var angle = (angleDeg * Math.PI) / 180;
    var distance = Math.random() * 420 + 420;
    var deltaX = Math.cos(angle) * distance;
    var deltaY = Math.sin(angle) * distance;
    var palette = colorForMode();

    meteor.style.position = "fixed";
    meteor.style.left = "0";
    meteor.style.top = "0";
    meteor.style.width = length + "px";
    meteor.style.height = thickness + "px";
    meteor.style.background =
      "linear-gradient(90deg, " + palette.head + ", " + palette.tail + ")";
    meteor.style.borderRadius = "999px";
    meteor.style.pointerEvents = "none";
    meteor.style.zIndex = 0;
    meteor.style.boxShadow = "0 0 14px " + palette.glow;
    meteor.style.opacity = 0;
    meteor.style.transform =
      "translate3d(" +
      startX +
      "px, " +
      startY +
      "px, 0) rotate(" +
      angleDeg +
      "deg)";
    meteor.style.willChange = "transform, opacity";
    meteor.style.filter = "blur(0.2px)";

    document.body.appendChild(meteor);

    var startTime = performance.now();

    function animate(now) {
      var t = (now - startTime) / duration;
      if (t >= 1) {
        document.body.removeChild(meteor);
        activeMeteors -= 1;
        return;
      }

      var eased = Math.sqrt(t);
      var currentX = startX + deltaX * eased;
      var currentY = startY + deltaY * eased;
      var fade = Math.min(1, eased * 2) * (1 - t * 0.8);

      meteor.style.transform =
        "translate3d(" +
        currentX +
        "px, " +
        currentY +
        "px, 0) rotate(" +
        angleDeg +
        "deg)";
      meteor.style.opacity = fade;

      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }

  (function scheduleMeteors() {
    createMeteor();
    var delay = Math.random() * 1500 + 1500;
    setTimeout(scheduleMeteors, delay);
  })();
});
