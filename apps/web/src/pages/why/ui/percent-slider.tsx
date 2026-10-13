import { useCallback, useId } from "react";
import type { ChangeEvent, ReactNode } from "react";

import { PERCENT } from "#/pages/why/model/layers";

const NONE = 0;

const PercentSlider = ({
  label,
  value,
  onChange,
}: Readonly<{ label: string; value: number; onChange: (percent: number) => void }>): ReactNode => {
  const id = useId();
  const slide = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange(event.currentTarget.valueAsNumber);
    },
    [onChange],
  );
  return (
    <div className="grid grid-cols-1 items-center gap-2 text-sm md:grid-cols-3">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="range"
        min={NONE}
        max={PERCENT}
        value={value}
        onChange={slide}
        className="accent-primary"
      />
      <output htmlFor={id} className="font-mono">{`${value}%`}</output>
    </div>
  );
};

export { PercentSlider };
