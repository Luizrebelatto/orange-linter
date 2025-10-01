export function check(code, ast, filePath) {
  const issues = [];

  ast.tokens.forEach(token => {
    if (token.type === "Keyword" && token.value === "var") {
      issues.push({
        message: "\x1b[31mavoid var, use let or const\x1b[0m",
        line: token.loc.start.line,
        column: token.loc.start.column,
        file: filePath
      });
    }
  });

  return issues;
}
