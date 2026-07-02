export type LearnClusterId =
  | 'agent-engineering'
  | 'protocols'
  | 'comparisons'
  | 'distribution'

export interface LearnFaq {
  answer: string
  question: string
}

export interface LearnSection {
  body: readonly string[]
  bullets?: readonly string[]
  heading: string
}

export interface LearnDecisionRow {
  avoidWhen: string
  choice: string
  useWhen: string
}

export interface LearnExample {
  body: string
  label: string
}

export interface LearnPage {
  cluster: LearnClusterId
  dateModified: string
  datePublished: string
  decisionRows: readonly LearnDecisionRow[]
  description: string
  examples: readonly LearnExample[]
  faqs: readonly LearnFaq[]
  primaryKeyword: string
  relatedKeywords: readonly string[]
  sections: readonly LearnSection[]
  shortTitle: string
  slug: string
  summary: string
  title: string
}

export interface LearnCluster {
  description: string
  id: LearnClusterId
  label: string
}

export const LEARN_CLUSTERS: readonly LearnCluster[] = [
  {
    id: 'protocols',
    label: 'Protocols',
    description:
      'MCP, skills, tools, resources, and how agents connect to external systems.',
  },
  {
    id: 'agent-engineering',
    label: 'Agent engineering',
    description:
      'Production choices behind workflows, tools, approval, state, and recovery.',
  },
  {
    id: 'comparisons',
    label: 'Comparisons',
    description:
      'Framework tradeoffs for teams choosing how to build and operate agents.',
  },
  {
    id: 'distribution',
    label: 'Distribution',
    description:
      'Registries, source-owned agents, and installable workflow files.',
  },
] as const

