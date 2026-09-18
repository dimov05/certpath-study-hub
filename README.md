# CertPath

A free, local-first certification study website. The first complete learning path is **Claude Certified Architect – Foundations** and includes:

- 30 self-contained learning modules across all five exam domains, each with objectives, mental models, architecture flows, deep explanations, failure analysis, scenarios, checks, and exercises
- official links are optional verification and further reading; the required teaching material lives inside CertPath
- a 30-question diagnostic assessment with domain-level recommendations
- evidence-based mastery scores combining lessons, practice, retained cards, diagnostics, scenarios, teach-back, and mocks
- 150 flashcards—30 per exam domain—with browser-local spaced repetition and a daily due queue
- 60 scenario-based practice questions with explanations
- six interactive Architecture Scenario Labs with decision-by-decision feedback
- fresh 10-question practice sessions by domain
- randomized, blueprint-weighted mock modes with confidence calibration, focused retakes, attempt comparison, and readiness estimates
- an “Explain it yourself” active-recall exercise in every lesson
- a six-week learning plan
- downloadable guide, mock exam, flashcards, tracker, and error log
- reset, export, and import controls for learner progress

The app is designed for GitHub Pages: no database, account, subscription, cookies, or server is required.

## Recommended architecture

The default architecture is **static site + browser storage**:

1. Curriculum and questions are versioned in this repository.
2. Each learner's progress is stored in their own browser under a certificate-specific key.
3. **Reset to zero** clears only that learner's current certificate progress.
4. Export/import JSON makes progress portable without creating accounts.
5. GitHub Actions builds and deploys the site for free on GitHub Pages.

This is the simplest privacy-friendly option for a public study resource. Its intentional limitation is that progress does not automatically sync between browsers or devices.

## Run locally

Requirements: Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Useful commands:

```bash
npm run content:generate  # rebuild questions/flashcards from source files
npm run lint
npm run build             # production build for OpenAI Sites / Cloudflare runtime
npm run build:pages       # static export for GitHub Pages
```

## Deploy to GitHub Pages

1. Create an empty GitHub repository.
2. Push this project to its `main` branch.
3. In **Settings → Pages**, set **Source** to **GitHub Actions**.
4. The included workflow deploys on every push to `main`.

The workflow automatically handles both project URLs (`owner.github.io/repository`) and user/organization URLs (`owner.github.io`). The generated static site is written to `dist/client/`.

## How progress works

Progress is namespaced by certificate in `localStorage`:

```text
certpath:<certificate-slug>:progress:v1
```

Sharing or forking the repository never shares anyone's progress. A new learner starts at zero. Existing learners can choose **Progress → Reset to zero**, export a backup, or import a prior backup.

Clearing browser site data also resets local progress. For automatic cross-device sync, see [Architecture options](docs/ARCHITECTURE_OPTIONS.md).

## Add another certificate

The UI reads certificate content from `content/registry.ts`. A second registered certificate automatically activates the learning-path selector in the header.

See [Adding a certificate](docs/ADDING_A_CERTIFICATE.md) and the starter files in `content/certificates/_template/`.

## Content maintenance

- Keep official links in each certificate's `resources` list.
- Put source material used by generators in `content/source/`.
- Put learner downloads in `public/materials/`.
- Verify exam price, eligibility, blueprint, scoring, and policy claims before releases; those details can change.
- Keep questions original. Do not publish remembered or copied live-exam items.

## Disclaimer

CertPath is an independent study aid and is not affiliated with or endorsed by Anthropic. Product names and trademarks belong to their respective owners. Always verify current exam policies with the certification provider.

## License

MIT. See [LICENSE](LICENSE).
