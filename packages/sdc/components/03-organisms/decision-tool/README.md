# Decision tool

A config-driven, 100% client-side branching decision tool. The user answers a
short check in their browser; at the end the component shows a severity-keyed
outcome and an opaque reference code, and exposes the structured result so a host
page can carry it into a separate confidential form. The answers never leave the
device.

## Completion contract

On completion the component dispatches a bubbling `CustomEvent` on its root
element. This is the primary integration point for a host page.

- **Event:** `civictheme:decision-tool:complete`
- **detail:**

  ```js
  {
    questionSetId: string,   // question_set.id
    outcomeId: string,       // id of the matched outcome
    flags: string[],         // accumulated criterion flags, in encounter order
    referenceCode: string    // opaque code, e.g. "QBV0-4JER-3"
  }
  ```

Consume it from the host page:

```js
document.addEventListener('civictheme:decision-tool:complete', (e) => {
  const { questionSetId, outcomeId, flags, referenceCode } = e.detail;
  // e.g. carry referenceCode into a separate confidential form.
});
```

### Reference code

Cryptographically random (`crypto.getRandomValues`), Crockford base32 with a
trailing check character, formatted `XXXX-XXXX-C`. It does not encode the answers
– a leaked code reveals nothing. A fresh code is generated on every completion.

### Optional sessionStorage (`storage_key`)

Off by default. When `storage_key` is set, the same `detail` object is also
written as JSON to `sessionStorage[storage_key]` on completion. Nothing else is
ever persisted.

## Privacy

100% client-side. The component issues no `fetch` / `XHR` / `WebSocket` / form
submission, never touches `window.location` (no query string, no hash), and emits
no analytics or `dataLayer` pushes. The only persistence is the opt-in
`storage_key` write above.

## Key props

- `question_set` – the questionnaire definition (see schema below).
- `option_style` – `list` (default radio/checkbox list) or `card` (selectable cards).
- `show_progress` – show the horizontal step indicator (auto for 3+ steps).
- `storage_key` – opt-in sessionStorage key for the completion detail.
- `theme`, `vertical_spacing`, and the UI label overrides (`back_label`,
  `next_label`, `submit_label`, `restart_label`, `reference_label`, `copy_label`,
  `progress_label`).

## Question set schema

```yaml
question_set:
  id: string                      # echoed back as questionSetId
  title: string                   # optional
  intro: string                   # optional
  steps:
    - id: string
      question: string
      help: string                # optional
      type: single | multiple     # radios | checkboxes (default single)
      option_style: list | card   # optional per-step override
      next: <stepId> | result     # optional default next for the step
      options:
        - id: string
          label: string
          description: string      # optional supporting line (good with cards)
          value: string            # optional, defaults to id
          next: <stepId> | result  # optional, per-option branching (single only)
          flags: [criterionId]     # optional, added to the flag set when chosen
  outcomes:                        # first match wins; put a catch-all last
    - id: string
      when:                        # omit (or leave empty) for a catch-all
        all: [criterionId]         # every listed flag must be present
        any: [criterionId]         # at least one listed flag must be present
      heading: string
      body: string
      severity: info | success | warning | error   # maps to the Message type + icon
      cta:                         # optional
        label: string
        href: string
```

Branching: a chosen option's `next` decides the next step for single-choice
steps; `multiple` steps use the step-level `next`. `flags` accumulate along the
path actually taken (recomputed on Back) and select the outcome.

## Accessibility

Each step is a `<fieldset>` / `<legend>` radio or checkbox group. Focus moves to
the question heading on navigation and to the result on completion; step and
result changes are announced through an `aria-live` region. The progress
indicator marks completed steps with a check (not colour alone) and the current
step with `aria-current`. Severity is carried by the Message icon and heading
text. The flow needs JavaScript; a `<noscript>` notice covers the no-JS case.
