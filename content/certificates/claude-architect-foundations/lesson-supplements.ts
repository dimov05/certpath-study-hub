import type { LessonDetails } from '@/lib/types';

type Section = LessonDetails['sections'][number];
type Check = LessonDetails['checks'][number];
type Supplement = Pick<LessonDetails, 'steps' | 'sections' | 'checks'>;

const supplement = (
  steps: [string, string][],
  sections: [string, string, string[]][],
  checks: Check[],
): Supplement => ({
  steps: steps.map(([title, detail]) => ({ title, detail })),
  sections: sections.map(([title, paragraph, bullets]): Section => ({ title, paragraphs: [paragraph], bullets })),
  checks,
});

export const lessonSupplements: Record<string, Supplement> = {
  'd1-2': supplement(
    [
      ['Map uncertainty', 'List which decisions are known before execution and which depend on evidence discovered during execution.'],
      ['Choose a pattern', 'Select chain, router, parallel workflow, evaluator–optimizer, or agent for the uncertain portion only.'],
      ['Place controls', 'Keep authorization, budgets, validation, and irreversible gates in deterministic code around the pattern.'],
      ['Evaluate', 'Measure task success, latency, cost, variance, and recoverability against a simpler baseline.'],
    ],
    [
      ['Pattern anatomy', 'A chain narrows one problem through ordered stages. A router selects one known branch. Parallelization executes independent branches. Evaluator–optimizer adds a rubric-driven feedback loop. An agent repeatedly observes state and chooses its next action. These patterns can be composed: for example, a deterministic intake router may send only novel investigations to an agent.', ['The application still owns the outer loop and policy boundaries.', 'A model call does not become an agent merely because it can use a tool.', 'A workflow may contain model judgment while retaining a fixed topology.']],
      ['Cost, latency, and observability', 'Every adaptive turn consumes another model call and introduces another decision that can fail. Budget expected and worst-case turns, record chosen actions and observations, and define a termination test. Compare that design with a workflow that might solve the same problem in fewer, more predictable stages.', ['Track tool calls and tokens per successful task.', 'Record why an agent stopped: success, budget, refusal, error, or escalation.', 'Prefer bounded loops with useful partial output.']],
      ['Failure analysis', 'Over-agentic systems wander, repeat searches, and spend budget without improving evidence. Over-rigid workflows fail when a new observation does not fit the predefined branches. The architectural skill is locating the smallest area where adaptation produces value and surrounding it with predictable contracts.', ['Repeated actions indicate weak state or termination design.', 'A growing list of special-case branches may indicate a genuine agentic search problem.', 'A requirement for strict order or approval favors deterministic orchestration.']],
    ],
    [
      { question: 'A process always extracts, validates, and stores a document in that order. Which pattern is the strongest default?', options: ['Open-ended agent', 'Prompt chain with deterministic gates', 'Coordinator with five specialists', 'Evaluator loop without a rubric'], answer: 1, explanation: 'The stages and order are known, so a chain gives predictable behavior and makes validation gates explicit.' },
      { question: 'What is the best evidence that added autonomy is justified?', options: ['The design uses more model calls', 'The system appears more sophisticated', 'Evaluation shows adaptive decisions improve outcomes enough to offset added cost and variance', 'The prompt asks the model to be autonomous'], answer: 2, explanation: 'Autonomy is an engineering trade-off and should earn its complexity through measured task performance.' },
    ],
  ),
  'd1-3': supplement(
    [
      ['Decompose', 'Split the goal into responsibilities with distinct evidence or expertise, not arbitrary equal-sized pieces.'],
      ['Contract', 'For each specialist, define input facts, constraints, tools, output schema, coverage, and error fields.'],
      ['Execute', 'Run independent specialists together and dependent specialists only after prerequisites arrive.'],
      ['Reconcile', 'The coordinator checks coverage, resolves conflicts from evidence, and owns the final answer or escalation.'],
    ],
    [
      ['Context packets', 'A reliable delegation packet is a miniature specification. It names the objective, the relevant slice of shared state, definitions, authority limits, evidence requirements, and output format. Sending the full parent transcript is often worse than sending a curated packet because irrelevant turns distract the specialist and waste context.', ['Include stable identifiers and current versions.', 'State what the specialist must not do.', 'Require a coverage statement so silence is not mistaken for completeness.']],
      ['Aggregation contracts', 'Specialist results should be easy to merge. A useful result contains findings, supporting evidence, source locations, confidence or uncertainty, attempted work, and unresolved errors. The coordinator can then compare like with like and distinguish conflict from different scopes.', ['Use stable finding IDs or categories.', 'Preserve exact claims rather than only narrative summaries.', 'Carry failure metadata into the final coverage assessment.']],
      ['Failure analysis', 'A coordinator fails when it delegates vague goals, assumes shared context, or blindly concatenates outputs. Specialists fail when responsibilities overlap or their tool access exceeds their role. Re-delegation should occur only because a coverage or quality check identified a specific gap.', ['Do not invoke every specialist for every request.', 'Do not let a specialist silently expand its authority.', 'Do not resolve conflicts by majority vote without examining sources.']],
    ],
    [
      { question: 'Which specialist result is most useful to a coordinator?', options: ['A long reasoning transcript', 'A conclusion with evidence, coverage, uncertainty, and errors', 'Only a confidence percentage', 'A copy of the original task'], answer: 1, explanation: 'Structured findings let the coordinator audit, compare, aggregate, and preserve partial failures.' },
      { question: 'When should the coordinator re-delegate work?', options: ['After every specialist returns', 'Whenever an output is short', 'When an explicit coverage or quality check identifies a gap', 'Only when every specialist fails'], answer: 2, explanation: 'Gap-driven re-delegation is bounded and purposeful; automatic re-delegation can create uncontrolled loops.' },
    ],
  ),
  'd1-4': supplement(
    [
      ['List nodes', 'Represent each lookup, transformation, validation, approval, and action as a task node.'],
      ['Add edges', 'Connect data prerequisites, authorization prerequisites, ordering constraints, and shared resource limits.'],
      ['Schedule waves', 'Run nodes whose incoming edges are satisfied, using bounded concurrency.'],
      ['Join safely', 'Aggregate required results, preserve branch errors, and unlock the next dependent wave.'],
    ],
    [
      ['Dependency graph design', 'Data dependency means one task consumes another result. Authorization dependency means one task proves another is permitted. Ordering dependency may exist because a side effect changes the world. Resource dependency limits concurrency even when data is independent. Labeling the edge explains why serialization exists.', ['Identity verification precedes account actions.', 'A plan may be generated in parallel with unrelated retrieval, but approval precedes execution.', 'Two writes to the same record may require serialization or optimistic concurrency.']],
      ['Parallel result handling', 'For parallel client tool calls, execute only the approved independent subset and return a result for every requested call. A branch can return an error while other branches succeed. The join policy decides whether missing evidence blocks the final result or becomes an explicit coverage gap.', ['Use Promise.allSettled-style behavior when partial results are useful.', 'Correlate each result with the exact tool-use ID.', 'Limit fan-out to protect rate limits and downstream services.']],
      ['Failure analysis', 'The dangerous optimization is parallelizing a check with the action it is meant to authorize. Another common failure is all-or-nothing aggregation that discards useful results because one source failed. The opposite problem—serializing every independent lookup—creates unnecessary latency.', ['Review every edge before removing it for speed.', 'Retry only the failed branch when safe.', 'Cancel downstream work when a hard prerequisite fails.']],
    ],
    [
      { question: 'What type of dependency exists between checking a credit limit and approving a purchase?', options: ['No dependency', 'Only a presentation dependency', 'An authorization and data dependency', 'A caching dependency'], answer: 2, explanation: 'The check supplies both the fact and permission condition required before approval.' },
      { question: 'One of four independent searches times out. What should a robust join do?', options: ['Discard the other three results', 'Pretend the failed search found nothing', 'Preserve successes and report or recover the failed coverage according to policy', 'Repeat all four forever'], answer: 2, explanation: 'Branch-level status preserves useful evidence while keeping the coverage gap visible.' },
    ],
  ),
  'd1-5': supplement(
    [
      ['Classify the rule', 'Decide whether it guides judgment, constrains data shape, grants authority, or validates an outcome.'],
      ['Choose the boundary', 'Place prevention before execution and detection or normalization after execution.'],
      ['Return evidence', 'Make allow, block, and escalation decisions structured and observable.'],
      ['Test bypasses', 'Exercise direct calls, malformed inputs, stale state, concurrency, retries, and alternate workflows.'],
    ],
    [
      ['Layered control model', 'Prompts express desired policy reasoning; schemas constrain request shape; permissions reduce available capabilities; pre-action code validates current authority and state; post-action code audits and normalizes; human review handles exceptions. Strong systems use several layers because each protects a different failure surface.', ['A valid schema can still request an unauthorized action.', 'A permission can allow a tool while application logic denies one specific transaction.', 'A post-action check cannot prevent an irreversible action that already happened.']],
      ['Idempotency and race conditions', 'Consequential tools need more than a threshold check. Use an idempotency key, re-read mutable state at execution time, and record a durable action result. Otherwise a retry or concurrent loop can duplicate a refund even though every individual request looked valid.', ['Bind idempotency to the business operation, not one network attempt.', 'Check current state inside the transaction boundary.', 'Return an existing result when the same operation is replayed.']],
      ['Failure analysis', 'A prompt-only guardrail fails silently when the model is confused or manipulated. A check performed too early can become stale before execution. A block with no machine-readable reason encourages blind retries. Design controls so the system can explain whether to repair input, request approval, or stop.', ['Fail closed for missing authority.', 'Keep user-safe explanations separate from internal diagnostics.', 'Log policy version and evaluated facts.']],
    ],
    [
      { question: 'Why must mutable authorization facts be rechecked near execution?', options: ['To make the prompt longer', 'Because earlier state may be stale when the action runs', 'Because schemas cannot contain numbers', 'To avoid all logging'], answer: 1, explanation: 'Authority, balance, ownership, or status may change between planning and execution.' },
      { question: 'What primarily prevents a duplicated refund after a network retry?', options: ['A polite system prompt', 'An idempotency key and durable operation record', 'A lower temperature', 'A larger model'], answer: 1, explanation: 'Idempotency lets repeated attempts resolve to one business action.' },
    ],
  ),
  'd1-6': supplement(
    [
      ['Checkpoint', 'Persist objective, completed actions, artifacts, exact critical facts, errors, and pending steps.'],
      ['Validate freshness', 'Compare versions, timestamps, commits, or record states with the saved checkpoint.'],
      ['Choose recovery', 'Resume valid work, restart stale discovery from a verified summary, or fork divergent alternatives.'],
      ['Reconcile effects', 'Confirm which side effects completed before issuing any repeated action.'],
    ],
    [
      ['Durable versus ephemeral state', 'Durable state includes commitments, completed side effects, artifact locations, decisions, and exact identifiers. Ephemeral state includes a search result that can change, a file snapshot, or a temporary service response. The manifest should distinguish them and record how to revalidate ephemeral observations.', ['Keep timestamps and source versions.', 'Store exact values separately from narrative summaries.', 'Record the authority under which an action completed.']],
      ['Resume, restart, or fork', 'Resume when inputs and observations remain valid. Restart discovery when the world changed but previous decisions can be summarized safely. Fork when two approaches should be compared independently from one trusted baseline; do not mix both alternatives in one evolving state.', ['A changed repository commit invalidates some code observations.', 'A completed payment must be discovered, not repeated.', 'A fork needs a named baseline and separate outputs.']],
      ['Failure analysis', 'Replaying an old transcript can cause duplicate actions or decisions based on stale facts. An over-aggressive restart wastes valid artifacts and loses auditability. A weak checkpoint says what the agent discussed rather than what was actually done.', ['Test recovery after forced interruption.', 'Make side effects queryable by idempotency key.', 'Verify pending work rather than trusting a summary label.']],
    ],
    [
      { question: 'Which state is most important before retrying an interrupted write?', options: ['The model’s last sentence', 'Whether the side effect already completed', 'The number of tokens used', 'The UI theme'], answer: 1, explanation: 'The system must reconcile the real external state to avoid duplicate or contradictory actions.' },
      { question: 'What makes two branches a true fork?', options: ['They use different wording', 'They independently explore divergent approaches from a named shared baseline', 'They run sequentially', 'They share all mutable context'], answer: 1, explanation: 'A fork isolates alternatives while preserving a common trusted starting point.' },
    ],
  ),
  'd1-7': supplement(
    [
      ['Define done', 'State an observable outcome and the validation that proves it.'],
      ['Allocate authority', 'Specify tools, data, spending, communication, and side effects the agent may use.'],
      ['Set budgets', 'Bound time, cost, iterations, and external requests while preserving partial work.'],
      ['Escalate with state', 'At a checkpoint or blocker, transfer verified facts, evidence, attempts, and recommendation.'],
    ],
    [
      ['Outcome and safety budgets', 'A completion test answers whether the work succeeded; a budget limits how much the system may spend trying. Both are required. A useful agent stops early on success, stops safely on budget exhaustion, and reports which acceptance criteria remain unmet.', ['Use task-specific validation rather than “looks good.”', 'Apply separate limits to expensive or risky tools.', 'Keep enough reserve for synthesis and handoff.']],
      ['Authority gradient', 'Autonomy can be broad for reversible read-only exploration and narrow for messages, writes, spending, or external commitments. Insert checkpoints where the risk profile changes, such as moving from analysis to execution.', ['Require approval at irreversible transitions.', 'Reduce tools after the exploration phase.', 'Let policy exceptions route to a human instead of expanding agent authority.']],
      ['Failure analysis', 'An arbitrary step limit can stop one turn before success or allow many useless repeated steps. A weak handoff forces the human to redo verification. Silent budget exhaustion makes partial output appear complete.', ['Report completion status against each criterion.', 'Include coverage gaps and their consequences.', 'Never label a safety cap as successful completion.']],
    ],
    [
      { question: 'What should happen when the task budget ends before acceptance criteria are met?', options: ['Declare success', 'Hide the partial work', 'Stop safely and report partial results, unmet criteria, and next recommendation', 'Automatically grant more authority'], answer: 2, explanation: 'Budget exhaustion is a controlled stop, not proof of success.' },
      { question: 'Where is the strongest checkpoint in an agent workflow?', options: ['Between two harmless reads', 'At the transition from reversible analysis to consequential action', 'Only after the final answer', 'Before the user request'], answer: 1, explanation: 'Oversight is most valuable where reversibility decreases and consequences rise.' },
    ],
  ),

  'd2-1': supplement(
    [
      ['Inventory intents', 'List the distinct tasks users or agents need and the authority required for each.'],
      ['Draw boundaries', 'Separate read, search, proposal, and consequential action operations.'],
      ['Specify contracts', 'Define names, use/non-use descriptions, schemas, result shapes, errors, and side effects.'],
      ['Test selection', 'Run ambiguous and adversarial prompts, then revise contracts before adding prompt instructions.'],
    ],
    [
      ['Description as routing interface', 'Claude selects tools from the information it sees. The name and description should communicate the operation, prerequisites, side effects, and exclusions. The implementation may be perfect, but the model cannot infer behavior hidden in code.', ['Use action-object names such as get_order_details.', 'State “use when” and “do not use when” boundaries.', 'Mention whether the result is current, cached, partial, or authoritative.']],
      ['Schema and result design', 'Inputs should use domain identifiers and validated formats instead of free-form blobs. Results should be compact and stable, with distinct success, empty, and error variants. Return the facts needed for the next decision rather than an entire backend record.', ['Use required fields only when truly required.', 'Constrain closed choices with enums.', 'Include operation IDs and version data for consequential work.']],
      ['Failure analysis', 'A mega-tool hides permissions and produces ambiguous selection. Tiny overlapping tools make routing arbitrary. Vague fields such as data or options shift validation work into the model. Tool descriptions copied from internal function names usually omit user intent.', ['Split when permissions or side effects differ.', 'Combine when operations are inseparable and share one authority boundary.', 'Observe real misroutes rather than guessing.']],
    ],
    [
      { question: 'Why should request_refund be separate from get_order_details?', options: ['Shorter names', 'They have different side effects and authority requirements', 'The API allows only one field', 'Read tools cannot return JSON'], answer: 1, explanation: 'Separate contracts make selection, permissions, approval, and auditing clearer.' },
      { question: 'Which result is most useful after search_orders finds nothing?', options: ['A generic exception', 'A successful empty result with applied filters', 'A permission error', 'An invented order'], answer: 1, explanation: 'The operation succeeded; the filters and empty set support the next clarification decision.' },
    ],
  ),
  'd2-2': supplement(
    [
      ['Detect', 'Capture the failure at the boundary with the strongest technical evidence.'],
      ['Classify', 'Label success, empty success, validation, permission, policy, transient, or uncertain outcome.'],
      ['Respond', 'Return a stable code, safe message, retryability, attempted operation, and correlation data.'],
      ['Recover', 'Retry, repair, choose an alternative, explain, or escalate according to class and budget.'],
    ],
    [
      ['Error taxonomy', 'Transient means the same valid operation may succeed later. Validation means the request must change. Permission means the caller lacks authority. Business-rule denial means the request is understood but disallowed. Uncertain outcome means a write may have happened even though confirmation failed.', ['Taxonomy should drive code paths, not only display text.', 'Keep an empty list distinct from failure.', 'Add retry-after or backoff hints when known.']],
      ['Safe error payloads', 'The model needs enough detail to recover but not secrets, stack traces, or internal topology. Preserve sensitive diagnostics in logs under a correlation ID, and return a user-safe explanation plus machine fields to the agent.', ['Include which input field failed validation.', 'State whether retry is safe.', 'Preserve the business operation ID for reconciliation.']],
      ['Failure analysis', 'Blind retries amplify permanent errors and can duplicate uncertain writes. Generic “failed” messages force the agent to guess. Marking zero matches as error causes needless retries; marking an unavailable source as zero matches creates false certainty.', ['Use bounded exponential backoff for transient dependencies.', 'Reconcile uncertain writes before retrying.', 'Alert on repeated codes and exhausted budgets.']],
    ],
    [
      { question: 'A create operation times out after sending the request. What is the first safe recovery?', options: ['Send it again immediately', 'Query by idempotency or operation ID to learn whether it completed', 'Tell the model it definitely failed', 'Change the schema'], answer: 1, explanation: 'The outcome is uncertain; reconciliation prevents a duplicate side effect.' },
      { question: 'Which field most directly tells an automated agent whether another attempt is sensible?', options: ['Font size', 'isRetryable or an equivalent recovery classification', 'The raw stack trace', 'The user’s name'], answer: 1, explanation: 'A machine-actionable retry classification routes the failure without exposing internal diagnostics.' },
    ],
  ),
  'd2-3': supplement(
    [
      ['Define the stage', 'Decide whether a direct answer is valid or a structured action is mandatory.'],
      ['Limit the set', 'Supply only tools relevant to the current role, phase, and authority.'],
      ['Choose selection', 'Use auto, any, forced named tool, or none to encode the stage contract.'],
      ['Authorize execution', 'Validate identity, policy, and current state after the model proposes a call.'],
    ],
    [
      ['Selection versus execution', 'tool_choice changes what the model must emit, not what the application must execute. A forced call can still contain a transaction that violates policy. Treat every generated input as an untrusted proposal and run the same validation as any other client request.', ['Selection is a model-output constraint.', 'Authorization is an application decision.', 'Strict schemas guarantee shape, not permission or truth.']],
      ['Phase-based least privilege', 'A workflow can shrink and expand its tool set by phase. An intake stage may expose only extraction; analysis may expose read tools; an approved execution stage may temporarily expose one write tool. Smaller sets improve selection and reduce risk.', ['Do not give every specialist the union of all tools.', 'Remove write tools after their approved use.', 'Log the active capability set with each decision.']],
      ['Failure analysis', 'Prompting “always call X” is weaker than a forced selection contract. Conversely, forcing a tool when a direct answer is legitimate creates unnecessary calls. Supplying a tool without runtime permission checks confuses visibility with authority.', ['Use forced choice for protocol requirements.', 'Use auto for optional retrieval or calculation.', 'Test unsupported combinations with other model features.']],
    ],
    [
      { question: 'A forced tool call requests an unauthorized account update. What should happen?', options: ['Execute because the call was forced', 'Application authorization should reject it', 'Change it into a read automatically', 'Hide the result'], answer: 1, explanation: 'Forced selection constrains model output; it never grants business authority.' },
      { question: 'Why reduce the tool list by workflow phase?', options: ['To make tools slower', 'To improve selection clarity and least privilege', 'To remove all schemas', 'To avoid logging'], answer: 1, explanation: 'A smaller relevant set reduces ambiguity and prevents unnecessary capability exposure.' },
    ],
  ),
  'd2-4': supplement(
    [
      ['Identify ownership', 'Decide whether the model, application, or user should initiate the capability.'],
      ['Choose primitive', 'Map model operations to tools, app-provided content to resources, and user templates to prompts.'],
      ['Negotiate', 'The host and server initialize capabilities and discover what each supports.'],
      ['Apply policy', 'The host controls context, consent, credentials, and presentation around server capabilities.'],
    ],
    [
      ['Host, client, and server', 'The host is the user-facing application. It creates MCP clients that maintain connections to servers. A server publishes capability metadata and handles protocol requests. This separation allows one host to combine several servers without giving any server control of the whole application.', ['The server cannot assume the host will expose every capability to the model.', 'The host owns user consent and context assembly.', 'Capability negotiation prevents unsupported requests.']],
      ['Primitive lifecycle', 'Tools are listed and called; resources are listed or addressed and read; prompts are listed and retrieved with arguments. Notifications can tell clients that catalogs changed. Current MCP revisions also add cache guidance and evolve authorization, so integrations should target a declared protocol revision rather than vague “MCP support.”', ['Validate every resource URI and tool input.', 'Treat annotations as hints, not security enforcement.', 'Keep authorization at both transport and business-operation layers.']],
      ['Failure analysis', 'Using an action tool as a content catalog wastes calls and grants unnecessary control. Treating a resource as an operation hides side effects. Assuming a server’s readOnly or destructive annotation enforces behavior is unsafe; the host must still apply policy.', ['Use resources for discoverable read-only content.', 'Use tools when fresh execution or action is required.', 'Make side effects explicit in descriptions and host UI.']],
    ],
    [
      { question: 'Who ultimately decides whether an MCP tool is exposed or approved?', options: ['The tool description alone', 'The host application', 'The resource URI', 'The model provider automatically'], answer: 1, explanation: 'The host mediates server capabilities, user consent, context, and permissions.' },
      { question: 'What do read-only or destructive annotations provide?', options: ['A cryptographic guarantee', 'Behavioral hints that hosts should verify and enforce with policy', 'Automatic authentication', 'A replacement for tool schemas'], answer: 1, explanation: 'Annotations communicate risk vocabulary but do not themselves enforce server behavior.' },
    ],
  ),
  'd2-5': supplement(
    [
      ['Select scope', 'Place shared safe configuration in the project and personal experiments in local or user scope.'],
      ['Inject secrets', 'Reference environment variables or approved secret stores without committing their values.'],
      ['Narrow access', 'Expose only needed servers, tools, directories, and operations.'],
      ['Discover surgically', 'Search paths, then contents, then read the smallest relevant file set.'],
    ],
    [
      ['Configuration trust boundary', 'A committed configuration is executable team input. Review server package source, command, transport, update policy, data destinations, and requested credentials. Pin or govern versions where supply-chain risk matters.', ['Do not auto-trust configuration from an unreviewed repository.', 'Document which data each server can read or transmit.', 'Separate development and production credentials.']],
      ['Targeted repository exploration', 'Use filename patterns when you know the artifact type, content search when you know a symbol or string, and file reads only after narrowing candidates. Then follow definitions, callers, tests, and configuration as the question demands.', ['Glob answers “where might it be?”', 'Grep answers “where is this referenced?”', 'Read answers “what does this relevant file actually do?”']],
      ['Failure analysis', 'Broad repository reads consume context and surface irrelevant examples. Secrets in project configuration leak through source control. A shared server with excessive write authority expands every connected agent’s risk surface.', ['Begin with a concrete discovery question.', 'Keep tokens and credentials out of logs and prompts.', 'Audit server capability changes after upgrades.']],
    ],
    [
      { question: 'You need to find every call to processRefund. What is the best first file operation?', options: ['Read every file', 'Search file contents for the symbol', 'Rewrite the repository index', 'Run the refund tool'], answer: 1, explanation: 'Content search narrows the candidate files before targeted reading.' },
      { question: 'Why review the command behind a shared MCP server?', options: ['Because configuration is executable and can access data or credentials', 'Only to improve formatting', 'Because servers cannot use networks', 'To make prompts longer'], answer: 0, explanation: 'The command and package are part of the trust and supply-chain boundary.' },
    ],
  ),
  'd3-1': supplement(
    [
      ['Name the owner', 'Identify whether the organization, repository team, one developer, or one checkout owns the setting.'],
      ['Choose the audience', 'Determine who should inherit the behavior and where it must travel.'],
      ['Place the setting', 'Use managed, project, user, or local scope without duplicating the same rule unnecessarily.'],
      ['Verify precedence', 'Test the effective configuration and document where important behavior comes from.'],
    ],
    [
      ['Scope model', 'Managed scope enforces organization policy. Project scope travels with version control. User scope follows one person across projects. Local scope applies to one person in one checkout and is normally ignored by Git. Scope is therefore both a distribution mechanism and an ownership statement.', ['Use managed scope for genuine non-overridable controls.', 'Use project scope for shared commands and architecture.', 'Use local scope for machine-specific paths or experiments.']],
      ['Conflict and precedence', 'Configuration becomes difficult to reason about when the same behavior is described in several scopes. Higher-priority policy may override broader defaults, but teams should not rely on obscure precedence to resolve contradictory intent. Remove duplication and make the authoritative owner obvious.', ['Inspect the effective setting when behavior surprises you.', 'Keep personal style preferences away from team rules.', 'Treat repository configuration as reviewed code.']],
      ['Failure analysis', 'Putting team standards in user scope makes behavior inconsistent across contributors. Committing local paths breaks other machines. Storing secrets in any tracked scope creates exposure. Overusing managed policy prevents legitimate project variation.', ['Classify owner before choosing a file.', 'Use environment or secret stores for credentials.', 'Review changes that widen permissions.']],
    ],
    [
      { question: 'A compiler command is specific to one repository and required for every contributor. Which owner and scope fit?', options: ['Individual owner, user scope', 'Team owner, project scope', 'One checkout, local scope', 'Organization owner, always managed scope'], answer: 1, explanation: 'The repository team owns the command and every clone should receive it.' },
      { question: 'What is the clearest response to contradictory settings across scopes?', options: ['Add another copy', 'Remove duplication and keep one authoritative owner where possible', 'Ignore the effective behavior', 'Commit personal preferences'], answer: 1, explanation: 'One clear source reduces surprising precedence and maintenance drift.' },
    ],
  ),
  'd3-2': supplement(
    [
      ['Inventory instructions', 'Collect current commands, boundaries, conventions, and path-specific rules.'],
      ['Classify relevance', 'Separate repository-wide facts from material that matters only for matching paths or tasks.'],
      ['Modularize', 'Keep a concise root operating card and move conditional detail into scoped rules or skills.'],
      ['Test retrieval', 'Open representative tasks and confirm the right guidance appears without contradictory noise.'],
    ],
    [
      ['Writing effective CLAUDE.md content', 'Prefer concrete commands, repository topology, architectural boundaries, generated-file rules, and validation expectations. Explain non-obvious constraints briefly. Avoid general software advice the model already knows and long historical narratives that do not affect decisions.', ['Give exact build and test commands.', 'Name protected or generated paths.', 'Describe component ownership and allowed dependencies.']],
      ['Path-rule design', 'A path rule should have a precise file pattern and only the instructions needed when those files are active. Rules can encode API error conventions, database migration policy, UI accessibility requirements, or test structure without burdening unrelated tasks.', ['Check glob coverage against real paths.', 'Avoid overlapping rules that disagree.', 'Keep universal requirements at the project root.']],
      ['Failure analysis', 'A giant always-on file dilutes important constraints and becomes stale. A rule with a broad glob loads everywhere and recreates the same problem. Duplicated guidance diverges over time and makes it unclear which instruction wins.', ['Audit instructions after architecture changes.', 'Delete copied framework manuals.', 'Use skills for large playbooks loaded on demand.']],
    ],
    [
      { question: 'Where should a detailed release playbook used only during releases live?', options: ['Repeated in every path rule', 'A reusable on-demand skill', 'An API key file', 'Every source file header'], answer: 1, explanation: 'A task-specific playbook should load when the release workflow is invoked, not on every task.' },
      { question: 'What is a sign that a path rule is too broad?', options: ['It loads only for its intended directory', 'It appears during unrelated work and consumes context', 'It contains an exact glob', 'It has a short title'], answer: 1, explanation: 'Conditional guidance should not load when it cannot affect the task.' },
    ],
  ),
  'd3-3': supplement(
    [
      ['Identify repetition', 'Find a knowledge-rich workflow repeated across tasks or repositories.'],
      ['Define triggers', 'Write a description that states the task, inputs, and situations where the skill should load.'],
      ['Package procedure', 'Add concise instructions, required references, reusable assets, and deterministic scripts.'],
      ['Validate use', 'Test explicit invocation, natural-language matching, tool restrictions, and output quality.'],
    ],
    [
      ['Skill anatomy', 'A skill’s main instruction file is the authoritative operating procedure. References provide domain detail, scripts handle repeatable mechanics, and assets provide templates or examples. Progressive loading keeps large supporting material out of context until it is actually needed.', ['Keep the main workflow clear and complete.', 'Route to specific references rather than loading a whole library.', 'Prefer supplied scripts over retyping fragile commands.']],
      ['Trigger and boundary design', 'A description is not marketing copy; it is a routing rule. State what the skill does, which user intents should invoke it, and important exclusions. Tool restrictions and isolated execution can reduce risk or keep verbose work outside the main context.', ['Use concrete task nouns and outcomes.', 'Separate adjacent skills with clear non-overlap.', 'Keep universal policy outside task-specific skills.']],
      ['Failure analysis', 'A vague description prevents reliable discovery. A huge skill loads excessive content. A skill used as a hard guardrail remains probabilistic. Embedded secrets make the package unsafe to share.', ['Test false-positive and false-negative invocation cases.', 'Version reusable templates and scripts.', 'Use permissions or hooks for absolute restrictions.']],
    ],
    [
      { question: 'What makes a skill description operationally important?', options: ['It controls font styling', 'It helps determine when the skill should be loaded', 'It encrypts assets', 'It replaces all project instructions'], answer: 1, explanation: 'Matching depends on a clear description of capability and trigger intent.' },
      { question: 'Which content should usually become a script inside a skill?', options: ['A subjective architectural trade-off', 'A repeatable deterministic transformation', 'A secret token', 'Every user conversation'], answer: 1, explanation: 'Deterministic mechanics are more reliable and reusable as scripts.' },
    ],
  ),
  'd3-4': supplement(
    [
      ['Separate concerns', 'Identify whether the need is isolated reasoning, capability control, or lifecycle automation.'],
      ['Configure minimums', 'Give subagents focused context and tools; define permissions at the narrowest useful level.'],
      ['Intercept', 'Use pre-tool hooks for prevention and post-tool hooks for validation, formatting, or feedback.'],
      ['Exercise controls', 'Test allowed, denied, malformed, and bypass attempts plus hook failure behavior.'],
    ],
    [
      ['Subagent contract', 'A subagent definition should state role, goal, allowed tools, expected output, and limits. The isolated context reduces contamination from unrelated work, but the parent must send all required facts. The returned summary should be compact enough for the parent to act on.', ['Use read-only tools for exploration specialists.', 'Give implementation specialists only their assigned surface.', 'Keep final integration accountability with the parent.']],
      ['Hook lifecycle', 'Pre-tool hooks can inspect a proposed operation and block before execution. Post-tool hooks observe a successful operation and may lint, normalize, record, or return actionable feedback. Hooks fire predictably at the lifecycle point, but any embedded language-model judgment remains probabilistic.', ['Use deterministic code for hard path or command restrictions.', 'Design timeouts and failures so a broken hook does not create silent unsafe behavior.', 'Log hook decisions with enough context to debug.']],
      ['Failure analysis', 'A post-tool hook is too late to prevent deletion. A prompt reminder is not a permission boundary. An overpowered subagent defeats the benefit of isolation. A blocking hook that produces vague errors can trap the workflow in repeated attempts.', ['Match prevention to pre-action interception.', 'Return precise remediation when blocking.', 'Review tool inheritance instead of assuming it.']],
    ],
    [
      { question: 'A formatter should run after every successful file edit. Which mechanism fits?', options: ['A PostToolUse hook', 'A new autonomous agent', 'A user-scope secret', 'A resource catalog'], answer: 0, explanation: 'Post-action automation is the natural place to format or lint completed edits.' },
      { question: 'What does context isolation not guarantee?', options: ['The specialist starts with focused context', 'The specialist has only the intended permissions', 'Unrelated conversation is omitted', 'The parent must pass necessary facts'], answer: 1, explanation: 'Tool permissions must be configured explicitly; isolation alone does not enforce least privilege.' },
    ],
  ),
  'd3-5': supplement(
    [
      ['Assess uncertainty', 'Estimate unknown dependencies, architectural choices, reversibility, and blast radius.'],
      ['Explore', 'Read the smallest relevant surface and identify constraints before proposing changes.'],
      ['Plan decisions', 'State approach, alternatives, affected components, migration order, and validation.'],
      ['Execute incrementally', 'Apply reversible slices, run evidence-producing checks, and revise from real failures.'],
    ],
    [
      ['A useful plan', 'A plan is a sequence of decisions and verification points, not a restatement of the request. It identifies dependencies, interfaces, risks, rollback points, and the test that proves each milestone. The detail should match the uncertainty: a one-line fix may need no formal plan.', ['Name files or components only after evidence supports them.', 'Separate design decisions from mechanical steps.', 'Identify where user approval changes the path.']],
      ['Iterative delivery', 'Implement a coherent slice that keeps the system runnable, then test it. Tests, examples, type errors, logs, and observed behavior are feedback. Update the remaining plan when evidence invalidates an assumption instead of following stale steps mechanically.', ['Prefer migrations that support old and new paths temporarily when needed.', 'Run narrow checks early and broad checks before completion.', 'Preserve unrelated user changes in a dirty worktree.']],
      ['Failure analysis', 'Premature editing creates rework when dependencies are misunderstood. Endless planning delays simple reversible work. A plan that omits validation cannot distinguish completion from changed files.', ['Plan decisions with material trade-offs.', 'Execute once the next safe action is clear.', 'Treat failing checks as information, not an inconvenience to bypass.']],
    ],
    [
      { question: 'Which item makes a plan verifiable?', options: ['More adjectives', 'An observable acceptance check for each milestone', 'A promise to be careful', 'The longest possible file list'], answer: 1, explanation: 'Acceptance checks connect planned actions to evidence of success.' },
      { question: 'A test reveals a dependency the plan missed. What should happen?', options: ['Ignore the test', 'Continue the stale plan', 'Update the plan and implementation based on the new evidence', 'Delete the dependency'], answer: 2, explanation: 'Plans guide work but must adapt when concrete evidence changes the model of the system.' },
    ],
  ),
  'd3-6': supplement(
    [
      ['Define the gate', 'Specify the categories, severity policy, evidence standard, and machine action.'],
      ['Assemble context', 'Provide the diff, relevant surrounding code, project rules, and known prior findings.'],
      ['Run headlessly', 'Invoke non-interactively with a schema-constrained result and explicit limits.'],
      ['Post-process', 'Validate, deduplicate, record, and apply deterministic CI policy to findings.'],
    ],
    [
      ['Automation contract', 'A CI invocation must have predictable inputs, bounded runtime, structured outputs, and meaningful failure behavior. Include stable repository instructions in version control and pass only the code context needed to judge the diff.', ['Use a schema with location, category, severity, evidence, and remediation.', 'Make no-finding output explicit and valid.', 'Record model, prompt, and schema versions for comparison.']],
      ['Independent review', 'Generation and review should not share one self-justifying context when independence matters. A separate review pass examines the actual diff against a rubric. For large changes, local file passes find detailed issues and an integration pass checks cross-file behavior.', ['Require concrete code evidence for each finding.', 'Deduplicate with stable fingerprints.', 'Calibrate blocking categories before enforcing them.']],
      ['Failure analysis', 'Interactive commands hang automation. Free-form output breaks parsers. Broad “find all bugs” prompts create low-precision noise. Letting a model directly determine build failure without policy and calibration produces unstable gates.', ['Separate model judgment from CI enforcement.', 'Handle timeouts and invalid output explicitly.', 'Track false positives and developer overrides.']],
    ],
    [
      { question: 'Who should decide whether a structured finding fails the build?', options: ['Unparsed model prose', 'Deterministic CI policy applied to validated findings', 'The operating system clock', 'The code-generation session alone'], answer: 1, explanation: 'The model supplies evidence-backed findings; explicit policy determines the machine consequence.' },
      { question: 'Why include previous findings in a review job?', options: ['To increase token use', 'To support deduplication and avoid reposting the same issue', 'To hide the new diff', 'To replace evidence'], answer: 1, explanation: 'Known finding identities let the workflow distinguish new, changed, and repeated results.' },
    ],
  ),

  'd4-1': supplement(
    [
      ['Define success', 'Translate the business outcome into observable criteria, unacceptable failures, and latency or cost limits.'],
      ['Build the set', 'Collect representative, difficult, ambiguous, and adversarial cases with labels or a scoring rubric.'],
      ['Run a baseline', 'Evaluate the current prompt and record results by task segment before changing anything.'],
      ['Compare and release', 'Test one revision on the same set, inspect regressions, and apply thresholds chosen in advance.'],
    ],
    [
      ['Evaluation architecture', 'An evaluation has a task dataset, a versioned system under test, one or more graders, and an analysis layer. Exact-match or deterministic checks fit objective properties; rubric-based model or human graders fit open-ended quality. A production decision should combine the relevant signals rather than collapse everything into one vague score.', ['Separate must-pass safety criteria from quality preferences.', 'Keep a holdout set that prompt authors do not tune against.', 'Record prompt, model, tools, schema, and grader versions with every run.']],
      ['Metrics and segmentation', 'Choose metrics from the cost of each error. Precision matters when false alarms waste scarce review time; recall matters when missed cases are dangerous. Segment results by input type, language, source quality, risk, or workflow stage so a high average cannot hide a weak minority case.', ['Report counts and confidence intervals when sample size matters.', 'Inspect individual failures as well as aggregate metrics.', 'Add newly discovered production failures to a regression set.']],
      ['Failure analysis', 'Changing prompts while changing the test set makes comparisons meaningless. Tuning repeatedly on the holdout leaks the answer and overstates performance. A model grader without a precise rubric may reward persuasive writing instead of correct behavior.', ['Freeze the comparison set during an experiment.', 'Calibrate subjective graders against human judgments.', 'Do not choose release thresholds after seeing the preferred result.']],
    ],
    [
      { question: 'A revision improves average score but doubles failures on high-value transactions. What is the correct conclusion?', options: ['Ship because the average rose', 'Inspect the high-risk segment and apply its release criterion', 'Remove the high-value cases', 'Average the two prompt versions'], answer: 1, explanation: 'Consequential segments need their own acceptance criteria; an aggregate gain cannot erase a dangerous regression.' },
      { question: 'Why keep a holdout evaluation set?', options: ['To make prompts longer', 'To estimate performance on cases not used during prompt tuning', 'To replace production monitoring', 'To eliminate the need for labels'], answer: 1, explanation: 'A holdout helps reveal overfitting to the examples repeatedly used during development.' },
    ],
  ),
  'd4-2': supplement(
    [
      ['Name the decision', 'State the exact classification, extraction, ranking, or writing choice the model must make.'],
      ['Write criteria', 'Define required evidence, exclusions, priorities, tie-breakers, and uncertainty behavior in concrete language.'],
      ['Select examples', 'Choose a small set of positive, negative, boundary, and edge cases that each teach a distinct rule.'],
      ['Test transfer', 'Evaluate on unseen cases and revise criteria when the model copies surface form instead of the underlying distinction.'],
    ],
    [
      ['Criteria before examples', 'Examples work best when they instantiate an explicit rule. Define the decision boundary first, then select examples on both sides of it. Include the reason for a label when the distinction depends on evidence or policy rather than obvious wording.', ['State which evidence outranks other signals.', 'Define what is out of scope as carefully as what is included.', 'Specify how to respond when evidence is insufficient.']],
      ['Example design', 'A useful set is diverse in irrelevant surface features and concentrated around meaningful boundaries. Negative examples prevent over-triggering; counterexamples break shortcuts such as equating angry tone with severity. The demonstrated answer should match the exact production format.', ['Vary names, wording, length, and order when those features should not matter.', 'Avoid examples that all share an accidental cue.', 'Use the fewest examples that cover distinct failure modes.']],
      ['Failure analysis', 'Contradictory examples silently teach an unstable rule. Too many near-duplicates consume context and encourage pattern imitation. Examples copied from evaluation cases contaminate the measurement and make progress appear larger than it is.', ['Review labels and rationales for consistency.', 'Keep training examples separate from held-out tests.', 'Remove an example when it adds no new boundary information.']],
    ],
    [
      { question: 'A classifier treats every message containing “urgent” as high risk. What example best corrects the shortcut?', options: ['Another high-risk message saying urgent', 'A routine low-risk message saying urgent and a high-risk calm message', 'Ten identical positive examples', 'An example with no label'], answer: 1, explanation: 'Counterexamples show that tone is not the criterion and redirect attention to the actual risk evidence.' },
      { question: 'What should remain separate from few-shot examples used to tune the prompt?', options: ['The output format', 'The held-out evaluation cases', 'The decision criteria', 'Negative examples'], answer: 1, explanation: 'A held-out set must remain unseen during tuning to provide a less biased estimate of generalization.' },
    ],
  ),
  'd4-3': supplement(
    [
      ['Choose the consumer', 'Identify whether downstream code needs a data object or valid arguments for a specific operation.'],
      ['Design the schema', 'Encode types, required fields, enums, bounds, nesting, and honest absence from real domain cases.'],
      ['Constrain generation', 'Use schema-constrained output or strict tool use instead of asking for JSON only in prose.'],
      ['Validate meaning', 'After parsing, check evidence, cross-field invariants, authorization, and business rules.'],
    ],
    [
      ['Two structured contracts', 'Use JSON structured output when Claude’s answer itself is the data consumed by a pipeline. Use strict tool definitions when the desired product is a valid call to an application operation. Requiring a schema does not by itself require a tool call; tool choice and argument validity are separate controls.', ['Put response schemas in the supported output-format configuration.', 'Use strict tool schemas for operation arguments.', 'Choose optional, automatic, or required tool use deliberately.']],
      ['Schema design for evolution', 'Model legitimate variants explicitly and keep the contract small enough for consumers to understand. Version incompatible changes, prefer stable identifiers over display text, and make absence distinct from an empty value. The schema should reflect domain truth rather than convenience for one example.', ['Use enums only for genuinely closed vocabularies.', 'Add nullable or status fields where sources can omit information.', 'Avoid exposing secrets in schema names or enumerated values.']],
      ['Failure analysis', 'A perfectly valid object can contain an invented invoice number, inconsistent totals, or an unauthorized instruction. An overly rigid schema can pressure the model to fabricate required values. A free-form JSON request can still produce fences, commentary, or malformed syntax.', ['Treat structural validation as the first gate, not the last.', 'Preserve source evidence for consequential fields.', 'Reject or review semantically invalid values even when parsing succeeds.']],
    ],
    [
      { question: 'Claude must call create_ticket with validated arguments. Which contract best fits?', options: ['Free-form prose requesting JSON', 'A strict tool schema for create_ticket', 'A Markdown table', 'A larger context window'], answer: 1, explanation: 'Strict tool use constrains the arguments to the application operation; authorization and semantic checks still remain in code.' },
      { question: 'Why might a required string field cause hallucination?', options: ['Strings cannot be validated', 'The source may legitimately omit the value while the schema forbids absence', 'JSON cannot contain null', 'Tools always invent strings'], answer: 1, explanation: 'A contract that cannot represent missing data pressures generation toward an unsupported value.' },
    ],
  ),
  'd4-4': supplement(
    [
      ['Enumerate source states', 'List present, absent, not applicable, ambiguous, conflicting, and unrecognized values that occur in real input.'],
      ['Model each state', 'Use nullable fields, explicit status tags, candidate lists, and other-plus-detail patterns as appropriate.'],
      ['Attach evidence', 'Keep source locations or excerpts with important values and separate them from confidence.'],
      ['Define routing', 'Specify what downstream code does for each uncertainty state instead of treating them all as failure.'],
    ],
    [
      ['Uncertainty as a tagged state', 'A value and its epistemic status are different fields. A record may have a verified value, no source evidence, multiple candidates, or a source conflict. A tagged union makes these states mutually understandable to code and prevents null from carrying several incompatible meanings.', ['Use distinct states for missing and not applicable.', 'Store candidates when ambiguity itself matters.', 'Require a reason or evidence reference for unresolved states.']],
      ['Closed and open vocabularies', 'Enums provide strong downstream behavior when the category set is genuinely closed. When new categories are possible, include an other state plus original text rather than rejecting or silently remapping them. Normalize only when a defensible mapping exists.', ['Preserve raw labels for audit and later taxonomy updates.', 'Do not turn every rare value into other by default.', 'Version taxonomy changes that alter routing.']],
      ['Failure analysis', 'Using empty string, null, and unknown interchangeably destroys meaning. A confidence number without calibration or evidence can look precise while conveying little. Forcing one candidate from conflicting evidence hides the very condition that should trigger review.', ['Test contradictory and sparse source documents.', 'Make consumers handle every tagged state.', 'Never use confidence alone to overwrite source conflict.']],
    ],
    [
      { question: 'A field does not apply to this document type. How should it differ from a missing expected field?', options: ['It should not differ', 'Use distinct not-applicable and missing states', 'Invent a default', 'Use the same empty string'], answer: 1, explanation: 'The states imply different data quality and downstream actions, so the schema should preserve the distinction.' },
      { question: 'When is an enum the strongest choice?', options: ['Whenever any future value is possible', 'When the domain is closed and consumers need known categories', 'When source text must be preserved exactly', 'To represent arbitrary explanations'], answer: 1, explanation: 'Enums work when the allowed set is genuinely bounded; extensible domains need an escape hatch with raw detail.' },
    ],
  ),
  'd4-5': supplement(
    [
      ['Parse and classify', 'First confirm structural validity, then classify each semantic failure by rule and affected field.'],
      ['Find the resolver', 'Decide whether deterministic code, another retrieval, a focused model repair, or human review can supply new information.'],
      ['Retry narrowly', 'Return the exact failed rule and relevant source evidence, preserve prior attempts, and cap the repair budget.'],
      ['Record the outcome', 'Store whether repair succeeded, remained inconsistent, lacked evidence, or required escalation.'],
    ],
    [
      ['Semantic invariant layer', 'Business validators test relationships a schema cannot express reliably: line items plus tax equal total, end follows start, identifiers are unique, and state transitions are allowed. Keep deterministic calculations in code and emit structured violations that name the values and rule.', ['Run invariants after every generated or repaired result.', 'Distinguish warnings from blocking violations.', 'Keep validators versioned with the domain policy.']],
      ['Retry decision tree', 'A retry is useful only if it changes the information or guidance available. Formatting or field-selection mistakes may respond to focused feedback. Missing source data requires retrieval or an honest missing state. Contradictory authoritative evidence may require policy or human judgment.', ['Retry transient service failures separately from content repair.', 'Do not resend the same prompt unchanged.', 'Stop after a bounded number of non-improving attempts.']],
      ['Failure analysis', 'Blind retries increase cost while reproducing the same error. Letting the model perform arithmetic that code can verify adds unnecessary uncertainty. Returning only the final repaired object erases the original failure and prevents diagnosis.', ['Preserve the attempt chain and validator messages.', 'Measure repair success by error class.', 'Escalate unresolved high-impact violations with evidence.']],
    ],
    [
      { question: 'A date range has end before start, although both dates are visible. What is the best repair input?', options: ['The same prompt with no feedback', 'The source plus the exact failed chronological rule and extracted values', 'A request to be more confident', 'No original evidence'], answer: 1, explanation: 'Focused feedback gives the model a correctable interpretation problem and preserves the evidence needed to reconsider it.' },
      { question: 'Three identical retries return the same semantic error. What should the system do?', options: ['Retry forever', 'Stop and route according to the error class and impact', 'Delete the validator', 'Accept the object because it is valid JSON'], answer: 1, explanation: 'Repeated non-improvement shows the retry lacks a correction mechanism; safe routing is preferable to an unbounded loop.' },
    ],
  ),
  'd4-6': supplement(
    [
      ['Characterize the workload', 'Measure item count, latency tolerance, independence, input size, and acceptable partial-failure behavior.'],
      ['Create requests', 'Assign stable custom IDs and record prompt, model, schema, dataset, and source versions.'],
      ['Process asynchronously', 'Submit independent items, poll or retrieve completion, and handle every result by its ID.'],
      ['Recover selectively', 'Resubmit only transient or repairable failures and reconcile results into a coverage report.'],
    ],
    [
      ['Batch operating model', 'Message batches trade immediate response for high-throughput asynchronous processing. Every request remains logically independent, so order should not carry meaning. The caller must persist correlation metadata and tolerate mixed success instead of treating the batch as one atomic call.', ['Use stable custom IDs that map back to source records.', 'Store submission and retrieval status durably.', 'Plan around the service’s current processing and retention limits.']],
      ['Focused multi-pass review', 'Large artifacts benefit from separate passes with narrow rubrics: local correctness, security, policy, and cross-file integration. Independence reduces attention competition, while a final deterministic or model-assisted reconciliation stage deduplicates findings and verifies evidence.', ['Give each pass only the context needed for its question.', 'Use stable finding fingerprints across passes.', 'Distinguish file-level evidence from system-level consequences.']],
      ['Failure analysis', 'Batch is a poor fit for a user waiting on the response or a blocking deployment gate. Losing ID mappings makes correct results unusable. Re-running an entire large batch because a small subset failed wastes time and cost.', ['Design per-item terminal states before submission.', 'Keep partial successes even when the batch is incomplete.', 'Do not assume result order matches request order.']],
    ],
    [
      { question: 'Why must batch items have stable custom IDs?', options: ['To make prose more persuasive', 'To correlate asynchronous results and recover failed items selectively', 'To force ordered completion', 'To eliminate schemas'], answer: 1, explanation: 'Stable IDs connect each result to its source, configuration, and retry history regardless of completion order.' },
      { question: 'What is the main benefit of separate review passes?', options: ['They guarantee perfection', 'Each pass can focus on a narrow rubric without competing concerns', 'They make evidence unnecessary', 'They convert every task into batch processing'], answer: 1, explanation: 'Focused passes improve attention and allow quality to be measured by category, though reconciliation is still required.' },
    ],
  ),

  'd5-1': supplement(
    [
      ['Map decisions', 'List the present and likely next decisions, then identify the facts each one requires.'],
      ['Normalize evidence', 'Transform verbose tool results into compact typed records with exact critical values and provenance.'],
      ['Externalize detail', 'Store large recoverable artifacts outside the active prompt and retain references for targeted retrieval.'],
      ['Refresh deliberately', 'Drop stale observations and re-fetch data when freshness affects the next decision.'],
    ],
    [
      ['Context layers', 'A useful working set separates stable instructions, durable task state, current evidence, recent interaction, and external artifacts. Stable material changes rarely; evidence can expire; durable state records commitments and completed effects. Treating all tokens as an undifferentiated transcript makes pruning unsafe.', ['Keep policy and task state clearly labeled.', 'Attach timestamps and versions to mutable evidence.', 'Place bulky source material behind retrievable references.']],
      ['Tool-boundary normalization', 'Tool adapters should return the smallest complete decision record rather than dumping backend responses. Keep exact identifiers, values, status, provenance, and error variants. Summarize or omit unrelated metadata while preserving a route to the original.', ['Design result shapes around the next decision.', 'Keep empty results distinct from errors.', 'Truncate repeated text only with an explicit marker.']],
      ['Failure analysis', 'More context can reduce quality by burying instructions and relevant evidence. Aggressive summarization can change exact amounts or erase exceptions. Stale facts become dangerous when they still look authoritative after the external state changes.', ['Protect exact consequential fields from narrative compression.', 'Evict redundant and recoverable content first.', 'Measure context growth and retrieval success in long tasks.']],
    ],
    [
      { question: 'A tool returns a 200 KB customer record, but eligibility needs six fields. What should enter active context?', options: ['The entire response', 'A typed six-field record plus source ID and freshness metadata', 'Only the customer name', 'A prose claim with no provenance'], answer: 1, explanation: 'The compact record preserves decision-critical facts and a path to verify or reacquire detail.' },
      { question: 'Which information should be removed first under context pressure?', options: ['An exact approved refund amount', 'Repeated recoverable tool output unrelated to the next decisions', 'The current policy version', 'A pending external commitment'], answer: 1, explanation: 'Redundant, recoverable detail is safer to evict than exact commitments or authoritative state.' },
    ],
  ),
  'd5-2': supplement(
    [
      ['Design the checkpoint', 'Define exact fields for objectives, decisions, evidence references, completed effects, errors, and pending work.'],
      ['Isolate noisy work', 'Move verbose searches or artifact analysis into focused workers and return compact evidence-backed findings.'],
      ['Compact safely', 'Summarize redundant history while preserving the checkpoint and the latest authoritative facts.'],
      ['Test recovery', 'Start a fresh context from the checkpoint and verify it can continue without inventing missing state.'],
    ],
    [
      ['Compaction contract', 'Compaction should produce a structured continuation record, not merely a shorter story. Preserve exact identifiers, numbers, dates, decisions, source mappings, side effects, unresolved ambiguity, and the next validation step. Narrative rationale can be compressed more aggressively when evidence remains retrievable.', ['Record what is known separately from what is inferred.', 'Mark which observations may now be stale.', 'Include the last verified external state.']],
      ['Context editing and caching', 'Context editing can clear or replace older tool results as a session grows, while application state preserves what matters. Prompt caching can reduce repeated-input cost and latency, but cached tokens still occupy the context window; it is not a substitute for pruning or compaction.', ['Protect recent and decision-critical tool results.', 'Clear large obsolete outputs before stable instructions.', 'Track whether removed detail can be retrieved again.']],
      ['Failure analysis', 'A lossy summary can turn a tentative statement into a fact or merge two identifiers. Keeping the full transcript indefinitely delays the problem and increases distraction. Resuming without reconciling external side effects risks duplicated actions.', ['Compare checkpoint fields before and after compaction.', 'Re-query consequential operations by idempotency key.', 'Never treat caching as additional context capacity.']],
    ],
    [
      { question: 'What should a recovery test prove?', options: ['The old transcript still exists', 'A fresh context can continue correctly from durable state and evidence references', 'The model uses the same wording', 'Every tool result remains in the prompt'], answer: 1, explanation: 'Recovery quality is demonstrated when the system can resume accurately without relying on hidden conversational memory.' },
      { question: 'Which statement about prompt caching is correct?', options: ['Cached tokens no longer count toward context', 'It can reduce repeated-input cost while context occupancy remains', 'It guarantees facts cannot become stale', 'It replaces durable checkpoints'], answer: 1, explanation: 'Caching changes reuse economics, not the amount of content the model receives in its context window.' },
    ],
  ),
  'd5-3': supplement(
    [
      ['Detect the condition', 'Evaluate explicit human requests, authority limits, policy gaps, ambiguity, risk, and repeated inability to progress.'],
      ['Resolve if safe', 'Ask the smallest discriminating question or use an approved read-only lookup when one fact can settle the ambiguity.'],
      ['Package the handoff', 'Provide verified facts, evidence, actions attempted, errors, risk, and the exact decision needed from the human.'],
      ['Resume consistently', 'Record the human decision and authority so the workflow continues without repeating settled work.'],
    ],
    [
      ['Escalation policy', 'Escalation is an explicit branch in the architecture. Define triggers from authority, policy, consequence, evidence quality, and progress. An explicit request for a person should be honored; sentiment can influence communication style but does not alone prove the case needs escalation.', ['Use observable conditions rather than vague discomfort.', 'Distinguish “needs more information” from “needs more authority.”', 'Set retry limits for permanent barriers.']],
      ['Discriminating clarification', 'A good question separates the remaining possibilities while requesting the least sensitive information necessary. It explains why the fact is needed and avoids revealing candidate-account details. Once received, verify it against authoritative state rather than accepting plausible text at face value.', ['Ask for one safe identifier when possible.', 'Do not list private attributes as hints.', 'Escalate if policy forbids resolution with available identifiers.']],
      ['Failure analysis', 'Escalating every angry user overloads humans and embeds sentiment bias. Guessing among ambiguous records risks privacy or financial harm. A handoff that omits attempted actions and evidence makes the person repeat work and may cause contradictory decisions.', ['Include the blocker and requested human decision.', 'Preserve uncertainty instead of overstating conclusions.', 'Return a handoff ID and status to the user when appropriate.']],
    ],
    [
      { question: 'Two accounts remain after a safe search. What should the agent ask for?', options: ['Any highly sensitive fact available', 'The smallest policy-approved identifier that distinguishes the accounts', 'Which account the user prefers', 'No clarification; pick the first'], answer: 1, explanation: 'A discriminating, minimally sensitive fact resolves ambiguity without guessing or exposing candidate records.' },
      { question: 'What makes an escalation handoff actionable?', options: ['Only the conversation transcript', 'Verified facts, evidence, attempts, blocker, risk, and requested decision', 'A confidence score alone', 'An apology without state'], answer: 1, explanation: 'The human needs a compact, auditable state package and a clear decision point to continue efficiently.' },
    ],
  ),
  'd5-4': supplement(
    [
      ['Classify the result', 'Represent success, valid empty, partial, transient error, permanent error, permission denial, and invalid request distinctly.'],
      ['Recover locally', 'Retry safe transient failures with backoff or use an approved equivalent source when the specialist has authority.'],
      ['Propagate impact', 'Return successful findings, failed coverage, attempts, retryability, and downstream limitations to the coordinator.'],
      ['Choose globally', 'The coordinator decides whether to continue, reassign, reduce claims, or escalate based on overall coverage and budget.'],
    ],
    [
      ['Typed error contract', 'Errors should be data the orchestration layer can reason about. A useful result names the operation, category, retryability, attempts, partial artifacts, affected scope, and safe diagnostic message. Keep internal details and credentials out of user-facing text.', ['Correlate every error with the originating tool call.', 'Preserve successful branch results beside failures.', 'Make rate limits and permission denials machine-distinguishable.']],
      ['Local versus global recovery', 'The component closest to a failure should handle a bounded retry when it understands the operation and no wider strategy changes. The coordinator should intervene when the failure consumes shared budget, removes required coverage, or suggests a different plan.', ['Use exponential backoff or service guidance for transient failures.', 'Do not retry invalid arguments without changing them.', 'Do not let every branch independently exhaust the global budget.']],
      ['Failure analysis', 'Converting errors into empty results creates false negative evidence. Throwing away all parallel successes wastes valid work. Exposing raw stack traces can leak secrets while still failing to tell the user what happens next.', ['Carry uncertainty into every dependent conclusion.', 'Separate internal diagnostics from safe explanations.', 'Test partial-failure behavior, not only the happy path.']],
    ],
    [
      { question: 'Who should reconsider the overall plan when one required evidence source permanently fails?', options: ['The failed tool alone', 'The coordinator with visibility into coverage and budget', 'An unrelated parallel branch', 'No component'], answer: 1, explanation: 'A permanent coverage loss affects the global strategy, which belongs to the coordinating layer.' },
      { question: 'What should a specialist return after two of three independent lookups succeed?', options: ['Only an exception', 'The two results plus structured failure and coverage impact for the third', 'An empty combined result', 'A fabricated third result'], answer: 1, explanation: 'Partial success and its limits let the coordinator preserve evidence and decide on recovery transparently.' },
    ],
  ),
  'd5-5': supplement(
    [
      ['Label outcomes', 'Collect representative model decisions with trusted human or deterministic ground truth.'],
      ['Measure segments', 'Compare errors and any confidence signal by field, source type, risk tier, language, and data quality.'],
      ['Set routing policy', 'Choose accept, review, or reject thresholds from observed harm and review capacity.'],
      ['Monitor drift', 'Sample even high-confidence outputs and recalibrate after data, model, prompt, schema, or policy changes.'],
    ],
    [
      ['Calibration versus accuracy', 'Accuracy asks how often predictions are correct; calibration asks whether a stated score corresponds to observed correctness. A model can be accurate on average but overconfident on one segment. Confidence is therefore a routing feature to validate, not a universal truth signal.', ['Plot or bucket score against observed outcomes.', 'Measure false accepts separately from false reviews.', 'Require evidence-based checks for consequential fields.']],
      ['Risk-based review', 'Review thresholds should reflect expected harm and operational capacity. A low-impact catalog tag can tolerate more automation than a payment amount or legal status. Contradiction, missing provenance, and policy exceptions may trigger review regardless of a numeric score.', ['Use field- and segment-specific policies.', 'Route novel distributions more conservatively.', 'Maintain random audit samples above the auto-accept threshold.']],
      ['Failure analysis', 'Optimizing a single aggregate hides minority failures. Reviewing only low-confidence output prevents discovery of confident mistakes and drift. Treating self-reported confidence as calibrated without labeled evidence creates false reassurance.', ['Track outcomes after human overrides.', 'Recalibrate after every material system change.', 'Measure review cost together with residual risk.']],
    ],
    [
      { question: 'Why sample some high-confidence outputs for review?', options: ['To make every task manual', 'To detect confident errors, drift, and calibration breakdown', 'Because low-confidence cases never fail', 'To avoid segment analysis'], answer: 1, explanation: 'Without sampling accepted output, the system cannot observe mistakes above its threshold or detect drift reliably.' },
      { question: 'Which field should normally have the stricter review policy?', options: ['A decorative product color tag', 'A bank-transfer amount', 'A page display preference', 'A nonbinding summary title'], answer: 1, explanation: 'Thresholds should reflect consequence; a financial amount has substantially greater harm from a false acceptance.' },
    ],
  ),
  'd5-6': supplement(
    [
      ['Capture claims', 'Store each material claim with exact value, units, source identity, location, date, method, and uncertainty.'],
      ['Normalize scope', 'Compare definitions, populations, time periods, currencies, and measurement methods before treating values as competing.'],
      ['Apply resolution rules', 'Prefer a source only when authority, recency, or scope provides a defensible reason; otherwise preserve the conflict.'],
      ['Synthesize audibly', 'Write conclusions that retain claim-to-source mappings, coverage gaps, and what evidence would resolve disagreement.'],
    ],
    [
      ['Claim-evidence graph', 'Treat provenance as a graph rather than a bibliography added at the end. Claims link to evidence spans; evidence links to sources, retrieval times, and methods; conclusions link to the claims they depend on. This structure survives summarization better than unstructured notes.', ['Assign stable IDs to sources and important claims.', 'Keep exact quotes short and preserve source locations.', 'Mark whether a source is primary, secondary, or derived.']],
      ['Conflict taxonomy', 'Apparent conflicts may come from different dates, populations, definitions, units, or methodologies. Normalize comparable dimensions first. If two authoritative sources still disagree, report both and state the decision impact rather than inventing consensus.', ['Never average values that measure different things.', 'Use current authoritative data only for the scope it actually covers.', 'Identify the missing fact or rule needed for resolution.']],
      ['Failure analysis', 'A synthesis can sound coherent while detaching numbers from sources. Majority vote rewards repeated secondary reporting over one primary record. Choosing the newest source automatically can be wrong when it describes a different period or method.', ['Audit every consequential claim back to evidence.', 'Keep failed or inaccessible sources in the coverage record.', 'Preserve disagreement when no justified tie-breaker exists.']],
    ],
    [
      { question: 'Five articles repeat one figure, while a primary filing reports another for a clearly defined period. What should drive the comparison?', options: ['The number of articles', 'Source authority plus matching scope, date, and definition', 'The larger number', 'Whichever source was read first'], answer: 1, explanation: 'Repeated secondary claims do not outweigh primary evidence automatically; comparability and authority determine the defensible use.' },
      { question: 'What should a synthesis say when two credible measurements remain incompatible after normalization?', options: ['Create their average', 'Report both, their provenance and methods, and the unresolved decision impact', 'Hide the conflict', 'Choose the newer publication without checking scope'], answer: 1, explanation: 'Preserving the unresolved conflict maintains auditability and prevents false certainty.' },
    ],
  ),
};
