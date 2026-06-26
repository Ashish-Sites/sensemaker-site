(function () {
  function updateEntryStickyOffsets() {
    const pages = document.querySelectorAll('.entry-page');
    if (!pages.length) return;

    const rootFont = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const baseTopPx = 6.2 * rootFont;
    const gapPx = 0.75 * rootFont;

    pages.forEach((page) => {
      const meta = page.querySelector('.entry-meta');
      const lineage = page.querySelector('.entry-lineage');
      if (!meta || !lineage) return;

      const lineageTopPx = baseTopPx + meta.offsetHeight + gapPx;
      page.style.setProperty('--entry-sticky-top', `${baseTopPx}px`);
      page.style.setProperty('--entry-lineage-top', `${lineageTopPx}px`);
    });
  }

  window.addEventListener('load', updateEntryStickyOffsets);
  window.addEventListener('resize', updateEntryStickyOffsets);
  document.addEventListener('DOMContentLoaded', updateEntryStickyOffsets);
})();
