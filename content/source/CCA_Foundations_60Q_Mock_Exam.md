# Claude Certified Architect – Foundations

## Original 60-Question Mock Exam

**Time limit:** 120 minutes  
**Target:** 80% overall, with no domain below 70%  
**Rules:** closed book; answer every item; multiple-response questions state exactly how many answers to select

These are original study questions, not recalled or copied exam items. The distribution mirrors the published domain weights: 16/11/12/12/9.

---

## Questions

### Domain 1 — Agentic Architecture & Orchestration (1–16)

**1.** A support agent sometimes calls `issue_refund` before verifying the customer. Refunds are irreversible once submitted. Which change most directly fixes the risk?

A. Add three examples showing verification first  
B. Raise the model’s reasoning effort  
C. Block `issue_refund` programmatically unless verified state exists  
D. Ask the agent to report confidence before refunding

**2.** A client-tool response has `stop_reason: "tool_use"` and two tool calls. What should the application do next?

A. Treat the assistant’s accompanying text as the final response  
B. Execute the calls, append correlated `tool_result` blocks, and continue the loop  
C. Send only the tool outputs in a new conversation  
D. Retry the identical model request without modifying history

**3. Select TWO.** A coordinator sends independent research tasks to four specialists. Which two practices best support reliable synthesis?

A. Give each specialist the entire coordinator history automatically  
B. Assign distinct scopes and a common structured output contract  
C. Require claim-to-source mappings in every result  
D. Allow specialists to message one another directly without coordinator visibility  
E. Give every specialist all available tools

**4.** A compliance review always requires document classification, PII detection, and policy comparison in that order. The steps and contracts are stable. Which architecture is best?

A. An unconstrained autonomous agent  
B. A fixed prompt chain with validated stage outputs  
C. Four parallel agents with shared memory  
D. A single long prompt with no intermediate validation

**5.** A research agent must decide which sources to inspect based on evidence discovered during the run. Which design best fits?

A. A rigid sequence listing every possible query  
B. An adaptive agent with scoped tools, budget, and completion criteria  
C. A batch job with one static prompt per source  
D. A forced tool call that always invokes the same search

**6.** A synthesis subagent is missing important facts found earlier by a search subagent. What is the most likely architectural cause?

A. The synthesis model needs a higher temperature  
B. Subagents do not automatically inherit one another’s context  
C. Search tools cannot return text  
D. The coordinator should remove metadata to save tokens

**7. Select TWO.** Which tasks are safe and beneficial to parallelize?

A. Calculate a refund, then submit that exact refund  
B. Search four independent source collections  
C. Analyze independent files before a later integration pass  
D. Verify identity, then access the verified account  
E. Generate a schema, then validate against that schema

**8.** A subagent’s source API times out twice but it has useful partial results. What should it return to the coordinator?

A. An empty success result  
B. A generic “search unavailable” string  
C. Structured failure details, attempts, partial results, and possible alternatives  
D. Nothing; the coordinator should infer failure from silence

**9.** A developer adds a hard maximum of five agent iterations as the only completion rule. What is the main problem?

A. Iteration limits are never allowed  
B. The agent may stop before the outcome is met or loop wastefully until the cap  
C. Tool results cannot be used after five turns  
D. The model will ignore the limit

**10.** A coordinator always invokes search, document analysis, legal review, translation, and synthesis even for a simple summarization request. What is the best improvement?

A. Increase the number of specialists  
B. Let the coordinator route dynamically based on requirements  
C. Merge all tools into the coordinator  
D. Run the same full pipeline in parallel

**11.** An agent receives dates as Unix timestamps from one tool and ISO strings from another. Downstream reasoning frequently compares them incorrectly. Where is the best fix?

A. A post-tool normalization layer that produces one canonical format  
B. More examples in the final report prompt  
C. A larger context window  
D. A third agent that guesses the intended date

**12.** Two proposed refactoring strategies should be explored independently from the same codebase analysis. Which state pattern is best?

