```markdown
# Design System Strategy: The Cinematic Observer

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Cinematic Observer."** 

We are moving away from the static, "templated" nature of traditional portfolios and moving toward an institutional-grade, high-end broadcast aesthetic. This system treats the screen not as a webpage, but as a viewfinder into a world of elite content. 

To break the "standard UI" feel, we employ **intentional asymmetry** and **tonal depth**. Elements should feel as though they are floating in a dark, infinite space, layered through light and blur rather than lines and boxes. We avoid the rigid 12-column grid in favor of dynamic, overlapping compositions where content "bleeds" off-edge, suggesting a larger, continuous world of motion.

---

## 2. Colors & Atmospheric Lighting
Our palette is rooted in the absence of light, using deep midnight blacks (`#0e0e0e`) and obsidian grays to create a premium "Pro" environment.

### The Signature Glow
The primary accent (`#CCFF00`) is not just a color; it is a **light source**. Use it sparingly for 'pulse' and 'glow' effects to draw the eye to critical CTAs or active states. 

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to define sections. Traditional borders create a "boxed-in" feel that destroys the cinematic illusion. 
- Boundaries must be defined solely through background color shifts.
- Example: Use a `surface-container-low` section sitting on a `surface` background to create a subtle horizon line.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of obsidian glass.
- **Layer 1 (The Void):** `surface` (`#0e0e0e`) – The foundation.
- **Layer 2 (The Stage):** `surface-container-low` – Used for large content areas.
- **Layer 3 (The Component):** `surface-container-high` – For cards or functional blocks.
- **Layer 4 (The Interaction):** `surface-bright` – For hovering or active elements.

### The "Glass & Gradient" Rule
Floating elements (modals, navigation bars) should utilize **Glassmorphism**. Combine `surface-container-highest` with a `20px` to `40px` backdrop-blur. To add "soul," use subtle linear gradients (e.g., `primary` to `primary-container`) on high-priority CTAs to mimic the way light hits a physical lens.

---

## 3. Typography: Technical Authority
We pair the technical, razor-sharp edges of **Space Grotesk** with the utilitarian elegance of **Manrope**.

- **Display & Headlines (Space Grotesk):** Use dramatic scale variations. A `display-lg` (3.5rem) should feel monumental, contrasting sharply with a `label-md` (0.75rem). This "High-Low" contrast creates an editorial, institutional feel.
- **Body & Titles (Manrope):** Manrope provides the readability required for "Pro" tools. Use `body-lg` (1rem) for descriptions, ensuring generous line-height to maintain a breathable, premium feel.
- **Hierarchy as Identity:** The typographic weight is your primary tool for hierarchy. Use `headline-lg` in Bold to command attention, then drop immediately to `body-md` in Regular for a sophisticated, "technical manual" aesthetic.

---

## 4. Elevation & Depth
In this system, depth is a product of **Tonal Layering**, not structural shadows.

- **The Layering Principle:** Stacking `surface-container` tiers creates a soft, natural lift. A `surface-container-lowest` card placed on a `surface-container-low` section provides enough contrast to be felt without being seen.
- **Ambient Shadows:** Shadows are rarely used. If a "floating" effect is required, shadows must be extra-diffused (60px-80px blur) and extremely low-opacity (4%-6%), using a tint of the `on-surface` color to mimic ambient light.
- **The "Ghost Border" Fallback:** If accessibility requires a container boundary, use a "Ghost Border." Apply the `outline-variant` token at **10% opacity**. Never use 100% opaque, high-contrast borders.

---

## 5. Components

### Buttons: The "Momentum" Variant
- **Primary:** Background `primary_container` (#cafd00), text `on_primary_container`. On hover, trigger a `primary` glow effect.
- **Secondary (Glass):** Semi-transparent `surface_variant` with a 10% `outline_variant` ghost border and backdrop-blur. 
- **Tertiary:** Text-only using `primary`, with a subtle `primary` underline that expands from the center on hover.

### Cards: The "Frame"
- **Style:** No borders. Background: `surface_container_low`. 
- **Interaction:** On hover, the background shifts to `surface_container_high` and the content subtly scales up (1.02x) to mimic a camera zoom.

### Input Fields: The "Terminal"
- **Style:** Bottom-border only (Ghost Border style). Text uses `spaceGrotesk`.
- **Focus State:** The bottom border pulses with `primary` (#CCFF00) glow.

### Video Tiles
- Use a `0.25rem` (DEFAULT) roundedness. 
- Overlays: Use a `surface_container_lowest` gradient at the bottom (0% to 60% opacity) to ensure `label-md` metadata remains legible.

---

## 6. Motion: Kinetic Energy
Motion is the heartbeat of this system. It should feel **fluid and momentum-based.**

- **The "Lens Blur" Transition:** When opening a modal or changing views, background elements don't just fade; they blur progressively from 0px to 20px while scaling down slightly.
- **Pulse States:** Active indicators (like a 'Live' badge or Recording light) should use a breathing animation on the `primary` token, oscillating between 40% and 100% opacity.
- **Momentum Scrolling:** Implement eased, inertial scrolling for galleries to give the impression of weight and high-quality "machined" hardware.

---

## 7. Do's and Don'ts

### Do:
- **Do** use heavy vertical whitespace. Generous tracking and leading signal "Elite" status.
- **Do** overlap elements. A headline partially covering a video frame creates depth.
- **Do** use `primary` (#CCFF00) as a light source, not a fill color for large areas.

### Don't:
- **Don't** use 1px solid white or gray borders. It breaks the cinematic immersion.
- **Don't** use standard easing (linear). All motion must have a "heavy" start and a "smooth" deceleration.
- **Don't** use pure white backgrounds for any reason. Even the brightest surfaces should feel like they exist within the "Midnight" spectrum.

---
**Director's Note:** This design system is about the tension between the dark, obsidian void and the high-energy neon light. Keep it sharp, keep it technical, and let the content—the video—be the star of the show.```