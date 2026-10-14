import { cn } from "@decision-experiments/web-ui";
import { useCallback } from "react";
import type { ChangeEvent, ReactNode } from "react";

import type { InspectState } from "#/pages/inspect/api/use-inspect";
import { answerOf } from "#/pages/inspect/model/answer";
import { useDraftText, useFocus, useSetDraftText } from "#/pages/inspect/model/draft";
import type { Focus } from "#/pages/inspect/model/draft";
import { MAX_CHARS } from "#/pages/inspect/model/models";
import { piecesOf } from "#/pages/inspect/model/overlay";
import type { Piece } from "#/pages/inspect/model/overlay";
import { traceOf } from "#/pages/inspect/model/trace";

import { HighlightTextarea } from "./highlight-textarea";
import { ANSWER_CLASS, TONE_CLASS } from "./tone";

const NOT_RUN = traceOf([]);

const overlayOf = (text: string, state: InspectState, focus: Focus): readonly Piece[] => {
  const answer = answerOf(text);
  if (state.status !== "streaming" || state.text !== text) {
    return piecesOf({ text, trace: NOT_RUN, focus, answer });
  }
  return piecesOf({ text, trace: state.trace, focus, answer });
};

const OverlaidText = ({ state }: Readonly<{ state: InspectState }>): ReactNode => {
  const text = useDraftText();
  const setText = useSetDraftText();
  const focus = useFocus();
  const edit = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      setText(event.target.value);
    },
    [setText],
  );
  return (
    <HighlightTextarea maxLength={MAX_CHARS} value={text} onChange={edit}>
      {overlayOf(text, state, focus).map((piece) => (
        <span
          key={piece.start}
          className={cn(TONE_CLASS[piece.tone], piece.answer && ANSWER_CLASS)}
        >
          {piece.text}
        </span>
      ))}
    </HighlightTextarea>
  );
};

export { OverlaidText };
