export const certificate = {
  slug: 'claude-architect-foundations',
  provider: 'Anthropic',
  title: 'Claude Certified Architect – Foundations',
  level: 'Foundations',
  summary: 'Build the judgment to design reliable Claude systems—from agent orchestration and MCP tools to structured output, context strategy, and production safeguards.',
  domains: [
    { id: 'd1-', title: 'Agentic Architecture & Orchestration', weight: 27, lessons: 7, description: 'Choose workflows, agents, subagents, guardrails, and recovery patterns.' },
    { id: 'd2-', title: 'Tool Design & MCP Integration', weight: 18, lessons: 5, description: 'Design narrow tools, structured errors, and least-privilege integrations.' },
    { id: 'd3-', title: 'Claude Code Configuration & Workflows', weight: 20, lessons: 6, description: 'Use project instructions, rules, skills, hooks, subagents, and CI safely.' },
    { id: 'd4-', title: 'Prompt Engineering & Structured Output', weight: 20, lessons: 6, description: 'Build eval-driven prompts, schemas, validators, retries, and batch flows.' },
    { id: 'd5-', title: 'Context Management & Reliability', weight: 15, lessons: 6, description: 'Curate context, preserve provenance, calibrate review, and escalate well.' },
  ],
} as const;
