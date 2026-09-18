import type { ArchitectureScenario } from '@/lib/types';

export const architectureScenarios: ArchitectureScenario[] = [
  {
    id: 'd1-support-refund',
    domainId: 'd1',
    title: 'Support agent with refund authority',
    difficulty: 'Exam-level',
    situation: 'A customer asks an agent to locate an order, explain a delay, and refund it if it has not shipped. Refunds below €100 may be automated after identity verification; larger refunds require a person.',
    goal: 'Design the smallest safe orchestration that can resolve routine requests without weakening financial controls.',
    constraints: ['Order state can change during the conversation.', 'Refunds are irreversible once submitted.', 'The same request may be retried after a network timeout.'],
    decisions: [
      { prompt: 'How should order lookup and refund execution be scheduled?', options: [
        { label: 'Run both in parallel to minimize latency', feedback: 'The refund depends on current order state and verified identity, so parallel execution removes required prerequisites.' },
        { label: 'Look up and verify first, then conditionally request the refund', feedback: 'Correct. Retrieval supplies the state and authorization evidence needed before the consequential action.' },
        { label: 'Let the model decide whether the dependency matters', feedback: 'Dependency and authorization enforcement belong to application code, not model discretion.' },
      ], answer: 1, principle: 'Serialize an action behind every data and authorization prerequisite.' },
      { prompt: 'Where should the €100 threshold be enforced?', options: [
        { label: 'Only in the system prompt', feedback: 'Prompt guidance is useful but cannot guarantee a financial control.' },
        { label: 'In deterministic application code immediately before execution', feedback: 'Correct. Re-check the current amount and authority at the action boundary.' },
        { label: 'In the final natural-language response', feedback: 'That is too late; the action may already have occurred.' },
      ], answer: 1, principle: 'Hard business rules belong in deterministic pre-action controls.' },
      { prompt: 'What protects against a duplicated refund after a timeout?', options: [
        { label: 'A lower model temperature', feedback: 'Temperature does not reconcile external side effects.' },
        { label: 'An idempotency key and a durable operation lookup', feedback: 'Correct. The retry can discover and return the first operation instead of executing it again.' },
        { label: 'Repeating the user request verbatim', feedback: 'Repeated wording does not make an operation idempotent.' },
      ], answer: 1, principle: 'Consequential tools need business-level idempotency and state reconciliation.' },
    ],
    blueprint: ['Deterministic intake and identity gate', 'Read-only order lookup', 'Policy and threshold check in code', 'Human checkpoint above authority', 'Idempotent refund operation', 'Structured result and audit record'],
  },
  {
    id: 'd1-vendor-review',
    domainId: 'd1',
    title: 'Parallel vendor security review',
    difficulty: 'Intermediate',
    situation: 'A coordinator must review a vendor’s contract, security controls, and data architecture before procurement. Each area has different evidence and expertise.',
    goal: 'Use specialists without losing coverage, provenance, or final accountability.',
    constraints: ['The three evidence sets are initially independent.', 'Some findings may conflict.', 'One evidence source may be unavailable.'],
    decisions: [
      { prompt: 'How should the initial review be decomposed?', options: [
        { label: 'One long prompt containing every document', feedback: 'This increases context competition and makes coverage harder to audit.' },
        { label: 'Three bounded specialists with a shared rubric and distinct evidence', feedback: 'Correct. Independent responsibilities can run concurrently with explicit contracts.' },
        { label: 'Three specialists that all review everything', feedback: 'Overlapping responsibilities waste work and produce conflicts without clear ownership.' },
      ], answer: 1, principle: 'Delegate by distinct responsibility and evidence boundary.' },
      { prompt: 'What should every specialist return?', options: [
        { label: 'A conclusion only', feedback: 'The coordinator cannot audit or reconcile an unsupported conclusion.' },
        { label: 'Findings, source locations, coverage, uncertainty, and errors', feedback: 'Correct. This is enough to aggregate and preserve partial failure.' },
        { label: 'Its complete hidden reasoning transcript', feedback: 'A compact evidence-backed result is more useful than an uncontrolled trace.' },
      ], answer: 1, principle: 'Agent boundaries need explicit, auditable output contracts.' },
      { prompt: 'One specialist cannot access a required source. What should synthesis do?', options: [
        { label: 'Treat the missing source as no issues found', feedback: 'That converts missing evidence into false negative evidence.' },
        { label: 'Keep successful findings and report the coverage gap', feedback: 'Correct. The coordinator can seek an alternative or condition the conclusion.' },
        { label: 'Discard every specialist result', feedback: 'Independent successes remain useful when their coverage is stated.' },
      ], answer: 1, principle: 'Preserve partial success and propagate missing coverage explicitly.' },
    ],
    blueprint: ['Coordinator owns rubric and synthesis', 'Parallel scoped specialists', 'Evidence-backed structured findings', 'Conflict resolution by source quality', 'Visible coverage gaps and recovery'],
  },
  {
    id: 'd2-mcp-documents',
    domainId: 'd2',
    title: 'MCP document service',
    difficulty: 'Foundation',
    situation: 'A team wants Claude to browse policy documents, retrieve a selected document, and submit a change request through an MCP server.',
    goal: 'Choose the correct MCP primitive and permission boundary for every capability.',
    constraints: ['Browsing is read-only.', 'Change requests have side effects.', 'The host controls user consent.'],
    decisions: [
      { prompt: 'How should the document catalog be exposed?', options: [
        { label: 'A resource catalog', feedback: 'Correct. Discoverable read-only content naturally fits resources.' },
        { label: 'A destructive tool', feedback: 'A catalog does not require an action capability.' },
        { label: 'A hidden server prompt only', feedback: 'Prompts are reusable templates, not the content catalog itself.' },
      ], answer: 0, principle: 'Use resources for app-controlled, discoverable read-only content.' },
      { prompt: 'How should submit_change_request be represented?', options: [
        { label: 'A resource URI', feedback: 'A resource should not hide a side effect.' },
        { label: 'A narrow tool with explicit inputs and side effects', feedback: 'Correct. The operation needs a model-visible contract and host-mediated approval.' },
        { label: 'An enum in the catalog', feedback: 'A category does not execute or govern the operation.' },
      ], answer: 1, principle: 'Use tools for operations and make consequences explicit.' },
      { prompt: 'Who ultimately decides whether the action tool is available?', options: [
        { label: 'The MCP server annotation', feedback: 'Annotations communicate intent but do not enforce host policy.' },
        { label: 'The host application and its permission policy', feedback: 'Correct. The host mediates exposure, consent, and execution.' },
        { label: 'The resource catalog', feedback: 'Resources do not grant operation authority.' },
      ], answer: 1, principle: 'The host remains the capability and consent boundary.' },
    ],
    blueprint: ['Catalog and documents as resources', 'Change submission as a narrow tool', 'Host-side permission and approval', 'Validated inputs and structured results', 'No credentials in shared configuration'],
  },
  {
    id: 'd3-repository-controls',
    domainId: 'd3',
    title: 'Claude Code repository controls',
    difficulty: 'Intermediate',
    situation: 'A repository has shared build commands, API-specific conventions, a protected migrations directory, and a detailed release procedure used monthly.',
    goal: 'Place each requirement in the correct Claude Code extension point.',
    constraints: ['Team behavior must travel with Git.', 'The protected directory must not be edited automatically.', 'Release instructions should not consume context during normal coding.'],
    decisions: [
      { prompt: 'Where should shared build commands and architecture boundaries live?', options: [
        { label: 'Project CLAUDE.md', feedback: 'Correct. These are concise, stable, repository-wide facts.' },
        { label: 'One developer’s user settings', feedback: 'Team-owned guidance should not depend on each contributor configuring it.' },
        { label: 'A monthly release skill', feedback: 'Always-relevant repository facts belong in always-on project guidance.' },
      ], answer: 0, principle: 'Place shared stable repository instructions in project scope.' },
      { prompt: 'How should API-only conventions load?', options: [
        { label: 'Repeat them in every prompt', feedback: 'This is inconsistent and wastes effort.' },
        { label: 'Use a path-specific rule for API files', feedback: 'Correct. Conditional guidance loads only when the matching files matter.' },
        { label: 'Put them in managed organization policy', feedback: 'Repository-path conventions are not necessarily universal organization controls.' },
      ], answer: 1, principle: 'Use scoped rules to reduce irrelevant context.' },
      { prompt: 'What should prevent automatic edits to migrations?', options: [
        { label: 'A polite instruction only', feedback: 'Instructions influence behavior but do not guarantee an absolute restriction.' },
        { label: 'A deterministic permission or pre-tool hook', feedback: 'Correct. Prevention must occur before the edit executes.' },
        { label: 'A post-tool formatting hook', feedback: 'Post-action checks are too late to prevent the write.' },
      ], answer: 1, principle: 'Enforce non-negotiable restrictions at the capability or pre-action boundary.' },
    ],
    blueprint: ['Concise project CLAUDE.md', 'Path rule for API conventions', 'On-demand release skill', 'Pre-action protection for migrations', 'Local scope only for machine-specific overrides'],
  },
  {
    id: 'd4-invoice-pipeline',
    domainId: 'd4',
    title: 'Reliable invoice extraction',
    difficulty: 'Exam-level',
    situation: 'An extraction service must produce supplier, dates, totals, line items, and evidence from inconsistent invoices. Some documents omit tax or contain contradictory dates.',
    goal: 'Design an output contract and repair loop that never converts uncertainty into fabricated certainty.',
    constraints: ['Downstream code requires valid JSON.', 'A valid shape does not prove arithmetic correctness.', 'Missing source values cannot be recovered by retrying.'],
    decisions: [
      { prompt: 'How should legitimate missing tax be represented?', options: [
        { label: 'Require a numeric value', feedback: 'A required number pressures the model to invent a value.' },
        { label: 'Use a nullable value plus an explicit source-status field', feedback: 'Correct. Shape remains stable while absence is represented honestly.' },
        { label: 'Use zero for every missing value', feedback: 'Zero is a factual claim and may differ from unknown or not applicable.' },
      ], answer: 1, principle: 'Schemas must represent uncertainty states directly.' },
      { prompt: 'Where should line-item arithmetic be checked?', options: [
        { label: 'Only by the structured-output schema', feedback: 'Schema conformance cannot reliably express or prove cross-field arithmetic.' },
        { label: 'In a deterministic semantic validator after parsing', feedback: 'Correct. Code can test the exact invariant and return a precise violation.' },
        { label: 'By asking for confident JSON', feedback: 'Confidence wording does not create a mathematical guarantee.' },
      ], answer: 1, principle: 'Separate syntactic structure from semantic invariants.' },
      { prompt: 'The source contains no purchase-order number. What should a retry do?', options: [
        { label: 'Retry until a value appears', feedback: 'This encourages fabrication because no new evidence is available.' },
        { label: 'Return the supported missing state or route to retrieval/review', feedback: 'Correct. Choose a resolver that can actually add information.' },
        { label: 'Copy the invoice number into the field', feedback: 'Substituting a different identifier corrupts the record.' },
      ], answer: 1, principle: 'Retry only when new guidance or evidence can correct the failure.' },
    ],
    blueprint: ['Schema-constrained JSON', 'Explicit missing and conflict states', 'Evidence references per consequential field', 'Deterministic semantic validation', 'Bounded targeted repair', 'Review for unresolved contradiction'],
  },
  {
    id: 'd5-long-investigation',
    domainId: 'd5',
    title: 'Long-running investigation',
    difficulty: 'Exam-level',
    situation: 'An investigation spans many tool calls and two sessions. It includes exact account IDs, conflicting evidence, completed read operations, and one uncertain write outcome.',
    goal: 'Preserve the facts required to resume safely without carrying an unlimited transcript.',
    constraints: ['Tool results are verbose.', 'Some observations become stale.', 'Repeating the write may duplicate an external action.'],
    decisions: [
      { prompt: 'What should the durable checkpoint contain?', options: [
        { label: 'A short narrative summary only', feedback: 'Narrative compression may distort identifiers, commitments, and action state.' },
        { label: 'Exact critical facts, provenance, completed effects, errors, and pending work', feedback: 'Correct. This structured state supports safe recovery and audit.' },
        { label: 'Every raw tool result forever', feedback: 'Unlimited context creates noise and eventually exceeds the working window.' },
      ], answer: 1, principle: 'Preserve exact consequential state separately from compressible narrative.' },
      { prompt: 'How should the uncertain write be handled after resumption?', options: [
        { label: 'Repeat it immediately', feedback: 'The first operation may have completed despite the missing response.' },
        { label: 'Query by idempotency key and reconcile external state first', feedback: 'Correct. Discover the real effect before any repeat attempt.' },
        { label: 'Assume it failed because there is no result', feedback: 'Missing confirmation is not proof that the side effect did not happen.' },
      ], answer: 1, principle: 'Reconcile external state before retrying consequential actions.' },
      { prompt: 'Two credible sources still disagree after dates and definitions are checked. What should synthesis do?', options: [
        { label: 'Average their values', feedback: 'Averaging hides disagreement and may create a value no source supports.' },
        { label: 'Preserve both claims, provenance, and decision impact', feedback: 'Correct. Unresolved conflict is part of the evidence state.' },
        { label: 'Choose the newest publication automatically', feedback: 'Recency alone is not a sufficient rule when scope or method differs.' },
      ], answer: 1, principle: 'Keep unresolved conflict visible when no defensible tie-breaker exists.' },
    ],
    blueprint: ['Layered working context', 'Structured durable checkpoint', 'Retrievable raw artifacts', 'Freshness metadata', 'Idempotency reconciliation', 'Claim-level provenance and conflict state'],
  },
];