A. Continue both strategies in one shared conversation  
B. Fork independent sessions from the common verified baseline  
C. Start both from no context  
D. Put both strategies into one tool description

**13. Select TWO.** Which controls appropriately bound a long autonomous coding task?

A. Clear outcome and acceptance criteria  
B. Unrestricted Bash and network access  
C. Cost/time budgets and checkpoints  
D. Natural-language promise to avoid risky actions  
E. Suppression of all progress signals

**14.** A coordinator gives the synthesizer a narrow instruction: “Write only about market size.” The user asked for a broad market assessment. The final report omits regulation and competitors. What is the best root-cause fix?

A. Increase output tokens  
B. Decompose against the full user goal and explicit coverage criteria  
C. Add another market-size agent  
D. Hide the original request from the coordinator

**15.** A human escalation occurs midway through a billing investigation. The human does not have the chat transcript. What should the handoff contain?

A. Only the last customer message  
B. The full raw token transcript only  
C. Verified identity, issue, evidence, actions attempted, current state, and recommendation  
D. The agent’s private reasoning

**16.** An agent resumed a week-old session after several relevant files changed. What is the most reliable approach?

A. Trust all previous tool results  
B. Tell the agent exactly what changed and revalidate affected findings, or start fresh from a verified summary  
C. Remove the changed files from context  
D. Increase the session’s temperature

### Domain 2 — Tool Design & MCP Integration (17–27)

**17.** Two tools named `analyze_content` and `analyze_document` have nearly identical descriptions. Claude selects them inconsistently. What should you change first?

A. Add more tools  
B. Rename and redescribe them with distinct purposes, boundaries, inputs, and outputs  
C. Force both tools on every turn  
D. Put the names in uppercase

**18.** A lookup executes successfully and finds no matching records. How should the tool represent this?

A. A transient error  
B. A permission error  
C. A successful empty result  
D. A retryable business error

**19. Select THREE.** Which fields make an MCP error useful for agent recovery?

A. Error category  
B. Retryability  
C. Human-readable/safe explanation  
D. Hidden stack memory address  
E. A generic “failed” message only

**20.** You need Claude to produce one of three structured extraction calls, but conversational text is not acceptable. Which tool-choice setting best fits?

A. Auto  
B. Any  
C. None  
D. Force all three tools

**21.** Metadata extraction must always happen before any enrichment tool. What is the strongest first-turn control?

A. Ask politely in the user message  
B. Force the named metadata tool, then allow later choices on subsequent turns  
C. Give enrichment tools longer descriptions  
D. Run every tool concurrently

**22.** A project’s shared MCP configuration needs a GitHub token. What is the best design?

A. Commit the token in `.mcp.json`  
B. Put the shared server configuration in project scope and reference an environment-provided secret  
C. Ask the model to remember the token  
D. Store it in a project `CLAUDE.md`

**23.** A team needs a read-only catalog of internal documentation pages so Claude can see what exists before requesting content. Which MCP primitive is the best fit?

A. Resource  
B. Prompt  
C. Destructive tool  
D. Hook

**24.** Which statement correctly distinguishes MCP prompts from tools?

A. Prompts are model-controlled actions; tools are user-selected templates  
B. Prompts are user-controlled reusable templates; tools are model-controlled operations  
C. They are equivalent and differ only by name  
D. Prompts can hold secrets; tools cannot

**25. Select TWO.** A document-analysis subagent only needs to read approved documents. Which controls best follow least privilege?

A. Give it unrestricted URL fetching  
B. Give it a `load_approved_document` tool that validates identifiers  
C. Omit write and shell tools  
D. Give it every tool in case requirements change  
E. Allow it to alter MCP configuration

**26.** Claude must find every caller of `processPayment` in a repository. Which built-in tool is the best first choice?

A. Glob  
B. Grep  
C. Write  
D. Edit

**27.** Claude must find all files matching `**/*.integration.test.ts`. Which built-in tool is the best first choice?

