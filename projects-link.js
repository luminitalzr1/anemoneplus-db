// Adds a "Projects & Maps" button next to "Map" in the ANEMONE PLUS database menu.
// It does not change the app itself: it only adds one extra link that opens projects.html.
(function () {
  function addLink() {
    if (document.getElementById("projects-maps-link")) return;
    var btns = Array.prototype.slice.call(document.querySelectorAll("button"));
    var mapBtn = btns.find(function (b) { return /(^|\s)Map\s*$/.test(b.textContent.trim()); });
    if (!mapBtn) return;
    var link = mapBtn.cloneNode(false);           // same look as the existing menu buttons
    link.id = "projects-maps-link";
    link.type = "button";
    link.textContent = "🌍 Projects & Maps";
    link.onclick = function () { link.textContent = "\u23F3 Opening…"; link.style.opacity = "0.7"; window.location.href = "projects.html"; };
    mapBtn.parentNode.insertBefore(link, mapBtn.nextSibling);
  }
  new MutationObserver(addLink).observe(document.documentElement, { childList: true, subtree: true });
  addLink();
})();
