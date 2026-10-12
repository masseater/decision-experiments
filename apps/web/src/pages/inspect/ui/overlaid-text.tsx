import { useCallback } from "react";
import type { ChangeEvent, ReactNode } from "react";

import type { InspectState } from "#/pages/inspect/api/use-inspect";
import { useDraftText, useFocus, useSetDraftText } from "#/pages/inspect/model/draft";
import type { Focus } from "#/pages/inspect/model/draft";
import { MAX_CHARS } from "#/pages/inspect/model/models";
import { piecesOf } from "#/pages/inspect/model/overlay";
import type { Piece } from "#/pages/inspect/model/overlay";

import { HighlightTextarea } from "./highlight-textarea";
import { TONE_CLASS } from "./tone";

const FIRST = 0;

const overlayOf = (text: string, state: InspectState, focus: Focus): readonly Piece[] => {
  if (state.status !== "streaming" || state.text !== text) {
    return [{ start: FIRST, text, tone: "none" }];
  }
  return piecesOf({ text, trace: state.trace, focus });
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
        <span key={piece.start} className={TONE_CLASS[piece.tone]}>
          {piece.text}
        </span>
      ))}
    </HighlightTextarea>
  );
};

export { OverlaidText };
