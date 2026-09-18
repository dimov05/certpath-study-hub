import flashcardsJson from './flashcards.json';
import questionsJson from './questions.json';
import { lessonDetails } from './lesson-details';
import type { Certificate, Domain, Flashcard, Lesson, LessonDetails, Question, StudyWeek } from '@/lib/types';

const lesson = (
  id: string,
  title: string,
  duration: number,
  summary: string,
  keyPoints: string[],
  examTraps: string[],
  practice: string,
  details?: LessonDetails,
): Lesson => ({ id, title, duration: details || lessonDetails[id] ? Math.max(duration, 45) : duration, summary, keyPoints, examTraps, practice, details: details ?? lessonDetails[id] });

const domains: Domain[] = [
  {
    id: 'd1',
    title: 'Agentic Architecture & Orchestration',
    shortTitle: 'Agentic architecture',
    weight: 27,
    color: 'var(--chart-1)',
    description: 'Choose the right execution pattern, coordinate specialists, and enforce critical workflow rules.',
    lessons: [
      lesson('d1-1', 'The tool-use loop', 45, 'Understand the protocol that turns Claude from a text generator into an application-controlled agent.', ['Drive continuation from stop_reason, not prose.', 'Execute client tools outside the model and return correlated tool_result blocks.', 'Preserve the required conversation history across iterations.'], ['Treating assistant text as a completion signal.', 'Dropping the assistant tool-use turn before sending results.'], 'Draw the complete loop and annotate every responsibility owned by the model versus your application.', {
        objectives: [
          'Explain which parts of tool use belong to Claude, the Anthropic API, and your application.',
          'Trace a tool_use block into an executed operation and a correctly correlated tool_result.',
          'Implement a loop that branches on stop_reason and handles multiple tool calls.',
          'Recognize malformed history, unsafe execution, and incorrect completion detection.',
        ],
        mentalModel: 'Claude does not call your function. It writes a typed request for your application to execute. Your application is the runtime, security boundary, and source of truth; Claude is the planner and interpreter.',
        steps: [
          { title: 'Send', detail: 'Your application sends messages plus tool definitions.' },
          { title: 'Inspect', detail: 'Claude returns content blocks and a stop_reason.' },
          { title: 'Validate', detail: 'Your code checks the requested tool, arguments, permissions, and business rules.' },
          { title: 'Execute', detail: 'Your code runs every approved client-side tool call.' },
          { title: 'Return', detail: 'A user message returns matching tool_result blocks.' },
          { title: 'Continue', detail: 'Claude interprets results and either calls more tools or ends the turn.' },
        ],
        sections: [
          {
            title: '1. The contract and the three actors',
            paragraphs: [
              'A tool definition is an interface contract: a name, a description, and an input schema. Claude sees that contract, but it does not see or execute your database query, HTTP client, filesystem function, or approval logic.',
              'For a client-executed tool, the model chooses a tool and proposes arguments. The Anthropic API transports that structured request. Your application validates and executes it, then reports the observation back. Keeping those responsibilities separate is the foundation of safe agent design.',
            ],
            bullets: [
              'Claude owns reasoning about whether a tool is useful and what arguments to propose.',
              'The API owns message validation and transports typed content blocks.',
              'Your application owns authorization, execution, retries, side-effect controls, logging, and result shaping.',
            ],
          },
          {
            title: '2. Read the response as a protocol',
            paragraphs: [
              'A response may contain ordinary text and one or more tool_use blocks. Each tool_use block has an id, name, and input object. The top-level stop_reason tells the application why generation stopped.',
              'When stop_reason is tool_use, do not treat nearby prose such as “I will check that” or “done” as authoritative. Extract every client tool request, keep its exact id, and decide whether it may run. Multiple independent calls can appear in the same response.',
            ],
            bullets: [
              'end_turn: the model naturally finished; present the answer.',
              'tool_use: execute approved client tools and continue the loop.',
              'max_tokens or model_context_window_exceeded: treat the response as truncated, not complete.',
              'pause_turn: return the paused assistant content so a server-tool loop can continue.',
              'refusal: handle the refusal path explicitly rather than parsing empty content as an error.',
            ],
          },
          {
            title: '3. Preserve the message sequence',
            paragraphs: [
              'The next request must contain the prior conversation, the complete assistant response that requested the tools, and then a user message whose content begins with the corresponding tool_result blocks. The tool_use_id on each result must equal the id of the request it answers.',
              'This history is not bookkeeping you can reconstruct approximately. It is how Claude knows which observation belongs to which action. Dropping the assistant turn, inventing a new id, or placing unrelated text before required results breaks the protocol or creates ambiguous state.',
            ],
            bullets: [
              'Return one result for every client tool_use block, including failures.',
              'For parallel calls, place all tool_result blocks in one user message.',
              'Use is_error: true when execution failed so Claude can repair, retry, choose an alternative, or explain.',
              'Keep the same relevant tool definitions available on continuation requests.',
            ],
          },
          {
            title: '4. A minimal manual loop',
            paragraphs: [
              'The loop is application code, not a special model feature. Production versions also need schema validation, permission checks, timeouts, idempotency for consequential operations, result-size limits, observability, and a total cost or iteration budget.',
            ],
            code: {
              language: 'TypeScript',
              caption: 'Illustrative client-tool loop; adapt SDK names to the current release.',
              source: `const messages = [{ role: "user", content: userRequest }];

while (true) {
  const response = await client.messages.create({
    model,
    max_tokens: 1200,
    tools,
    messages,
  });

  messages.push({ role: "assistant", content: response.content });

  if (response.stop_reason === "end_turn") {
    return response.content;
  }

  if (response.stop_reason !== "tool_use") {
    return handleExceptionalStop(response);
  }

  const calls = response.content.filter(block => block.type === "tool_use");
  const results = await Promise.all(calls.map(async call => {
    try {
      validateAuthorization(call.name, call.input);
      const output = await executeTool(call.name, call.input);
      return { type: "tool_result", tool_use_id: call.id, content: JSON.stringify(output) };
    } catch (error) {
      return { type: "tool_result", tool_use_id: call.id, is_error: true, content: safeError(error) };
    }
  }));

  messages.push({ role: "user", content: results });
}`,
            },
          },
          {
            title: '5. Reliability and safety decisions',
            paragraphs: [
              'Tool input is a proposal, even when it conforms to JSON Schema. Re-check identity, authorization, business thresholds, and current state immediately before execution. A perfectly valid refund request can still be unauthorized or exceed a policy limit.',
              'Retries belong to the application and should depend on error class. A timeout may be retried with a limit and backoff; invalid arguments should be returned as a structured error; a permission denial should not be retried; an uncertain consequential result may require an idempotency lookup before any second attempt.',
            ],
          },
        ],
        scenario: {
          title: 'Worked example: order status and refund request',
          situation: 'A customer asks, “Where is order A-1042, and refund it if it has not shipped.” Claude requests get_order and request_refund in the same turn.',
          walkthrough: [
            'Your application may run get_order, because it is read-only and supplies the state needed for the decision.',
            'It must not run request_refund in parallel: refund eligibility depends on the order result and possibly verified identity.',
            'Return the get_order result. Claude can then propose request_refund only if the evidence supports it.',
            'Before execution, application code checks identity, refund authority, order state, threshold, and idempotency key.',
            'Return either a success result or a structured policy/error result; Claude explains the outcome or escalates.',
          ],
          takeaway: 'Parallelism is not determined by how many tool_use blocks appear. Your application still enforces dependencies and authorization before executing side effects.',
        },
        checks: [
          {
            question: 'Claude returns text saying “The task is complete,” but stop_reason is tool_use. What should the application do?',
            options: ['Show the text and exit', 'Execute the requested tools and continue', 'Call the model again without results', 'Change stop_reason to end_turn'],
            answer: 1,
            explanation: 'stop_reason is the protocol signal. With tool_use, execute every approved client call and return correlated results before continuing.',
          },
          {
            question: 'Two tool calls are returned together. What is the safest default?',
            options: ['Always execute both concurrently', 'Return only the first result', 'Check dependencies and permissions, then parallelize only independent calls', 'Ask Claude whether its own calls are safe'],
            answer: 2,
            explanation: 'The application owns dependency and authorization enforcement. Independent approved calls can run concurrently; dependent or consequential calls must be serialized or blocked.',
          },
          {
            question: 'Which field connects a tool result to the original request?',
            options: ['The tool name', 'tool_use_id matching the tool_use id', 'The order of text blocks', 'stop_sequence'],
            answer: 1,
            explanation: 'Each tool_result carries tool_use_id equal to the id of the tool_use block it answers.',
          },
        ],
        resources: [
          { title: 'How tool use works', href: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/how-tool-use-works', note: 'Conceptual model and canonical client-tool loop.' },
          { title: 'Handle tool calls', href: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls', note: 'Exact tool_use, tool_result, parallel call, and error mechanics.' },
          { title: 'Stop reasons and fallback', href: 'https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons', note: 'Current stop_reason values and application behavior.' },
        ],
      }),
      lesson('d1-2', 'Workflows versus agents', 24, 'Select deterministic workflows for known paths and agents for evidence-dependent paths.', ['Use chains for predictable ordered stages.', 'Use routing when one specialist path should handle the request.', 'Use adaptive agents only when intermediate findings should change the plan.'], ['Choosing an autonomous agent because it sounds more advanced.', 'Using a static chain for an open-ended investigation.'], 'Classify ten example workloads as chain, router, parallel workflow, agent, or evaluator–optimizer.'),
      lesson('d1-3', 'Coordinator and subagents', 32, 'Design hub-and-spoke systems with isolated specialist contexts and explicit handoffs.', ['The coordinator owns decomposition, routing, aggregation, and recovery.', 'Subagents receive only explicitly supplied context.', 'Return concise structured findings with provenance.'], ['Assuming child agents inherit the parent history.', 'Letting specialists communicate invisibly outside coordinator oversight.'], 'Design a research coordinator with search, analysis, and synthesis specialists.'),
      lesson('d1-4', 'Parallelism and dependencies', 22, 'Run independent work concurrently while preserving ordering where outputs or authorization create dependencies.', ['Parallelize independent searches and per-file inspections.', 'Serialize verification before consequential action.', 'Aggregate only after all required parallel results arrive.'], ['Parallelizing a prerequisite with the action it authorizes.', 'Running independent work sequentially without a constraint.'], 'Create a dependency graph for a multi-issue support request and identify safe parallel branches.'),
      lesson('d1-5', 'Deterministic guardrails', 30, 'Place non-negotiable controls in code, permissions, schemas, and hooks.', ['Use pre-action gates for identity, authority, thresholds, and destructive actions.', 'Use post-action hooks to normalize, redact, audit, or provide feedback.', 'Prompts improve behavior but do not guarantee compliance.'], ['Answering a hard-rule problem with “improve the prompt.”', 'Confusing a post-action check with prevention.'], 'Implement a refund gate that requires verified identity and escalates above a threshold.'),
      lesson('d1-6', 'State, recovery, and forking', 26, 'Persist enough structured state to resume safely and branch work intentionally.', ['Resume only when prior observations remain valid.', 'Start fresh from a verified summary when tool results are stale.', 'Fork when comparing divergent approaches from a common baseline.'], ['Trusting week-old file observations after the repository changed.', 'Mixing competing approaches in one context.'], 'Write a recovery manifest with completed steps, outputs, errors, and pending work.'),
      lesson('d1-7', 'Bounded autonomy and handoffs', 26, 'Control long-running work with outcomes, budgets, permissions, checkpoints, and escalation.', ['Use completion criteria in addition to safety caps.', 'Preserve partial results when a specialist fails.', 'Hand humans verified state, evidence, attempts, and recommendations.'], ['Using an arbitrary iteration cap as the sole success rule.', 'Sending only the last user message in a human handoff.'], 'Draft a structured handoff for a partially resolved billing dispute.'),
    ],
  },
  {
    id: 'd2',
    title: 'Tool Design & MCP Integration',
    shortTitle: 'Tools & MCP',
    weight: 18,
    color: 'var(--chart-2)',
    description: 'Create clear tool contracts, actionable errors, least-privilege access, and useful MCP interfaces.',
    lessons: [
      lesson('d2-1', 'Tool contracts and boundaries', 30, 'Make selection reliable through precise names, descriptions, schemas, and non-overlapping responsibilities.', ['State when to use and not use each tool.', 'Define formats, units, identifiers, edge cases, and output meaning.', 'Split vague “manage” tools into narrow purpose-specific operations.'], ['Assuming a good JSON schema compensates for a vague description.', 'Keeping two tools with nearly identical purposes.'], 'Rewrite three ambiguous tool definitions into distinct contracts.'),
      lesson('d2-2', 'Structured errors and recovery', 28, 'Return errors that let an agent choose retry, repair, explanation, alternative, or escalation.', ['Distinguish transient, validation, permission, business-rule, and empty-success results.', 'Include category, code, retryability, safe message, and attempted operation.', 'Retry transient failures with limits; do not blindly retry permanent failures.'], ['Treating zero matches as an error.', 'Returning only “operation failed.”'], 'Design success and error payloads for an order lookup tool.'),
      lesson('d2-3', 'Tool choice and least privilege', 25, 'Control whether Claude may, must, or must specifically call a tool while limiting each role’s capabilities.', ['Auto permits direct response or a tool.', 'Any requires one of the supplied tools.', 'Forced named selection guarantees a particular first-stage call.'], ['Giving every specialist every tool.', 'Using prompt wording where forced tool choice is required.'], 'Choose tool-choice settings for five extraction and action scenarios.'),
      lesson('d2-4', 'MCP mental model', 34, 'Use MCP tools, resources, and prompts according to who controls them and what they represent.', ['Tools are model-controlled operations.', 'Resources are app-controlled read-only content.', 'Prompts are user-controlled reusable templates.'], ['Using an action tool as a content catalog.', 'Assuming an MCP server decides host permissions.'], 'Build a small MCP document service with a catalog resource and narrow tools.'),
      lesson('d2-5', 'MCP scope, secrets, and built-ins', 26, 'Share integrations safely and select Claude Code file tools deliberately.', ['Commit safe project-scoped configuration, not credentials.', 'Inject secrets from environment or an approved store.', 'Use Glob for paths and Grep for contents before reading targeted files.'], ['Committing tokens in .mcp.json.', 'Reading an entire repository before targeted search.'], 'Configure one shared MCP server and trace a function from Grep results through relevant files.'),
    ],
  },
  {
    id: 'd3',
    title: 'Claude Code Configuration & Workflows',
    shortTitle: 'Claude Code',
    weight: 20,
    color: 'var(--chart-3)',
    description: 'Put each instruction, workflow, integration, and guardrail in the correct Claude Code extension point.',
    lessons: [
      lesson('d3-1', 'Configuration scopes', 24, 'Separate organization policy, team-shared project behavior, local overrides, and personal defaults.', ['Project scope is version-controlled and shared.', 'Local scope is project-specific to one developer.', 'User scope follows one person across projects; managed scope enforces organization policy.'], ['Putting team standards in user scope.', 'Committing secrets or personal overrides.'], 'Sort a set of configuration examples into managed, project, local, and user scope.'),
      lesson('d3-2', 'CLAUDE.md and path rules', 28, 'Keep always-on instructions concise and load conditional conventions only for matching files.', ['CLAUDE.md holds stable commands, boundaries, and conventions.', 'Path rules apply by glob and reduce irrelevant context.', 'Modularize instead of building a monolithic instruction file.'], ['Copying entire framework manuals into CLAUDE.md.', 'Repeating test rules in every directory.'], 'Create root instructions plus separate API and test-file rules.'),
      lesson('d3-3', 'Skills and reusable workflows', 25, 'Package task-specific knowledge and multi-step procedures for on-demand use.', ['Skills load when relevant or explicitly invoked.', 'Use clear descriptions so matching is reliable.', 'Restrict tools or fork context for verbose workflows.'], ['Using a skill for a rule that must apply to every action.', 'Storing credentials in skill content.'], 'Create a code-review skill with a rubric and read-only tool set.'),
      lesson('d3-4', 'Subagents, hooks, and permissions', 32, 'Combine context isolation, lifecycle automation, and explicit capability controls.', ['Subagents are isolated workers; skills are reusable knowledge/workflows.', 'PreToolUse can prevent unsafe actions.', 'PostToolUse can lint, normalize, log, or return feedback.'], ['Relying on CLAUDE.md to enforce an absolute prohibition.', 'Using a subagent when a deterministic script is enough.'], 'Add an exploration subagent and a pre-edit hook for a protected directory.'),
      lesson('d3-5', 'Plan mode and iterative delivery', 26, 'Match planning depth to uncertainty and refine implementations against concrete tests.', ['Plan architectural, multi-file, and multi-option work.', 'Execute small, clear, reversible changes directly.', 'Use examples, tests, and failures to drive iteration.'], ['Planning trivial one-line fixes for hours.', 'Editing a monolith before understanding dependencies.'], 'Compare a one-line bug fix and a service extraction; write the right workflow for each.'),
      lesson('d3-6', 'CI/CD integration', 30, 'Run Claude Code non-interactively and produce deduplicated, machine-readable review findings.', ['Use -p or --print for headless execution.', 'Request schema-constrained findings for automation.', 'Use an independent context to review generated code.'], ['Running an interactive command in CI.', 'Asking the generation session to approve its own work.'], 'Design a CI review step with severity, evidence, location, and remediation fields.'),
    ],
  },
  {
    id: 'd4',
    title: 'Prompt Engineering & Structured Output',
    shortTitle: 'Prompting & output',
    weight: 20,
    color: 'var(--chart-4)',
    description: 'Improve behavior empirically and make downstream output parseable, valid, and reviewable.',
    lessons: [
      lesson('d4-1', 'Success criteria and evals', 28, 'Define measurable behavior and representative cases before changing prompts.', ['Specify desired quality, unacceptable failures, latency, and cost.', 'Include normal, hard, ambiguous, and adversarial cases.', 'Compare revisions on the same evaluation set.'], ['Tuning prompts from anecdotes.', 'Using only easy examples.'], 'Create a 20-case evaluation set for code-review precision.'),
      lesson('d4-2', 'Explicit criteria and examples', 30, 'Use concrete categories, exclusions, severity rules, and boundary examples.', ['Tell Claude what to report and what to omit.', 'Use examples when prose does not communicate the decision boundary.', 'Include positive and acceptable-negative examples.'], ['Saying only “be conservative.”', 'Adding dozens of redundant examples.'], 'Write four boundary examples for support-ticket escalation.'),
      lesson('d4-3', 'Schema-constrained output', 34, 'Choose JSON outputs or strict tool use to guarantee structure for downstream systems.', ['JSON outputs constrain response shape.', 'Strict tool use validates tool names and inputs.', 'Tool choice controls whether a structured action is optional or required.'], ['Assuming “return JSON” guarantees valid syntax.', 'Confusing shape validity with truth.'], 'Define a structured extraction schema with evidence fields.'),
      lesson('d4-4', 'Schema design for uncertainty', 26, 'Represent missing, ambiguous, and novel values without forcing fabrication.', ['Use optional or nullable fields for legitimate absence.', 'Use enums for closed sets and other-plus-detail for extensible sets.', 'Separate extracted value, evidence, and confidence.'], ['Making every field required.', 'Using “other” to avoid defining any taxonomy.'], 'Revise an invoice schema to handle missing and conflicting values honestly.'),
      lesson('d4-5', 'Semantic validation and retry', 30, 'Validate domain relationships after parsing and retry only when correction is possible.', ['Check totals, date order, state transitions, and cross-field consistency.', 'Return original source, failed output, and specific validation errors on retry.', 'Route missing evidence to retrieval or review instead of repeated generation.'], ['Retrying when the source lacks the field.', 'Stopping after schema validation alone.'], 'Build a validator for invoice totals and date ordering.'),
      lesson('d4-6', 'Batch and independent review', 28, 'Match asynchronous processing to latency needs and split complex reviews into focused passes.', ['Use batch for high-volume latency-tolerant work.', 'Correlate items and resubmit only failures.', 'Use independent local and integration review passes for large changes.'], ['Using batch for a blocking gate.', 'Running one undifferentiated review over dozens of files.'], 'Design overnight analysis for 50,000 documents plus a failure-resubmission policy.'),
    ],
  },
  {
    id: 'd5',
    title: 'Context Management & Reliability',
    shortTitle: 'Context & reliability',
    weight: 15,
    color: 'var(--chart-5)',
    description: 'Curate working context, preserve exact facts and sources, and route uncertainty to the right recovery path.',
    lessons: [
      lesson('d5-1', 'Context as a curated working set', 28, 'Keep the most useful instructions, state, evidence, and recent interaction—not every available token.', ['Everything in the request consumes context.', 'Trim verbose tool results at the boundary.', 'Keep critical facts in a structured durable layer.'], ['Assuming more context always improves accuracy.', 'Appending full upstream records when five fields matter.'], 'Reduce a 40-field order response to the facts needed for return eligibility.'),
      lesson('d5-2', 'Compaction and long sessions', 26, 'Preserve what must survive summarization and isolate verbose exploration.', ['Keep exact IDs, amounts, dates, commitments, and source mappings.', 'Use subagents for noisy discovery.', 'Remember that prompt caching changes cost, not context occupancy.'], ['Summarizing exact commitments into vague prose.', 'Treating caching as a larger context window.'], 'Design a persistent case-facts block for a multi-turn support session.'),
      lesson('d5-3', 'Escalation and ambiguity', 28, 'Escalate from explicit policy and authority signals rather than mood or unsupported confidence.', ['Honor an explicit human request.', 'Escalate policy gaps, exceptions, high-risk ambiguity, and inability to progress.', 'Ask for a discriminating identifier when records match.'], ['Using angry sentiment as the sole trigger.', 'Guessing which matching account is correct.'], 'Write escalation and clarification rules for five ambiguous support cases.'),
      lesson('d5-4', 'Error propagation', 24, 'Let specialists recover locally, then preserve partial results and failure context for coordinator decisions.', ['Differentiate access failure from valid empty results.', 'Return attempts, partial results, and alternatives.', 'Annotate coverage gaps in final synthesis.'], ['Silently turning errors into empty success.', 'Failing an entire workflow after one recoverable source error.'], 'Simulate a source timeout and design the coordinator response.'),
      lesson('d5-5', 'Human review and calibration', 30, 'Route review using labeled calibration and segment-level performance, not aggregate confidence alone.', ['Measure by document type and field.', 'Calibrate confidence thresholds against labeled data.', 'Sample some high-confidence outputs to detect drift.'], ['Reducing review based only on 97% aggregate accuracy.', 'Trusting model confidence without calibration.'], 'Design a stratified review sample and threshold policy.'),
      lesson('d5-6', 'Provenance and conflicting evidence', 28, 'Preserve claim-to-source mappings, dates, and methodological context through synthesis.', ['Keep source ID, excerpt/location, and date with each claim.', 'Preserve credible disagreements instead of silently choosing.', 'Use temporal context to explain apparent contradictions.'], ['Dropping citations during summarization.', 'Averaging incompatible source values.'], 'Synthesize two conflicting revenue figures without losing provenance.'),
    ],
  },
];

const plan: StudyWeek[] = [
  { week: 1, title: 'Agentic architecture', outcome: 'Choose and defend orchestration patterns.', tasks: [
    { id: 'w1-tool-loop', label: 'Master the tool-use loop and stop reasons', minutes: 90 },
    { id: 'w1-patterns', label: 'Compare chains, routers, parallelism, and agents', minutes: 90 },
    { id: 'w1-coordinator', label: 'Design a coordinator with isolated specialists', minutes: 90 },
    { id: 'w1-guardrails', label: 'Implement deterministic prerequisites and handoff', minutes: 90 },
    { id: 'w1-lab', label: 'Complete the support resolution lab', minutes: 100 },
  ] },
  { week: 2, title: 'Tools and MCP', outcome: 'Design safe, unambiguous integration contracts.', tasks: [
    { id: 'w2-contracts', label: 'Critique tool names, schemas, and boundaries', minutes: 90 },
    { id: 'w2-errors', label: 'Build structured error and recovery contracts', minutes: 90 },
    { id: 'w2-choice', label: 'Practice tool choice and least privilege', minutes: 90 },
    { id: 'w2-mcp', label: 'Study MCP tools, resources, and prompts', minutes: 90 },
    { id: 'w2-lab', label: 'Build the MCP document-service lab', minutes: 100 },
  ] },
  { week: 3, title: 'Claude Code', outcome: 'Place configuration and enforcement correctly.', tasks: [
    { id: 'w3-config', label: 'Build CLAUDE.md and path-specific rules', minutes: 90 },
    { id: 'w3-skills', label: 'Create a skill and exploration subagent', minutes: 90 },
    { id: 'w3-hooks', label: 'Add permissions and deterministic hooks', minutes: 90 },
    { id: 'w3-plan', label: 'Practice plan versus direct execution', minutes: 90 },
    { id: 'w3-lab', label: 'Run a headless structured CI review', minutes: 100 },
  ] },
  { week: 4, title: 'Prompts and structured output', outcome: 'Build eval-driven, machine-safe output.', tasks: [
    { id: 'w4-evals', label: 'Define evaluation criteria and cases', minutes: 90 },
    { id: 'w4-examples', label: 'Write targeted boundary examples', minutes: 90 },
    { id: 'w4-schema', label: 'Implement schema-constrained output', minutes: 90 },
    { id: 'w4-validation', label: 'Add semantic validation and retry', minutes: 90 },
    { id: 'w4-lab', label: 'Complete the invoice extraction lab', minutes: 100 },
  ] },
  { week: 5, title: 'Context and reliability', outcome: 'Recover well and preserve critical evidence.', tasks: [
    { id: 'w5-context', label: 'Practice context budgeting and trimming', minutes: 90 },
    { id: 'w5-escalation', label: 'Design escalation and ambiguity rules', minutes: 90 },
    { id: 'w5-review', label: 'Calibrate confidence and review thresholds', minutes: 90 },
    { id: 'w5-provenance', label: 'Preserve provenance and conflicts', minutes: 90 },
    { id: 'w5-lab', label: 'Complete the research synthesis lab', minutes: 100 },
  ] },
  { week: 6, title: 'Simulation and repair', outcome: 'Reach consistent timed-exam readiness.', tasks: [
    { id: 'w6-mock', label: 'Take the 60-question mock in 120 minutes', minutes: 120 },
    { id: 'w6-review', label: 'Review every answer and update error rules', minutes: 100 },
    { id: 'w6-weak1', label: 'Repair the weakest domain', minutes: 90 },
    { id: 'w6-weak2', label: 'Repair the second-weakest domain', minutes: 90 },
    { id: 'w6-ready', label: 'Retest flagged items and check readiness', minutes: 90 },
  ] },
];

export const claudeArchitectFoundations: Certificate = {
  slug: 'claude-architect-foundations',
  provider: 'Anthropic',
  title: 'Claude Certified Architect – Foundations',
  shortTitle: 'Claude Architect Foundations',
  level: 'Foundations',
  summary: 'Build the judgment to design reliable Claude systems—from agent orchestration and MCP tools to structured output, context strategy, and production safeguards.',
  updatedAt: '2026-09-17',
  exam: { questions: 60, minutes: 120, passingScore: '720 / 1,000', price: '$125', validity: '12 months' },
  domains,
  questions: questionsJson as Question[],
  flashcards: flashcardsJson as Flashcard[],
  plan,
  resources: [
    { title: 'Official certification page', description: 'Current exam facts, guide, registration, and recommended courses.', href: 'https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification', type: 'official' },
    { title: 'Certification FAQ', description: 'Eligibility, policies, retakes, scoring, and exam-day rules.', href: 'https://anthropic-partners.skilljar.com/page/faq-certifications', type: 'official' },
    { title: 'Claude Platform documentation', description: 'Current API, tools, structured output, context, and batch behavior.', href: 'https://platform.claude.com/docs/en/home', type: 'official' },
    { title: 'Claude Code documentation', description: 'Current configuration, skills, hooks, subagents, and CLI behavior.', href: 'https://code.claude.com/docs/en/overview', type: 'official' },
    { title: 'MCP specification', description: 'The authoritative Model Context Protocol specification.', href: 'https://modelcontextprotocol.io/specification/latest', type: 'official' },
    { title: 'Complete study guide', description: 'Download the full independent reference guide in Markdown.', href: './materials/CCA_Foundations_Study_Guide.md', type: 'download' },
    { title: 'Printable mock exam', description: 'The full 60-question exam with answers and explanations.', href: './materials/CCA_Foundations_60Q_Mock_Exam.md', type: 'download' },
    { title: 'Flashcard deck', description: 'Importable TSV for Anki or another spaced-repetition app.', href: './materials/CCA_Foundations_Flashcards.tsv', type: 'download' },
    { title: 'Study tracker', description: 'Six-week schedule as a reusable CSV checklist.', href: './materials/CCA_Study_Tracker.csv', type: 'download' },
    { title: 'Error log', description: 'Reusable template for missed questions and decision rules.', href: './materials/CCA_Error_Log.csv', type: 'download' },
  ],
};
