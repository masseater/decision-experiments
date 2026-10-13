import { expect, test } from "vite-plus/test";

import { EXAMPLES } from "./examples";

test("every answer appears once in its example", () => {
  for (const example of EXAMPLES) {
    if (example.kind === "injected") {
      for (const answer of example.answers) {
        expect(example.text.indexOf(answer)).toBe(example.text.lastIndexOf(answer));
        expect(example.text).toContain(answer);
      }
    }
  }
});
