import type { ReactNode } from "react";

import { sentenceClass } from "#/pages/why/model/cleanup";
import type { View } from "#/pages/why/model/cleanup";
import { SAMPLE } from "#/pages/why/model/copy";

const Sentences = ({ view }: Readonly<{ view: View }>): ReactNode => (
  <p className="text-sm leading-relaxed">
    {SAMPLE.map(({ text, kind }) => (
      <span key={text} className={sentenceClass({ view, kind })}>
        {text}
      </span>
    ))}
  </p>
);

export { Sentences };
