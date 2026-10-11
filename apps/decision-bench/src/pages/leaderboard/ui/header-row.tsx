import type { ReactNode } from "react";

const FIRST = 0;

const alignOf = (index: number, align: "start" | "end"): string => {
  if (index === FIRST || align === "start") {
    return "text-left";
  }
  return "text-right";
};

const HeaderRow = ({
  headers,
  align,
}: Readonly<{ headers: readonly string[]; align: "start" | "end" }>): ReactNode => (
  <tr className="text-muted-foreground">
    {headers.map((header, index) => (
      <th key={header} scope="col" className={`pr-3 pb-2 font-normal ${alignOf(index, align)}`}>
        {header}
      </th>
    ))}
  </tr>
);

export { HeaderRow };
