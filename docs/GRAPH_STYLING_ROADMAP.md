# Graph Styling Roadmap

**Status**: Planned  
**Priority**: Enhancement  
**Created**: 2026-07-02

## Overview

Apply GitHub-style visual aesthetics to the knowledge graph visualization on investigation pages. This includes refined colors, box styles, link styles, and interactive effects for a cohesive, professional appearance.

## Current Implementation

### Colors
- Investigation nodes: `#4a90e2` (muted blue)
- Article nodes: `#50c878` (green)
- Attached links: `#ff6b6b` (red)
- Related links: `#8b949e` (gray)

### Styling
- Basic circular nodes
- Outer ring for central/current node
- Particle effects on attached links
- Varied link widths (attached: 2.5px, related: 1.5px)

### Files Involved
- **Graph rendering**: `themes/sensemaker/layouts/investigations/single.html` (lines 255-345)
- **CSS legend**: `themes/sensemaker/static/css/style.css` (lines 680-725)
- **Graph data structure**: Generated from frontmatter (articles, related investigations)

---

## Proposed Enhancements

### 1. Node Visual Styling

#### Investigation Nodes
- **Primary color**: `#58a6ff` (GitHub blue) - matches informational/exploratory intent
- **Style**:
  - Circular with soft drop shadow (`0 0 8px rgba(88, 166, 255, 0.4)`)
  - Glow ring on hover/interaction
  - Slightly larger base size (8-10px radius)
  - Central node: Enhanced glow ring (`#58a6ff` with 4px width)

#### Article Nodes
- **Primary color**: `#3fb950` (GitHub green) - matches supporting/success content
- **Style**:
  - Circular with subtle shadow
  - Smaller size (6-7px radius) to indicate support role
  - Softer glow on interaction

#### Related Investigation Nodes
- **Primary color**: `#a371f7` (GitHub purple) - visual distinction for alternatives
- **Style**:
  - Same size as investigation nodes
  - Purple glow for discovery pattern

### 2. Link Visual Styling

#### Attached Links (Direct relationships)
- **Color**: `#58a6ff` (blue gradient)
- **Thickness**: 2.5px (thicker than related)
- **Style**:
  - Smooth gradient from source to target
  - Directional arrowhead/tapered end (0.5px taper)
  - Animated particles (2 particles, speed 0.005)
  - Soft glow: `0 0 4px rgba(88, 166, 255, 0.3)`

#### Related Links (Discovery/context)
- **Color**: `#a371f7` (purple gradient)
- **Thickness**: 1.5px (thinner for visual hierarchy)
- **Style**:
  - Softer appearance
  - Subtle gradient
  - Optional directional particles (1 particle, slower)
  - Minimal glow: `0 0 2px rgba(163, 113, 247, 0.2)`

### 3. Interactive Effects

#### Hover State
- **Nodes**: 
  - Glow intensity increases (2x shadow blur)
  - Label text brightens to `#58a6ff` or relevant color
  - Node slightly enlarges (5-10% scale)
  
- **Links**:
  - Glow intensifies
  - Particle speed increases
  - Color saturation increases

#### Label Enhancement
- Font: Maintain `9px Arial` but improve anti-aliasing
- Color mapping:
  - Investigation labels: `#58a6ff`
  - Article labels: `#3fb950`
  - Related investigation labels: `#a371f7`
- Background: Optional semi-transparent dark bg for readability

#### Discovery Highlighting
- When hovering a node, related nodes in chain show subtle highlight
- Transitive link highlighting: Show connection path

### 4. Overall Polish

#### Shadows and Depth
- Drop shadows on all nodes: `0 0 6px rgba(0, 0, 0, 0.5)`
- Link glows: Colored shadows following link type
- Central node: Double-ring effect for prominence

#### Rendering Quality
- Canvas anti-aliasing optimization
- Smooth curve rendering for links
- Texture/pattern consideration for node differentiation (optional)

#### Consistency with Brand
- Palette matches existing CSS variables (GitHub dark mode theme)
- Spacing and sizing align with investigation page layout
- Smooth transitions on state changes (200ms)

---

## Color Reference (GitHub Palette)

```
Primary:      #58a6ff (Informational Blue)
Success:      #3fb950 (Success Green)
Alternative:  #a371f7 (Alternative Purple)
Accent:       #f0883e (Attention Orange)
Critical:     #d1240f (Critical Red)
Neutral:      #8b949e (Neutral Gray)

Dark Backgrounds:
  Primary:    #0d1117
  Secondary:  #161b22
  Border:     #30363d

Text:
  Primary:    #c9d1d9
  Secondary:  #8b949e
  Light:      #6e7681
```

---

## Implementation Approach

### Phase 1: Canvas Rendering Enhancement
1. Update `nodeCanvasObject()` callback in `single.html`
   - Implement drop shadows
   - Add glow effects
   - Improve label rendering

2. Add `linkCanvasObject()` callback for link styling
   - Draw gradient coloring
   - Add arrowheads/tapers
   - Implement link-specific glows

### Phase 2: Interactive Effects
1. Implement hover detection and state management
2. Add smooth glow/scale transitions
3. Update particle effects

### Phase 3: CSS Legend Updates
1. Update `.legend-node-investigation` background and shadow
2. Update `.legend-node-article` background
3. Add `.legend-node-related` for related investigations
4. Update `.legend-link-attached` and `.legend-link-related` colors and shadows

### Phase 4: Testing & Refinement
1. Test on various graph sizes (small, medium, large)
2. Performance monitoring (FPS, memory)
3. Cross-browser testing
4. Dark/light mode validation

---

## Technical Notes

### Force-Graph API
- **nodeCanvasObject()**: Custom canvas rendering per node
- **linkCanvasObject()**: Custom canvas rendering per link
- **onNodeClick()**: Already wired for navigation
- **onNodeHover()**: Available for hover effects
- **d3Force()**: Physics simulation (currently charge disabled)

### Graph Data Structure
```javascript
{
  current: "current-node-id",
  title: "Investigation Title",
  nodes: [
    { id, label, type: "investigation|article", group }
  ],
  links: [
    { source, target, type: "attached-article|related-investigation" }
  ]
}
```

### Performance Considerations
- Canvas rendering is efficient but avoid excessive particles
- Keep shadow blur moderate (6-8px) for performance
- Throttle hover effects on large graphs (50+ nodes)
- Consider using requestAnimationFrame for smooth transitions

---

## Acceptance Criteria

- [ ] All node types display with appropriate GitHub colors
- [ ] Node styling includes soft shadows and glows
- [ ] Links display with gradient colors and directional indicators
- [ ] Hover effects work smoothly without performance degradation
- [ ] Legend visually matches graph styling
- [ ] Interactive particles animate smoothly
- [ ] Text labels readable and properly colored
- [ ] Central node clearly distinguished with enhanced ring
- [ ] No console errors or warnings
- [ ] Works on graphs with 5-50+ nodes

---

## Future Enhancements

1. **3D Mode**: Optional force-graph-3d for spatial visualization
2. **Search Highlighting**: Highlight matched nodes in graph
3. **Filtering**: Hide/show nodes by type
4. **Timeline View**: Animate graph based on creation date
5. **Export**: Download graph as SVG/PNG
6. **Animation Presets**: Intro animations, transition effects
7. **Accessibility**: Keyboard navigation, screen reader support

---

## References

- **Force-Graph Docs**: https://github.com/vasturiano/force-graph
- **GitHub Design Palette**: GitHub's dark mode color scheme
- **Canvas API**: MDN Canvas documentation for rendering techniques
