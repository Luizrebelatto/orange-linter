import fs from "fs";
import esprima from "esprima";
import * as noVar from "./rules/no-var.js";
import * as maxLineLength from "./rules/max-line-length.js";
import * as noConsole from "./rules/no-console.js";
import * as noEmptyFunction from "./rules/no-empty-function.js";
import * as noUnusedVar from "./rules/unused-var.js";
import * as noUnusedFunction from "./rules/unused-function.js";

const rules = [noVar, maxLineLength, noConsole, noEmptyFunction, noUnusedVar, noUnusedFunction];

export function lintFile(filePath) {
  const code = fs.readFileSync(filePath, "utf-8");
  const ast = esprima.parseScript(code, { loc: true, tokens: true });

  const issues = [];

  for (const rule of rules) {
    const foundIssues = rule.check(code, ast, filePath);
    issues.push(...foundIssues);
  }

  return issues;
}
