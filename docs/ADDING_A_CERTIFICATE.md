# Adding a certificate

Each certificate is a self-contained content module registered in one array. No UI component should contain certificate-specific copy.

## 1. Create the content folder

Copy `content/certificates/_template/` to a lowercase, hyphenated slug such as:

```text
content/certificates/aws-solutions-architect-associate/
```

Create:

```text
index.ts
questions.json
flashcards.json
```

Use globally unique IDs inside the certificate (`d1-lesson-1`, `q001`, `f001`, and so on). Domain IDs are strings and are not limited to five domains.

## 2. Fill the certificate object

The object must satisfy the `Certificate` type in `lib/types.ts`:

- identity: slug, provider, title, level, summary, and update date
- exam facts: question count, duration, passing score, price, and validity
- domains: weights, descriptions, and lessons
- questions: one or multiple correct options plus an explanation
- flashcards: front, back, and domain label
- optional scenarios: architecture situations, constraints, scored decisions, feedback, and a reference blueprint
- plan: weeks with stable task IDs
- resources: official sources and optional local downloads

For changing exam facts, link to the provider's official page and record the verification date.

## 3. Register it

Import the new object in `content/registry.ts` and append it to `certificates`:

```ts
import { awsSolutionsArchitectAssociate } from './certificates/aws-solutions-architect-associate';

export const certificates = [
  claudeArchitectFoundations,
  awsSolutionsArchitectAssociate,
];
```

With two or more entries, CertPath shows a path selector automatically. Progress stays isolated because each certificate uses its own storage key.

## 4. Validate the content

Before publishing:

1. Confirm domain weights and question distribution against an official blueprint.
2. Ensure every question references a registered domain.
3. Check that every answer ID exists among the options.
4. Test both single-answer and multiple-answer questions.
5. Complete a full mock, reset progress, export it, and import it again.
6. Run `npm run lint`, `npm run build`, and `npm run build:pages`.

## 5. Add a parser only when useful

The first certificate is generated from Markdown and TSV by `scripts/generate-content.mjs`. A new certificate can use hand-authored JSON, a certificate-specific parser, or another data pipeline. Keep the generated JSON committed so deployments remain deterministic.
