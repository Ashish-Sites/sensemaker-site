(function () {
  if (!window.CMS) return;

  const ReactRef = window.CMS.React || null;
  const h = ReactRef ? ReactRef.createElement : null;

  const getValue = (obj, key, fallback) => {
    if (!obj || typeof obj.get !== "function") return fallback;
    const value = obj.get(key);
    return value === undefined || value === null || value === "" ? fallback : value;
  };

  const toPlain = (value) => {
    if (value && typeof value.toJS === "function") return value.toJS();
    return value;
  };

  const escapeHtml = (value) =>
    String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const escapeAttr = (value) => String(value || "").replace(/"/g, "\\\"");

  const buildShortcode = (name, attrs, body) => {
    const attrString = Object.entries(attrs || {})
      .filter(([, value]) => value !== undefined && value !== null && String(value) !== "")
      .map(([key, value]) => `${key}="${escapeAttr(value)}"`)
      .join(" ");
    const openTag = attrString ? `{{< ${name} ${attrString} >}}` : `{{< ${name} >}}`;
    if (body === undefined || body === null) return openTag;
    return `${openTag}\n${body}\n{{< /${name} >}}`;
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

  const runPreviewEnhancements = (root) => {
    const scope = root || document;

    if (window.mermaid) {
      try {
        window.mermaid.initialize({ startOnLoad: false, theme: "dark", securityLevel: "loose" });
        const nodes = scope.querySelectorAll(".mermaid");
        if (nodes.length) window.mermaid.run({ nodes: Array.from(nodes) });
      } catch (_error) {
        // Keep preview responsive even when diagram text is incomplete.
      }
    }

    if (window.Chart) {
      const canvases = scope.querySelectorAll("canvas.interactive-chart");
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
          .map((v) => Number(v.trim()));

        if (!labels.length || labels.length !== values.length || values.some((v) => !Number.isFinite(v))) {
          return;
        }

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
              legend: { labels: { color: "#c9d1d9" } }
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
  };

  const installPreviewObserver = () => {
    if (window.__sensemakerPreviewObserverInstalled) return;
    window.__sensemakerPreviewObserverInstalled = true;

    const observer = new MutationObserver(() => {
      runPreviewEnhancements(document);
    });

    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => runPreviewEnhancements(document), 0);
  };

  const installPublishWarning = () => {
    if (window.__sensemakerPublishWarningInstalled) return;
    window.__sensemakerPublishWarningInstalled = true;

    window.CMS.registerEventListener({
      name: 'prePublish',
      handler: ({ entry }) => {
        const isDraft = Boolean(entry && typeof entry.getIn === 'function' && entry.getIn(['data', 'draft']));
        if (!isDraft) return;

        window.alert(
          'This entry is still marked as draft. Publishing will make it live on the site.',
        );
      },
    });
  };

  if (h && ReactRef && ReactRef.Component) {
    const renderBlock = (block, idx) => {
      const data = toPlain(block) || {};
      const type = getValue(block, "type", data.type || "markdown");
      const plain = (key, fallback) => {
        const value = data[key];
        return value === undefined || value === null || value === "" ? fallback : value;
      };

      if (type === "markdown") {
        const content = plain("markdown", "");
        return h(
          "div",
          { key: `block-${idx}`, className: "cms-block cms-block-markdown" },
          h("div", { className: "cms-block-title" }, "Markdown"),
          h("pre", null, content)
        );
      }

      if (type === "code") {
        const language = plain("language", "text");
        const code = plain("code", "");
        return h(
          "div",
          { key: `block-${idx}`, className: "cms-block cms-block-code" },
          h("div", { className: "cms-block-title" }, `Code (${language})`),
          h("pre", null, h("code", null, code))
        );
      }

      if (type === "mermaid") {
        const diagram = plain("diagram", "");
        return h(
          "div",
          { key: `block-${idx}`, className: "cms-block cms-block-mermaid" },
          h("div", { className: "cms-block-title" }, "Mermaid"),
          h("div", { className: "mermaid" }, diagram)
        );
      }

      if (type === "table") {
        const markdown = plain("markdown", "");
        const parsed = parseTableMarkdown(markdown);

        if (!parsed) {
          return h(
            "div",
            { key: `block-${idx}`, className: "cms-block cms-block-table" },
            h("div", { className: "cms-block-title" }, "Table"),
            h("pre", null, markdown)
          );
        }

        return h(
          "div",
          { key: `block-${idx}`, className: "cms-block cms-block-table" },
          h("div", { className: "cms-block-title" }, "Table"),
          h(
            "table",
            { className: "cms-preview-table" },
            h("thead", null, h("tr", null, parsed.headers.map((cell, cIdx) => h("th", { key: `th-${cIdx}` }, cell)))),
            h(
              "tbody",
              null,
              parsed.rows.map((row, rIdx) => h("tr", { key: `tr-${rIdx}` }, row.map((cell, cIdx) => h("td", { key: `td-${rIdx}-${cIdx}` }, cell))))
            )
          )
        );
      }

      if (type === "image") {
        const src = plain("src", "");
        const alt = plain("alt", "");
        const caption = plain("title", "");

        return h(
          "div",
          { key: `block-${idx}`, className: "cms-block cms-block-image" },
          h("div", { className: "cms-block-title" }, "Image"),
          src ? h("img", { src, alt, style: { maxWidth: "100%", height: "auto", display: "block" } }) : null,
          caption ? h("p", { style: { marginTop: "8px", color: "#64748b" } }, caption) : null
        );
      }

      if (type === "chart") {
        const chartType = plain("chart_type", "line");
        const labels = plain("labels", "");
        const values = plain("values", "");
        const series = plain("series", "Series");

        return h(
          "div",
          { key: `block-${idx}`, className: "cms-block cms-block-chart" },
          h("div", { className: "cms-block-title" }, `Chart (${chartType})`),
          h(
            "div",
            { className: "cms-chart-wrap", style: { height: "240px" } },
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

      if (type === "quote") {
        const source = plain("source", "");
        const date = plain("date", "");
        const body = plain("body", "");
        return h(
          "figure",
          { key: `block-${idx}`, className: "cms-block cms-block-quote quote-item quote-block" },
          h("blockquote", { className: "quote-text prose" }, body),
          h(
            "figcaption",
            null,
            source ? h("span", { className: "quote-source" }, `— ${source}`) : null,
            date ? h("span", { className: "quote-date" }, date) : null
          )
        );
      }

      if (type === "details") {
        const title = plain("title", "Details");
        const body = plain("body", "");
        return h(
          "details",
          { key: `block-${idx}`, className: "cms-block cms-block-details content-details" },
          h("summary", null, title),
          h("div", { className: "content-details-body prose" }, h("pre", null, body))
        );
      }

      if (type === "definition") {
        const term = plain("term", "Term");
        const body = plain("body", "");
        return h(
          "dl",
          { key: `block-${idx}`, className: "cms-block cms-block-definition definition-card" },
          h("dt", null, term),
          h("dd", { className: "prose" }, h("pre", null, body))
        );
      }

      if (type === "tabs") {
        const items = Array.isArray(data.items) ? data.items : [];
        return h(
          "div",
          { key: `block-${idx}`, className: "cms-block cms-block-tabs content-tabs" },
          items.map((item, tabIdx) => {
            const itemData = toPlain(item) || {};
            return h(
              "div",
              { key: `tab-${tabIdx}`, className: "content-tabs-item" },
              h("div", { className: "content-tabs-label" }, itemData.title || `Tab ${tabIdx + 1}`),
              h("div", { className: "content-tabs-panel prose" }, h("pre", null, itemData.body || ""))
            );
          })
        );
      }

      if (type === "timeline") {
        const events = Array.isArray(data.events) ? data.events : [];
        return h(
          "ol",
          { key: `block-${idx}`, className: "cms-block cms-block-timeline content-timeline" },
          events.map((item, eventIdx) => {
            const itemData = toPlain(item) || {};
            return h(
              "li",
              { key: `event-${eventIdx}`, className: "content-timeline-item" },
              h("div", { className: "content-timeline-meta" }, itemData.date ? h("span", { className: "content-timeline-date" }, itemData.date) : null),
              itemData.title ? h("h3", { className: "content-timeline-title" }, itemData.title) : null,
              h("div", { className: "content-timeline-body prose" }, h("pre", null, itemData.body || ""))
            );
          })
        );
      }

      if (type === "checklist") {
        const body = plain("body", "");
        return h(
          "section",
          { key: `block-${idx}`, className: "cms-block cms-block-checklist content-checklist" },
          h("pre", null, body)
        );
      }

      if (type === "embed") {
        const src = plain("src", "");
        const title = plain("title", "Embedded content");
        const ratio = plain("ratio", "16:9");
        return h(
          "div",
          { key: `block-${idx}`, className: `cms-block cms-block-embed embed-wrapper embed-wrapper-${String(ratio).replace(":", "-")}` },
          src ? h("iframe", { src, title, loading: "lazy", referrerPolicy: "no-referrer", allowFullScreen: true }) : null
        );
      }

      if (type === "referencecard") {
        const ref = plain("ref", "");
        const label = plain("label", "");
        return h(
          "div",
          { key: `block-${idx}`, className: "cms-block cms-block-referencecard reference-card" },
          h("span", { className: "reference-card-type" }, "reference"),
          h("strong", { className: "reference-card-title" }, label || ref || "Reference"),
          h("span", { className: "reference-card-desc" }, ref || "No reference selected")
        );
      }

      if (type === "math") {
        const expression = plain("expression", "");
        return h(
          "div",
          { key: `block-${idx}`, className: "cms-block cms-block-math math-block" },
          h("pre", null, `$$\n${expression}\n$$`)
        );
      }

      return h("div", { key: `block-${idx}`, className: "cms-block" }, `Unsupported block type: ${type}`);
    };

    class BlockPreview extends ReactRef.Component {
      componentDidMount() {
        runPreviewEnhancements(document);
      }

      componentDidUpdate() {
        runPreviewEnhancements(document);
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
        }

        children.push(h("div", { key: "body", className: "cms-body-preview" }, bodyWidget));

        return h("article", { className: "cms-block-preview-root" }, children);
      }
    }

    window.CMS.registerPreviewTemplate("investigations", BlockPreview);
    window.CMS.registerPreviewTemplate("articles", BlockPreview);
  }

  const mermaidPattern = /^{{<\s*mermaid\s*>}}\n([\s\S]*?)\n{{<\s*\/mermaid\s*>}}$/m;

  window.CMS.registerEditorComponent({
    id: "mermaid-diagram",
    label: "Mermaid",
    fields: [{ name: "diagram", label: "Mermaid Definition", widget: "text" }],
    pattern: mermaidPattern,
    fromBlock: function (match) {
      return { diagram: match[1] };
    },
    toBlock: function (obj) {
      return buildShortcode("mermaid", {}, obj.diagram || "");
    },
    toPreview: function (obj) {
      return '<div class="mermaid">' + (obj.diagram || "") + "</div>";
    }
  });

  window.CMS.registerEditorComponent({
    id: "code-shortcode",
    label: "Code",
    fields: [
      { name: "lang", label: "Language", widget: "string", required: false, default: "text" },
      { name: "code", label: "Code", widget: "text" }
    ],
    pattern: /^{{<\s*code(?:\s+lang="([^"]*)")?\s*>}}\n([\s\S]*?)\n{{<\s*\/code\s*>}}$/m,
    fromBlock: function (match) {
      return { lang: match[1] || "text", code: match[2] || "" };
    },
    toBlock: function (obj) {
      return buildShortcode("code", { lang: obj.lang || "text" }, obj.code || "");
    },
    toPreview: function (obj) {
      return '<pre class="cms-shortcode-preview-code"><code>' + escapeHtml(obj.code || "") + "</code></pre>";
    }
  });

  window.CMS.registerEditorComponent({
    id: "chart-shortcode",
    label: "Chart",
    fields: [
      { name: "type", label: "Chart Type", widget: "select", options: ["line", "bar"], default: "line" },
      { name: "labels", label: "Labels (pipe separated)", widget: "string" },
      { name: "values", label: "Values (pipe separated)", widget: "string" },
      { name: "series", label: "Series Label", widget: "string", required: false, default: "Series" }
    ],
    pattern: /^{{<\s*chart(?:\s+type="([^"]*)")?(?:\s+labels="([^"]*)")?(?:\s+values="([^"]*)")?(?:\s+series="([^"]*)")?\s*>}}$/m,
    fromBlock: function (match) {
      return { type: match[1] || "line", labels: match[2] || "", values: match[3] || "", series: match[4] || "Series" };
    },
    toBlock: function (obj) {
      return buildShortcode("chart", { type: obj.type || "line", labels: obj.labels || "", values: obj.values || "", series: obj.series || "Series" });
    },
    toPreview: function (obj) {
      return '<div class="cms-shortcode-preview">Chart (' + escapeHtml(obj.type || "line") + ")</div>";
    }
  });

  window.CMS.registerEditorComponent({
    id: "image-shortcode",
    label: "Image",
    fields: [
      { name: "src", label: "Image Source", widget: "image" },
      { name: "alt", label: "Alt Text", widget: "string", required: false },
      { name: "title", label: "Caption", widget: "string", required: false }
    ],
    pattern: /^{{<\s*image\s+src="([^"]*)"(?:\s+alt="([^"]*)")?(?:\s+title="([^"]*)")?\s*>}}$/m,
    fromBlock: function (match) {
      return { src: match[1] || "", alt: match[2] || "", title: match[3] || "" };
    },
    toBlock: function (obj) {
      return buildShortcode("image", { src: obj.src || "", alt: obj.alt || "", title: obj.title || "" });
    },
    toPreview: function (obj) {
      return '<div class="cms-shortcode-preview">Image: ' + escapeHtml(obj.src || "") + "</div>";
    }
  });

  window.CMS.registerEditorComponent({
    id: "table-shortcode",
    label: "Table",
    fields: [
      { name: "caption", label: "Caption", widget: "string", required: false },
      { name: "markdown", label: "Table Markdown", widget: "text" }
    ],
    pattern: /^{{<\s*table(?:\s+caption="([^"]*)")?\s*>}}\n([\s\S]*?)\n{{<\s*\/table\s*>}}$/m,
    fromBlock: function (match) {
      return { caption: match[1] || "", markdown: match[2] || "" };
    },
    toBlock: function (obj) {
      return buildShortcode("table", { caption: obj.caption || "" }, obj.markdown || "");
    },
    toPreview: function (obj) {
      return '<div class="cms-shortcode-preview">Table</div>';
    }
  });

  window.CMS.registerEditorComponent({
    id: "callout-shortcode",
    label: "Callout",
    fields: [
      { name: "variant", label: "Variant", widget: "select", options: ["note", "info", "success", "warning", "danger"], default: "note" },
      { name: "title", label: "Title", widget: "string", required: false },
      { name: "body", label: "Body", widget: "markdown" }
    ],
    pattern: /^{{<\s*callout(?:\s+variant="([^"]*)")?(?:\s+title="([^"]*)")?\s*>}}\n([\s\S]*?)\n{{<\s*\/callout\s*>}}$/m,
    fromBlock: function (match) {
      return { variant: match[1] || "note", title: match[2] || "", body: match[3] || "" };
    },
    toBlock: function (obj) {
      return buildShortcode("callout", { variant: obj.variant || "note", title: obj.title || "" }, obj.body || "");
    },
    toPreview: function (obj) {
      return '<div class="cms-shortcode-preview">Callout: ' + escapeHtml(obj.variant || "note") + "</div>";
    }
  });

  window.CMS.registerEditorComponent({
    id: "quote-shortcode",
    label: "Quote",
    fields: [
      { name: "source", label: "Source", widget: "string", required: false },
      { name: "date", label: "Date", widget: "string", required: false },
      { name: "body", label: "Body", widget: "markdown" }
    ],
    pattern: /^{{<\s*quote(?:\s+source="([^"]*)")?(?:\s+date="([^"]*)")?\s*>}}\n([\s\S]*?)\n{{<\s*\/quote\s*>}}$/m,
    fromBlock: function (match) {
      return { source: match[1] || "", date: match[2] || "", body: match[3] || "" };
    },
    toBlock: function (obj) {
      return buildShortcode("quote", { source: obj.source || "", date: obj.date || "" }, obj.body || "");
    },
    toPreview: function (obj) {
      return '<blockquote class="cms-shortcode-preview">' + escapeHtml(obj.body || "") + "</blockquote>";
    }
  });

  window.CMS.registerEditorComponent({
    id: "details-shortcode",
    label: "Details",
    fields: [
      { name: "title", label: "Title", widget: "string", required: false, default: "Details" },
      { name: "open", label: "Open", widget: "boolean", required: false, default: false },
      { name: "body", label: "Body", widget: "markdown" }
    ],
    pattern: /^{{<\s*details(?:\s+title="([^"]*)")?(?:\s+open="(true|false)")?\s*>}}\n([\s\S]*?)\n{{<\s*\/details\s*>}}$/m,
    fromBlock: function (match) {
      return { title: match[1] || "Details", open: match[2] === "true", body: match[3] || "" };
    },
    toBlock: function (obj) {
      return buildShortcode("details", { title: obj.title || "Details", open: String(Boolean(obj.open)) }, obj.body || "");
    },
    toPreview: function (obj) {
      return '<details class="cms-shortcode-preview"><summary>' + escapeHtml(obj.title || "Details") + "</summary><div>" + escapeHtml(obj.body || "") + "</div></details>";
    }
  });

  window.CMS.registerEditorComponent({
    id: "definition-shortcode",
    label: "Definition",
    fields: [
      { name: "term", label: "Term", widget: "string", required: false, default: "Term" },
      { name: "body", label: "Body", widget: "markdown" }
    ],
    pattern: /^{{<\s*definition(?:\s+term="([^"]*)")?\s*>}}\n([\s\S]*?)\n{{<\s*\/definition\s*>}}$/m,
    fromBlock: function (match) {
      return { term: match[1] || "Term", body: match[2] || "" };
    },
    toBlock: function (obj) {
      return buildShortcode("definition", { term: obj.term || "Term" }, obj.body || "");
    },
    toPreview: function (obj) {
      return '<dl class="cms-shortcode-preview"><dt>' + escapeHtml(obj.term || "Term") + "</dt><dd>" + escapeHtml(obj.body || "") + "</dd></dl>";
    }
  });

  window.CMS.registerEditorComponent({
    id: "tabs-shortcode",
    label: "Tabs",
    fields: [
      { name: "id", label: "Tabs ID", widget: "string", required: false },
      { name: "body", label: "Tabs Content", widget: "text", hint: "Use sections as: Title line, body text, then --- between tabs." }
    ],
    pattern: /^{{<\s*tabs(?:\s+id="([^"]*)")?\s*>}}\n([\s\S]*?)\n{{<\s*\/tabs\s*>}}$/m,
    fromBlock: function (match) {
      return { id: match[1] || "", body: match[2] || "" };
    },
    toBlock: function (obj) {
      return buildShortcode("tabs", { id: obj.id || "" }, obj.body || "");
    },
    toPreview: function (obj) {
      return '<div class="cms-shortcode-preview">Tabs</div>';
    }
  });

  window.CMS.registerEditorComponent({
    id: "timeline-shortcode",
    label: "Timeline",
    fields: [
      { name: "id", label: "Timeline ID", widget: "string", required: false },
      { name: "body", label: "Timeline Content", widget: "text", hint: "Use sections as: date | title, body text, then --- between events." }
    ],
    pattern: /^{{<\s*timeline(?:\s+id="([^"]*)")?\s*>}}\n([\s\S]*?)\n{{<\s*\/timeline\s*>}}$/m,
    fromBlock: function (match) {
      return { id: match[1] || "", body: match[2] || "" };
    },
    toBlock: function (obj) {
      return buildShortcode("timeline", { id: obj.id || "" }, obj.body || "");
    },
    toPreview: function (obj) {
      return '<div class="cms-shortcode-preview">Timeline</div>';
    }
  });

  window.CMS.registerEditorComponent({
    id: "checklist-shortcode",
    label: "Checklist",
    fields: [{ name: "body", label: "Body", widget: "markdown" }],
    pattern: /^{{<\s*checklist\s*>}}\n([\s\S]*?)\n{{<\s*\/checklist\s*>}}$/m,
    fromBlock: function (match) {
      return { body: match[1] || "" };
    },
    toBlock: function (obj) {
      return buildShortcode("checklist", {}, obj.body || "");
    },
    toPreview: function (obj) {
      return '<div class="cms-shortcode-preview">Checklist</div>';
    }
  });

  window.CMS.registerEditorComponent({
    id: "embed-shortcode",
    label: "Embed",
    fields: [
      { name: "src", label: "Source URL", widget: "string" },
      { name: "title", label: "Title", widget: "string", required: false },
      { name: "ratio", label: "Aspect Ratio", widget: "select", options: ["16:9", "4:3", "1:1"], default: "16:9" }
    ],
    pattern: /^{{<\s*embed(?:\s+src="([^"]*)")?(?:\s+title="([^"]*)")?(?:\s+ratio="([^"]*)")?\s*>}}$/m,
    fromBlock: function (match) {
      return { src: match[1] || "", title: match[2] || "", ratio: match[3] || "16:9" };
    },
    toBlock: function (obj) {
      return buildShortcode("embed", { src: obj.src || "", title: obj.title || "", ratio: obj.ratio || "16:9" });
    },
    toPreview: function (obj) {
      return '<div class="cms-shortcode-preview">Embed: ' + escapeHtml(obj.src || "") + "</div>";
    }
  });

  window.CMS.registerEditorComponent({
    id: "referencecard-shortcode",
    label: "Reference Card",
    fields: [
      { name: "ref", label: "Reference Path", widget: "string" },
      { name: "label", label: "Label", widget: "string", required: false }
    ],
    pattern: /^{{<\s*referencecard(?:\s+ref="([^"]*)")?(?:\s+label="([^"]*)")?\s*>}}$/m,
    fromBlock: function (match) {
      return { ref: match[1] || "", label: match[2] || "" };
    },
    toBlock: function (obj) {
      return buildShortcode("referencecard", { ref: obj.ref || "", label: obj.label || "" });
    },
    toPreview: function (obj) {
      return '<div class="cms-shortcode-preview">Reference: ' + escapeHtml(obj.ref || "") + "</div>";
    }
  });

  window.CMS.registerEditorComponent({
    id: "math-shortcode",
    label: "Math",
    fields: [{ name: "expression", label: "Expression", widget: "text" }],
    pattern: /^{{<\s*math\s*>}}\n([\s\S]*?)\n{{<\s*\/math\s*>}}$/m,
    fromBlock: function (match) {
      return { expression: match[1] || "" };
    },
    toBlock: function (obj) {
      return buildShortcode("math", {}, obj.expression || "");
    },
    toPreview: function (obj) {
      return '<div class="cms-shortcode-preview">Math</div>';
    }
  });

  window.CMS.registerEditorComponent({
    id: "contentlink-shortcode",
    label: "Inline Content Link",
    fields: [
      { name: "ref", label: "Reference Path", widget: "string" },
      { name: "label", label: "Label", widget: "string", required: false }
    ],
    pattern: /^{{<\s*contentlink(?:\s+ref="([^"]*)")?(?:\s+label="([^"]*)")?\s*>}}$/m,
    fromBlock: function (match) {
      return { ref: match[1] || "", label: match[2] || "" };
    },
    toBlock: function (obj) {
      return buildShortcode("contentlink", { ref: obj.ref || "", label: obj.label || "" });
    },
    toPreview: function (obj) {
      return '<span class="cms-shortcode-preview">' + escapeHtml(obj.label || obj.ref || "Link") + "</span>";
    }
  });

  window.CMS.registerEditorComponent({
    id: "toc-shortcode",
    label: "Table of Contents",
    fields: [{ name: "title", label: "Title", widget: "string", required: false, default: "On this page" }],
    pattern: /^{{<\s*toc(?:\s+title="([^"]*)")?\s*>}}$/m,
    fromBlock: function (match) {
      return { title: match[1] || "On this page" };
    },
    toBlock: function (obj) {
      return buildShortcode("toc", { title: obj.title || "On this page" });
    },
    toPreview: function (obj) {
      return '<div class="cms-shortcode-preview">TOC: ' + escapeHtml(obj.title || "On this page") + "</div>";
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

  installPreviewObserver();
  installPublishWarning();
})();
