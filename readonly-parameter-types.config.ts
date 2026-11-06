const readonlyParameterTypes: {
  ignoreInferredTypes: boolean;
  allow: (
    | { from: "lib"; name: string }
    | { from: "package"; package: string; name: string | string[] }
  )[];
} = {
  ignoreInferredTypes: true,
  allow: [
    { from: "lib", name: "Request" },
    { from: "lib", name: "Uint8Array" },
    { from: "lib", name: "DataView" },
    { from: "package", package: "@tanstack/query-core", name: "QueryClient" },
    { from: "package", package: "ical.js", name: "Component" },
    {
      from: "package",
      package: "@jupyterlab/nbformat",
      name: [
        "ICell",
        "IDisplayData",
        "IExecuteResult",
        "INotebookContent",
        "IOutput",
        "MultilineString",
      ],
    },
    {
      from: "package",
      package: "react",
      name: ["ReactNode", "ButtonHTMLAttributes", "ChangeEvent", "ClassAttributes"],
    },
    { from: "package", package: "clsx", name: "ClassValue" },
    { from: "package", package: "unpdf", name: "PDFDocumentProxy" },
    { from: "package", package: "@kenjiuno/msgreader", name: "FieldsData" },
    {
      from: "package",
      package: "parse5",
      name: [
        "Document",
        "DocumentFragment",
        "DocumentType",
        "Element",
        "Template",
        "CommentNode",
        "TextNode",
      ],
    },
    {
      from: "package",
      package: "@types/mdast",
      name: ["Code", "Nodes"],
    },
    { from: "package", package: "@types/hast", name: ["Element", "RootContent"] },
    { from: "package", package: "postal-mime", name: ["Address", "Email"] },
    { from: "package", package: "fflate", name: ["Unzipped"] },
    {
      from: "package",
      package: "@openrouter/sdk",
      name: ["DecisionsChoiceAnswer", "DecisionsNoulAnswer", "DecisionsScoreAnswer", "Unknown"],
    },
    { from: "package", package: "recharts", name: "TooltipPayloadEntry" },
    {
      from: "package",
      package: "effect",
      name: ["Cause", "Context", "Effect", "Exit", "Layer", "Option"],
    },
  ],
};

export { readonlyParameterTypes };
