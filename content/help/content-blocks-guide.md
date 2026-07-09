---
title: "Content Blocks Guide"
description: "Reference guide for all supported content blocks with syntax, examples, and rendered output."
draft: false
---

## Table of Contents

- [External References](#external-references)
- [Callout](#callout)
- [Code](#code)
- [Mermaid](#mermaid)
- [Chart](#chart)
- [Image](#image)
- [Table](#table)
- [Quote](#quote)
- [Details](#details)
- [Definition](#definition)
- [Tabs](#tabs)
- [Timeline](#timeline)
- [Checklist](#checklist)
- [Embed](#embed)
- [Reference Card](#reference-card)
- [Math](#math)
- [Content Link](#content-link)
- [TOC Shortcode](#toc-shortcode)

## External References

- Mermaid docs: https://mermaid.js.org/intro/
- Markdown guide: https://www.markdownguide.org/basic-syntax/

## Callout

Syntax:

```markdown
{{</* callout variant="info" title="Info" */>}}
Your callout body.
{{</* /callout */>}}
```

Example + Rendered:

{{< callout variant="info" title="Info" >}}
Your callout body.
{{< /callout >}}

## Code

Syntax:

```markdown
{{</* code lang="python" */>}}
print("hello")
{{</* /code */>}}
```

Example + Rendered:

{{< code lang="python" >}}
print("hello")
{{< /code >}}

## Mermaid

Syntax:

```markdown
{{</* mermaid */>}}
flowchart TD
  A --> B
{{</* /mermaid */>}}
```

Example + Rendered:

{{< mermaid >}}
flowchart TD
  A[Start] --> B[End]
{{< /mermaid >}}

## Chart

Syntax:

```markdown
{{</* chart type="bar" labels="A|B|C" values="5|10|7" series="Series" */>}}
```

Example + Rendered:

{{< chart type="bar" labels="A|B|C" values="5|10|7" series="Series" >}}

## Image

Syntax:

```markdown
{{</* image src="/images/uploads/example.png" alt="Alt text" title="Caption" */>}}
```

Example + Rendered:

{{< image src="/images/favicon.svg" alt="Alt text" title="Caption" >}}

## Table

Syntax:

```markdown
{{</* table */>}}
| A | B |
|---|---|
| 1 | 2 |
{{</* /table */>}}
```

Example + Rendered:

{{< table >}}
| A | B |
|---|---|
| 1 | 2 |
{{< /table >}}

## Quote

Syntax:

```markdown
{{</* quote source="Source" date="2026-07-03" */>}}
Quoted text.
{{</* /quote */>}}
```

Example + Rendered:

{{< quote source="Source" date="2026-07-03" >}}
Quoted text.
{{< /quote >}}

## Details

Syntax:

```markdown
{{</* details title="More" open="false" */>}}
Hidden details body.
{{</* /details */>}}
```

Example + Rendered:

{{< details title="More" open="false" >}}
Hidden details body.
{{< /details >}}

## Definition

Syntax:

```markdown
{{</* definition term="Term" */>}}
Definition body.
{{</* /definition */>}}
```

Example + Rendered:

{{< definition term="Term" >}}
Definition body.
{{< /definition >}}

## Tabs

Syntax:

```markdown
{{</* tabs id="tabs-1" */>}}
Tab One
Body for tab one.
---
Tab Two
Body for tab two.
{{</* /tabs */>}}
```

Example + Rendered:

{{< tabs id="tabs-1" >}}
Tab One
Body for tab one.
---
Tab Two
Body for tab two.
{{< /tabs >}}

## Timeline

Syntax:

```markdown
{{</* timeline id="timeline-1" */>}}
2026-01-01 | Started
Initial note.
---
2026-02-01 | Updated
Second note.
{{</* /timeline */>}}
```

Example + Rendered:

{{< timeline id="timeline-1" >}}
2026-01-01 | Started
Initial note.
---
2026-02-01 | Updated
Second note.
{{< /timeline >}}

## Checklist

Syntax:

```markdown
{{</* checklist */>}}
- [x] Done
- [ ] Pending
{{</* /checklist */>}}
```

Example + Rendered:

{{< checklist >}}
- [x] Done
- [ ] Pending
{{< /checklist >}}

## Embed

Syntax:

```markdown
{{</* embed src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Video" ratio="16:9" */>}}
```

Example + Rendered:

{{< embed src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Video" ratio="16:9" >}}

## Reference Card

Syntax:

```markdown
{{</* referencecard ref="/articles/the-north-start-of-my-career" label="Read More" */>}}
```

Example + Rendered:

{{< referencecard ref="/articles/the-north-start-of-my-career" label="Read More" >}}

## Math

Syntax:

```markdown
{{</* math */>}}
\\int_0^1 x^2 dx
{{</* /math */>}}
```

Example + Rendered:

{{< math >}}
\int_0^1 x^2 dx
{{< /math >}}

## Content Link

Syntax:

```markdown
{{</* contentlink ref="/investigations/direction-of-my-career" label="Open Investigation" */>}}
```

Example + Rendered:

{{< contentlink ref="/investigations/direction-of-my-career" label="Open Investigation" >}}

## TOC Shortcode

Syntax:

```markdown
{{</* toc */>}}
```

Example + Rendered:

{{< toc >}}