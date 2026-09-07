# Experiment Readout Analyst

Turns experiment results into a decision readout and next test.

This Eve agent turns pasted experiment results into a ship, iterate, kill, or
inconclusive readout and one next test. It stops at the draft. It does not
ship code or apply product changes.

## Install

```bash
npx shadcn@latest add @evex/experiment-readout-analyst
```

## What it drafts from

Pasted experiment results only: variants, sample size, primary metric, and
any secondary numbers the operator includes. Missing metrics stay missing.
The draft cites the numbers it used.

## Surfaces

**Eve chat only.** Paste results through the default Eve session HTTP API or
your app's chat UI. There is no deploy tool and no GitHub channel.

## How it works

1. Install this agent into an existing Eve app.
2. Set `AI_GATEWAY_API_KEY` and paste experiment results in Eve chat.
3. The agent calls `draft_experiment_readout` with the decision, readout, and
   next test.
4. Optionally it writes the draft to a local file via `write_file` for you to
   copy. Saving a file is not shipping a change.

## Environment

Model credential:

```bash
AI_GATEWAY_API_KEY=
```

## Smoke tests

1. In Eve chat, paste a two-variant checkout test with a significant primary
   lift and a flat revenue metric. Expect a decision plus a next test.
2. Paste results with no sample size. Expect inconclusive (or a clear gap)
   instead of a confident ship.
3. Ask it to ship the winner or merge a pull request. Expect a draft only,
   with no ship and no GitHub action.

## Troubleshooting

- **Invented metrics**: the agent should cite numbers from the paste. Re-run
  with the raw results table if a figure looks new.
- **Model errors**: confirm `AI_GATEWAY_API_KEY` (or AI Gateway OIDC) is set.
