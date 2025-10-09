export function check(code, ast, filePath) {
  const functionDeclared = new Set();
  const functionsCalled = new Set();
  const issues = [];

  function traverse(node) {
    if (!node || typeof node !== "object") return;

    switch (node.type) {
      case "FunctionDeclaration":
        if (node.id?.name) {
            functionDeclared.add(node.id.name)
        };
        break;

      case "VariableDeclarator":
        if (
          (node.init?.type === "FunctionExpression" ||
           node.init?.type === "ArrowFunctionExpression") &&
          node.id?.name
        ) {
          functionDeclared.add(node.id.name);
        }
        break;

      case "CallExpression":
        if (node.callee?.type === "Identifier") {
          functionsCalled.add(node.callee.name);
        }
        break;
    }

    for (const value of Object.values(node)) {
      if (Array.isArray(value)) value.forEach(traverse);
      else if (typeof value === "object") traverse(value);
    }
  }

  traverse(ast);

  for (const name of functionDeclared) {
    if (!functionsCalled.has(name)) {
      issues.push({
        message: `\x1b[31mFunction '${name}' declared but never used\x1b[0m`,
        file: filePath,
      });
    }
  }

  return issues;
}
