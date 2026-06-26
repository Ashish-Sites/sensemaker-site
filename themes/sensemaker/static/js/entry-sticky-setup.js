(function () {
  function updateEntryStickyOffsets() {
    const pages = document.querySelectorAll('.entry-page');
    if (!pages.length) return;

    const rootFont = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const baseTopPx = 6.2 * rootFont;

    pages.forEach((page) => {
      const meta = page.querySelector('.entry-meta');
      if (!meta) return;

      page.style.setProperty('--entry-sticky-top', `${baseTopPx}px`);
    });
  }

  window.addEventListener('load', updateEntryStickyOffsets);
  window.addEventListener('resize', updateEntryStickyOffsets);
  document.addEventListener('DOMContentLoaded', updateEntryStickyOffsets);
})();
