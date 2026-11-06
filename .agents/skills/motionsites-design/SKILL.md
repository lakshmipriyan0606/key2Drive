---
name: motionsites-design
description: Design and implement high-polish website motion, award-winning micro-interactions, automotive luxury aesthetics, and fluid physics inspired by MotionSites.ai and modern creative engineering. Use when asked to upgrade UI animations, make a site feel like an award-winning motion website, or add tactile interactive polish.
---

# MotionSites.ai Design & Creative Motion Engineering

A creative engineering standard for building web interfaces inspired by award-winning motion websites ([motionsites.ai](https://motionsites.ai)), automotive ateliers, and Emil Kowalski motion design principles.

---

## 1. Core Visual Foundations

### A. Atmospheric Depth & Ambient Lighting
Award-winning motion websites create a sense of physical space and premium tactile quality through subtle, layered radial gradients rather than flat surfaces:
- **Hero Ambient Glow**: Use radial spotlights (`radial-gradient(ellipse at center, rgba(242,140,0,0.12), transparent 70%)`) anchored behind key focal points.
- **Surface Elevation**: High-contrast dark navies (`#11243D`, `#070D18`) paired with warm pearl accents (`#FAF9F6`, `#FFFFFF`) to make cards float naturally over depth.
- **Glassmorphism**: Subtle frosted glass (`backdrop-blur-md bg-white/10` or `bg-brand-navy/80`) with fine hairline borders (`border border-white/15`).

---

## 2. Micro-Interaction Design Patterns

### A. The Tactile Card Hover Lift
Interactive cards must feel like physical tiles floating on a magnetized surface:
```css
/* Card baseline styles */
.motion-card {
  transition: transform 320ms cubic-bezier(0.23, 1, 0.32, 1),
              box-shadow 320ms cubic-bezier(0.23, 1, 0.32, 1),
              border-color 240ms ease;
  will-change: transform;
}

.motion-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 30px -10px rgba(17, 36, 61, 0.12);
}
```

### B. Image Zoom with Spring Recovery
When hovering over visual cards (like automotive services or gallery previews):
- Use `overflow-hidden` on the image wrapper.
- Apply `scale-105` on hover with a deliberate easing (`duration-700 ease-out`).
- Never jerk or jump on unhover; ensure easing applies symmetrically.

### C. Magnetic Button Press & Feedback
- **Tap Depression**: Buttons depress to `scale(0.97)` on `:active` with `duration-140` for immediate tactile confirmation.
- **Glint / Shimmer**: Subtle light sweep or color accent shift on hover without aggressive distraction.

---

## 3. Motion Timing & Curves Reference

| Motion Type | Duration | Easing Curve | Purpose |
| :--- | :--- | :--- | :--- |
| **Micro Toggle / Pill** | `180ms` | `cubic-bezier(0.16, 1, 0.3, 1)` | Snappy feedback on status changes |
| **Card Lift / Hover** | `300ms` | `cubic-bezier(0.23, 1, 0.32, 1)` | Smooth physical elevation |
| **Modal / Dialog Entrance** | `320ms` | `cubic-bezier(0.16, 1, 0.3, 1)` | Crisp, confident arrival from `scale(0.96)` |
| **Accordion / Height Reveal** | `260ms` | `cubic-bezier(0.25, 1, 0.5, 1)` | Natural expansion without layout jitter |

---

## 4. Performance & Accessibility Guardrails

1. **Composite-Only Properties**: Animate only `transform` and `opacity`. Never animate `width`, `height`, `left`, `top`, or `margin` for decorative motion.
2. **GPU Layer Promotion**: Add `transform-gpu` or `will-change: transform` on hovering cards to prevent repaints and subpixel jitter.
3. **Respect Reduced Motion**: Always wrap motion in `@media (prefers-reduced-motion: reduce)` or Framer Motion's `useReducedMotion()`. If reduced motion is requested, collapse transitions to instant or simple opacity fades.

