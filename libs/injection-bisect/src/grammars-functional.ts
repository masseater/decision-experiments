import clojureGrammar from "refractor/clojure";
import elixirGrammar from "refractor/elixir";
import elmGrammar from "refractor/elm";
import erlangGrammar from "refractor/erlang";
import fsharpGrammar from "refractor/fsharp";
import haskellGrammar from "refractor/haskell";
import juliaGrammar from "refractor/julia";
import ocamlGrammar from "refractor/ocaml";
import scalaGrammar from "refractor/scala";

const FUNCTIONAL_GRAMMARS = [
  scalaGrammar,
  elixirGrammar,
  erlangGrammar,
  haskellGrammar,
  clojureGrammar,
  fsharpGrammar,
  ocamlGrammar,
  elmGrammar,
  juliaGrammar,
];

export { FUNCTIONAL_GRAMMARS };
