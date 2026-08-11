export const HOME_FAQ_ITEMS = [
  {
    question: 'What is evex?',
    answer:
      'evex is the community registry for eve agents. It packages reusable agent configurations as shadcn-compatible registry items so developers can browse, inspect, and install them into eve projects.',
  },
  {
    question: 'How do I install an eve agent?',
    answer:
      'Run eve add https://www.evex.sh/r/{slug}.json from your eve app root. The command writes the agent files under agent/ in the layout expected by eve.',
  },
  {
    question: 'How do I publish an agent?',
    answer:
      'Open a pull request to the evex repository with your agent under registry/{slug}. After merge, the agent appears in the public catalog and shadcn registry.',
  },
  {
    question: 'What is eve?',
    answer:
      'eve is a framework for building durable backend AI agents with instructions, skills, tools, connections, and subagents. evex distributes ready-made configurations into eve projects.',
  },
] as const
