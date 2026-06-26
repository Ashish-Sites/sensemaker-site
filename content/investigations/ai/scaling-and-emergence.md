---
title: "Scaling and Emergence in Neural Networks"
created: 2026-03-10
status: "Model Emerging"
areas: ["AI"]
topics: ["Deep Learning", "Scaling Laws", "Emergence", "Language Models"]
questions:
  - "Why do larger models show qualitatively different behaviors?"
  - "Is scaling alone sufficient to reach AGI?"
  - "What are the limits of neural scaling?"
tags: ["scaling", "emergence", "neural-networks", "llms"]
related: ["emergence"]
draft: false
---

## 10-March-2026

There's something remarkable happening in AI right now: behaviors that didn't exist in smaller models suddenly appear in larger ones.

### Observed Phenomena

**In-context learning**: Small models can't learn from examples in the prompt. Larger models can.

**Reasoning**: Models under a certain scale seem to purely memorize patterns. Larger models exhibit something that looks like reasoning.

**Multi-step problem solving**: Emerges around the billions parameter scale.

**Apparent understanding**: At sufficient scale, models output text that sounds intelligent rather than simply patterned.

This is NOT because we added new training techniques. We just scaled.

### The Scaling Laws

Papers by OpenAI and others show that model performance follows power laws:

$$\text{Loss} \propto N^{-\alpha}$$

Where $N$ is the number of parameters and $\alpha \approx 0.07$.

This means:
- Every 10x increase in parameters gives ~20% improvement in loss
- The relationship is predictable
- There are no apparent cliffs (until there are)

### The Mystery

If the relationship is smooth, why do capabilities appear discrete?

**Hypothesis**: Capabilities emerge when the loss crosses certain thresholds where qualitatively new behaviors become possible.

Like a phase transition in physics.

---

## 22-August-2026

After reading more about scaling laws and watching the rapid evolution of language models, I think I've been framing this wrong.

The question isn't "why does emergence happen at scale?"

The question is: **What is a capability?**

If a model can output sensible code after 2B parameters but not at 1B, did the capability "emerge" or did we reach a resolution threshold where the underlying competence becomes visible?

### Reframing

Maybe there's no emergence at all. Maybe:
1. The model learns a distributed representation of how to reason
2. At smaller scales, noise dominates the signal
3. At larger scales, signal overwhelms noise
4. Capabilities appear, but they were always being learned

This is very different from emergence as I understand it in complex systems.

---

## 06-January-2027

I need to test whether these are really "emergent" capabilities or just noise thresholds.

One approach: take a task a small model can't do, and see if we can extract the hidden computation.

Another thought: what if both are true?
- The underlying competence is learned gradually
- But the observable behavior threshold (emergence)
- AND novel combinatorial capabilities genuinely emerge from having enough capacity

This might explain why:
- Scaling helps everything
- But also why some capabilities really do feel like sudden transitions

