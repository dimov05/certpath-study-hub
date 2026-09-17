# Claude Certified Architect – Foundations

## Complete Study Guide and Learning Plan

**Prepared:** 17 September 2026  
**Exam:** Claude Certified Architect – Foundations  
**Audience:** solution architects and technical practitioners designing production systems with Claude  
**Use with:** the separate 60-question mock exam and flashcards included in this study pack

> This is an independent preparation guide, not an exam dump and not endorsed by Anthropic. Product behavior changes quickly. Treat the official certification page and current documentation as authoritative.

---

## 1. Start here: eligibility and exam facts

Before studying, confirm that you can register. As of 17 September 2026, Claude certification is available only to people at organizations in the Claude Partner Network. Registration requires a recognized partner-company email address, and candidates must be at least 18.

| Item | Current fact |
|---|---|
| Questions | 60 |
| Time | 120 minutes; allow about 135 minutes of seat time |
| Format | Multiple choice and scenario-based multiple response |
| Passing score | 720 on a 100–1,000 scaled score |
| Price | USD 125 before partner-tier discounts |
| Delivery | Pearson VUE test center or OnVUE online proctoring |
| Language | English |
| Validity | 12 months |
| Notes/resources | Closed book; no documentation, translation tool, or AI assistant |
| Retakes | Wait 14 days after the first failure, 30 after the second, and 90 after the third; maximum four attempts per rolling 12 months |

Anthropic does not publish a raw-percentage conversion for 720. Do not assume that 72% is a pass. For practice, use **80% overall with no domain below 70%** as your readiness target.

Official links:

