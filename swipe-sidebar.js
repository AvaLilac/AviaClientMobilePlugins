(function () {
  if (window.__SWIPE_SIDEBAR__) return;
  window.__SWIPE_SIDEBAR__ = true;

  const SWIPE_THRESHOLD = 80;   // minimum px to count as a swipe
  const EDGE_ZONE = 20;         // px from left edge to trigger open swipe

  let touchStartX = null;
  let touchStartY = null;

  function getSidebar() {
    const wrap = document.getElementsByClassName(
      'd_flex h_100% min-w_0 c_var(--md-sys-color-outline) bg_var(--md-sys-color-surface-container-high)'
    ).item(0);
    return wrap && wrap.firstChild && wrap.firstChild.children[1]
      ? wrap.firstChild
      : null;
  }

  function showSidebar(sidebar) {
    sidebar.style.display = 'flex';
  }

  function hideSidebar(sidebar) {
    sidebar.style.display = 'none';
  }

  function onTouchStart(e) {
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  }

  function onTouchEnd(e) {
    if (touchStartX === null) return;

    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;

    if (Math.abs(dy) > Math.abs(dx)) {
      touchStartX = null;
      touchStartY = null;
      return;
    }

    const sidebar = getSidebar();
    if (!sidebar) return;

    if (dx > SWIPE_THRESHOLD) {

      if (touchStartX <= EDGE_ZONE || sidebar.style.display === 'none') {
        showSidebar(sidebar);
      }
    } else if (dx < -SWIPE_THRESHOLD) {

      hideSidebar(sidebar);
    }

    touchStartX = null;
    touchStartY = null;
  }

  document.addEventListener('touchstart', onTouchStart, { passive: true });
  document.addEventListener('touchend', onTouchEnd, { passive: true });
})();
