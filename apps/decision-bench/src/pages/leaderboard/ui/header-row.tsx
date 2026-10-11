import type { ReactNode } from "react";

const HeaderRow = ({ headers }: Readonly<{ headers: readonly string[] }>): ReactNode => (
  <tr className="text-muted-foreground text-left">
    {headers.map((header) => (
      <th key={header} scope="col" className="pr-4 pb-2 font-normal">
        {header}
      </th>
    ))}
  </tr>
);

export { HeaderRow };