A. Glob  
B. Grep  
C. Bash with unrestricted shell  
D. Write

### Domain 3 — Claude Code Configuration & Workflows (28–39)

**28.** A coding standard must apply to every team member and be version-controlled. Where should it live?

A. User-level configuration only  
B. Project-scoped configuration  
C. A developer’s shell history  
D. An untracked local note

**29.** Test conventions apply to files named `*.test.ts` across many directories. What is the most maintainable mechanism?

A. Repeat the text in every subdirectory  
B. A path-scoped rule using a glob for test files  
C. A user-only `CLAUDE.md`  
D. A one-time chat message

**30.** A long security-review playbook should load only when relevant. Which feature best fits?

A. Put the entire playbook in always-loaded `CLAUDE.md`  
B. Package it as a skill with a precise description  
C. Put it in an API key variable  
D. Add it to every user prompt

**31.** A repository exploration will produce large amounts of intermediate output that the main coding conversation does not need. What should you use?

A. An isolated exploration subagent  
B. A longer root `CLAUDE.md`  
C. More verbose main-session tool output  
D. A forced write tool

**32.** A policy must block edits to production secrets every time. Where should the guarantee live?

A. A sentence in `CLAUDE.md` only  
B. A deterministic permission rule or pre-tool hook  
C. A few-shot example  
D. A post-hoc code review only

**33.** A task restructures a monolith into services across dozens of files and has several valid boundary choices. What is the best starting mode?

A. Direct execution  
B. Plan mode with codebase exploration and design review  
C. Non-interactive batch output without inspection  
D. A one-line edit

**34.** A clear stack trace points to one missing null check in a single function. What is the best approach?

A. Direct execution followed by the relevant test  
B. A multi-day architecture plan  
C. Four parallel research agents  
D. Rebuild the application

**35. Select TWO.** Which are appropriate contents for a lean project `CLAUDE.md`?

A. Stable build and test commands  
B. Non-obvious architecture boundaries  
C. Every framework manual copied in full  
D. Personal preferences unrelated to the team  
E. API secrets

**36.** A CI job runs `claude "review this diff"` and waits for interaction. Which change is necessary?

A. Use `claude -p "review this diff"`  
B. Add an undocumented `--batch` flag  
C. Increase terminal timeout indefinitely  
D. Redirect the output back to input

**37.** An automated system must parse Claude Code review findings. What should the pipeline request?

A. Decorative prose only  
B. Machine-readable structured output constrained by a schema  
C. A screenshot  
D. An interactive permission dialogue

**38.** The same session generated a change and then approved its own code review. Important problems were missed. What is the best improvement?

A. Ask the same session to “look harder”  
B. Use an independent review session with the diff, criteria, and relevant context  
C. Hide the diff  
D. Remove tests from context

**39. Select TWO.** When is a skill preferable to `CLAUDE.md`?

A. The material is a task-specific workflow invoked on demand  
B. The content is large reference material needed only for one class of tasks  
C. The rule must apply to every action in every session  
D. The requirement is to block a dangerous tool call deterministically  
E. The item is a secret token

### Domain 4 — Prompt Engineering & Structured Output (40–51)

**40.** A team keeps revising a review prompt based on anecdotes. Results vary and no one can tell whether a revision helped. What should happen first?

A. Add more adjectives to the prompt  
B. Define success criteria and a representative evaluation set  
C. Switch randomly between models  
D. Increase output length

**41.** A code reviewer flags harmless style preferences as critical defects. Which prompt improvement is most direct?

A. Say “be more accurate”  
B. Define reportable categories, exclusions, severity criteria, and boundary examples  
C. Ask for more findings  
D. Remove all examples

**42.** Detailed prose instructions still produce inconsistent labels on ambiguous support tickets. What is the best next technique?

A. Add 2–4 targeted few-shot examples covering the decision boundaries  
B. Repeat the same prose five times  
C. Increase randomness  
D. Make every label optional