export const LEARN_PAGES: readonly LearnPage[] = [
  {
    slug: 'mcp-server-for-ai-agents',
    title: 'MCP server for AI agents: what it gives you and what it does not',
    shortTitle: 'MCP server for AI agents',
    description:
      'A practical guide to MCP servers for agent builders: tools, resources, prompts, permissions, and where MCP stops.',
    cluster: 'protocols',
    datePublished: '2026-07-01',
    dateModified: '2026-07-02',
    primaryKeyword: 'mcp server',
    relatedKeywords: ['model context protocol', 'mcp tools', 'mcp server ai'],
    summary:
      'An MCP server gives agents a standard way to discover and call external capabilities. It does not decide policy for you. The server exposes tools and context; the agent still needs clear instructions, permissions, logging, and workflow boundaries. Treat MCP as the integration layer, not the whole agent architecture.',
    sections: [
      {
        heading: 'MCP solves integration sprawl',
        body: [
          'Without MCP, every agent client needs custom glue for every system it touches. One client calls GitHub, another queries a database, and another searches docs. The result is repeated integration work and inconsistent permissions.',
          'An MCP server gives those capabilities a standard shape. The host or client discovers tools, resources, and prompts through MCP, then presents the usable actions or context to the model in the format that runtime expects.',
          'That matters once more than one agent needs the same system. A database analyst, a support triage agent, and a product ops agent may all need read-only access to a data warehouse. If each agent builds its own database wrapper, the team now has three permission models and three places for query safety bugs. A shared MCP server gives the team one place to define permissions, logging, and query safety.',
        ],
      },
      {
        heading: 'What an MCP server actually exposes',
        body: [
          'The useful split is simple. Tools perform actions, such as listing issues or running a read-only query. Resources provide context, such as files, schemas, or documentation. Prompts provide reusable interaction templates.',
          'That does not make every MCP server safe. A broad tool with vague arguments is still broad. A server that exposes write actions still needs consent, authorization, and observability.',
          'The best MCP servers are boring in the right way. They expose small capabilities with clear names, typed inputs, and predictable outputs. The model should know what a tool does before it calls it, and a human reviewer should understand the blast radius without reading a page of hidden implementation.',
        ],
        bullets: [
          'Tools: executable operations the model can request.',
          'Resources: contextual data the client can attach or retrieve.',
          'Prompts: reusable interaction patterns exposed by the server.',
        ],
      },
      {
        heading: 'Keep access separate from agent behavior',
        body: [
          'In an Eve project, MCP access usually belongs near connections or narrow tools, while agent behavior stays in instructions, skills, and application code. That keeps external capability separate from the policy that decides when to use it.',
          'This matters for installable agents. A registry item should make it obvious which external systems the agent can reach and which files implement that access.',
          'For example, an Eve agent can connect to a hosted MCP server for Supabase or Linear, but still keep its local judgment in files users can inspect: instructions for when to ask for clarification, skills for safe analysis, and tools that wrap only the actions the workflow needs. The external capability is shared. The agent behavior remains owned by the project.',
        ],
      },
      {
        heading: 'The risk is assuming protocol equals policy',
        body: [
          'MCP standardizes how capabilities are exposed. It does not decide whether the agent should call a tool, whether a user is authorized, whether a result can be trusted, or whether a write needs approval.',
          'Use MCP for access. Put rules in tools, permissions, approval gates, and runtime checks.',
          'A useful rule: if a bad tool call would surprise a user, the protection should not live only in the prompt. Use scopes, read-only credentials, allowlists, approval gates, rate limits, and logs. The model can choose from available capabilities, but the system should decide what capabilities are available.',
        ],
      },
      {
        heading: 'How to evaluate an MCP server before using it',
        body: [
          'Start with the tool list. Look for tool names that describe one action, not an entire product surface. Then check inputs. A tool with one unstructured string may be convenient, but it gives the model too much room to improvise. Finally, inspect failure behavior. The server should return clear errors that the agent can use to recover.',
          'For production agents, also ask who owns the server. A public MCP server may be useful for quick exploration, while a company-owned server may be required for audited data access. The more sensitive the system, the more the MCP server should look like infrastructure, not a demo.',
        ],
      },
    ],
    decisionRows: [
      {
        choice: 'MCP server',
        useWhen:
          'Many agents or clients need the same external capabilities through a shared protocol.',
        avoidWhen:
          'The capability is private to one agent and simpler as a local tool.',
      },
      {
        choice: 'Native tool',
        useWhen:
          'The action is specific to one workflow and needs local policy close to the agent.',
        avoidWhen:
          'Multiple clients need the same integration and discovery behavior.',
      },
      {
        choice: 'Skill',
        useWhen: 'The agent needs a procedure for using a capability well.',
        avoidWhen: 'The agent needs live access to an external system.',
      },
    ],
    examples: [
      {
        label: 'Eve example',
        body: 'An Eve data analyst can use a database MCP server for schema and query tools, plus a local skill that defines metric rules and safe query behavior.',
      },
      {
        label: 'Outside Eve',
        body: 'A desktop assistant can connect to the same MCP server, but it still needs client-side permission prompts and a clear display of what the tool will do.',
      },
    ],
    faqs: [
      {
        question: 'Is MCP only for tools?',
        answer:
          'No. MCP can expose tools, resources, and prompts. Tools are the most visible part because they let agents act.',
      },
      {
        question: 'Does MCP make tool use safe?',
        answer:
          'No. MCP gives tools a standard interface. Safety still depends on scopes, validation, approvals, and logging.',
      },
      {
        question: 'When should I build an MCP server?',
        answer:
          'Build one when the same integration should be reused across agents, clients, or teams.',
      },
    ],
  },
  {
    slug: 'agentic-workflows',
    title: 'Agentic workflows: when software should decide the next step',
    shortTitle: 'Agentic workflows',
    description:
      'How to decide when a workflow should be agentic, deterministic, or a hybrid of both.',
    cluster: 'agent-engineering',
    datePublished: '2026-07-01',
    dateModified: '2026-07-01',
    primaryKeyword: 'agentic workflow',
    relatedKeywords: ['ai agent workflow', 'agentic workflows', 'ai workflows'],
    summary:
      'An agentic workflow is useful when the next step depends on judgment. If the path is fixed, ordinary workflow code is clearer. The best production systems usually mix both: deterministic rails around model decisions, with tools and approvals controlling the moments where the agent can affect the outside world.',
    sections: [
      {
        heading: 'Do not make everything agentic',
        body: [
          'A workflow becomes agentic when the model observes state, chooses an action, sees the result, and decides what to do next. That flexibility is useful for triage, research, code review, support, and messy operational work.',
          'It is wasteful when the process is already known. If step two always follows step one, a model does not need to decide it. Deterministic software will be cheaper, faster, and easier to test.',
          'The easiest mistake is asking the model to enforce rules the application already knows. It should not decide whether an invoice over a fixed threshold needs approval if that threshold is a policy. It should not decide whether a user has access if the application already has permissions. Let the agent handle interpretation and prioritization. Let code handle invariants.',
        ],
      },
      {
        heading: 'Use agents for ambiguity',
        body: [
          'Good agentic work has ambiguity at the center. Which issue matters? Which query answers the question? Which source is credible? Which tool should run next? These are judgment calls where a model can add value.',
          'Bad agentic work asks the model to enforce fixed policy. Business rules, permissions, idempotency, and irreversible writes should live in code.',
          'This split is not just about reliability. It also makes the user experience better. A user should feel that the agent is making thoughtful choices where humans normally spend time, not that it is randomly deciding things software should know already.',
        ],
      },
      {
        heading: 'Hybrid workflows are the default',
        body: [
          'The practical pattern is a hybrid: a deterministic trigger starts the run, the model makes a bounded decision, tools execute narrow actions, and the workflow records state. Human approval appears only where risk justifies it.',
          'Eve fits this pattern because channels, schedules, tools, skills, and durable sessions can sit around model judgment instead of replacing application structure.',
          'A scheduled digest is a good example. A cron-like schedule can start the run. The model can decide which changes matter. A Slack tool can post the final summary. Durable state can prevent duplicate delivery. Each layer does one job, and the agent is used where judgment actually matters.',
        ],
      },
      {
        heading: 'Design for the second run',
        body: [
          'The first run is usually easy. The second run reveals whether the workflow is real. What if the same event arrives twice? What if the user rejects the draft? What if the tool succeeds but the response stream fails? What if the model has no useful action to take?',
          'A strong agentic workflow has answers to those questions. It can no-op, ask for clarification, retry safely, or stop with a useful explanation. If every failure path becomes "ask the model again", the workflow is not designed yet.',
        ],
      },
    ],
    decisionRows: [
      {
        choice: 'Deterministic workflow',
        useWhen: 'The steps and branches are known before the run starts.',
        avoidWhen:
          'The workflow depends on interpreting messy context or choosing among uncertain actions.',
      },
      {
        choice: 'Agentic workflow',
        useWhen: 'The model must choose the next action based on observations.',
        avoidWhen:
          'The model is being asked to enforce rules that code can enforce exactly.',
      },
      {
        choice: 'Hybrid workflow',
        useWhen: 'You need model judgment inside clear runtime boundaries.',
        avoidWhen:
          'The boundaries are so vague that no one can explain who controls the next step.',
      },
    ],
    examples: [
      {
        label: 'Good fit',
        body: 'A Linear triage agent reads new issues, decides which ones need clarification, and drafts updates while code enforces allowed project fields.',
      },
      {
        label: 'Poor fit',
        body: 'A billing workflow asks a model whether a fixed refund threshold applies. That should be a rule, not a judgment call.',
      },
    ],
    faqs: [
      {
        question: 'Are agentic workflows the same as automations?',
        answer:
          'No. Automations follow predefined steps. Agentic workflows let the model choose some steps based on context.',
      },
      {
        question: 'Where do tools fit?',
        answer:
          'Tools are the bounded actions an agentic workflow can request. They should stay narrow and observable.',
      },
      {
        question: 'What is the first thing to test?',
        answer:
          'Test the failure path: bad input, missing context, duplicate trigger, and rejected approval.',
      },
    ],
  },
  {
    slug: 'ai-agent-frameworks',
    title: 'AI agent frameworks: the practical checklist before you choose',
    shortTitle: 'AI agent frameworks',
    description:
      'A practical checklist for comparing LangGraph, CrewAI, AutoGen-style systems, Eve, and other agent frameworks.',
    cluster: 'comparisons',
    datePublished: '2026-07-01',
    dateModified: '2026-07-02',
    primaryKeyword: 'ai agent frameworks',
    relatedKeywords: ['ai agent framework', 'best ai agent framework'],
    summary:
      'Choose an AI agent framework by the work it must survive: tool calls, retries, approvals, state, deployment, observability, and team ownership. A demo tells you whether the framework can run. A failure-path test tells you whether your team can operate it.',
    sections: [
      {
        heading: 'Start with the job the agent must survive',
        body: [
          'Most agent frameworks can run a tool call in a tutorial. That is not enough. The real question is what happens when the run is messy: a webhook arrives twice, a tool partially succeeds, a human rejects an output, or a deployment happens while the agent is waiting.',
          'Before you compare frameworks, write down the agent’s operational requirements. Does it need durable state? Does it write to external systems? Does a human approve anything? Does it run on a schedule? Does it need to be installed as source in customer projects? Those answers matter more than a generic “best framework” ranking.',
          'This makes the comparison less abstract. LangGraph, CrewAI, AutoGen-style systems, Eve, Mastra, and vendor SDKs are not interchangeable wrappers around the same thing. They make different tradeoffs around control flow, collaboration, deployment, and ownership.',
        ],
      },
      {
        heading: 'The seven checks that actually matter',
        body: [
          'A serious evaluation should cover seven areas. First, state: can the framework resume a run without repeating completed side effects? Second, tools: can you define narrow actions with typed inputs and clear errors? Third, approvals: can a human approve the exact artifact that will be executed?',
          'Fourth, deployment: does the framework fit your runtime, queue, serverless, or long-running worker model? Fifth, observability: can you inspect prompts, tool calls, retries, approvals, token spend, and final delivery? Sixth, evals: can you run behavior checks in CI? Seventh, ownership: can your team inspect and change the agent’s instructions and tools without fighting the framework?',
          'If a framework is weak in one of these areas, that does not automatically disqualify it. It tells you where you will need extra infrastructure or stricter conventions.',
        ],
        bullets: [
          'State and recovery',
          'Tool boundaries and permissions',
          'Human approval and artifact review',
          'Deployment and runtime fit',
          'Observability and cost tracking',
          'Behavior evals in CI',
          'Source ownership and local customization',
        ],
      },
      {
        heading: 'Where the popular options tend to fit',
        body: [
          'LangGraph is strongest when explicit workflow state is the center of the problem. If you need branches, loops, retries, and human interruptions that are easy to reason about, graph structure helps. The tradeoff is that simple workflows can feel heavy when forced into graph terms.',
          'CrewAI is strongest when the work naturally maps to roles: researcher, analyst, writer, reviewer. It can be fast for prototypes and internal workflows where role collaboration is the clearest way to describe the task. CrewAI also has flow-style orchestration, but if exact state recovery and side-effect boundaries are the main concern, compare those flow primitives directly against graph-first options.',
          'AutoGen-style systems are strongest when the work is conversational collaboration between agents, especially code or research loops where one agent proposes and another critiques. The risk is that long conversations can hide control flow unless you add strong stop conditions and tracing.',
          'Eve is strongest when the agent should be a TypeScript backend project with inspectable files: instructions, tools, skills, channels, schedules, and env requirements. That makes it a better fit for source-owned agents distributed through a registry than for every possible orchestration problem.',
        ],
      },
      {
        heading: 'Use the failure-path prototype',
        body: [
          'Do not choose from a hello-world example. Build the smallest version of the real workflow that includes one trigger, one model decision, one tool call, one rejected or failed path, and one log you would show a teammate.',
          'For a code review agent, that might mean opening a pull request, detecting one real issue, rejecting a noisy finding, and posting a review only after validation. For a data agent, it might mean reading schema, refusing a write query, running a safe read query, and explaining the SQL. For an operations agent, it might mean receiving a Slack message, creating a draft Linear update, and asking for approval before posting.',
          'Then compare the result. Which framework made the code easier to read? Which made the run easier to inspect? Which made the unsafe action harder to perform by accident?',
        ],
      },
      {
        heading: 'When distribution is part of the decision',
        body: [
          'If you are building reusable Eve agents, the framework choice also becomes a distribution question. Can another developer inspect the files before they install them? Can they see which tools write to external systems? Can they change the instructions and keep the result in their own repository?',
          'That is where evex is relevant. It does not make Eve the best framework for every workflow. It makes Eve’s source-owned file model easier to discover, preview, and install when that model is the right fit.',
        ],
      },
    ],
    decisionRows: [
      {
        choice: 'Graph-first framework',
        useWhen:
          'The workflow needs explicit branching, loops, checkpointed state, and recoverable interruptions.',
        avoidWhen:
          'The agent is mostly a small source-owned workflow where graph structure adds noise.',
      },
      {
        choice: 'Role-first framework',
        useWhen:
          'The task maps cleanly to specialist roles and quick multi-agent collaboration.',
        avoidWhen:
          'The process needs strict state recovery, narrow side effects, and auditability.',
      },
      {
        choice: 'Filesystem-first framework',
        useWhen:
          'The team needs installable source files, inspectable tools, and project-level ownership.',
        avoidWhen:
          'The execution graph is the main artifact the team must control.',
      },
    ],
    examples: [
      {
        label: 'Framework evaluation slice',
        body: 'Build a PR-review agent that reads a diff, rejects one false positive, posts one validated comment, and records the run. The best framework is the one that makes that failure path easiest to understand.',
      },
      {
        label: 'Eve-shaped workflow',
        body: 'An installable Slack data analyst benefits from visible files: channel, tools, instructions, env example, and query policy. That source-owned shape matters as much as orchestration.',
      },
    ],
    faqs: [
      {
        question: 'What is the best AI agent framework?',
        answer:
          'There is no universal best. Start with state, tools, approvals, deployment, observability, evals, and source ownership.',
      },
      {
        question: 'Should I choose based on programming language?',
        answer:
          'Language matters because your team has to maintain the agent, but it should not override runtime fit, recovery, and tool safety.',
      },
      {
        question: 'How do I compare frameworks quickly?',
        answer:
          'Build one failure-path prototype in each candidate framework. Include a tool error, a duplicate event, and one user-visible output.',
      },
    ],
  },
  {
    slug: 'ai-agent-tools',
    title: 'AI agent tools: the safe way to give models actions',
    shortTitle: 'AI agent tools',
    description:
      'How to design agent tools with narrow authority, typed inputs, clear descriptions, and observable results.',
    cluster: 'agent-engineering',
    datePublished: '2026-07-01',
    dateModified: '2026-07-02',
    primaryKeyword: 'ai agent tools',
    relatedKeywords: ['agent tools', 'llm tools', 'tool calling'],
    summary:
      'A tool lets the model affect a real system, so every tool needs a narrow job, typed inputs, logs, and clearly declared side effects. Bad tools turn the agent into an unreviewable API gateway where the model has too many ways to surprise you.',
    sections: [
      {
        heading: 'A tool is not just a helper function',
        body: [
          'In agent systems, tools are where model output becomes system behavior. A model can ask to call a tool, pass arguments, read the result, and decide what to do next.',
          'That makes tool design a security and product decision. The tool name, description, schema, permissions, and output shape all influence how the agent behaves.',
          'A human user may never see the tool definition, but they feel its quality. A good tool lets the agent answer confidently and recover from errors. A bad tool creates vague failures: the model sends malformed input, receives a confusing error, and guesses its way forward.',
        ],
      },
      {
        heading: 'Narrow tools beat clever tools',
        body: [
          'A broad tool feels flexible, but it moves complexity into the model prompt. A narrow tool gives the model fewer ways to be wrong. Compare `update_ticket_status` with a typed status enum to `run_linear_operation` with a free-form operation string.',
          'The narrow version is easier to test, easier to log, and easier to explain to users.',
          'Narrow does not mean tiny. A tool can perform several deterministic steps if those steps always belong together. The key question is whether the model should make a decision between steps. If not, hide the sequence behind a tool. If yes, expose smaller steps and let the agent inspect the result.',
        ],
      },
      {
        heading: 'Give every tool a reviewable file',
        body: [
          'Eve tools live in `agent/tools/`, so every callable action has a file. That layout makes review concrete: what can the model ask the system to do, and where is that behavior implemented?',
          'For registry-installed agents, this is especially useful. Users can inspect tool files before giving the agent credentials or connecting a channel.',
          'That does not remove the need for careful schemas. A file path tells you where authority lives. The tool implementation still has to validate inputs, handle errors, redact sensitive output, and make side effects explicit.',
        ],
      },
      {
        heading: 'What to include in a tool contract',
        body: [
          'A tool contract should answer five questions: what action does it perform, what input does it accept, what output does it return, what can go wrong, and what side effects can happen. If any of those are unclear, the model and the reviewer are both guessing.',
          'Descriptions should be written for the model, but they should also be readable by humans. Avoid vague verbs like "handle" or "process". Name the action: list, describe, create, update, send, preview, approve.',
        ],
      },
    ],
    decisionRows: [
      {
        choice: 'Read tool',
        useWhen:
          'The model needs data from a system, such as schema, issue state, or file content.',
        avoidWhen:
          'The data can be attached as static context or a resource without model-controlled execution.',
      },
      {
        choice: 'Write tool',
        useWhen:
          'The agent needs to create, update, send, or trigger something outside itself.',
        avoidWhen:
          'The action is risky and lacks approval, idempotency, or audit logs.',
      },
      {
        choice: 'Composite tool',
        useWhen:
          'A sequence is deterministic and should not be controlled step-by-step by the model.',
        avoidWhen:
          'The sequence contains judgment points the model should inspect between steps.',
      },
    ],
    examples: [
      {
        label: 'Good tool',
        body: '`submit_pr_review` accepts a review body and inline comments, then posts one GitHub review with clear rate limits and logging.',
      },
      {
        label: 'Risky tool',
        body: '`github_action` accepts any operation and arbitrary JSON. It may demo quickly, but it is difficult to permission or test.',
      },
    ],
    faqs: [
      {
        question: 'Should tools be tiny?',
        answer:
          'They should be narrow, not necessarily tiny. A tool can do several deterministic steps if the model should not decide between them.',
      },
      {
        question: 'Where should validation happen?',
        answer:
          'Validate at the tool boundary with schemas and runtime checks. Do not rely on prompt instructions alone.',
      },
      {
        question: 'Should a tool return prose or data?',
        answer:
          'Return structured data when the agent will reason over it. Use prose only when the output is meant for a human.',
      },
    ],
  },
  {
    slug: 'mcp-vs-skills',
    title: 'MCP vs skills: do you need a connection or a playbook?',
    shortTitle: 'MCP vs skills',
    description:
      'A grounded distinction between MCP servers, tools, resources, prompts, and skills for teams extending AI agents.',
    cluster: 'protocols',
    datePublished: '2026-07-01',
    dateModified: '2026-07-01',
    primaryKeyword: 'mcp vs skills',
    relatedKeywords: ['model context protocol', 'ai skills', 'mcp tools'],
    summary:
      'MCP gives an AI application a standard way to reach external systems. Skills, in Eve/Cursor/Claude-style runtimes, give an agent a reusable playbook for a task. They often work together, but they are not substitutes. The clean design is usually MCP for access, skills for judgment.',
    sections: [
      {
        heading: 'The common confusion',
        body: [
          'Both MCP and skills show up when people ask how to give an agent more context. That phrase hides two different needs. Sometimes the agent needs access to a system: list tables, read a file, search docs, create an issue. Sometimes the agent needs a method: review a migration, write in a brand voice, or triage an incident.',
          'MCP is strongest for the first need. Skills are strongest for the second.',
          'The confusion is understandable because both change what the model can do. But they change different things. MCP changes what systems the agent can reach. Skills change how the agent uses that access. Mixing them up leads to strange designs, like hiding API credentials inside a markdown playbook or turning a review rubric into a fake tool.',
        ],
      },
      {
        heading: 'MCP is an interface to capabilities',
        body: [
          'An MCP server exposes tools, resources, and prompts through a standard protocol. The client can discover what is available and call into those capabilities without each agent inventing a custom integration.',
          'This is useful when the capability should be shared across many clients or agents. A Postgres MCP server, a Linear MCP server, or a docs search MCP server can serve multiple workflows.',
          'MCP is especially useful when the external system is not owned by the agent author. A team can maintain one approved server for a database, CRM, or ticketing system, then let multiple agents use the same capability under the same access rules.',
        ],
      },
      {
        heading: 'Skills are playbooks',
        body: [
          'A skill is a playbook. It tells the agent how to perform a class of work: what to check, what to avoid, what output shape to use, what examples matter.',
          'Skills should not hide credentials or grant authority. They can tell the model to use a read-only SQL tool carefully, but the read-only boundary must still live in the tool, database role, MCP server, or runtime policy.',
          'A good skill makes the agent more consistent without giving it new powers. It might teach severity levels for code review, rules for customer-facing email, or the right way to answer analytics questions. The skill improves judgment; it does not replace permissions.',
        ],
      },
      {
        heading: 'Use both when capability needs a method',
        body: [
          'Many useful workflows need both layers. A data analyst needs database access and metric definitions. A support agent needs ticket access and escalation policy. A code reviewer needs GitHub access and review calibration.',
          'In those cases, the design question becomes: what does the agent need to reach, and what does it need to know? MCP answers the first question. Skills answer the second.',
        ],
      },
    ],
    decisionRows: [
      {
        choice: 'MCP',
        useWhen:
          'The agent needs live access to external tools, resources, or server-provided prompts.',
        avoidWhen: 'The agent only needs local procedure or writing rules.',
      },
      {
        choice: 'Skill',
        useWhen:
          'The agent needs repeatable judgment, checklists, examples, or output standards.',
        avoidWhen: 'The agent needs credentials or live system access.',
      },
      {
        choice: 'Both',
        useWhen:
          'A workflow needs external capability plus domain-specific procedure.',
        avoidWhen:
          'The combination adds indirection without improving reuse or safety.',
      },
    ],
    examples: [
      {
        label: 'Eve example',
        body: 'A database analyst can use MCP for database access and a skill for metric definitions, SQL safety rules, and answer format.',
      },
      {
        label: 'Outside Eve',
        body: 'A coding assistant can connect to an MCP server while loading project-specific skills from the repository.',
      },
    ],
    faqs: [
      {
        question: 'Can a skill call an MCP tool?',
        answer:
          'A skill can tell the agent when and how to use the tool. The runtime still performs the actual tool call.',
      },
      {
        question: 'Can MCP replace skills?',
        answer:
          'No. MCP can expose prompts, but skills remain useful for local, portable procedure and examples.',
      },
      {
        question: 'Which is safer?',
        answer:
          'Neither by default. Safety comes from scopes, validation, approvals, and logs.',
      },
    ],
  },
  {
    slug: 'agent-registry',
    title: 'Agent registry: discovery without trust is just a list',
    shortTitle: 'Agent registry',
    description:
      'What an AI agent registry must expose before developers can reuse agents safely.',
    cluster: 'distribution',
    datePublished: '2026-07-01',
    dateModified: '2026-07-01',
    primaryKeyword: 'agent registry',
    relatedKeywords: [
      'ai agent registry',
      'agent catalog',
      'agent marketplace',
    ],
    summary:
      'An agent registry should help a developer answer whether an agent is safe, maintained, installable, and worth adapting. Discovery is only the first step. Trust comes from seeing what will be installed, who owns it, and what authority it needs.',
    sections: [
      {
        heading: 'The registry problem is trust',
        body: [
          'Agents carry instructions, tools, external access, schedules, and sometimes public-facing channels. A card with a name and a nice description is not enough to install anything safely.',
          'A useful registry shows files, tools, schedules, credentials, write access, dependencies, author, update date, and install command.',
          'This is different from a normal plugin directory. Agents can reason, call tools, and act across systems. A registry listing has to show those capabilities before installation, or it is just asking developers to trust a black box.',
        ],
      },
      {
        heading: 'Registry, catalog, marketplace',
        body: [
          'A catalog helps people browse inventory. A marketplace helps people choose between vendors. A registry should provide structured metadata and installation paths.',
          'For developer agents, the registry model is often the right starting point because the user needs to inspect and own the artifact.',
          'This distinction matters for product expectations. A marketplace implies reviews, pricing, support, and vendor comparison. A registry implies installable artifacts, metadata, and repeatable delivery. Agent infrastructure usually needs the second before it can credibly become the first.',
        ],
      },
      {
        heading: 'What a registry item needs',
        body: [
          'A real registry item has a clear job, source files, target paths, dependencies, setup instructions, author identity, and update metadata. Install counts are useful, but they are secondary to inspectability.',
          'The best registry items also explain the first-run path. What credentials does the agent need? Which files should the user review first? Which tools can write to external systems? What should a safe dry run look like?',
        ],
        bullets: [
          'Files and target paths',
          'Dependencies and environment variables',
          'Author and source review path',
          'Install command and previewable output',
        ],
      },
      {
        heading: 'Why source ownership matters',
        body: [
          'Agent behavior often needs local policy. A company may want a stricter review rubric, a different Slack channel, a narrower SQL policy, or a custom approval step. Source-owned installation makes those changes normal instead of forcing a fork of an opaque tool.',
          'Installable source files let teams review the agent, change the policy, and commit the result before they run it. Reusable agents should not trap teams inside someone else’s hidden prompt or tool wrapper.',
        ],
      },
    ],
    decisionRows: [
      {
        choice: 'Public registry',
        useWhen:
          'Reusable artifacts should be discoverable and installable across projects.',
        avoidWhen:
          'The agents depend on private infrastructure or internal policy.',
      },
      {
        choice: 'Internal registry',
        useWhen:
          'A company needs approved agents, private tools, and governance.',
        avoidWhen: 'The goal is open contribution and public discovery.',
      },
      {
        choice: 'Marketplace',
        useWhen:
          'Commerce, licensing, reviews, and support are part of the product.',
        avoidWhen: 'The core value is source-owned installation.',
      },
    ],
    examples: [
      {
        label: 'evex-style registry',
        body: 'An agent page shows files, dependencies, author, install command, and related agents. Canonical agent content lives in source.',
      },
      {
        label: 'Enterprise registry',
        body: 'A company registry may track approved MCP servers, internal agents, policy status, owners, and deployment state.',
      },
    ],
    faqs: [
      {
        question: 'What makes an agent registry trustworthy?',
        answer:
          'Transparent files, clear ownership, dependency disclosure, review history, and install previews.',
      },
      {
        question: 'Should a registry store runtime state?',
        answer:
          'It can store metrics and favorites, but canonical source metadata should stay close to the files being installed.',
      },
      {
        question: 'Is evex an agent marketplace?',
        answer:
          'Not in the commerce sense. It is a community registry for reusable Eve agent configurations.',
      },
    ],
  },
  {
    slug: 'shadcn-registry-for-agents',
    title: 'Shadcn registry for agents: installing workflows as source files',
    shortTitle: 'Shadcn registry for agents',
    description:
      'How the shadcn registry model applies to AI agent workflows, where users need source files rather than opaque packages.',
    cluster: 'distribution',
    datePublished: '2026-07-01',
    dateModified: '2026-07-01',
    primaryKeyword: 'shadcn registry',
    relatedKeywords: [
      'custom shadcn registry',
      'registry json',
      'shadcn registry item',
    ],
    summary:
      'The shadcn registry model fits agents because many agent workflows are source bundles: instructions, tools, skills, env examples, evals, and integration files that users need to inspect and adapt. For agents, owning the installed files is often the point.',
    sections: [
      {
        heading: 'A reusable agent is not just a dependency',
        body: [
          'Traditional packages work well when the user wants stable behavior behind an import. Agent workflows often need the opposite. The user wants to see the prompt, adjust the tool, change the channel, remove an integration, or add a stricter approval step.',
          'A registry item can install editable files directly into the project. The user owns the result and can change it before running the agent.',
          'This is the same reason shadcn became popular for UI: teams wanted useful starting points without surrendering ownership. Agent workflows have an even stronger version of that need because prompts and tools encode policy, tone, and authority.',
        ],
      },
      {
        heading: 'What the registry must show before install',
        body: [
          'Before install, the registry should show files, target paths, dependencies, author, category, update date, and install command. Otherwise the user cannot answer the basic question: what will this add to my project?',
          'This is especially important for agents because installed files can contain authority: tools that write to APIs, channels that receive webhooks, schedules that run unattended, and skills that shape judgment.',
          'A previewable registry item reduces anxiety. The user can see whether the agent adds a Slack channel, a GitHub tool, a schedule, an MCP connection, or only local instructions. That makes the install feel like code review, not blind trust.',
        ],
      },
      {
        heading: 'Why it pairs well with Eve',
        body: [
          'Eve already organizes agents as files under `agent/`. A shadcn registry item can place those files into the expected locations, while the user keeps ownership of the result.',
          'The registry installs the agent files users need to review: instructions, tools, skills, channels, env examples, and evals.',
          'For example, an Eve registry item can install `agent/instructions.md`, `agent/tools/`, `agent/skills/`, `agent/channels/`, `.env.example`, and evals together. Each file lands where an Eve developer expects it.',
        ],
      },
      {
        heading: 'When not to use a registry item',
        body: [
          'Do not use a registry item for every reusable thing. Stable library code still belongs in a package. Small snippets may belong in docs. A registry item is strongest when several files work together and the user benefits from owning them.',
          'The test is simple: if the user will need to inspect and adapt the files, a registry item is a good fit. If the user only needs to call a stable API, a package is probably cleaner.',
        ],
      },
    ],
    decisionRows: [
      {
        choice: 'Shadcn registry item',
        useWhen:
          'Users should own, inspect, and modify the installed agent files.',
        avoidWhen:
          'The artifact is a stable library better consumed as a normal package.',
      },
      {
        choice: 'npm package',
        useWhen:
          'The behavior is reusable code with a stable API and little need for local editing.',
        avoidWhen:
          'Prompts, tools, env files, and workflow policy need project ownership.',
      },
      {
        choice: 'Docs snippet',
        useWhen: 'The setup is tiny and educational.',
        avoidWhen:
          'The workflow has enough files that copy-paste becomes unreliable.',
      },
    ],
    examples: [
      {
        label: 'Eve example',
        body: 'An evex item can install `agent/agent.ts`, `agent/instructions.md`, `agent/tools/run_sql.ts`, a skill folder, README, and `.env.example` into the expected Eve layout.',
      },
      {
        label: 'Outside Eve',
        body: 'The same registry mechanism can distribute project rules, MCP setup, CI workflows, and framework templates.',
      },
    ],
    faqs: [
      {
        question: 'Why not publish every agent as an npm package?',
        answer:
          'Because users often need to inspect and change prompts, tools, schedules, and channel behavior.',
      },
      {
        question: 'What makes a registry item good?',
        answer:
          'A clear job, explicit target paths, dependency declarations, setup docs, and files that belong together.',
      },
      {
        question: 'Is customization expected?',
        answer:
          'Yes. The registry gives users a reviewed starting point, not a permanent black box.',
      },
    ],
  },
  {
    slug: 'langgraph-vs-crewai',
    title: 'LangGraph vs CrewAI: graph control or role-based crews?',
    shortTitle: 'LangGraph vs CrewAI',
    description:
      'A builder-focused comparison of LangGraph and CrewAI, with Eve as a file-based reference point.',
    cluster: 'comparisons',
    datePublished: '2026-07-01',
    dateModified: '2026-07-02',
    primaryKeyword: 'langgraph vs crewai',
    relatedKeywords: [
      'langgraph alternatives',
      'crewai alternatives',
      'ai agent frameworks',
    ],
    summary:
      'LangGraph and CrewAI start from different mental models. LangGraph makes workflow state and transitions explicit. CrewAI makes role-based collaboration quick to model. The right choice depends on which complexity your team needs to see first, not which framework has the longer feature list.',
    sections: [
      {
        heading: 'The real comparison is not popularity',
        body: [
          'Both frameworks can build useful agents. The difference is how they ask you to think. LangGraph asks you to model a stateful graph. CrewAI often starts with agents, roles, and tasks, while its flow patterns cover more structured orchestration.',
          'Those mental models lead to different debugging experiences. A graph helps when the failure is in routing. A crew helps when the work naturally decomposes into roles.',
          'This is why search results for "LangGraph vs CrewAI" often feel unsatisfying. They compare stars, syntax, and sample apps, but the real question is operational: when the workflow goes wrong, which model helps your team find the problem faster?',
        ],
      },
      {
        heading: 'Where LangGraph is stronger',
        body: [
          'LangGraph is a better fit when the workflow needs explicit branching, loops, checkpointed state, and human-in-the-loop transitions. It is also a better fit when you want to reason about the path a run took.',
          'The tradeoff is overhead. Simple workflows can feel verbose when forced into graph terms.',
          'A graph also creates useful pressure. If you cannot draw the states, you probably do not understand the workflow. That is valuable for regulated, high-stakes, or long-running processes where implicit model behavior is too hard to audit.',
        ],
      },
      {
        heading: 'Where CrewAI is stronger',
        body: [
          'CrewAI is attractive for fast prototypes and workflows that map to human-like roles: researcher, analyst, writer, reviewer. CrewAI also has flow-style orchestration, but the common crew abstraction is easiest to explain when the work naturally decomposes into roles.',
          'The tradeoff appears when control flow gets complex. Role metaphors can hide state transitions that should be explicit.',
          'CrewAI can be the right choice when the team needs to test a multi-agent collaboration pattern quickly. The role-based crew abstraction becomes weaker when the workflow needs durable recovery, careful retries, or exact visibility into how state changes over time; those cases often need flow or graph structure.',
        ],
      },
      {
        heading: 'Where Eve differs',
        body: [
          'Eve is neither graph-first nor crew-first. It is filesystem-first. That makes it relevant when the agent is a backend project whose tools, skills, channels, schedules, and env requirements should be visible as files.',
          'This gives teams a third option in the comparison. If the main problem is control flow, reach for graph thinking. If the main problem is role collaboration, crew thinking may fit. If the main problem is inspectable, source-owned agent capability, Eve’s file model becomes more interesting.',
        ],
      },
      {
        heading: 'How to decide without guessing',
        body: [
          'Build the same uncomfortable slice in both frameworks. Include one external tool, one bad input, one human decision, and one recovery path. Then read the implementation with a teammate who did not write it.',
          'If they can explain what happens next, what can fail, and where to make a change, the framework is serving the team. If they need a tour of hidden conventions, the framework may be working against the workflow.',
        ],
      },
    ],
    decisionRows: [
      {
        choice: 'LangGraph',
        useWhen:
          'State transitions, retries, and explicit routing are the main complexity.',
        avoidWhen:
          'The workflow is simple enough that graph structure adds more weight than clarity.',
      },
      {
        choice: 'CrewAI',
        useWhen:
          'The task maps naturally to roles and fast multi-agent collaboration.',
        avoidWhen:
          'The workflow needs precise state control and durable side-effect boundaries.',
      },
    ],
    examples: [
      {
        label: 'LangGraph-shaped workflow',
        body: 'A claims workflow with branching escalation paths, retries, and approval states benefits from explicit graph control.',
      },
      {
        label: 'CrewAI-shaped workflow',
        body: 'A research pipeline with researcher, analyst, and writer roles can be faster to express as a crew.',
      },
    ],
    faqs: [
      {
        question: 'Is LangGraph more production-ready than CrewAI?',
        answer:
          'It is often stronger for explicit state and control flow. CrewAI can still be useful when the role model fits the work.',
      },
      {
        question: 'Where does Eve fit in this comparison?',
        answer:
          'Eve is a different axis: file-owned backend agents rather than graph-first or role-first orchestration.',
      },
      {
        question: 'How should teams choose?',
        answer:
          'Build the hardest failure path in each candidate framework and compare which one is easier to debug.',
      },
    ],
  },
] as const

