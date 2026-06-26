(function () {
  function updateEntryStickyOffsets() {
    const pages = document.querySelectorAll('.entry-page');
    if (!pages.length) return;

    const rootFont = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const baseTopPx = 6.2 * rootFont;
    const gapPx = 1.0 * rootFont;
    const minLineageStickyHeightPx = 240;

    pages.forEach((page) => {
      const meta = page.querySelector('.entry-meta');
      const lineage = page.querySelector('.entry-lineage');
      if (!meta || !lineage) return;

      const metaHeightPx = Math.ceil(meta.getBoundingClientRect().height);
      const lineageTopPx = baseTopPx + metaHeightPx + gapPx;
      const lineageAvailablePx = window.innerHeight - lineageTopPx - 16;

      page.style.setProperty('--entry-sticky-top', `${baseTopPx}px`);
      page.style.setProperty('--entry-lineage-top', `${lineageTopPx}px`);

      if (lineageAvailablePx < minLineageStickyHeightPx) {
        lineage.classList.add('entry-lineage-static');
      } else {
        lineage.classList.remove('entry-lineage-static');
      }
    });
  }

  window.addEventListener('load', updateEntryStickyOffsets);
  window.addEventListener('resize', updateEntryStickyOffsets);
  document.addEventListener('DOMContentLoaded', updateEntryStickyOffsets);
})();