**43.** A downstream service requires valid JSON matching a known schema. Which current API feature most directly provides this?

A. A prose request saying “return JSON”  
B. JSON structured output with a JSON Schema  
C. Regex extraction from arbitrary prose  
D. A longer user message

**44.** A response is valid against the invoice schema, but its line items total 920 while `total` is 980. What failed?

A. JSON syntax validation  
B. Semantic validation  
C. Tool discovery  
D. MCP transport

**45.** Some source contracts genuinely omit a termination date. How should the extraction schema handle it?

A. Require a date so Claude must infer one  
B. Allow null/absence and capture evidence status  
C. Substitute today’s date  
D. Retry until a date appears

**46. Select TWO.** Which are good uses of an `other` category plus a detail field?

A. The known enum covers common categories but legitimate new categories may occur  
B. The system needs a truthful representation outside the closed list  
C. The category must be one of exactly two values by policy  
D. The developer does not want to define any categories  
E. Missing evidence should be fabricated

**47.** Semantic validation detects an impossible date order. What should a correction retry include?

A. Only “try again”  
B. Original source, previous extraction, and the specific validation error  
C. A different unrelated document  
D. No schema

**48.** A required value is absent from the supplied document and exists only in an external system the model cannot access. What should the pipeline do?

A. Retry indefinitely  
B. Mark it missing/unknown or retrieve it through an authorized tool  
C. Infer the most likely value  
D. Hide the missing field

**49.** Which workload is the best fit for Message Batches?

A. A blocking pre-merge security gate  
B. A live support chat response  
C. Overnight analysis of 50,000 documents  
D. A user waiting for account verification

**50. Select TWO.** What are sound batch-processing practices?

A. Correlate requests and results with `custom_id`  
B. Resubmit only failed items after addressing the cause  
C. Assume guaranteed completion in five minutes  
D. Use batch for every synchronous request  
E. Omit evaluation on a sample before a large submission

**51.** A 70-file change needs both local bug detection and cross-file data-flow review. Which architecture is strongest?

A. One undifferentiated prompt over all files  
B. Per-file review passes followed by an independent integration pass  
C. Review only the largest file  
D. Ask the generation session whether it feels confident

### Domain 5 — Context Management & Reliability (52–60)

**52.** Order lookups return 45 fields, but the support agent needs only order ID, status, amount, date, and eligibility. What is the best context strategy?

A. Append all fields on every turn  
B. Normalize and retain only relevant fields plus necessary provenance  
C. Convert the output into longer prose  
D. Repeat the tool call instead of storing facts

**53.** A summary turns “refund of EUR 247.35 promised by 18 September” into “refund promised soon.” What should the system change?

A. Use a persistent structured facts block for exact values and commitments  
B. Summarize more aggressively  
C. Remove the original currency  
D. Rely on the model to remember

**54.** Which statement about prompt caching is correct?

A. It removes cached tokens from the context window  
B. It can reduce repeated-input cost, but cached tokens still occupy context  
C. It guarantees semantic accuracy  
D. It replaces compaction

**55.** A customer says, “Stop troubleshooting and connect me to a person.” What should the agent do?

A. Continue troubleshooting until confidence falls  
B. Honor the explicit human request according to the escalation workflow  
C. Escalate only if sentiment is classified as angry  
D. Ask the customer to repeat the request three times

**56.** A customer name matches three accounts. What is the safest next step?

A. Choose the most recently active account  
B. Ask for a discriminating identifier  
C. Choose the first search result  
D. Average the account details

**57. Select TWO.** A system reports 97% aggregate extraction accuracy. What else is necessary before reducing human review?

A. Accuracy segmented by document type and field  
B. A labeled set to calibrate confidence thresholds  
C. Trust the aggregate alone  
D. Review only low-confidence outputs forever  
E. Remove ambiguous examples from evaluation

**58.** Why should some high-confidence outputs still be randomly reviewed?

