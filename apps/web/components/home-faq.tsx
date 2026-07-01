'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@evex/ui/accordion'

const HOME_FAQ_ITEMS = [
  {
    question: 'What is evex?',
    answer:
      'evex is the community registry for eve agents. It packages reusable agent configurations as shadcn-compatible registry items so developers can browse, inspect, and install them into eve projects.',
  },
  {
    question: 'How do I install an eve agent?',
    answer:
      'Run npx shadcn@latest add @evex/{slug} from your eve app root. The command writes the agent files under agent/ in the layout expected by eve.',
  },
  {
    question: 'How do I publish an agent?',
    answer:
      'Open a pull request to the evex repository with your agent under packages/agent-registry/agents/{slug}. After merge, the agent appears in the public catalog and shadcn registry.',
  },
  {
    question: 'What is eve?',
    answer:
      'eve is a framework for building durable backend AI agents with instructions, skills, tools, connections, and subagents. evex distributes ready-made configurations into eve projects.',
  },
] as const

export function HomeFaq() {
  return (
    <section
      aria-labelledby="home-faq-heading"
      className="mt-16 border-border border-t pt-12"
    >
      <h2
        className="text-balance font-semibold text-2xl text-foreground"
        id="home-faq-heading"
      >
        Frequently Asked Questions
      </h2>
      <Accordion className="mt-6 w-full rounded-md border border-border">
        {HOME_FAQ_ITEMS.map((item) => (
          <AccordionItem key={item.question} value={item.question}>
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="px-4 text-muted-foreground leading-relaxed">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
