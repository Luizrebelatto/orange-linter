export function check(code, ast, filePath) {
  const functionDeclared = new Map();
  const functionsCalled = new Set();
  const issues = [];

  function checkFunctions(node) {
    if (!node || typeof node !== "object") return;
    const line = node.loc?.start?.line || 0;
    const nameOfFunction = node.id?.name

    switch (node.type) {
      case "FunctionDeclaration":
        if (nameOfFunction) {
            functionDeclared.set(node.id.name, line)
        };
        break;

      case "VariableDeclarator":
        if (
          (node.init?.type === "FunctionExpression" ||
           node.init?.type === "ArrowFunctionExpression") &&
          nameOfFunction
        ) {
          functionDeclared.set(nameOfFunction, line);
        }
        break;

      case "CallExpression":
        if (node.callee?.type === "Identifier") {
          functionsCalled.add(node.callee.name);
        }
        break;
    }

    for (const value of Object.values(node)) {
      if (Array.isArray(value)) value.forEach(checkFunctions);
      else if (typeof value === "object") checkFunctions(value);
    }
  }

  checkFunctions(ast);

  for (const [name, line] of functionDeclared) {
    if (!functionsCalled.has(name)) {
      issues.push({
        message: `\x1b[31mFunction '${name}' declared but never used\x1b[0m`,
        line: line,
        file: filePath,
      });
    }
  }

  return issues;
}
