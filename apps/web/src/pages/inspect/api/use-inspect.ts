import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";

import { inspectQueries } from "./queries";
import type { InspectInput, InspectResponse } from "./routes.server";

type Inspected = Exclude<InspectResponse, Readonly<{ status: "failed" }>>;

type InspectOutcome =
  | { readonly status: "idle" | "pending" }
  | { readonly status: "error"; readonly message: string }
  | { readonly status: "success"; readonly text: string; readonly response: Inspected };

interface Inspect {
  readonly submit: (input: InspectInput) => void;
  readonly outcome: InspectOutcome;
}

const inspectMutation = inspectQueries.api.inspect.post.mutationOptions();

const settled = (text: string, response: InspectResponse): InspectOutcome => {
  if (response.status === "failed") {
    return { status: "error", message: response.reason };
  }
  return { status: "success", text, response };
};

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
    return { submit, outcome: settled(mutation.variables.text, mutation.data) };
  }
  if (mutation.status === "error") {
    return { submit, outcome: { status: "error", message: mutation.error.message } };
  }
  return { submit, outcome: { status: mutation.status } };
};

export type { Inspected, InspectOutcome };
export { useInspect };
