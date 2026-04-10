# Design System: TimeLog Family Web

## 1. Visual Theme & Atmosphere
The "TimeLog Family Web" interface is designed as a **Premium Listening Room**. It avoids the cluttered, utilitarian feel of a typical admin dashboard, favoring a **calm, immersive, and protected** atmosphere. The aesthetic is characterized by deep, layered dark tones, elegant serif typography, and subtle glassmorphism effects that suggest a high-quality, archival space for family memories.

## 2. Color Palette & Roles
*   **Deep Onyx Canvas (#11100d):** The primary background color, providing a stable and focused foundation.
*   **Elevated Obsidian (#1a1814):** Used for secondary backgrounds and nested containers to create depth.
*   **Antique Parchment Ink (#f4efe6):** The primary text color, offering high contrast without the harshness of pure white.
*   **Muted Driftwood (#a79d89):** Used for secondary text, metadata, and less prominent UI elements.
*   **Golden Sand Accent (#d4b67a):** The primary brand color, used for key actions, highlights, and indicating premium status.
*   **Soft Sage Success (#83c49a):** Used for positive status indicators and successful actions.
*   **Faded Coral Danger (#db8f7d):** Used for error states, destructive actions, and warnings.
*   **Translucent Amber Line (rgba(208, 184, 132, 0.18)):** Used for borders and separators to maintain a light, airy structure.

## 3. Typography Rules
*   **Display Serif (Cormorant Garamond):** Used for large headings and emotional statements. It conveys a sense of history, elegance, and storytelling.
*   **Functional Sans (Instrument Sans):** Used for body text, metadata, and interactive elements. It ensures readability and a modern, clean feel.
*   **Character:** Headers use tight line-height (`leading-[0.9]`) for a dramatic, editorial look, while body text uses generous spacing (`leading-7`) for comfortable reading.

## 4. Component Stylings
*   **Panels & Containers:** Feature **generous rounding** (`rounded-[2rem]`), subtle borders, and **glassmorphism** (`backdrop-filter: blur(22px)`). They often have a "glow" or "ambient ring" effect to separate them from the background.
*   **Interactive Cards:** Use a dark, semi-transparent background (`bg-black/10`) with a thin border. Hover states are subtle, increasing background opacity and border strength.
*   **Status Badges:** Standardized via the `Badge` component using `class-variance-authority`. Pill-shaped with a border and a light background tint. Variants include `default` (accent), `success` (green), and `destructive` (coral).
*   **Buttons:** Standardized via the `Button` component. Large, rounded (`rounded-2xl`), and high-contrast for primary actions. Includes variants for `outline`, `ghost`, and `destructive`.
*   **Feedback & Interactions:** Interactive elements should have clear focus states (`focus-visible:outline-accent`). Buttons and links use a `0.2s ease` transition for all state changes.

## 5. Layout Principles
*   **Whitespace Strategy:** Uses generous margins and padding to create a sense of breathability and focus.
*   **Grid Alignment:** Follows a flexible grid system, often using asymmetric layouts (e.g., `1.05fr_0.95fr`) to create visual interest while maintaining balance.
*   **Focus:** The UI is designed to draw the eye toward the content (the stories) while keeping operational controls (settings, devices) secondary.
*   **Performance-First UI:** Use skeletons (`animate-pulse`) for all async data loading to maintain layout stability and reduce perceived latency.
