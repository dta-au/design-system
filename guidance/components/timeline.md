---
title: 'Timeline'
description: 'A timeline walks users through a process by presenting each stage as a distinct, visually connected step.'
component-type: Content
rendered-by: []
---

Use a timeline to explain how a process works. It suits an agency submitting a digital investment plan, a program cohort moving from application to completion, or an assessor checking a policy for compliance. The component presents each stage as a named step with supporting content. A visual path connects the steps and shows where each one sits in the process.

The component takes a header with a title and description. Each step takes an image, a primary label, and secondary content. An optional bottom area holds a summary or the next action.

## When to use

Use a timeline when:

- you are explaining a process that users need to understand before they can act
- the process has 3–8 distinct steps, each with enough substance to describe
- the order of steps is meaningful and fixed – one step leads to the next
- you write each step from the user's perspective: what they do, or what happens to them
- step labels are short and active: 'Submit your digital investment plan', not 'Step 3 – DIP submission activities'
- each step has an image; the component pairs image with content and looks unbalanced without one

## When not to use

Do not use a timeline when:

- the content is a list of events with dates – use a table or a rich text list instead
- there are fewer than 3 steps – a numbered list in the rich text body is sufficient
- there are more than 8 steps – the component becomes hard to scan; split the process into phases
- the user can take the steps in any order – use a card grid instead
- the content is primarily navigational – use a card grid or section landing page instead
- the process is internal to the DTA – describe what happens to the user, not what the agency does behind the scenes
- step content would run to long paragraphs – keep each step to 2–3 sentences, and link to a guide for more detail

## Accessibility

- The path that connects the steps is decorative. Every step must carry its own meaning in text (WCAG 1.3.1 Info and Relationships).
- Step labels follow the heading order of the page around them, so the page outline stays intact (WCAG 2.4.6 Headings and Labels).
- A step image that adds information needs alt text. A step image that only decorates takes empty alt text (WCAG 1.1.1 Non-text Content).

## Related components

- [Promo](/components/promo/) – use when you need to highlight a single featured item without implying a sequence.
- [Campaign](/components/campaign/) – use for a major editorial feature that does not require ordered steps.
- [Callout](/components/callout/) – use within a rich text body to draw attention to a single important step or requirement.

## Related patterns

- Program page – use a timeline in the 'how we deliver the program' section of a [program page](/templates/program/) to show how participants progress.
- Guide – to visualise a multi-step process before explaining each step in detail, embed a timeline in a [guide](/templates/guide/).
