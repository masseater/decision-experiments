import type { ReactNode } from "react";

const Section = ({
  id,
  title,
  note,
  children,
}: Readonly<{ id: string; title: string; note: string; children: ReactNode }>): ReactNode => (
  <section className="flex flex-col gap-4">
    <h2 id={id} className="text-lg font-semibold">
      {title}
    </h2>
    <p className="text-muted-foreground text-sm">{note}</p>
    {children}
  </section>
);

export { Section };