A. To make the system slower  
B. To detect calibration drift and silent novel error patterns  
C. Because confidence can never be useful  
D. To increase token counts

**59.** Two credible sources give different revenue values, collected in different months. What should synthesis do?

A. Select the larger value without comment  
B. Preserve both values with source and date, and explain the temporal difference  
C. Average them  
D. Remove both claims

**60. Select THREE.** What should survive a multi-agent summarization pipeline for each important claim?

A. Source identifier or URL  
B. Relevant evidence/location  
C. Publication or collection date  
D. Every token of private reasoning  
E. Decorative formatting preference

---

## Answer sheet

| 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|
|  |  |  |  |  |  |  |  |  |  |

| 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 |
|---|---|---|---|---|---|---|---|---|---|
|  |  |  |  |  |  |  |  |  |  |

| 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 |
|---|---|---|---|---|---|---|---|---|---|
|  |  |  |  |  |  |  |  |  |  |

| 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40 |
|---|---|---|---|---|---|---|---|---|---|
|  |  |  |  |  |  |  |  |  |  |

| 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50 |
|---|---|---|---|---|---|---|---|---|---|
|  |  |  |  |  |  |  |  |  |  |

| 51 | 52 | 53 | 54 | 55 | 56 | 57 | 58 | 59 | 60 |
|---|---|---|---|---|---|---|---|---|---|
|  |  |  |  |  |  |  |  |  |  |

---

## Answer key and explanations

### Domain 1

1. **C.** Financial and identity prerequisites require deterministic application enforcement; prompts and examples only reduce probability of error.  
2. **B.** Client tools require execution plus correlated results appended to the conversation before the next model call.  
3. **B, C.** Distinct scopes reduce duplication, and a shared structured contract with provenance makes aggregation reliable.  
4. **B.** Stable, ordered compliance stages are a workflow, not an open-ended agent problem.  
5. **B.** Evidence-dependent next steps justify an adaptive agent, but it still needs explicit boundaries.  
6. **B.** Isolated subagents need relevant prior findings passed explicitly.  
7. **B, C.** Independent collections/files can run concurrently; the other pairs have data dependencies.  
8. **C.** Structured partial failure lets the coordinator retry, switch source, continue with a gap, or escalate.  
9. **B.** A safety cap is useful, but it is not an outcome criterion and should not be the sole termination rule.  
10. **B.** Requirement-aware routing avoids needless cost, latency, and failure surface.  
11. **A.** Normalize at the tool boundary before reasoning depends on the values.  
12. **B.** Forking preserves a common baseline while preventing the two approaches from contaminating each other.  
13. **A, C.** Outcome criteria, budgets, and checkpoints bound autonomy; unrestricted access and promises do not.  
14. **B.** The decomposition lost the original coverage goal; more tokens do not repair the scope.  
15. **C.** A structured operational handoff gives the human enough verified state to continue safely.  
16. **B.** Stale observations must be invalidated or rechecked; a fresh verified summary is safer when much has changed.

### Domain 2

17. **B.** Tool selection is driven heavily by names and descriptions; remove overlap before adding prompt workarounds.  
18. **C.** “No matches” after a successful query is valid data, not a transport or authorization failure.  
19. **A, B, C.** Category, retryability, and safe explanation support recovery and user communication.  
20. **B.** `any` requires a tool call while allowing Claude to choose the appropriate extraction schema.  
21. **B.** Forced named selection creates the required first stage deterministically at the model interface.  
22. **B.** Share safe configuration; inject secrets at runtime from an approved source.  
23. **A.** A resource is appropriate for app-exposed, read-only discoverable content.  
24. **B.** MCP prompts are user-controlled templates; tools are model-selected actions/queries.  
25. **B, C.** A validated narrow reader plus omission of write/shell capabilities implements least privilege.  
26. **B.** Grep searches file contents.  
27. **A.** Glob matches file paths and naming patterns.

### Domain 3

