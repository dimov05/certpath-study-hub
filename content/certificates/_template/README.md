# Certificate template

Copy this directory, replace the placeholders, rename `certificate.ts.example` to `index.ts`, rename the two example JSON files to `questions.json` and `flashcards.json`, and register the exported object in `content/registry.ts`.

- `questions.example.json` demonstrates single- and multiple-answer records.
- `flashcards.example.json` demonstrates flashcard records.
- Every question `domainId` must match a domain `id`.
- Keep IDs stable after release so learner progress remains valid.
