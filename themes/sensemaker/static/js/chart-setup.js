(function () {
  if (typeof Chart === "undefined") return;

  const charts = document.querySelectorAll("canvas.interactive-chart");
  charts.forEach((canvas) => {
    const labels = (canvas.dataset.labels || "").split("|").map((s) => s.trim()).filter(Boolean);
    const values = (canvas.dataset.values || "").split("|").map((s) => Number(s.trim()));
    const seriesLabel = canvas.dataset.series || "Series";
    const chartType = canvas.dataset.type || "line";

    if (!labels.length || !values.length || labels.length !== values.length) return;

    new Chart(canvas, {
      type: chartType,
      data: {
        labels,
        datasets: [
          {
            label: seriesLabel,
            data: values,
            tension: 0.3,
            borderWidth: 2,
            borderColor: "#58a6ff",
            backgroundColor: "rgba(88,166,255,0.25)",
            fill: chartType === "line"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: "#c9d1d9" }
          }
        },
        scales: {
          x: {
            ticks: { color: "#8b949e" },
            grid: { color: "rgba(139,148,158,0.2)" }
          },
          y: {
            ticks: { color: "#8b949e" },
            grid: { color: "rgba(139,148,158,0.2)" }
          }
        }
      }
    });
  });
})();
