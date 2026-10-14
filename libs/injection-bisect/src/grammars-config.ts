import cmakeGrammar from "refractor/cmake";
import dockerGrammar from "refractor/docker";
import gradleGrammar from "refractor/gradle";
import hclGrammar from "refractor/hcl";
import nginxGrammar from "refractor/nginx";
import nixGrammar from "refractor/nix";
import propertiesGrammar from "refractor/properties";
import protobufGrammar from "refractor/protobuf";
import tomlGrammar from "refractor/toml";

const CONFIG_GRAMMARS = [
  tomlGrammar,
  propertiesGrammar,
  dockerGrammar,
  hclGrammar,
  nginxGrammar,
  cmakeGrammar,
  nixGrammar,
  gradleGrammar,
  protobufGrammar,
];

export { CONFIG_GRAMMARS };
