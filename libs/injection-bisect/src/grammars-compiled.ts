import cobolGrammar from "refractor/cobol";
import crystalGrammar from "refractor/crystal";
import dartGrammar from "refractor/dart";
import fortranGrammar from "refractor/fortran";
import groovyGrammar from "refractor/groovy";
import nimGrammar from "refractor/nim";
import pascalGrammar from "refractor/pascal";
import solidityGrammar from "refractor/solidity";
import zigGrammar from "refractor/zig";

const COMPILED_GRAMMARS = [
  dartGrammar,
  groovyGrammar,
  solidityGrammar,
  zigGrammar,
  nimGrammar,
  crystalGrammar,
  fortranGrammar,
  pascalGrammar,
  cobolGrammar,
];

export { COMPILED_GRAMMARS };
