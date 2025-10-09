export function check(code, ast, filePath) {
  const declared = new Map();
  const used = new Set();
  const issues = [];

  function checkVars(node) {
    if (!node || typeof node !== "object") return;

    if(node.type === "VariableDeclarator" && node.id?.name) {
        const line = node.loc?.start?.line || 0;
        declared.set(node.id.name, line)
        return;
    } 

    if(node.type === "Identifier") {
        used.add(node.name);
        return;
    } 

    for (const value of Object.values(node)) {
      if (Array.isArray(value)) {
        value.forEach(checkVars);
      }
      else if (typeof value === "object") {
        checkVars(value)
      };
    }
  }

  checkVars(ast);

  for (const [name, line] of declared.entries()) {
    if (!used.has(name)) {
      issues.push({
        message: `\x1b[31mVariable '${name}' declared but never used\x1b[0m`,
        file: filePath,
        line: line,
      });
    }
  }

  return issues;
}