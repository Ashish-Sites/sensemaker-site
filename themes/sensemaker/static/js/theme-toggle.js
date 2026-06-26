// Theme Toggle
const html = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');

// Initialize theme from localStorage or system preference
function initTheme() {
  const saved = localStorage.getItem('theme');
  if (saved) {
    setTheme(saved);
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');
  }
}

function setTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  updateToggleButton(theme);
}

function updateToggleButton(theme) {
  if (themeToggle) {
    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
}

function toggleTheme() {
  const current = html.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  setTheme(next);
}

// Event listeners
if (themeToggle) {
  themeToggle.addEventListener('click', toggleTheme);
}

// Listen for system preference changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!localStorage.getItem('theme')) {
    setTheme(e.matches ? 'dark' : 'light');
  }
});

// Initialize on load
initTheme();
