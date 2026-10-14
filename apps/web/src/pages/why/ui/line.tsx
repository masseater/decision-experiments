import type { ReactNode } from "react";

const Line = ({ children, text }: Readonly<{ children: ReactNode; text: string }>): ReactNode => (
  <p className="[&_svg]:text-primary flex items-start gap-3 leading-relaxed [&_svg]:mt-1 [&_svg]:size-4 [&_svg]:shrink-0">
    {children}
    {text}
  </p>
);

export { Line };
