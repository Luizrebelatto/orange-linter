export function check(code, ast, filePath) {
  const issues = [];
  ast.tokens.forEach((token, i) => {
    
    if (
      token.type === "Identifier" &&
      token.value === "console" &&
      ast.tokens[i + 1]?.value === "."
    ) {
      issues.push({
        message: "\x1b[31mavoid use console.log\x1b[0m",
        line: token.loc.start.line,
        column: token.loc.start.column,
        file: filePath
      });
    }
  });

  return issues;
}