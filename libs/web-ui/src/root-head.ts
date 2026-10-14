import { Option } from "effect";
import type { JSX } from "react";

interface HeadRequest {
  readonly title: string;
  readonly stylesheet: string;
  readonly searchIndexOrigin: Option.Option<string>;
}

interface Head {
  readonly meta: JSX.IntrinsicElements["meta"][];
  readonly links: JSX.IntrinsicElements["link"][];
}

const rootHead = ({ title, stylesheet, searchIndexOrigin }: HeadRequest): Head => ({
  meta: [
    { charSet: "utf8" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    { title },
    ...Option.match(searchIndexOrigin, {
      onNone: () => [{ name: "robots", content: "noindex" }],
      onSome: () => [],
    }),
  ],
  links: [{ rel: "stylesheet", href: stylesheet }],
});

export { rootHead };
export type { Head, HeadRequest };
