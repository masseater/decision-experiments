import applescriptGrammar from "refractor/applescript";
import awkGrammar from "refractor/awk";
import batchGrammar from "refractor/batch";
import graphqlGrammar from "refractor/graphql";
import matlabGrammar from "refractor/matlab";
import powershellGrammar from "refractor/powershell";
import tclGrammar from "refractor/tcl";
import vimGrammar from "refractor/vim";
import visualBasicGrammar from "refractor/visual-basic";

const SCRIPTING_GRAMMARS = [
  powershellGrammar,
  batchGrammar,
  vimGrammar,
  awkGrammar,
  tclGrammar,
  visualBasicGrammar,
  applescriptGrammar,
  matlabGrammar,
  graphqlGrammar,
];

export { SCRIPTING_GRAMMARS };
