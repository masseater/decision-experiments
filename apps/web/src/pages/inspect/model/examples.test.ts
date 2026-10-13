import { expect, test } from "vite-plus/test";

import { EXAMPLES } from "./examples";

test("every answer appears once in its example", () => {
  for (const example of EXAMPLES) {
    if (example.kind === "injected") {
      expect(example.text.indexOf(example.answer)).toBe(example.text.lastIndexOf(example.answer));
      expect(example.text).toContain(example.answer);
    }
  }
});
