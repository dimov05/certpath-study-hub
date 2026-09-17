# Architecture options

## Option 1 — Static and local-first (implemented)

**Stack:** this repository, GitHub Pages, GitHub Actions, and browser `localStorage`.

Best when the goal is a clean, free, public study resource with no account setup. It has no hosting bill at ordinary GitHub Pages usage, no backend to maintain, and no learner data leaves the browser. Progress can be reset, exported, and imported.

Trade-off: progress is tied to one browser unless the learner exports it. Private browsing and cleared site data will remove it.

## Option 2 — Static frontend plus optional account sync

Add a free-tier backend such as Supabase or Firebase. Keep certificate content static, but store progress behind learner accounts.

Best when cross-device sync, cohorts, leaderboards, or instructor analytics become important. This adds authentication, privacy responsibilities, schema migrations, abuse controls, and possible costs as usage grows.

A safe migration path is to keep the current `StudyProgress` shape, add a storage adapter interface, and offer cloud sync as opt-in. Local storage remains the offline cache.

## Option 3 — Content-first documentation platform

Move lessons into MDX under Astro or Docusaurus and keep quizzes as interactive client components.

Best when many non-developers will author long-form guides, versioned documentation, and translated content. It brings excellent content navigation but requires more work to retain the integrated dashboard, adaptive practice, timed exam, and progress model.

## Recommendation

Start with Option 1. Introduce Option 2 only after real learners ask for synchronization or instructor features. The current content registry and certificate-specific progress keys make that upgrade incremental rather than a rewrite.
