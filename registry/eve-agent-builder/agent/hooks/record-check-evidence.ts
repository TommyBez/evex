import { defineHook } from "eve/hooks";
import { toolResultFrom } from "eve/tools";
import {
  classifyEveCommand,
  deliveryEvidence,
} from "../lib/delivery-evidence";
import runEveCli from "../tools/run_eve_cli";

// Records the outcome of every run_eve_cli info/build/eval call into durable
// session state. The runtime-status instructions render this evidence each
// turn, so deploy approvals are grounded in recorded results instead of the
// model's recollection. Observe-only: this hook gates nothing.
export default defineHook({
  events: {
    "action.result"(event) {
      const result = toolResultFrom(event.data.result, runEveCli);

      if (!result) {
        return;
      }

      const kind = classifyEveCommand(result.output.command);

      if (!kind) {
        return;
      }

      deliveryEvidence.update((current) => ({
        checks: {
          ...current.checks,
          [kind]: {
            command: result.output.command,
            exitCode: result.output.exitCode,
          },
        },
      }));
    },
  },
});
