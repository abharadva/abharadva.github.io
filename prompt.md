### The Reusable Prompt

Act as an Expert Senior UI/UX Developer. Your task is to **[YOUR TASK HERE]** by applying the **"Digital Blueprint"** design system. This system is tailored for a male developer's portfolio and must be followed strictly to create a sophisticated, technically-focused, and premium user experience.

---

### **Design System: The Digital Blueprint**

**1. Core Philosophy:**
The design is inspired by technical schematics, futuristic heads-up displays (HUDs), and the precision of engineered systems. The aesthetic is structured, intelligent, and subtly interactive, reflecting a developer's mindset. Avoid playful or overly soft elements. The final output must feel premium, focused, and distinctly masculine.

**2. Color Palette:**
-   **Base/Background:** A deep, near-black navy/charcoal (`hsl(220, 20%, 5%)`).
-   **Surfaces/Cards:** A slightly lighter shade of the base for depth (`hsl(220, 20%, 8%)`).
-   **Foreground/Text:** A clean, legible off-white/light grey (`hsl(210, 20%, 90%)`).
-   **Muted Text:** A softer grey for secondary information (`hsl(220, 10%, 60%)`).
-   **Accent/Primary:** A single, vibrant **Electric Blue** (`hsl(200, 100%, 50%)`). This is the *only* strong color. Use it for primary calls-to-action, active states, focus rings, and subtle glows.
-   **Borders:** A subtle, darker grey to define edges (`hsl(220, 20%, 15%)`).

**3. Typography:**
-   **Headings (`h1`, `h2`, etc.):** Use a sharp, clean monospace font like **`IBM Plex Mono`**. They should be uppercase or title-case and have a commanding presence.
-   **Body/Paragraphs:** Use a highly readable sans-serif font like **`Inter`**.
-   **Metadata/Tags:** Use `IBM Plex Mono` in a smaller size to reinforce the technical theme.

**4. Layout & Spacing:**
-   **Background:** The entire page background must feature a subtle dot-grid pattern (`radial-gradient` in CSS) to evoke blueprint paper.
-   **Structure:** Employ asymmetrical layouts for key pages (like the homepage) to create visual interest. Internal pages should use clean, structured grids.
-   **Spacing:** Use a consistent spacing scale. Spacing should feel deliberate and precise, not overly airy.

**5. Borders, Surfaces & Depth:**
-   **Surfaces:** Component backgrounds (Cards, Headers) should be solid or very slightly translucent (`bg-card/90`) with a `backdrop-blur`. They are not full glassmorphism but feel like premium, solid panels floating over the blueprint grid.
-   **Borders:** Use sharp, 1px borders.
-   **Rounding:** Use a subtle corner radius (`rounded-md` or `0.375rem`). Avoid fully rounded (`rounded-full`) elements except for specific icons or indicators.

**6. Interactivity & Motion:**
-   **Signature Effect:** The background must feature a mouse-following "spotlight" effect—a soft, radial gradient of the Electric Blue accent color that illuminates the dot-grid as the user moves their cursor.
-   **Animations:** Motion should be precise and swift.
    -   Use `Framer Motion` for entrance animations (staggered fades, "slide-in-blur" effects).
    -   Implement kinetic typography for main headings, where letters animate in sequence.
-   **Hover States:**
    -   **Buttons (Primary):** Should have a subtle glow effect (`shadow-lg shadow-primary/20`).
    -   **Cards/Links:** Should have their border color change to the Electric Blue accent.

**7. Component-Specific Styling:**
-   **Buttons:** The primary button is solid Electric Blue. Secondary/Outline buttons should have a 1px border and glow with the accent color on hover.
-   **Cards:** Use the `bg-blueprint-bg` style (solid/semi-translucent dark panel with a 1px border). On hover, the border should illuminate with the accent color.
-   **Inputs:** Clean, rectangular fields with a subtle border that lights up with the accent color on focus.

Your final output must be a complete, production-ready code implementation. Verify that every element, from the layout to the smallest interactive detail, aligns perfectly with the "Digital Blueprint" system.