import { COMPILED_GRAMMARS } from "./grammars-compiled.ts";
import { CONFIG_GRAMMARS } from "./grammars-config.ts";
import { FUNCTIONAL_GRAMMARS } from "./grammars-functional.ts";
import { SCRIPTING_GRAMMARS } from "./grammars-scripting.ts";

interface Language {
  readonly format: string;
  readonly extensions: readonly string[];
  readonly aliases: readonly string[];
  readonly signature: RegExp;
}

const NEVER = /(?!)/u;

const GRAMMARS = [
  ...CONFIG_GRAMMARS,
  ...FUNCTIONAL_GRAMMARS,
  ...COMPILED_GRAMMARS,
  ...SCRIPTING_GRAMMARS,
];

const MORE_LANGUAGES: readonly Language[] = [
  { format: "css", extensions: [".css"], aliases: [], signature: NEVER },
  { format: "scss", extensions: [".scss"], aliases: [], signature: NEVER },
  { format: "sass", extensions: [".sass"], aliases: [], signature: NEVER },
  { format: "less", extensions: [".less"], aliases: [], signature: NEVER },
  { format: "lua", extensions: [".lua"], aliases: [], signature: NEVER },
  { format: "perl", extensions: [".pl", ".pm"], aliases: [], signature: NEVER },
  { format: "r", extensions: [".r"], aliases: [], signature: NEVER },
  {
    format: "objectivec",
    extensions: [".m", ".mm"],
    aliases: ["objc", "objective-c"],
    signature: NEVER,
  },
  {
    format: "makefile",
    extensions: [".mk", "makefile", "gnumakefile"],
    aliases: ["make"],
    signature: NEVER,
  },
  {
    format: "ini",
    extensions: [".ini", ".cfg", ".conf", ".editorconfig"],
    aliases: [],
    signature: NEVER,
  },
  { format: "toml", extensions: [".toml"], aliases: [], signature: NEVER },
  { format: "properties", extensions: [".properties", ".env"], aliases: ["env"], signature: NEVER },
  {
    format: "powershell",
    extensions: [".ps1", ".psm1"],
    aliases: ["ps1", "pwsh"],
    signature: NEVER,
  },
  { format: "scala", extensions: [".scala", ".sc"], aliases: [], signature: NEVER },
  { format: "dart", extensions: [".dart"], aliases: [], signature: NEVER },
  { format: "elixir", extensions: [".ex", ".exs"], aliases: [], signature: NEVER },
  { format: "erlang", extensions: [".erl", ".hrl"], aliases: [], signature: NEVER },
  { format: "haskell", extensions: [".hs"], aliases: ["hs"], signature: NEVER },
  {
    format: "clojure",
    extensions: [".clj", ".cljs", ".cljc", ".edn"],
    aliases: ["clj"],
    signature: NEVER,
  },
  { format: "fsharp", extensions: [".fs", ".fsx"], aliases: ["f#"], signature: NEVER },
  { format: "ocaml", extensions: [".ml", ".mli"], aliases: [], signature: NEVER },
  { format: "julia", extensions: [".jl"], aliases: [], signature: NEVER },
  { format: "groovy", extensions: [".groovy"], aliases: [], signature: NEVER },
  { format: "gradle", extensions: [".gradle"], aliases: [], signature: NEVER },
  {
    format: "docker",
    extensions: [".dockerfile", "dockerfile", "containerfile"],
    aliases: ["dockerfile"],
    signature: NEVER,
  },
  {
    format: "hcl",
    extensions: [".tf", ".hcl", ".tfvars"],
    aliases: ["terraform"],
    signature: NEVER,
  },
  { format: "graphql", extensions: [".graphql", ".gql"], aliases: [], signature: NEVER },
  { format: "protobuf", extensions: [".proto"], aliases: ["proto"], signature: NEVER },
  { format: "nginx", extensions: [".nginx", "nginx.conf"], aliases: [], signature: NEVER },
  { format: "batch", extensions: [".bat", ".cmd"], aliases: ["bat", "cmd"], signature: NEVER },
  { format: "matlab", extensions: [], aliases: [], signature: NEVER },
  { format: "solidity", extensions: [".sol"], aliases: [], signature: NEVER },
  { format: "zig", extensions: [".zig"], aliases: [], signature: NEVER },
  { format: "nim", extensions: [".nim"], aliases: [], signature: NEVER },
  { format: "crystal", extensions: [".cr"], aliases: [], signature: NEVER },
  { format: "fortran", extensions: [".f", ".f90", ".f95"], aliases: [], signature: NEVER },
  { format: "pascal", extensions: [".pas"], aliases: ["delphi"], signature: NEVER },
  { format: "cobol", extensions: [".cob", ".cbl"], aliases: [], signature: NEVER },
  {
    format: "vim",
    extensions: [".vim", "vimrc", ".vimrc"],
    aliases: ["vimscript"],
    signature: NEVER,
  },
  { format: "cmake", extensions: [".cmake", "cmakelists.txt"], aliases: [], signature: NEVER },
  { format: "awk", extensions: [".awk"], aliases: [], signature: NEVER },
  { format: "tcl", extensions: [".tcl"], aliases: [], signature: NEVER },
  { format: "elm", extensions: [".elm"], aliases: [], signature: NEVER },
  {
    format: "visual-basic",
    extensions: [".vb", ".vbs", ".bas"],
    aliases: ["vb", "vba", "vbscript"],
    signature: NEVER,
  },
  { format: "vbnet", extensions: [], aliases: [], signature: NEVER },
  { format: "applescript", extensions: [".applescript", ".scpt"], aliases: [], signature: NEVER },
  { format: "nix", extensions: [".nix"], aliases: [], signature: NEVER },
];

export { GRAMMARS, MORE_LANGUAGES, NEVER };
export type { Language };
