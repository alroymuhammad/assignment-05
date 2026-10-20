# Maju-Telco Design System

## Visual Direction

Maju-Telco uses a network-wayfinding visual language: a deep navy navigation rail, cool daylight work surface, porcelain content surfaces, cobalt actions, and cyan signal details. The experience should feel authoritative, direct, and operational rather than decorative.

The chat composition intentionally remains familiar: persistent sidebar on desktop, drawer on mobile, centered empty state, readable conversation column, and anchored composer.

## Color

- **Navigation:** `#0b1739`; use white and cool blue-tinted text over it.
- **Canvas:** `#f5f7fb`; the main workspace is light to support daytime customer-service use.
- **Primary action:** Tailwind `blue-700`, strengthening to `blue-800` on hover.
- **Signal detail:** `cyan-300` through `cyan-500`, used for the brand mark, active navigation detail, and thinking state.
- **Content:** slate text and borders on white or cool-blue surfaces.
- **Semantic states:** emerald for success and red for errors. Semantic colors must not be reused decoratively.

Color performs a job. Cobalt identifies action and focus; cyan indicates signal or active identity; navy establishes navigation and authority.

## Typography

Use the native UI sans stack declared in `src/styles.css`. Hierarchy comes from size, weight, and spacing rather than a contrasting display family. Body copy should remain highly legible at 15–16px with generous response leading.

## Shape and Depth

- Standard controls use 8–10px radii.
- The composer and message bubble may use 16–18px radii.
- Pills are reserved for circular icon actions and compact status-like controls.
- Prefer a single inset border or a soft shadow treatment, not both as competing elevation systems.
- The composer carries the strongest depth because it is the primary action area.

## Brand Mark

Use `MajuTelcoMark` from `src/components/icons.tsx`. It combines an M-shaped route with a signal node. Do not use the Claude mark or approximate it. The mark should usually inherit cobalt on light surfaces and cyan on navy surfaces.

## Motion

Motion is restrained and functional:

- The empty state enters once with a short ease-out rise.
- The three-node thinking indicator pulses in sequence as the signature signal movement.
- The sidebar drawer uses a direct ease-out slide.
- Respect `prefers-reduced-motion`; animations and transitions become effectively immediate.

## Responsive Behavior

At widths above 900px, the sidebar occupies 280px and may collapse fully. At 900px and below, it becomes an off-canvas drawer with a scrim and mobile top bar. The message and composer measure stays capped at 48rem (`max-w-3xl`) while horizontal padding contracts on small screens.

## Implementation

Layout and component styling belong in Tailwind utility classes colocated with the React components. `src/styles.css` is limited to the Tailwind import, document-level browser defaults, shared keyframes, and reduced-motion behavior. Avoid rebuilding large component selector trees in global CSS.
