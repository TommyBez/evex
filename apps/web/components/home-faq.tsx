'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@evex/ui/accordion'
import { HOME_FAQ_ITEMS } from '@/lib/home-faq-content'

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