const LEARN_PAGE_MAP = new Map(
  LEARN_PAGES.map((page) => [page.slug, page] as const),
)

export function listLearnPages(): readonly LearnPage[] {
  return LEARN_PAGES
}

export function getLearnPage(slug: string): LearnPage | null {
  return LEARN_PAGE_MAP.get(slug) ?? null
}

export function getLearnCluster(id: LearnClusterId): LearnCluster {
  const cluster = LEARN_CLUSTERS.find((entry) => entry.id === id)
  if (!cluster) {
    throw new Error(`Unknown learn cluster: ${id}`)
  }
  return cluster
}

export function getLearnPagesByCluster(
  id: LearnClusterId,
): readonly LearnPage[] {
  return LEARN_PAGES.filter((page) => page.cluster === id)
}

export function getRelatedLearnPages(
  page: LearnPage,
  limit: number,
): readonly LearnPage[] {
  const sameCluster = LEARN_PAGES.filter(
    (candidate) =>
      candidate.cluster === page.cluster && candidate.slug !== page.slug,
  )
  const otherClusters = LEARN_PAGES.filter(
    (candidate) =>
      candidate.cluster !== page.cluster && candidate.slug !== page.slug,
  )

  return [...sameCluster, ...otherClusters].slice(0, limit)
}
