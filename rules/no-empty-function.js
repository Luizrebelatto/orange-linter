export function check(code, ast, filePath) {
  const issues = [];

  function traverse(node) {
    if (!node) return;

    if (
      (node.type === "FunctionDeclaration" || node.type === "FunctionExpression" || node.type === "ArrowFunctionExpression") &&
      node.body.type === "BlockStatement" &&
      node.body.body.length === 0
    ) {
      issues.push({
        message: "\x1b[31mEmpty function detected\x1b[0m",
        line: node.loc.start.line,
        column: node.loc.start.column,
        file: filePath
      });
    }

    for (const key in node) {
      if (node[key] && typeof node[key] === "object") {
        if (Array.isArray(node[key])) {
          node[key].forEach(traverse);
        } else {
          traverse(node[key]);
        }
      }
    }
  }

  traverse(ast);
  return issues;
}
