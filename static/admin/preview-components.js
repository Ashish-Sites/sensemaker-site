(function () {
  if (!window.CMS || !window.React) return;

  const h = window.React.createElement;

  const getValue = (obj, key, fallback) => {
    if (!obj || typeof obj.get !== "function") return fallback;
    const value = obj.get(key);
    return value === undefined || value === null || value === "" ? fallback : value;
  };

  const parseTableMarkdown = (markdown) => {
    const text = String(markdown || "").trim();
    if (!text) return null;

    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((line) => /^\|.*\|$/.test(line));

    if (lines.length < 2) return null;

    const parseRow = (line) =>
      line
        .split("|")
        .slice(1, -1)
        .map((cell) => cell.trim());

    const headers = parseRow(lines[0]);
    const bodyLines = lines.slice(2);
    const rows = bodyLines.map(parseRow).filter((row) => row.length > 0);

    if (!headers.length) return null;

    return { headers, rows };
  };

  const renderBlock = (block, idx) => {
    const type = getValue(block, "type", "markdown");

    if (type === "markdown") {
      const content = getValue(block, "markdown", "");
      return h("div", { key: `block-${idx}`, className: "cms-block cms-block-markdown" },
        h("div", { className: "cms-block-title" }, "Markdown"),
        h("pre", null, content)
      );
    }

    if (type === "code") {
      const language = getValue(block, "language", "text");
      const code = getValue(block, "code", "");
      return h("div", { key: `block-${idx}`, className: "cms-block cms-block-code" },
        h("div", { className: "cms-block-title" }, `Code (${language})`),
        h("pre", null, h("code", null, code))
      );
    }

    if (type === "mermaid") {
      const diagram = getValue(block, "diagram", "");
      return h("div", { key: `block-${idx}`, className: "cms-block cms-block-mermaid" },
        h("div", { className: "cms-block-title" }, "Mermaid"),
        h("div", { className: "mermaid" }, diagram)
      );
    }

    if (type === "table") {
      const markdown = getValue(block, "markdown", "");
      const parsed = parseTableMarkdown(markdown);

      if (!parsed) {
        return h("div", { key: `block-${idx}`, className: "cms-block cms-block-table" },
          h("div", { className: "cms-block-title" }, "Table"),
          h("pre", null, markdown)
        );
      }

      return h("div", { key: `block-${idx}`, className: "cms-block cms-block-table" },
        h("div", { className: "cms-block-title" }, "Table"),
        h("table", { className: "cms-preview-table" },
          h("thead", null,
            h("tr", null, parsed.headers.map((cell, cIdx) => h("th", { key: `th-${cIdx}` }, cell)))
          ),
          h("tbody", null,
            parsed.rows.map((row, rIdx) =>
              h("tr", { key: `tr-${rIdx}` }, row.map((cell, cIdx) => h("td", { key: `td-${rIdx}-${cIdx}` }, cell)))
            )
          )
        )
      );
    }

    if (type === "chart") {
      const chartType = getValue(block, "chart_type", "line");
      const labels = getValue(block, "labels", "");
      const values = getValue(block, "values", "");
      const series = getValue(block, "series", "Series");

      return h("div", { key: `block-${idx}`, className: "cms-block cms-block-chart" },
        h("div", { className: "cms-block-title" }, `Chart (${chartType})`),
        h("div", { className: "cms-chart-wrap", style: { height: "240px" } },
          h("canvas", {
            className: "interactive-chart",
            "data-type": chartType,
            "data-labels": labels,
            "data-values": values,
            "data-series": series
          })
        )
      );
    }

    return h("div", { key: `block-${idx}`, className: "cms-block" }, `Unsupported block type: ${type}`);
  };

  class BlockPreview extends window.React.Component {
    componentDidMount() {
      this.enhance();
    }

    componentDidUpdate() {
      this.enhance();
    }

    enhance() {
      const root = document.querySelector(".cms-block-preview-root");
      if (!root) return;

      if (window.mermaid) {
        try {
          window.mermaid.initialize({ startOnLoad: false, theme: "dark", securityLevel: "loose" });
          const nodes = root.querySelectorAll(".mermaid");
          window.mermaid.run({ nodes });
        } catch (_error) {
          // Preview should remain usable even if Mermaid fails for partial input.
        }
      }

      if (window.Chart) {
        const canvases = root.querySelectorAll("canvas.interactive-chart");
        canvases.forEach((canvas) => {
          if (canvas.__chartInstance) {
            canvas.__chartInstance.destroy();
            canvas.__chartInstance = null;
          }

          const labels = String(canvas.dataset.labels || "")
            .split("|")
            .map((v) => v.trim())
            .filter(Boolean);
          const values = String(canvas.dataset.values || "")
            .split("|")
            .map((v) => Number(v.trim()))
            .filter((v) => Number.isFinite(v));

          if (!labels.length || labels.length !== values.length) return;

          canvas.__chartInstance = new window.Chart(canvas, {
            type: canvas.dataset.type || "line",
            data: {
              labels,
              datasets: [
                {
                  label: canvas.dataset.series || "Series",
                  data: values,
                  tension: 0.3,
                  borderWidth: 2,
                  borderColor: "#58a6ff",
                  backgroundColor: "rgba(88,166,255,0.25)",
                  fill: (canvas.dataset.type || "line") === "line"
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
      }
    }

    render() {
      const entry = this.props.entry;
      const data = entry && entry.get ? entry.get("data") : null;
      const title = getValue(data, "title", "Untitled");
      const blocks = data && data.get ? data.get("content_blocks") : null;
      const bodyWidget = this.props.widgetFor ? this.props.widgetFor("body") : null;

      const children = [h("h1", { key: "title" }, title)];

      if (blocks && typeof blocks.map === "function" && blocks.size > 0) {
        const rendered = blocks.map((block, idx) => renderBlock(block, idx)).toArray();
        children.push(h("div", { key: "blocks", className: "cms-block-list" }, rendered));
      } else {
        children.push(h("div", { key: "body", className: "cms-body-preview" }, bodyWidget));
      }

      return h("article", { className: "cms-block-preview-root" }, children);
    }
  }

  const mermaidPattern = /^```mermaid\n([\s\S]*?)\n```$/m;

  window.CMS.registerEditorComponent({
    id: "mermaid-diagram",
    label: "Mermaid",
    fields: [{ name: "diagram", label: "Mermaid Definition", widget: "text" }],
    pattern: mermaidPattern,
    fromBlock: function (match) {
      return {
        diagram: match[1]
      };
    },
    toBlock: function (obj) {
      return "```mermaid\n" + (obj.diagram || "") + "\n```";
    },
    toPreview: function (obj) {
      return '<div class="mermaid">' + (obj.diagram || "") + "</div>";
    }
  });

  window.CMS.registerEditorComponent({
    id: "interactive-chart",
    label: "Chart",
    fields: [
      { name: "type", label: "Chart Type", widget: "select", options: ["line", "bar"], default: "line" },
      { name: "labels", label: "Labels (pipe separated)", widget: "string" },
      { name: "values", label: "Values (pipe separated)", widget: "string" },
      { name: "series", label: "Series Label", widget: "string", required: false, default: "Series" }
    ],
    pattern: /^<canvas class="interactive-chart" data-type="(line|bar)" data-labels="([^"]*)" data-values="([^"]*)" data-series="([^"]*)"><\/canvas>$/m,
    fromBlock: function (match) {
      return {
        type: match[1],
        labels: match[2],
        values: match[3],
        series: match[4]
      };
    },
    toBlock: function (obj) {
      const type = obj.type || "line";
      const labels = obj.labels || "";
      const values = obj.values || "";
      const series = obj.series || "Series";
      return '<canvas class="interactive-chart" data-type="' + type + '" data-labels="' + labels + '" data-values="' + values + '" data-series="' + series + '"></canvas>';
    },
    toPreview: function (obj) {
      return '<canvas class="interactive-chart" data-type="' + (obj.type || "line") + '" data-labels="' + (obj.labels || "") + '" data-values="' + (obj.values || "") + '" data-series="' + (obj.series || "Series") + '"></canvas>';
    }
  });

  window.CMS.registerPreviewTemplate("investigations", BlockPreview);
  window.CMS.registerPreviewTemplate("articles", BlockPreview);
})();
