---
title: 'Writing rules'
description: 'The rules that govern all prose in the design library documentation.'
---

## Purpose and audience

These rules govern every doc in `guidance/` and every component `.md` twin. They exist so the corpus reads as one author.

Write for content owners and leadership. They decide what to publish and how to structure it. They do not read code.

## Sentences

- Write one instruction per sentence.
- Keep instructions to 20 words or fewer.
- Keep descriptive sentences to 25 words or fewer.
- Write one topic per paragraph.
- Keep paragraphs to six sentences or fewer.
- Split a long sentence instead of joining clauses with "and", "which" or a semicolon.

## Verbs

- Use the simple tenses only: present, past, future.
- Do not use perfect tenses ("has been", "have received").
- Write in active voice. Name the actor.
- Use passive voice only when the actor is unknown or does not matter.
- Do not start a sentence with an -ing verb form.
- Write instructions as commands (`Use a callout`, not `A callout can be used`).

## Words

- Give each word one meaning and one part of speech.
- Use the same word for the same thing in every doc. Do not vary words for style.
- Keep every noun cluster to three nouns or fewer.
- Do not omit articles. Write "the component renders the form", not "component renders form".

### Technical names

Component names, platform names and contract words form a fixed vocabulary. Use them exactly as published:

- components and patterns – accordion, callout, promo card, sub-nav, and the other published names
- platforms – CivicTheme, Drupal, GovCMS, Storybook, the CMS
- contract words – frontmatter, slug, demo, paragraph type, component type

### Unapproved words

| Do not write | Write |
|---|---|
| utilise | use |
| leverage | use |
| in order to | to |
| prior to | before |
| in the event that | if |
| note that, it is important to note | delete it |
| simply, just, easily | delete it |
| reach for | choose |
| surface (as a verb) | show |
| over-promote, under-promote | give too much weight, give too little weight |

Add a row when a review finds a new offender.

## Structure

Each doc type has a fixed shape. Do not invent a new shape for one page.

### Component docs

Use these sections, in this order:

1. `## When to use`
2. `## When not to use`
3. `## Do` and `## Don't` – as a pair, or neither
4. `## Accessibility`
5. `## Related components`

Add `## Variants` after `## Don't` when the component ships variants. Add other sections only when the component demands them, and keep their headings short.

Every `## Accessibility` section names the behaviour and the WCAG criterion it protects.

### Pattern docs

A pattern doc decides. It tells the reader whether to use a component and which variant fits. The component doc tells the reader how. Do not repeat component guidance in a pattern.

### Template docs

A template doc has four layers, in this order: when to use, sizing and variation, required structure, CMS build. Handle sub-types as variant notes inside the template doc. Do not add a new template for a variant.

## Tone

- State rules as absolutes. Write "must", "do not", "never". Do not soften a rule to "should", "consider" or "in most cases".
- Pair every rule with its consequence.
- Cite the WCAG criterion when the consequence is an accessibility failure.
- Keep "What to avoid here" sections. Write each item as a command plus the consequence.
- Keep the "Reader's job / Page's job" framing where a doc uses it.
- Do not lecture. State the rule and its consequence, then stop. Delete rhetorical framing ("the page has failed", "resist the urge").
- Do not write "This is X, not Y". State what X is.
- Do not use metaphor, idiom or coined verbs.
- Do not ask rhetorical questions.

## Mechanics

- Write headings in sentence case.
- Keep H2 headings short. On pages with `toc: true`, each H2 becomes a nav label.
- Use straight quotes and apostrophes.
- Put a quoted example in backticks (`Use a callout`, not `A callout can be used`). The prose checker skips code spans, so a counter-example does not read as a violation.
- Use an en dash (`–`) for asides and ranges. Never use an em dash (`—`).
- Do not write in all caps. Acronyms (WCAG, CMS, HTML) are the exception.
- Put links at the end of the sentence. Start the link text with the keyword. Make the destination clear from the link text alone.
- Write the `description` frontmatter as one sentence. It renders as the lead paragraph and the card summary. Do not repeat it in the body.
- Do not add an H1 to the body. The site renders the title.

## Spelling and terminology

Use Australian English spelling. Follow the conventions in the [Australian Government Style Manual](https://www.stylemanual.gov.au/).

Where these rules and the Style Manual conflict, the Style Manual wins on spelling and terminology. These rules win on sentence structure.
