import { PRODUCT_NAME } from "@injection-bisect/core";

const COPY = {
  title: PRODUCT_NAME,
  apiKey: "OpenRouter API キー",
  submit: "インジェクションを探す",
  pending: "探しています…",
  clean: "インジェクションなし",
  injected: "インジェクションあり",
  result: "結果",
  step: "段目",
  times: "回",
} as const;

export { COPY };
