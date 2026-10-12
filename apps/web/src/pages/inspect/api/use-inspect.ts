import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";

import type { ModelChoice } from "#/pages/inspect/model/models";

import { inspectQueries } from "./queries";
import type { InspectResponse } from "./routes.server";

interface InspectInput {
  readonly text: string;
  readonly model: ModelChoice;
}

type InspectOutcome =
  | { readonly status: "idle" | "pending" }
  | { readonly status: "error"; readonly message: string }
  | { readonly status: "success"; readonly text: string; readonly response: InspectResponse };

interface Inspect {
  readonly submit: (input: InspectInput) => void;
  readonly outcome: InspectOutcome;
}

const inspectMutation = inspectQueries.api.inspect.post.mutationOptions();

const useInspect = (): Inspect => {
  const mutation = useMutation(inspectMutation);
  const { mutate } = mutation;
  const submit = useCallback(
    (input: InspectInput) => {
      mutate(input);
    },
    [mutate],
  );
  if (mutation.status === "success") {
    return {
      submit,
      outcome: { status: "success", text: mutation.variables.text, response: mutation.data },
    };
  }
  if (mutation.status === "error") {
    return { submit, outcome: { status: "error", message: mutation.error.message } };
  }
  return { submit, outcome: { status: mutation.status } };
};

export type { InspectOutcome };
export { useInspect };