28. **B.** Shared standards belong in version-controlled project scope.  
29. **B.** A glob-scoped rule follows the file pattern across directories without duplication.  
30. **B.** Skills load reusable task-specific knowledge on demand.  
31. **A.** A subagent isolates verbose exploration and returns a compact result.  
32. **B.** A hard guarantee belongs in permissions or deterministic pre-action enforcement.  
33. **B.** Architectural, multi-file, multi-option work should be explored and reviewed before edits.  
34. **A.** The change is small and well understood; direct execution plus verification is proportionate.  
35. **A, B.** Stable commands and boundaries are useful always-on context; manuals, secrets, and personal preferences are not.  
36. **A.** `-p`/`--print` is the non-interactive invocation.  
37. **B.** Downstream automation needs a stable machine-readable contract.  
38. **B.** A separate context provides a more independent check and avoids anchoring on generation reasoning.  
39. **A, B.** On-demand workflow/reference content fits a skill; universal rules fit `CLAUDE.md`, hard blocks fit hooks/permissions.

### Domain 4

40. **B.** Prompt improvement requires explicit success criteria and repeatable evaluation.  
41. **B.** Concrete categories, exclusions, severities, and examples define the decision boundary and reduce false positives.  
42. **A.** A few carefully chosen examples teach ambiguous classification boundaries more effectively than repeated prose.  
43. **B.** JSON structured outputs constrain the response to the supplied schema.  
44. **B.** The object is syntactically/schema valid but violates a domain relationship.  
45. **B.** Honest absence prevents fabricated dates and preserves downstream meaning.  
46. **A, B.** `other` plus detail keeps common categories normalized without forcing legitimate novel cases into the wrong enum.  
47. **B.** Specific feedback plus original evidence and failed output gives the model a correctable target.  
48. **B.** No retry can recover evidence that is not present; represent absence or obtain authorized data.  
49. **C.** High-volume, latency-tolerant overnight work is the canonical batch case.  
50. **A, B.** Correlation and selective resubmission reduce confusion and waste; batch latency is not guaranteed for blocking work.  
51. **B.** Focused local passes reduce attention dilution, while a separate integration pass finds cross-file problems.

### Domain 5

52. **B.** Context should contain the relevant normalized facts and provenance, not every upstream field.  
53. **A.** Critical exact facts must live in structured durable state outside lossy summaries.  
54. **B.** Caching changes repeated-input cost, not how much working context the tokens consume.  
55. **B.** An explicit request for a human is a direct escalation trigger.  
56. **B.** Ambiguous identity requires clarification, not heuristic selection.  
57. **A, B.** Segment accuracy exposes minority failures, and labeled data is required to calibrate confidence.  
58. **B.** Sampling high-confidence items reveals drift and confident novel errors that threshold routing would otherwise miss.  
59. **B.** Preserve provenance and dates; the values may both be correct for their collection periods.  
60. **A, B, C.** Source, evidence/location, and date allow downstream verification and correct temporal interpretation.

---

## Scoring worksheet

Score each question as one point. A multiple-response item earns a point only when every required selection is correct and no extra option is chosen.

| Domain | Items | Your score | Percent |
|---|---:|---:|---:|
| Agentic Architecture & Orchestration | 16 |  |  |
| Tool Design & MCP Integration | 11 |  |  |
| Claude Code Configuration & Workflows | 12 |  |  |
| Prompt Engineering & Structured Output | 12 |  |  |
| Context Management & Reliability | 9 |  |  |
| **Total** | **60** |  |  |

Interpretation:

- **48–60 (80–100%):** near ready; repair any domain below 70% and take another fresh timed mock.
- **42–47 (70–78%):** close, but scenario judgment is not yet consistent.
- **33–41 (55–68%):** revisit the two weakest domains and repeat the hands-on labs.
- **0–32:** complete the full study plan before another timed mock.

Do not convert this raw score to Anthropic’s scaled score. No official conversion is published.

