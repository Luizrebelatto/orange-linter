export function check(code, ast, filePath) {
  const issues = [];

  const walk = (node) => {
    if (!node || typeof node !== "object") return;

    const typeOfFunction = ["FunctionDeclaration", "FunctionExpression", "ArrowFunctionExpression"]

    if (typeOfFunction.includes(node.type) && node.body?.type === "BlockStatement" && node.body.body.length === 0) {
      issues.push({
        message: "\x1b[31mEmpty function detected\x1b[0m",
        line: node.loc.start.line,
        column: node.loc.start.column,
        file: filePath
      });
    }

    for (const value of Object.values(node)) {
      if (Array.isArray(value)) value.forEach(walk);
      else walk(value);
    }
  };

  walk(ast);
  return issues;
}
