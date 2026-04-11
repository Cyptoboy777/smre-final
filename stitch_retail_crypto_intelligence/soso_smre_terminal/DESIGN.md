# Design System Specification: Institutional Precision

## 1. Overview & Creative North Star
**Creative North Star: "The Kinetic Vault"**
This design system is engineered for the high-stakes world of institutional-grade crypto trading. It moves away from the "toy-like" interfaces of retail DeFi and embraces the sophisticated density of a modern Bloomberg Terminal. The goal is to convey absolute technical authority through **Organic Brutalism**—a style that favors high-density data, precise geometry, and intentional asymmetry.

We break the "template" look by treating the screen not as a flat grid, but as a deep, pressurized environment. Elements do not merely sit next to each other; they are layered, nested, and recessed, creating a visual rhythm that guides the eye through complex datasets without the need for traditional structural clutter.

---

## 2. Colors & Surface Logic
The palette is rooted in the "Dark Mode Pro" philosophy, utilizing a sophisticated range of near-blacks and charcoal grays to minimize eye strain during long-haul trading sessions.

### The "No-Line" Rule
Standard 1px solid borders are strictly prohibited for sectioning. Structural boundaries must be defined through **Background Color Shifts**. 
- To separate the sidebar from the main terminal, transition from `surface` (#0b0e11) to `surface-container-low` (#101417).
- To highlight a focused trading pair, use `surface-container-high` (#1c2024).

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of semi-translucent materials.
- **Base Layer:** `surface` (#0b0e11) for the main application background.
- **Secondary Modules:** `surface-container` (#161a1e) for data tables and charts.
- **Nested Elements:** `surface-container-highest` (#22262b) for active states or hovered items.

### The "Glass & Gradient" Rule
To elevate the experience, use **Glassmorphism** for modal overlays and floating tooltips. Utilize `surface-container` at 70% opacity with a `24px` backdrop-blur. 
- **Signature Textures:** Main Action Buttons (CTAs) should not be flat. Apply a subtle linear gradient from `primary` (#f3ffca) to `primary-container` (#cafd00) at a 135-degree angle to provide a "machined metal" sheen.

---

## 3. Typography: Data as Architecture
The typography system prioritizes rapid scanning and legibility.

- **Display & Headlines:** We use **Space Grotesk**. Its geometric construction feels high-tech and aggressive. Use `display-lg` for portfolio totals to create a focal point of power.
- **Body & Labels:** We use **Inter**. It is the workhorse for dense information. 
- **The Data Layer:** All price actions, hashes, and quantitative values must use a **Monospace font variant** (e.g., JetBrains Mono or Inter Mono). This ensures that numbers don't "jump" when prices update, maintaining institutional stability.

**Hierarchy Logic:**
- `title-lg` (Inter, 1.375rem) is reserved for module headers.
- `label-sm` (Inter, 0.6875rem) is used for metadata like "Gas Fees" or "24h Volume," set in `on-surface-variant` (#a9abaf) for lower visual noise.

---

## 4. Elevation & Depth
In this system, depth is a functional tool, not just an aesthetic choice.

- **The Layering Principle:** Achieve lift by stacking tiers. A `surface-container-lowest` card placed on a `surface-container-low` section creates a recessed "well" effect, perfect for input zones.
- **Ambient Shadows:** For floating elements (like the Whale Tracker notification), use extra-diffused shadows.
    - *Shadow:* `0px 24px 48px rgba(0, 0, 0, 0.5)`
    - *Tinting:* The shadow should be tinted with a hint of `on-surface` at 4% to simulate real-world ambient occlusion in a dark environment.
- **The "Ghost Border" Fallback:** Where containment is critical for accessibility, use the `outline-variant` (#45484c) at **15% opacity**. It should be felt, not seen.

---

## 5. Components

### Buttons
- **Primary (The Cyber Lime):** Background: `primary` (#f3ffca); Text: `on-primary` (#516700). Use `DEFAULT` (0.25rem) roundedness for a precision-tool feel.
- **Secondary (The Electric Purple):** Background: `secondary-container` (#7d01b1); Text: `on-secondary-container` (#f3cfff). Use for AI/Whale features.
- **Tertiary:** No background. `outline` text. Hover state shifts background to `surface-bright`.

### Inputs & Terminal Fields
- **Container:** `surface-container-lowest` (#000000).
- **Active State:** A 1px "Ghost Border" using `primary` at 40% opacity.
- **Typography:** `body-md` Monospace for numeric input.

### Chips (Market Indicators)
- **Trend Up:** `primary-dim` text on a 10% opacity `primary` background.
- **Trend Down:** `error` (#ff7351) text on a 10% opacity `error` background.
- **AI/Whale Alerts:** `secondary` (#d277ff) text with a subtle `secondary` outer glow (4px blur).

### Lists & Order Books
- **Rule:** Forbid divider lines. Use `0.125rem` of vertical whitespace (Spacing Scale `sm`) to separate rows.
- **Hover State:** Apply `surface-container-high` (#1c2024) to the entire row with a transition speed of `150ms`.

### The Whale-Tracker Feed (Bespoke Component)
- High-density feed using `surface-container` with a `secondary` (Electric Purple) left-accent stripe (2px wide). Typography should be `label-md` for high data density.

---

## 6. Do's and Don'ts

### Do:
- **Embrace Density:** Institutional users prefer seeing more data at once. Use `body-sm` and `label-sm` aggressively.
- **Use Intentional Asymmetry:** Align chart controls to the right and telemetry data to the left to create a "cockpit" feel.
- **Leverage Color for Meaning:** Only use `Cyber Lime` for "Positive/Buy" and `Electric Purple` for "Intelligence/AI." Never use them for decorative accents.

### Don't:
- **No Large Radius:** Avoid `xl` or `full` roundedness unless it's a circular status indicator. Large curves feel "consumer" and soft.
- **No Pure White:** Never use #FFFFFF. Use `on-surface` (#f8f9fe) to prevent "screen bleed" in dark environments.
- **No Standard Grids:** Avoid perfectly centered layouts. Data should feel like it is unfolding across the screen in functional clusters.