- [Certification page and registration](https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification)
- [Certification FAQ and policies](https://anthropic-partners.skilljar.com/page/faq-certifications)
- [Anthropic Academy course catalog](https://anthropic.skilljar.com/)

### Your first decision

- **You work for a Partner Network organization:** sign in with your company email, download the latest exam guide, and compare its version/date with this pack.
- **Your employer is not a partner:** ask your employer whether it plans to join the free Partner Network. You can still study now, but you cannot currently register as an individual using a personal email.

---

## 2. Exam blueprint and study allocation

| Domain | Weight | Approx. questions out of 60 | Suggested study time |
|---|---:|---:|---:|
| 1. Agentic Architecture & Orchestration | 27% | 16 | 27% |
| 2. Tool Design & MCP Integration | 18% | 11 | 18% |
| 3. Claude Code Configuration & Workflows | 20% | 12 | 20% |
| 4. Prompt Engineering & Structured Output | 20% | 12 | 20% |
| 5. Context Management & Reliability | 15% | 9 | 15% |

The exam rewards the **best production decision**, not merely a plausible one. In most questions, several options could work. Prefer the answer that best satisfies the stated constraint while minimizing failure modes, excessive privilege, latency, cost, and operational complexity.

### The six decision lenses

Apply these to every scenario:

1. **Deterministic or probabilistic?** Put non-negotiable rules in code, permissions, schemas, or hooks—not only in a prompt.
2. **Static or adaptive?** Use a fixed workflow for predictable steps; use an agent when the path depends on intermediate evidence.
3. **Reversible or consequential?** Increase confirmation, validation, and human review as actions become harder to undo.
4. **Synchronous or latency-tolerant?** Use real-time calls for blocking user or CI work; use batch processing for asynchronous volume.
5. **Shared or personal configuration?** Put team behavior in version-controlled project scope and personal preferences in user/local scope.
6. **More context or better context?** Curate, structure, and preserve critical facts; do not blindly add tokens.

---

## 3. Baseline diagnostic

Before beginning, answer these without notes. Give yourself 1 point for each confident “yes.”

1. Can you diagram a tool-use loop and explain `tool_use`, `tool_result`, and `stop_reason`?
2. Can you explain when a deterministic workflow is preferable to an autonomous agent?
3. Can you design a coordinator/subagent system with explicit context passing?
4. Can you write a narrowly scoped tool schema and distinguish retryable from non-retryable errors?
5. Can you explain MCP tools, resources, prompts, clients, and servers?
6. Can you choose between project-, local-, and user-scoped Claude Code configuration?
7. Can you explain the roles of `CLAUDE.md`, rules, skills, subagents, hooks, and MCP?
8. Can you run Claude Code non-interactively and request machine-readable output?
9. Can you design an extraction schema that represents missing and ambiguous values honestly?
10. Can you distinguish schema validity from semantic correctness?
11. Can you design an evaluation set and a validation/retry loop?
12. Can you preserve provenance and critical facts through long or multi-agent workflows?

Interpretation:

- **10–12:** use the four-week plan; spend most time on scenario drills.
- **6–9:** use the six-week plan below.
- **0–5:** add a foundation week for Python/TypeScript, JSON Schema, HTTP, Git, and CLI basics.

---

## 4. Domain 1 — Agentic Architecture & Orchestration (27%)

### What you must know

#### The canonical client-tool loop

1. Send the conversation and available tools.
2. Inspect Claude’s response and `stop_reason`.
3. When it is `tool_use`, execute every requested client-side tool safely.
4. Append the assistant response plus matching `tool_result` blocks to the conversation.
5. Call the model again with the full required history.
6. Exit or handle exceptional stop reasons such as `end_turn`, `max_tokens`, or `refusal`.

Never infer loop completion by parsing phrases such as “I’m done.” The protocol signal is authoritative. Preserve each tool-use ID so results can be correlated correctly.

#### Workflow versus agent

| Use a workflow | Use an agent |
|---|---|
| Steps and order are known | The next step depends on findings |
| Compliance requires a fixed gate | The search space is open-ended |
| Predictable latency/cost is important | Adaptation is worth extra cost/variance |
| Each stage has a stable contract | Tool choice and decomposition need reasoning |

Common patterns:

- **Prompt chaining:** sequential, focused stages with explicit intermediate outputs.
- **Routing:** classify the request and choose one specialized path.
- **Parallelization:** independent subtasks execute together; aggregate after all required results arrive.
- **Coordinator/subagents:** a central agent decomposes, delegates, gathers, and reconciles.
- **Evaluator–optimizer:** one component produces, another independently checks against a rubric, then the producer revises.

#### Coordinator/subagent design

- The coordinator owns decomposition, routing, shared constraints, aggregation, and final accountability.
- A subagent gets an isolated context. Pass the goal, relevant facts, constraints, output contract, and provenance explicitly.
- Give each subagent only the tools needed for its role.
- Parallelize independent tasks in one wave; serialize tasks with data dependencies.
- Return concise structured results rather than raw reasoning transcripts.
- Preserve partial results and structured error context when a subagent fails.
- Use iterative re-delegation only when a defined coverage or quality check finds a gap.

#### Deterministic guardrails

Use programmatic gates or pre-action interception for identity verification, authorization, monetary thresholds, destructive operations, and regulated steps. Prompts and examples improve behavior but do not guarantee it.

Use post-action hooks or normalization layers to:

- convert heterogeneous date/status formats;
- redact or trim tool output;
- add audit records;
- transform tool results before the agent sees them.

#### State and recovery

- Persist compact structured state: completed steps, inputs, outputs, citations, errors, and pending work.
- Resume when prior context and tool results remain valid.
- Start fresh with a verified summary when earlier observations may be stale.
- Fork from a shared baseline when comparing genuinely divergent approaches.
- Bound autonomous work with outcome criteria, cost/time budgets, permission limits, checkpoints, and escalation—not with an arbitrary loop count alone.

### Exam traps

- “Improve the system prompt” when the requirement is a hard business rule.
- Always invoking every specialist instead of routing based on the request.
- Assuming subagents automatically inherit the parent conversation.
- Giving a synthesis agent search/write tools it does not need.
- Parallelizing steps that depend on each other.
- Aborting a whole job after one recoverable specialist failure.

### Hands-on lab 1: support resolution agent

Build a small agent with `get_customer`, `lookup_order`, `process_refund`, and `escalate_to_human`.

Acceptance criteria:

- `lookup_order` cannot run before verified identity.
- Refunds above a threshold are blocked and escalated in code.
- Tool errors include category, retryability, user-safe message, and attempted operation.
- A two-issue request is decomposed and both outcomes appear in one final response.
- The handoff contains the verified customer ID, issue summary, evidence, actions attempted, and recommendation.

### Mastery check

You are ready when you can explain why each control belongs in the prompt, schema, hook, application logic, or human-review layer.

Official reading:

- [How tool use works](https://platform.claude.com/docs/en/agents-and-tools/tool-use/how-tool-use-works)
- [Handle tool calls and errors](https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls)
- [Claude Agent SDK cookbook: chief-of-staff agent](https://platform.claude.com/cookbook/claude-agent-sdk-01-the-chief-of-staff-agent)

---

## 5. Domain 2 — Tool Design & MCP Integration (18%)

### Tool design principles

A strong tool contract answers:

- What exact task does this tool perform?
- When should and should not Claude use it?
- What are the required and optional inputs?
- What format, units, identifiers, and constraints apply?
- What comes back on success, empty success, validation failure, permission failure, business-rule failure, and transient failure?
- Is the action read-only, reversible, or consequential?

Prefer narrow, non-overlapping tools. `search_orders`, `get_order_details`, and `request_refund` are easier to select safely than several vague “manage” or “process” tools.

### Tool choice

- **Auto:** Claude may call a tool or answer directly.
- **Any:** Claude must call one of the supplied tools.
- **Forced named tool:** Claude must call the specified tool.
- **None:** Claude must not call a tool, where supported.

Use a forced first tool for a mandatory structured first stage. Use `any` when a structured action is required but Claude may choose among several schemas. Use auto when conversation without a tool can legitimately answer the request.

### Error contract

Return machine-actionable fields, for example:

```json
{
  "ok": false,
  "errorCategory": "transient",
  "isRetryable": true,
  "code": "UPSTREAM_TIMEOUT",
  "message": "Order service timed out after 10 seconds",
  "safeUserMessage": "The order system is temporarily unavailable.",
  "attempted": {"operation": "lookup_order", "orderId": "A-1042"}
}
```

Distinguish:

- **Transient:** timeout, unavailable dependency; retry with limits/backoff.
- **Validation:** malformed or missing input; repair the request.
- **Permission:** caller lacks access; do not blindly retry.
- **Business rule:** request is valid but disallowed; explain or escalate.
- **Empty success:** the call worked and found zero matches; do not mislabel it as failure.

### MCP mental model

| Primitive | Controlled by | Best for |
|---|---|---|
| Tool | Model | Actions, queries, calculations |
| Resource | Application | Read-only content/catalogs addressed by URI |
| Prompt | User | Reusable user-invoked workflow templates |

An MCP host contains a client that connects to one or more MCP servers. Servers expose capabilities; the host still decides permissions, context, and user experience.

Use resources to expose catalogs, schemas, or documentation indexes so the model can discover what exists without speculative action calls. Use tools for operations and fresh queries. Prefer an established MCP server for a standard integration when it meets security and functional requirements; build a custom server for organization-specific behavior or contracts.

### Scope and secrets

- Put team-shared MCP configuration in the project and commit safe configuration.
- Keep secrets in environment variables or an approved secret store, never in committed configuration.
- Keep personal experiments in user/local scope.
- Review each server’s trust, permissions, data access, and side effects.
- Expose least privilege at both the MCP server and the individual agent.

### Built-in Claude Code tools

- **Glob:** find paths by filename pattern.
- **Grep:** find content within files.
- **Read:** inspect file contents.
- **Edit:** make targeted changes when the anchor text is unique.
- **Write:** create or replace a full file when that is intentional.
- **Bash:** run commands; constrain it carefully because its capabilities are broad.

Start with targeted search, then read relevant files. Loading an entire repository wastes context and increases distraction.

### Exam traps

- A vague tool description with a perfect schema.
- Two tools whose names and descriptions overlap.
- Retrying permission or policy failures.
- Treating “no rows found” as an infrastructure error.
- Giving every subagent every tool.
- Putting an API key directly in `.mcp.json`.

### Hands-on lab 2: MCP document service

Create an MCP server with:

- a resource listing available documents;
- `read_document` for a validated document identifier;
- `search_documents` for a query and optional filters;
- `update_document` as an explicitly consequential action;
- structured errors and a permission check.

Test it with the MCP Inspector and with ambiguous prompts. Record every misrouted call and improve names/descriptions before adding prompt instructions.

Official reading:

- [Introduction to MCP course](https://anthropic.skilljar.com/introduction-to-model-context-protocol)
- [MCP specification](https://modelcontextprotocol.io/specification/latest)
- [Tool-use documentation](https://platform.claude.com/docs/claude/docs/tool-use)

---

## 6. Domain 3 — Claude Code Configuration & Workflows (20%)

### Choose the correct extension point

| Need | Use |
|---|---|
| Always-on project facts and conventions | `CLAUDE.md` |
| Conditional rules for matching paths | `.claude/rules/` |
| Reusable, on-demand knowledge/workflow | Skill in `.claude/skills/` |
| Isolated specialist with its own context/tools | Subagent in `.claude/agents/` |
| Deterministic lifecycle action or guardrail | Hook in settings |
| External data/service connection | MCP server |
| Permissions and environment settings | `.claude/settings*.json` |

### Scope

- **Project scope:** version-controlled behavior shared with the team.
- **Local scope:** project-specific preferences/secrets for one developer, normally ignored by Git.
- **User scope:** defaults for one person across projects.
- **Managed scope:** organization policy that users cannot override.

Keep `CLAUDE.md` concise and operational: build/test commands, architecture boundaries, conventions, and non-obvious constraints. Avoid an encyclopedia. Put conditional material in rules and large reference/playbook content in skills.

### Plan mode versus direct execution

Use plan mode when:

- scope or dependencies are unknown;
- multiple approaches have material tradeoffs;
- the task changes architecture or many files;
- exploration is needed before edits;
- a human should approve the design.

Use direct execution for a small, clear, reversible change with known acceptance tests. A productive pattern is **plan → approve → execute → verify**.

### Skills, subagents, and context

- A skill teaches reusable knowledge or a workflow and loads on demand.
- A subagent performs a delegated task in isolated context and returns a summary.
- Use a forked skill/subagent for verbose exploration that should not consume the main context.
- Restrict tools in frontmatter or agent configuration.
- Prefer skills over legacy custom commands for new reusable multi-step workflows, while knowing existing commands may still be tested by the current exam guide.

### Hooks and permissions

- `PreToolUse`: validate or block before execution.
- `PostToolUse`: lint, normalize, log, or return feedback after success.
- Permission settings define what tools/actions are allowed, denied, or require confirmation.
- A hook is deterministic in *when it fires*; an LLM-based hook may still be probabilistic in its decision.
- Use code-based hooks for hard guarantees.

### CI/CD

For non-interactive use, run Claude Code with `-p`/`--print`. Prefer structured output flags or schema-constrained output when another system will parse the result. Supply stable project context from committed files; use an independent review session instead of asking the generation session to review its own work.

CI review prompts should specify:

- the diff and relevant surrounding code;
- categories that matter and categories to omit;
- severity definitions;
- evidence required for each finding;
- a structured output contract;
- prior findings when deduplication is required.

### Exam traps

- Putting shared standards in a user-only file.
- Making `CLAUDE.md` huge instead of using rules/skills.
- Using a prompt instruction where a permission or hook is required.
- Using direct execution for an architectural migration.
- Running interactive `claude` in CI.
- Using the same context for generation and independent review.

### Hands-on lab 3: team configuration

In a sample repository:

1. Add a lean project `CLAUDE.md` with build/test commands and architecture boundaries.
2. Add path-scoped rules for API code and test files.
3. Add a code-review skill with a clear description and tool restrictions.
4. Add a read-only exploration subagent.
5. Add a pre-tool hook that blocks edits to a protected path.
6. Add an MCP server using environment-based credentials.
7. Run one simple task directly and one migration through plan mode.
8. Run a non-interactive review in CI style and parse its output.

Official reading:

- [How Claude Code works](https://code.claude.com/docs/en/how-claude-code-works)
- [Claude Code best practices](https://code.claude.com/docs/en/best-practices)
- [Hooks guide](https://code.claude.com/docs/en/hooks-guide)
- [Permissions](https://code.claude.com/docs/en/permissions)
- [CLI reference](https://docs.anthropic.com/en/docs/claude-code/cli-usage)
- [Claude Code in Action course](https://anthropic.skilljar.com/claude-code-in-action)

---

## 7. Domain 4 — Prompt Engineering & Structured Output (20%)

### Begin with an evaluation target

Before changing a prompt, define:

- representative inputs, including hard and ambiguous cases;
- the desired output or scoring rubric;
- precision/recall or business-error tradeoffs;
- unacceptable failures;
- latency and cost limits.

Without evals, prompt iteration is anecdotal.

### Prompt structure

A production prompt should make the following explicit:

- role and goal;
- trusted instructions versus untrusted source data;
- definitions and decision criteria;
- relevant context;
- examples for ambiguous boundaries;
- output contract;
- what to do when evidence is missing or contradictory.

Use XML-style delimiters or similarly clear boundaries when they reduce ambiguity. Tell the model what to do, not merely what to avoid.

### Few-shot examples

Use a small set of targeted examples when prose rules still produce inconsistent judgment. Include both positive and negative boundary cases. Examples should teach the decision boundary and output format, not cover every possible input.

### Structured output

Current Claude APIs support:

- JSON outputs through `output_config.format` for schema-constrained response JSON;
- strict tool use with `strict: true` for schema-valid tool names and inputs;
- ordinary tool schemas with tool choice controls.

Schema conformance does **not** guarantee semantic correctness. A valid invoice object may still have line items that do not sum to the stated total. Add domain validation after parsing.

Schema design rules:

- Model missing information as nullable/optional instead of forcing invention.
- Use enums for closed categories, with `other` plus a detail field when extension is legitimate.
- Include evidence/provenance fields for extracted claims.
- Separate value, confidence, and source evidence where human review depends on them.
- Avoid embedding sensitive data in schema property names or enum values.

### Validation and retry

1. Parse/schema-validate.
2. Apply semantic rules such as totals, date ordering, cross-field consistency, and allowed transitions.
3. If correctable, retry with the original source, previous output, and specific validation errors.
4. If the source lacks the data, return missing/unknown or route to review—retries cannot create evidence.
5. Cap retries and measure their yield.

### Batch processing

Use the Message Batches API when immediate output is unnecessary and volume/cost matters. It offers a 50% cost discount; requests are asynchronous and can take up to 24 hours. Correlate each result using `custom_id`, and resubmit only failed items. Do not use batch processing for a blocking pre-merge gate or live customer response.

### Independent and multi-pass review

- Separate generation and review contexts when independence matters.
- For a large change, inspect files locally and then run a cross-file integration pass.
- Require evidence, location, severity, and remediation for each finding.
- Remove or rework categories with persistently high false positives; vague “be conservative” wording is not enough.

### Exam traps

- Asking for JSON in prose and assuming syntax is guaranteed.
- Treating strict schema compliance as proof that facts are correct.
- Making every field required when source documents may omit it.
- Retrying missing evidence.
- Using batch processing for a blocking workflow.
- Adding more instructions when a few boundary examples would clarify better.

### Hands-on lab 4: structured invoice extraction

Create a schema for supplier, invoice ID, currency, dates, line items, subtotal, tax, total, and evidence references. Include nullable fields and an ambiguity status. Test at least 20 documents with:

- missing values;
- inconsistent totals;
- multiple currencies;
- handwritten or informal quantities;
- duplicate invoice IDs;
- conflicting dates.

Measure field-level accuracy, invalid outputs, semantic failures, retry success, and human-review rate.

Official reading:

- [Structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)
- [Prompt engineering overview](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview)
- [Prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)
- [Batch processing](https://platform.claude.com/docs/en/build-with-claude/batch-processing)

---

## 8. Domain 5 — Context Management & Reliability (15%)

### Context is a curated working set

Everything in a request consumes context: system instructions, messages, tool definitions, tool results, documents, images, and output. More context can reduce quality through distraction and context rot.

Use these layers:

1. **Stable instructions:** short system/project rules.
2. **Structured durable state:** critical IDs, values, decisions, constraints, and provenance.
3. **Task-relevant evidence:** selected excerpts or normalized tool results.
4. **Recent interaction:** only the turns needed for coherence.
5. **External storage:** scratchpads, manifests, or memory for recovery across long runs.

Trim verbose tool output at the boundary. Preserve exact numbers, dates, identifiers, customer commitments, and source mappings outside lossy narrative summaries.

### Long context

- Put a concise key-findings block early and detailed evidence in clearly labeled sections.
- Preserve important information at stable, easy-to-find positions.
- Use subagents to isolate verbose exploration.
- Use compaction deliberately and record what must survive it.
- Prompt caching reduces repeated-input cost; it does not remove those tokens from the context window.

### Escalation

Escalate when:

- the user explicitly requests a human;
- policy is missing, ambiguous, or requires an exception;
- the system cannot make meaningful progress after appropriate recovery;
- an action exceeds authority/risk thresholds;
- evidence is contradictory or confidence is below a calibrated threshold for the consequence.

Do not use sentiment alone as a proxy for complexity. When multiple records match, ask for a discriminating identifier rather than guessing.

### Human review and confidence

- Calibrate confidence against labeled data; do not trust self-reported confidence at face value.
- Measure accuracy by document type, field, language, source quality, and other meaningful strata.
- Randomly sample some high-confidence outputs to detect silent failure modes.
- Route low-confidence, contradictory, policy-sensitive, or high-impact cases to human review.
- Aggregate accuracy can hide a disastrous minority segment.

### Provenance and conflicting evidence

Every extracted claim should retain:

- source/document identifier and URL if applicable;
- relevant excerpt or location;
- publication or collection date;
- method/context needed to interpret it;
- uncertainty or conflict annotations.

When credible sources disagree, preserve both claims and explain the difference. Do not silently pick one. Dates often explain apparent contradictions.

### Error propagation

Subagents should recover locally from transient failures when safe, then return partial results plus structured details of unrecovered errors. The coordinator should decide whether to retry, use an alternative, continue with a documented coverage gap, or escalate.

### Exam traps

- Summarizing away exact monetary values, dates, or commitments.
- Passing raw 40-field tool responses when five fields matter.
- Treating prompt caching as context-window reduction.
- Escalating based only on angry sentiment or a raw confidence number.
- Reporting 97% aggregate accuracy without segment analysis.
- Dropping source attribution during synthesis.

### Hands-on lab 5: multi-source research report

Create search, document-analysis, and synthesis roles. Require every finding to include a claim, evidence, source, and date. Inject one unavailable source and two conflicting statistics. The final report must:

- preserve both conflicting values;
- distinguish established, contested, and missing findings;
- show the failed source and what was attempted;
- avoid inventing coverage;
- fit a strict context budget by passing structured results, not raw documents.

Official reading:

- [Context windows](https://platform.claude.com/docs/en/build-with-claude/context-windows)
- [Manage tool context](https://platform.claude.com/docs/en/agents-and-tools/tool-use/manage-tool-context)
- [How Claude Code handles context](https://code.claude.com/docs/en/how-claude-code-works)

---

## 9. The six-week plan (recommended, 7–9 hours/week)

### Daily study loop

Use five sessions per week, 75–100 minutes each:

1. **Recall (10 min):** review due flashcards without notes.
2. **Learn (25 min):** read/watch one narrow objective.
3. **Build (30–45 min):** implement or diagram it.
4. **Questions (15 min):** answer 5–10 scenario questions.
5. **Error log (5 min):** record the decision rule behind every miss.

Do not merely reread. The exam tests application, so at least half of your time should be active: building, diagramming, explaining aloud, or solving scenarios.

### Week 0 — setup and diagnostic (2–3 hours)

- Confirm partner eligibility and download the newest official exam guide.
- Create an Anthropic Academy account and enroll in the recommended courses.
- Install Claude Code and prepare an API development environment if available.
- Take the baseline diagnostic and 20 mixed questions from the mock.
- Start an error log with columns: question, chosen answer, correct principle, why fooled, review date.

Exit criterion: you know your two weakest domains and have a working study environment.

### Week 1 — agentic architecture

- Learn the tool loop and stop reasons.
- Compare chains, routers, parallel workflows, agents, and evaluator–optimizer designs.
- Design a coordinator with two isolated specialists.
- Implement deterministic prerequisites and structured handoff.
- Complete Lab 1.

Exit criterion: draw the loop and select an orchestration pattern for five new cases with clear justification.

### Week 2 — tools and MCP

- Write and critique tool names, descriptions, schemas, and errors.
- Practice `auto`, `any`, and forced tool selection.
- Study MCP clients, servers, tools, resources, and prompts.
- Configure project/user scope and secret injection.
- Complete Lab 2.

Exit criterion: achieve at least 80% on 20 Domain 2 questions and explain every error category.

### Week 3 — Claude Code

- Build a lean `CLAUDE.md`, path rules, a skill, and a subagent.
- Add permissions and deterministic hooks.
- Practice plan versus direct execution.
- Run a headless structured CI review.
- Complete Lab 3.

Exit criterion: given any requirement, choose the correct Claude Code extension point in under 20 seconds.

### Week 4 — prompts and structured output

- Define eval criteria before changing prompts.
- Add targeted few-shot boundary examples.
- Implement schema-constrained output and semantic validators.
- Add a validation-feedback retry and human-review path.
- Compare synchronous versus batch processing.
- Complete Lab 4.

Exit criterion: at least 90% schema-valid output and a documented semantic error rate on your test set.

### Week 5 — context and reliability

- Practice context budgeting, trimming, and structured durable state.
- Build error propagation and escalation logic.
- Calibrate review thresholds with a labeled sample.
- Preserve claim-source mappings and contradictory evidence.
- Complete Lab 5.

Exit criterion: explain how the system recovers from stale state, partial failure, context pressure, and ambiguous identity.

### Week 6 — exam simulation and repair

- Day 1: take the full 60-question mock in 120 minutes, closed book.
- Day 2: review every answer, including correct guesses; update the error log.
- Days 3–4: rebuild or explain the weakest two objectives.
- Day 5: retake only missed/flagged items shuffled, then do 20 fresh scenarios you write yourself.
- Final 48 hours: light recall, exam logistics, sleep; no new broad topic.

Booking threshold:

- at least 80% on two separate timed mocks;
- no domain below 70%;
- at least 75% on multi-response items;
- can complete 60 items in 105 minutes, leaving 15 minutes for review;
- can state the principle behind each corrected miss.

---

## 10. Two-week accelerated plan (25–35 hours)

Use only if your diagnostic is at least 9/12 and you have hands-on Claude experience.

| Day | Focus |
|---:|---|
| 1 | Blueprint, diagnostic, tool loop |
| 2 | Agent patterns and decomposition |
| 3 | Guardrails, hooks, state, recovery |
| 4 | Tool schemas, tool choice, structured errors |
| 5 | MCP primitives, scope, security |
| 6 | Claude Code configuration and skills |
| 7 | Plan mode, hooks, permissions, CI |
| 8 | Prompt criteria, examples, evals |
| 9 | Structured output, validation, retries |
| 10 | Batch, independent review, multi-pass design |
| 11 | Context, escalation, provenance |
| 12 | Timed mock and detailed review |
| 13 | Weak-domain repair plus 30 targeted questions |
| 14 | Light recall and exam logistics |

Do not compress hands-on work out of the plan; compress passive reading first.

---

## 11. Official material sequence

Complete these in this order. All are free, although Partner Academy access may require partner validation.

1. [Official certification page and latest exam guide](https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification)
2. [Claude 101](https://anthropic-partners.skilljar.com/claude-101)
3. [Building with the Claude API](https://anthropic.skilljar.com/claude-with-the-anthropic-api)
4. [Introduction to Model Context Protocol](https://anthropic.skilljar.com/introduction-to-model-context-protocol)
5. [Claude Code in Action](https://anthropic.skilljar.com/claude-code-in-action)
6. [Current Claude Platform documentation](https://platform.claude.com/docs/en/home)
7. [Current Claude Code documentation](https://code.claude.com/docs/en/overview)
8. [Current MCP specification](https://modelcontextprotocol.io/specification/latest)

The certification page also lists optional cloud-platform versions of the API course. Take the AWS or Google Cloud course only if that matches your environment; specific cloud-provider configuration is not the best use of time unless the latest exam guide explicitly adds it.

### Version-drift rule

The exam guide is the authority for **what is tested**; current product docs are the authority for **how the product works today**. If they differ:

1. Note the discrepancy.
2. Learn the exam guide’s named objective.
3. Learn the current behavior separately.
4. Re-check the certification page for a newer guide before the exam.

For example, current APIs expose dedicated structured-output features in addition to tool-use schemas, and Claude Code increasingly favors skills over legacy custom commands. Expect product terminology to evolve.

---

## 12. Exam technique

### Timing

- First pass: 90 minutes, about 90 seconds per question.
- Flag uncertain questions and move on.
- Second pass: 20 minutes for flagged items.
- Final 10 minutes: verify every question is answered and every multi-response item has the requested number of selections.

### Scenario method

For each question, identify:

1. **Primary constraint:** safety, correctness, latency, cost, context, team sharing, or autonomy.
2. **Failure mode:** what is actually going wrong?
3. **Control layer:** prompt, schema, tool, hook, application logic, configuration, or human review.
4. **Best-fit pattern:** deterministic workflow, routing, parallelism, coordinator/subagent, retry, batch, or escalation.
5. **Why the distractors fail:** solve a different problem, rely on probability for a guarantee, over-provision access/context, or violate latency/scope.

### Tie-breakers

When two choices look correct, prefer the one that:

- directly fixes the stated root cause;
- provides a deterministic guarantee for a hard requirement;
- uses least privilege and the narrowest contract;
- preserves provenance and partial results;
- validates empirically instead of assuming;
- meets the stated latency and operational constraint;
- avoids inventing missing information.

---

## 13. Final rapid-review sheet

- Drive client-tool loops by protocol stop reasons, not natural-language completion signals.
- Append assistant tool calls and matching tool results before the next model turn.
- Fixed, high-stakes order → programmatic workflow/gate.
- Open-ended path → agent; bounded by budget, permissions, and outcome criteria.
- Subagents have isolated context; pass facts, constraints, output contract, and sources explicitly.
- Parallelize independent work; serialize dependencies.
- Least privilege applies to tools, agents, MCP servers, and permissions.
- Tool descriptions determine selection; schemas determine input shape.
- Empty success is not failure; permission/business errors are not transient retries.
- MCP tool = model-controlled action; resource = app-controlled context; prompt = user-controlled template.
- Project scope is shared; user/local scope is personal; secrets stay out of Git.
- `CLAUDE.md` = always-on; rules = path-conditional; skill = on-demand; subagent = isolated worker; hook = lifecycle enforcement.
- Plan mode for architectural uncertainty; direct execution for small, clear changes.
- CI uses non-interactive mode and machine-readable output.
- Independent review beats same-context self-review when objectivity matters.
- Define success criteria and evals before prompt optimization.
- Few-shot examples teach ambiguous boundaries.
- Structured output guarantees shape, not truth.
- Nullable/optional fields prevent fabrication when source data is absent.
- Semantic validation catches cross-field errors; retry with specific feedback only when correction is possible.
- Batch is asynchronous, latency-tolerant, and cheaper; not for blocking paths.
- More context is not automatically better; trim and structure it.
- Prompt caching reduces cost, not context-window occupancy.
- Preserve exact facts and source mappings outside lossy summaries.
- Calibrate confidence with labeled data and sample high-confidence outputs.
- Explicit human request, policy gap, inability to progress, or high-risk ambiguity → escalate.
- Conflicting credible sources → preserve and annotate both, including dates.

---

## 14. Your study artifacts

Maintain these throughout preparation:

- **Architecture notebook:** one-page diagrams for the five labs.
- **Decision-rule sheet:** one sentence per recurring principle.
- **Error log:** every missed or guessed question and the misconception behind it.
- **Flashcard deck:** use the TSV supplied with this pack; suspend cards you know consistently.
- **Evidence portfolio:** runnable lab code, screenshots/logs, schemas, and evaluation results.

Passing the exam is the near-term goal. Being able to defend these architecture decisions in a production design review is the better standard.

