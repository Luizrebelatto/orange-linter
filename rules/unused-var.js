export function checkUnusedVariables(code, ast, filePath) {
  const declared = new Set();
  const used = new Set();
  const issues = [];

  function traverse(node) {
    if (!node || typeof node !== "object") return;

    switch (node.type) {
      case "VariableDeclarator":
        if (node.id?.name) {
          declared.add(node.id.name);
        }
        break;

      case "Identifier":
        used.add(node.name);
        break;
    }

    for (const value of Object.values(node)) {
      if (Array.isArray(value)) value.forEach(traverse);
      else if (typeof value === "object") traverse(value);
    }
  }

  traverse(ast);

  for (const name of declared) {
    if (!used.has(name)) {
      issues.push({
        message: `Variable '${name}' declared but never used`,
        file: filePath,
      });
    }
  }

  return issues;
}
