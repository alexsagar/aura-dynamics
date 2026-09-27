# Claude Code

This project uses the Payload CMS skill at `.claude/skills/payload/`.
Start with `.claude/skills/payload/SKILL.md` for a quick reference, then see `.claude/skills/payload/reference/` for detailed docs.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes â€” APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` â€” verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:aura-project-instructions -->

# Aura project instructions

**Stack:** Next.js Â· TypeScript/TSX Â· Tailwind CSS v4 Â· Payload CMS + Payload Ecommerce Â· Cloudflare Workers Â· D1 Â· R2.

## Design principles
- Modern editorial ecommerce: light, minimal, product-focused.
- Use official Aura branding and the existing design tokens in `src/app/(frontend)/styles.css`. Tailwind is the primary styling system â€” no large new stylesheets.
- No generic AI-looking UI; no unnecessary glow or decorative effects.
- Responsive and accessible by default. Preserve the existing approved visual design when wiring CMS data â€” do not redesign during data integration.

## Engineering principles
- Inspect before modifying; reuse existing components and helpers instead of duplicating ecommerce logic.
- Preserve the Payload schema unless explicitly authorized. Do not create migrations or run CMS seeds without being asked.
- Never invent product data. Prices are NPR-only; protect inventory and customer data.
- Prefer simple, maintainable implementations; verify behavior with real browser tests (Playwright / claude-in-chrome) before claiming done.

## Which skill for which task
- **impeccable** â€” UI critique, polish, design consistency Â· **design-taste-frontend** â€” creative visual exploration/redesign Â· **ui-ux-pro-max** â€” design references / design-system decisions Â· **baseline-ui** â€” UI quality checks.
- **fixing-accessibility** â€” a11y review Â· **fixing-motion-performance** â€” animation performance Â· **gsap-\*** â€” GSAP work.
- **ponytail** â€” simplification / anti-overengineering Â· **feature-dev** â€” complex features Â· **code-review** â€” review Â· **security-guidance** â€” security-sensitive work.
- **context7** â€” up-to-date framework docs (Next/Payload/Tailwind/Cloudflare) Â· **playwright** / **claude-in-chrome** â€” browser & interaction testing (`http://localhost:3000`).
- Invoke skills by task; do not run every design skill at once, and never let a skill override Aura's approved design system without instruction.

<!-- END:aura-project-instructions -->
