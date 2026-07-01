export type LearnClusterId =
  | 'agent-engineering'
  | 'eve-architecture'
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
  audience: string
  cluster: LearnClusterId
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
    id: 'agent-engineering',
    label: 'Agent engineering',
    description:
      'Production decisions behind tools, skills, subagents, approval, state, and recovery.',
  },
  {
    id: 'eve-architecture',
    label: 'Eve architecture',
    description:
      'Eve used as a concrete example of filesystem-first agent design.',
  },
  {
    id: 'protocols',
    label: 'Protocols and integrations',
    description:
      'Where MCP, native tools, resources, and skills belong in agent systems.',
  },
  {
    id: 'comparisons',
    label: 'Comparisons',
    description:
      'Framework tradeoffs written for builders, not leaderboard shoppers.',
  },
  {
    id: 'distribution',
    label: 'Distribution',
    description:
      'How reusable agent files move between projects without becoming black boxes.',
  },
] as const

export const LEARN_PAGES: readonly LearnPage[] = [
  {
    slug: 'tools-vs-skills-vs-subagents',
    title: 'Tools vs skills vs subagents: the control boundary that matters',
    shortTitle: 'Tools vs skills vs subagents',
    description:
      'A practical guide to choosing between executable tools, procedural skills, and delegated subagents without turning every capability into a confusing blob.',
    cluster: 'agent-engineering',
    primaryKeyword: 'tools vs skills vs subagents',
    relatedKeywords: ['AI agent tools', 'agent skills', 'subagents'],
    audience: 'Developers designing agent capabilities',
    summary:
      'The useful distinction is control. A tool executes a narrow action. A skill changes how the model approaches a task. A subagent gets its own reasoning loop and returns a result. If you blur those lines, the agent may still demo well, but it becomes harder to review, test, and recover.',
    sections: [
      {
        heading: 'The wrong abstraction makes agents feel haunted',
        body: [
          'Most weak agent designs do not fail because the model is bad. They fail because everything is shoved into the same bucket. A database query, a review checklist, a security policy, and a separate research pass all become “tools” because tools are the first extension point people learn.',
          'That works until something breaks. The model calls the wrong broad tool. The prompt contains too many procedural rules. A task that deserved isolated context pollutes the main run. The debugging question becomes vague: did the agent lack an action, lack a playbook, or need a specialist?',
        ],
      },
      {
        heading: 'Use the control test',
        body: [
          'Ask who controls the next step. If software should execute a known operation, use a tool. If the model should apply a method while staying in the same conversation, use a skill. If another reasoning process should own the task and report back, use a subagent.',
          'This is why the boundary matters more than the name. Different frameworks use different labels, but the same design axis keeps showing up: action, procedure, delegation.',
        ],
        bullets: [
          'Tool: “Run this bounded operation with validated inputs.”',
          'Skill: “Follow this playbook when the task matches.”',
          'Subagent: “Work this problem in your own context and return a judged result.”',
        ],
      },
      {
        heading: 'How Eve makes the decision visible',
        body: [
          'Eve is useful as a case study because the decision appears in the file tree. `agent/tools/` contains callable TypeScript actions. `agent/skills/` contains procedures and references. `agent/subagents/` contains specialist agents with their own instructions and possible tools.',
          'That file layout does not magically make the design good. It does make a bad design easier to spot. If a pull request adds a giant tool that contains strategy, policy, network access, and formatting, the shape is suspicious before you read every line.',
        ],
      },
      {
        heading: 'What belongs where',
        body: [
          'Put deterministic side effects behind tools: fetch a pull request diff, post a review, run a read-only query, create a draft. Give those tools narrow names and explicit schemas. The model should not need to invent how the operation works.',
          'Put reusable judgment in skills: a review rubric, a content editing pass, an incident triage checklist, a query safety policy. Skills are not enforcement. They guide the model, so anything safety-critical still needs code or runtime checks.',
          'Use subagents when isolation is valuable: a security reviewer that should not share the main agent’s assumptions, a research worker that needs its own search loop, or a database analyst that should return a bounded answer instead of dragging a large schema into the parent context.',
        ],
      },
      {
        heading: 'The review smell',
        body: [
          'A good agent extension should be explainable in one sentence. “This tool posts a GitHub review.” “This skill teaches severity calibration.” “This subagent performs independent security review.” If the sentence needs three commas, the abstraction probably does too much.',
        ],
      },
    ],
    decisionRows: [
      {
        choice: 'Tool',
        useWhen:
          'The agent needs a bounded action with typed inputs, observable output, and clear side effects.',
        avoidWhen:
          'The task mainly needs judgment, examples, or a multi-step reasoning strategy.',
      },
      {
        choice: 'Skill',
        useWhen:
          'The model needs reusable procedure, checklists, writing rules, or domain context loaded only when relevant.',
        avoidWhen:
          'The procedure must enforce permissions or perform live system access.',
      },
      {
        choice: 'Subagent',
        useWhen:
          'The task needs independent context, specialist instructions, or a separate acceptance bar.',
        avoidWhen:
          'A deterministic function or a short checklist would solve the problem with less cost and latency.',
      },
    ],
    examples: [
      {
        label: 'Eve example',
        body: 'A code review agent can use a `submit_pr_review` tool for the final GitHub write, a review-calibration skill for severity rules, and a security subagent only when the diff touches auth, secrets, or data access.',
      },
      {
        label: 'Outside Eve',
        body: 'In LangGraph, the same split might become a graph node that calls a function, a prompt/rubric loaded into the node, and a separate reviewer branch whose output is merged before final response.',
      },
    ],
    faqs: [
      {
        question: 'Can a tool include judgment?',
        answer:
          'It can include deterministic policy checks, but open-ended judgment usually belongs in the model path. Keep the tool narrow and let the agent decide when to call it.',
      },
      {
        question: 'Are skills safer than tools?',
        answer:
          'No. Skills are instructions. They can improve behavior, but they do not enforce authority boundaries. Use code, schemas, permissions, and approvals for enforcement.',
      },
      {
        question: 'When is a subagent worth the overhead?',
        answer:
          'Use one when separate context improves the result enough to justify latency, cost, and coordination complexity.',
      },
    ],
  },
  {
    slug: 'durable-ai-agents',
    title: 'Durable AI agents: saving chat history is not recovery',
    shortTitle: 'Durable AI agents',
    description:
      'Why production agents need execution history, side-effect boundaries, and resumable pauses rather than just conversation memory.',
    cluster: 'agent-engineering',
    primaryKeyword: 'durable AI agents',
    relatedKeywords: [
      'durable execution',
      'agent recovery',
      'agent checkpoints',
    ],
    audience: 'Engineers shipping long-running agent workflows',
    summary:
      'Durability is not “the model remembers what happened.” Durability is the system knowing which steps completed, which side effects were committed, and where a run can resume without duplicating work.',
    sections: [
      {
        heading: 'The failure mode is duplicate action, not forgotten chat',
        body: [
          'A production agent does not only produce text. It reads systems, calls tools, waits for humans, sends messages, creates drafts, updates tickets, and sometimes deploys code. When the process dies halfway through, replaying the transcript is not enough.',
          'The system needs to know whether the email was sent, whether the GitHub comment was posted, whether the approval applied to the exact payload being executed, and whether the next retry is allowed to call the same tool again.',
        ],
      },
      {
        heading: 'Memory and durability solve different problems',
        body: [
          'Memory helps a model preserve useful context across turns. Durable execution helps software preserve the truth of a run across crashes, deploys, timeouts, and human delays.',
          'If an agent asks for approval on Monday and resumes on Wednesday, the important artifact is not a vague memory that someone approved something. The important artifact is the exact reviewed patch, message, command, or query plus the reviewer and timestamp.',
        ],
      },
      {
        heading: 'Why Eve is interesting here',
        body: [
          'Eve positions agents as durable backend software, not single request handlers. That matters because many useful agents are slow by nature: they wait for Slack replies, background schedules, external APIs, or human review.',
          'The implementation detail belongs in the framework, but the design responsibility still belongs to the agent author. Tools should be idempotent where possible. Approval gates should store artifacts. Output delivery should tolerate retries without spamming users.',
        ],
      },
      {
        heading: 'A practical recovery checklist',
        body: [
          'Before calling a workflow durable, test ugly points. Crash after a tool returns but before the final answer. Crash after a human approval but before the write. Replay a run after a deployment. Send the same webhook twice. These are the places where demos become systems.',
        ],
        bullets: [
          'Persist completed tool results, not just attempts.',
          'Give external writes idempotency keys or dedupe rules.',
          'Store the exact artifact attached to an approval.',
          'Make retries visible in logs and traces.',
        ],
      },
    ],
    decisionRows: [
      {
        choice: 'Simple request/response',
        useWhen:
          'The agent only answers from context and can safely restart from scratch.',
        avoidWhen:
          'A run includes external writes, approvals, schedules, or expensive multi-step work.',
      },
      {
        choice: 'Durable workflow',
        useWhen:
          'The agent must resume after failure without repeating completed side effects.',
        avoidWhen:
          'The added persistence would not change correctness or user experience.',
      },
      {
        choice: 'Human approval pause',
        useWhen:
          'A user needs to inspect a specific artifact before the agent proceeds.',
        avoidWhen:
          'The approval is only a vague “continue?” prompt with no durable object attached.',
      },
    ],
    examples: [
      {
        label: 'Eve example',
        body: 'A scheduled Linear summary agent should remember which summary window it processed and whether it posted to Slack. If the server restarts, it should not post the same standup report twice.',
      },
      {
        label: 'Outside Eve',
        body: 'Temporal-style systems solve this with workflow histories and replay. LangGraph-style systems often solve it with checkpointed state. The key idea is the same: completed boundaries must survive process death.',
      },
    ],
    faqs: [
      {
        question: 'Is database-backed chat history enough?',
        answer:
          'No. Chat history records conversation. Durable execution records completed steps and side effects. You often need both.',
      },
      {
        question: 'When can I skip durability?',
        answer:
          'Skip it for short, read-only, low-cost interactions where retrying from the start is harmless.',
      },
      {
        question: 'What is the first durability test to write?',
        answer:
          'Crash immediately after the most important tool call completes. The recovered run should not call that tool again unless the operation is explicitly idempotent.',
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
    primaryKeyword: 'MCP vs skills',
    relatedKeywords: ['Model Context Protocol', 'AI skills', 'MCP tools'],
    audience: 'Developers extending agents with context and actions',
    summary:
      'MCP gives an AI application a standard way to reach external capabilities. Skills give an agent a reusable way to approach a task. They often work together, but they are not substitutes.',
    sections: [
      {
        heading: 'The common confusion',
        body: [
          'Both MCP and skills show up when people ask how to “give an agent more context.” That phrase hides two different needs. Sometimes the agent needs access to a system: list tables, read a file, search docs, create an issue. Sometimes the agent needs a method: how to review a migration, write in a brand voice, or triage an incident.',
          'MCP is strongest for the first need. Skills are strongest for the second.',
        ],
      },
      {
        heading: 'MCP is an interface to capabilities',
        body: [
          'An MCP server exposes tools, resources, and prompts through a standard protocol. The client can discover what is available and call into those capabilities without each agent inventing a custom integration.',
          'This is useful when the capability should be shared across many clients or agents. A Postgres MCP server, a Linear MCP server, or a docs search MCP server can serve multiple workflows.',
        ],
      },
      {
        heading: 'Skills are procedural context',
        body: [
          'A skill is closer to a field manual. It tells the agent how to perform a class of work: what to check, what to avoid, what output shape to use, what examples matter.',
          'Skills should not hide credentials or grant authority. They can tell the model to use a read-only SQL tool carefully, but the read-only boundary must still live in the tool, database role, MCP server, or runtime policy.',
        ],
      },
      {
        heading: 'How they combine in real agents',
        body: [
          'A data analyst agent might use MCP to reach a database schema and use a skill to follow your company’s metric definitions. A code review agent might use native GitHub tools and a skill for severity calibration. A research agent might use an MCP search server and a skill for source quality.',
          'The useful question is not “MCP or skills?” It is “which part is live capability, and which part is judgment?”',
        ],
      },
    ],
    decisionRows: [
      {
        choice: 'MCP server',
        useWhen:
          'Multiple agents or clients need a shared external capability with discoverable tools or resources.',
        avoidWhen:
          'You only need local instructions, examples, or review criteria.',
      },
      {
        choice: 'Skill',
        useWhen:
          'The agent needs repeatable procedure, domain rules, or output standards loaded on demand.',
        avoidWhen:
          'The agent needs to execute an external action or hold credentials.',
      },
      {
        choice: 'Both',
        useWhen:
          'The workflow needs system access plus domain-specific judgment.',
        avoidWhen:
          'Combining them adds indirection without improving safety or reuse.',
      },
    ],
    examples: [
      {
        label: 'Eve example',
        body: 'An Eve agent can keep integration setup in connections, expose narrow tools for actions, and ship skills for domain procedure. evex can distribute all of those files together so users can inspect the whole workflow.',
      },
      {
        label: 'Outside Eve',
        body: 'Cursor or Claude Desktop can connect to an MCP server for tool access while also loading local skills that teach the assistant project-specific conventions.',
      },
    ],
    faqs: [
      {
        question: 'Can MCP transport prompts?',
        answer:
          'Yes, MCP includes prompts as a primitive. That still does not make MCP the same thing as a local skill system. The protocol is the transport and discovery layer.',
      },
      {
        question: 'Can a skill call an MCP tool?',
        answer:
          'A skill can instruct the agent when and how to use a tool exposed through MCP, but the model and runtime still perform the actual tool call.',
      },
      {
        question: 'Which one is safer?',
        answer:
          'Neither by default. Safety comes from narrow capabilities, permissioning, validation, logging, and clear procedures.',
      },
    ],
  },
  {
    slug: 'filesystem-first-agents',
    title:
      'Filesystem-first agents: architecture you can review before it runs',
    shortTitle: 'Filesystem-first agents',
    description:
      'Why placing agent capabilities in predictable files can improve reviewability, distribution, and trust.',
    cluster: 'eve-architecture',
    primaryKeyword: 'filesystem-first agents',
    relatedKeywords: ['Eve agent framework', 'agent project structure'],
    audience: 'Developers comparing agent architecture styles',
    summary:
      'Filesystem-first agent design is not about aesthetics. It is about making capability visible. A reviewer should be able to open the project tree and see where the agent listens, what it can do, what it knows, and when it runs.',
    sections: [
      {
        heading: 'Agents need an inventory, not only code paths',
        body: [
          'A normal application can hide complexity behind modules because most code only runs when called by other code. Agents are different. Their capabilities are offered to a model that chooses what to do next. That makes the capability inventory part of the safety surface.',
          'If tools, prompts, schedules, and channels are scattered across generic application folders, the reviewer has to reconstruct the agent from implementation detail. A filesystem-first layout flips that. The tree tells you what to inspect.',
        ],
      },
      {
        heading: 'What Eve makes explicit',
        body: [
          'Eve uses the `agent/` directory as the authoring boundary. `instructions.md` describes baseline behavior. `tools/` exposes actions. `skills/` carries longer procedures. `channels/` defines where messages arrive. `schedules/` defines unattended work. `connections/` and `lib/` support integrations and shared code.',
          'This does not remove the need for good design. It gives design mistakes a shape. A scheduled action hidden in a helper looks wrong. A broad tool with too many responsibilities looks wrong. A missing `.env.example` for an external integration looks wrong.',
        ],
      },
      {
        heading: 'Where file-first loses',
        body: [
          'Dynamic workflows can outgrow a simple directory inventory. If the core challenge is conditional graph routing, retries across many branches, or explicit state machines, a graph-first framework may expose the logic more directly.',
          'That is the tradeoff. Files make capability review easier. Graphs make control-flow review easier. The right choice depends on what will be hardest to debug six months later.',
        ],
      },
      {
        heading: 'Why this matters for registries',
        body: [
          'A registry that distributes filesystem-first agents can show users the install surface before they run it. That is the connection between Eve and evex: the files are not an implementation detail hidden behind a package. They are the thing being evaluated.',
        ],
      },
    ],
    decisionRows: [
      {
        choice: 'Filesystem-first',
        useWhen:
          'Reviewability, source ownership, and predictable project layout matter.',
        avoidWhen:
          'The workflow is mostly a complex state graph and files would hide the routing logic.',
      },
      {
        choice: 'Graph-first',
        useWhen:
          'Branching, loops, checkpoints, and explicit transitions are the main complexity.',
        avoidWhen:
          'The team mainly needs to inspect installable capabilities and platform entry points.',
      },
      {
        choice: 'Package-first',
        useWhen:
          'The behavior is stable library code that users should not customize.',
        avoidWhen:
          'Users must audit prompts, tools, schedules, or external writes.',
      },
    ],
    examples: [
      {
        label: 'Eve example',
        body: 'A reviewer can scan an Eve agent for `channels/github.ts`, `tools/submit_pr_review.ts`, `skills/review-calibration/SKILL.md`, and `.env.example` before deciding whether the agent is safe to install.',
      },
      {
        label: 'Outside Eve',
        body: 'A LangGraph project may make the execution graph clearer than the capability inventory. That can be the better tradeoff for workflows where transitions are the product.',
      },
    ],
    faqs: [
      {
        question: 'Is filesystem-first only useful for Eve?',
        answer:
          'No. The broader idea is that important capabilities deserve predictable homes. Eve is one clear implementation of that idea.',
      },
      {
        question: 'Does file layout replace documentation?',
        answer:
          'No. It reduces the amount of documentation needed to answer basic review questions, but authors still need README guidance and examples.',
      },
      {
        question: 'Can file-first and graph-first coexist?',
        answer:
          'Yes. A project can use files to expose capabilities and graph logic to orchestrate them. The question is which model owns the main complexity.',
      },
    ],
  },
  {
    slug: 'shadcn-registry-for-agents',
    title:
      'Shadcn registry for agents: why workflows want to be installed as files',
    shortTitle: 'Shadcn registry for agents',
    description:
      'How the shadcn registry model applies to AI agent workflows, where users need source files rather than opaque packages.',
    cluster: 'distribution',
    primaryKeyword: 'shadcn registry for agents',
    relatedKeywords: [
      'agent registry',
      'registry.json agents',
      'source-owned agents',
    ],
    audience: 'Developers packaging reusable agent workflows',
    summary:
      'The shadcn model fits agents because many agent workflows are not libraries. They are source bundles: instructions, tools, skills, env examples, evals, and integration files users need to inspect and adapt.',
    sections: [
      {
        heading: 'A reusable agent is not just a dependency',
        body: [
          'Traditional packages work well when the user wants stable behavior behind an import. Agent workflows often need the opposite. The user wants to see the prompt, adjust the tool, change the channel, remove an integration, or add a stricter approval step.',
          'That is why source distribution is attractive. Install the files into the project, own them, and change them. The registry is not a runtime service. It is a delivery mechanism for code and instructions.',
        ],
      },
      {
        heading: 'What the registry must show before install',
        body: [
          'A serious agent registry should expose the files, target paths, dependencies, author, category, update date, and install command. Otherwise the user cannot answer the basic question: what will this add to my project?',
          'This is especially important for agents because the installed files can contain authority: tools that write to APIs, channels that receive webhooks, schedules that run unattended, and skills that shape judgment.',
        ],
      },
      {
        heading: 'Where evex fits',
        body: [
          'evex uses the shadcn registry pattern for Eve agents. The product promise is not “trust this black box.” It is “inspect the files, then install them with one command.” That is a stronger fit for developer trust than a generic marketplace listing.',
          'The registry also gives authors a standard shape. Instead of sharing a gist, a half-documented folder, or a README snippet, they publish a coherent installable item.',
        ],
      },
      {
        heading: 'The content warning',
        body: [
          'Do not abuse this model by shipping giant bundles nobody can review. Source-owned distribution only builds trust when the source is organized, small enough to inspect, and honest about dependencies and credentials.',
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
          'The workflow has enough files that copy-paste will become unreliable.',
      },
    ],
    examples: [
      {
        label: 'Eve example',
        body: 'An evex item can install `agent/agent.ts`, `agent/instructions.md`, `agent/tools/run_sql.ts`, a skill folder, README, and `.env.example` into the expected Eve layout.',
      },
      {
        label: 'Outside Eve',
        body: 'The same shadcn registry mechanism can distribute project rules, MCP setup, CI workflows, or framework templates because registry items are not limited to React components.',
      },
    ],
    faqs: [
      {
        question: 'Why not publish every agent as an npm package?',
        answer:
          'Because users often need to inspect and change prompts, tools, schedules, and channel behavior. Source files make that normal.',
      },
      {
        question: 'What makes a registry item good?',
        answer:
          'A good item has a clear job, explicit target paths, dependency declarations, setup docs, and files that belong together.',
      },
      {
        question: 'Is this still useful if users customize the files?',
        answer:
          'Yes. Customization is the point. The registry gives them a reviewed starting point instead of a blank folder.',
      },
    ],
  },
  {
    slug: 'eve-vs-langgraph',
    title: 'Eve vs LangGraph: file inventory or explicit state graph?',
    shortTitle: 'Eve vs LangGraph',
    description:
      'A builder-focused comparison of Eve and LangGraph across project shape, control flow, durability, and team fit.',
    cluster: 'comparisons',
    primaryKeyword: 'Eve vs LangGraph',
    relatedKeywords: [
      'LangGraph alternatives',
      'Eve framework',
      'AI agent frameworks',
    ],
    audience: 'Teams choosing an agent framework',
    summary:
      'Eve and LangGraph are not two skins on the same idea. Eve makes agent capability visible through files. LangGraph makes workflow control visible through graphs. Pick based on which thing will be hardest for your team to reason about.',
    sections: [
      {
        heading: 'The real comparison',
        body: [
          'Most framework comparisons collapse into feature bingo: tools, memory, streaming, human-in-the-loop, evals, deployment. That misses the point. Good frameworks make one kind of complexity easier to see.',
          'Eve’s bet is that an agent is a project whose capabilities should live in predictable places. LangGraph’s bet is that agent workflows are stateful graphs whose transitions should be explicit.',
        ],
      },
      {
        heading: 'Where Eve is the better fit',
        body: [
          'Eve is attractive for TypeScript teams that want an agent to look like a backend project: instructions, tools, skills, channels, schedules, connections, and supporting code. It is especially compelling when the agent will be installed, reviewed, and modified as source.',
          'If your team cares about “what files will this add?” Eve gives that question a natural answer. That is why it pairs well with evex and the shadcn registry model.',
        ],
      },
      {
        heading: 'Where LangGraph is the better fit',
        body: [
          'LangGraph is attractive when the workflow’s shape is the hard part: branches, loops, retries, checkpointed state, and explicit transitions between steps. If a diagram of the graph is the artifact the team needs to reason about, LangGraph is probably closer to the center of the problem.',
          'This is not a weakness of Eve. It is a different emphasis. A filesystem can show capability inventory; a graph can show execution topology.',
        ],
      },
      {
        heading: 'A practical way to choose',
        body: [
          'Do not compare hello-world examples. Build the failure path. Include one external write, one approval, one retry, and one deployment or restart. Then ask which framework made the system easier to understand.',
        ],
      },
    ],
    decisionRows: [
      {
        choice: 'Eve',
        useWhen:
          'You want a TypeScript, filesystem-first backend agent whose installed files are easy to inspect.',
        avoidWhen:
          'Your core complexity is a dense state graph with many dynamic transitions.',
      },
      {
        choice: 'LangGraph',
        useWhen:
          'You need explicit graph control, checkpointed state, and detailed routing logic.',
        avoidWhen:
          'The team mainly wants source-owned agent bundles and predictable file layout.',
      },
      {
        choice: 'Hybrid thinking',
        useWhen:
          'You like Eve’s capability layout but still need to document or implement graph-like control explicitly.',
        avoidWhen:
          'The hybrid adds two mental models without clarifying the hard part.',
      },
    ],
    examples: [
      {
        label: 'Eve-shaped workflow',
        body: 'A GitHub PR review agent with a channel, a review tool, a calibration skill, and evals benefits from visible files and source-owned installation.',
      },
      {
        label: 'LangGraph-shaped workflow',
        body: 'A multi-step claims-processing agent with branching escalation paths and many resumable states may benefit from an explicit graph first.',
      },
    ],
    faqs: [
      {
        question: 'Is Eve a LangGraph replacement?',
        answer:
          'Not directly. Eve is a filesystem-first agent framework. LangGraph is a graph-first workflow framework. Their overlap depends on the workflow.',
      },
      {
        question: 'Which is better for TypeScript teams?',
        answer:
          'Eve is more naturally TypeScript-first. LangGraph has a broader ecosystem, especially around Python and LangChain.',
      },
      {
        question: 'Which one should evex content recommend?',
        answer:
          'Recommend neither universally. evex should explain when Eve’s file-owned model is the right tradeoff.',
      },
    ],
  },
  {
    slug: 'human-in-the-loop-agents',
    title: 'Human-in-the-loop agents: approval is a state boundary',
    shortTitle: 'Human-in-the-loop agents',
    description:
      'How to design approval flows that survive retries, changed payloads, and real production delays.',
    cluster: 'agent-engineering',
    primaryKeyword: 'human in the loop agents',
    relatedKeywords: ['agent approvals', 'AI approval workflow', 'HITL agents'],
    audience: 'Teams adding approval gates to agent workflows',
    summary:
      'Human-in-the-loop is not a chat UX pattern. It is a correctness boundary. The system must know exactly what was reviewed, who reviewed it, and what may happen next.',
    sections: [
      {
        heading: 'The dangerous version of approval',
        body: [
          'The weak pattern is familiar: the agent says “Should I proceed?” The user says yes. The agent continues from whatever mutable context it has at that moment. That is fine for brainstorming and dangerous for writes, deploys, customer messages, billing changes, or data access.',
          'Approval needs an object. A patch. A SQL query. A message body. A set of issues to update. If the approved object changes, the approval should not silently transfer.',
        ],
      },
      {
        heading: 'Approval should pause the run',
        body: [
          'A real approval gate pauses execution, stores the reviewed artifact, records the reviewer, and resumes only when the response is valid. That pause may last minutes or days. It should survive reloads, deploys, and worker restarts.',
          'This is where durable execution and human-in-the-loop design meet. The UX is the button. The system design is the state boundary behind it.',
        ],
      },
      {
        heading: 'What to approve',
        body: [
          'Approve high-risk external writes, irreversible actions, public messages, expensive operations, and actions whose correctness depends on human context. Do not require approval for every harmless read or the agent becomes unusable.',
        ],
        bullets: [
          'Approve the exact payload, not a summary of it.',
          'Show why the agent wants to proceed.',
          'Make rejection and revision first-class outcomes.',
          'Expire stale approvals instead of treating them as permanent consent.',
        ],
      },
      {
        heading: 'Eve and evex angle',
        body: [
          'Eve provides a useful environment for agents that pause and resume. evex adds a distribution concern: if an installable agent includes approval behavior, users should be able to inspect the files that implement the gate before trusting it.',
        ],
      },
    ],
    decisionRows: [
      {
        choice: 'No approval',
        useWhen:
          'The action is read-only, reversible, low-cost, and easy to audit after the fact.',
        avoidWhen:
          'The action writes to external systems or users will blame the product for mistakes.',
      },
      {
        choice: 'Inline confirmation',
        useWhen:
          'The action is low risk but benefits from user confirmation in the moment.',
        avoidWhen: 'The approval must survive long delays or process restarts.',
      },
      {
        choice: 'Durable approval gate',
        useWhen:
          'The reviewed artifact and approval record must be exact and recoverable.',
        avoidWhen:
          'The overhead would slow a harmless workflow without reducing risk.',
      },
    ],
    examples: [
      {
        label: 'Good approval',
        body: 'A support agent drafts a refund email, shows the exact text and refund amount, records the manager approval, then sends that exact payload.',
      },
      {
        label: 'Bad approval',
        body: 'An agent asks “send the update?” then regenerates the message after approval and sends a different version.',
      },
    ],
    faqs: [
      {
        question: 'Should every agent have human approval?',
        answer:
          'No. Approval is for risk. Overusing it makes agents slow and trains users to click through without reading.',
      },
      {
        question: 'What should an approval record contain?',
        answer:
          'At minimum: the artifact, reviewer, timestamp, decision, and next action. For sensitive actions, include policy checks and tool arguments.',
      },
      {
        question: 'Can approval be delegated to another agent?',
        answer:
          'Another agent can review, but that is not the same as human authorization unless your policy explicitly allows it.',
      },
    ],
  },
  {
    slug: 'agent-registries',
    title: 'Agent registries: discovery without trust is just a list',
    shortTitle: 'Agent registries',
    description:
      'What an AI agent registry must expose before developers can reuse agents safely.',
    cluster: 'distribution',
    primaryKeyword: 'agent registry',
    relatedKeywords: [
      'AI agent registry',
      'agent catalog',
      'agent marketplace',
    ],
    audience: 'Teams evaluating reusable agent distribution',
    summary:
      'An agent registry should not stop at discovery. It should help a developer answer whether an agent is safe, maintained, installable, and worth adapting.',
    sections: [
      {
        heading: 'The registry problem is not “find me an agent”',
        body: [
          'Search is the easy part. Trust is the hard part. Agents carry instructions, tools, external access, schedules, and sometimes public-facing channels. A card with a name and a nice description does not give a developer enough to install anything.',
          'A useful registry shows the operational surface: what files are installed, what dependencies are needed, who authored it, when it changed, what permissions it implies, and how to inspect it before running it.',
        ],
      },
      {
        heading: 'Marketplace, catalog, registry',
        body: [
          'These words are often used interchangeably, but they imply different jobs. A marketplace helps people choose between vendors. A catalog helps people browse inventory. A registry should provide enough structured metadata for installation, automation, and governance.',
          'evex should lean into registry language. It is not selling agents today. It is making reusable Eve agent configurations discoverable, inspectable, and installable.',
        ],
      },
      {
        heading: 'What a registry item needs',
        body: [
          'A real registry item should have a clear job, source files, target paths, dependencies, setup instructions, author identity, and update metadata. Install counts and favorites are useful signals, but they are secondary to inspectability.',
        ],
        bullets: [
          'Files and target paths',
          'Dependencies and environment variables',
          'Author and source review path',
          'Install command and previewable output',
          'Runtime metrics separated from canonical metadata',
        ],
      },
      {
        heading: 'Why source ownership matters',
        body: [
          'Agent behavior often needs local policy. A company may want a stricter review rubric, a different Slack channel, a narrower SQL policy, or a custom approval step. Source-owned installation makes those changes normal instead of a fork of an opaque tool.',
        ],
      },
    ],
    decisionRows: [
      {
        choice: 'Public registry',
        useWhen:
          'The goal is reusable artifacts that developers can inspect and install across projects.',
        avoidWhen:
          'The agents depend on private infrastructure or company-only policies.',
      },
      {
        choice: 'Internal registry',
        useWhen:
          'The organization needs approved agents, private tools, and governance.',
        avoidWhen:
          'The content is meant for community discovery and contribution.',
      },
      {
        choice: 'Marketplace',
        useWhen:
          'Commerce, reviews, licensing, and support expectations are part of the product.',
        avoidWhen:
          'The product is currently a free source-owned distribution layer.',
      },
    ],
    examples: [
      {
        label: 'evex-style registry',
        body: 'An agent page shows files, dependencies, author, install command, and related agents. The database can track installs, but canonical agent content lives in source.',
      },
      {
        label: 'Enterprise-style registry',
        body: 'A company registry may track approved MCP servers, internal agents, policy status, owners, and runtime deployment state.',
      },
    ],
    faqs: [
      {
        question: 'What makes an agent registry trustworthy?',
        answer:
          'Transparent files, clear ownership, dependency disclosure, review history, and install previews matter more than polished listing copy.',
      },
      {
        question: 'Should a registry store runtime state?',
        answer:
          'It can store metrics and favorites, but canonical agent metadata should stay close to source when users install source files.',
      },
      {
        question: 'Is evex an agent marketplace?',
        answer:
          'Not in the commerce sense. It is better described as a community registry for reusable Eve agent configurations.',
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
