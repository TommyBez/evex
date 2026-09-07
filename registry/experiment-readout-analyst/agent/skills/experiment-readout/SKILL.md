---
name: experiment-readout
description: Turn pasted experiment results into a decision readout and next test. Use when an operator pastes experiment results or asks for a ship, iterate, or kill call.
---

# Experiment readout

Draft only from the pasted results. Do not invent metrics.

## Steps

1. Restate the experiment, variants, and primary metric.
2. Make a decision: ship, iterate, kill, or inconclusive.
3. Propose one next test that follows from the results.
4. Call `draft_experiment_readout` once with the decision, readout, next
   test, and cited metrics.
5. Optionally `write_file` the draft for the operator to copy without asking.
   A file write is not a ship.
6. Finish without `ask_question`. Do not park on ship or GitHub choices.

## Do not

- Ship, deploy, or merge code
- Open or comment on GitHub issues or pull requests
- Invent metrics that are not in the paste
- Claim a variant was rolled out
