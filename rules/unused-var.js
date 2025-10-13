export function check(code, ast, filePath) {
  const issues = [];
  const GLOBALS = new Set(["console", "window", "document", "global", "process"]);

  const scopeStack = [];

  function pushScope() {
    scopeStack.push({
      declared: new Map(),
      used: new Set(),
    });
  }

  function popScope() {
    const current = scopeStack.pop();
    const parent = scopeStack[scopeStack.length - 1];

    for (const [name, line] of current.declared.entries()) {
      const usedInCurrentOrChild =
        current.used.has(name) || parent?.used.has(name);
      if (!usedInCurrentOrChild) {
        issues.push({
          message: `\x1b[31m'${name}' is declared but its value is never read\x1b[0m`,
          file: filePath,
          line,
        });
      }
    }

    if (parent) {
      for (const usedVar of current.used) {
        parent.used.add(usedVar);
      }
    }
  }

  function declareVariable(name, line) {
    const current = scopeStack[scopeStack.length - 1];
    current.declared.set(name, line);
  }

  function useVariable(name) {
    if (GLOBALS.has(name)) return;
    for (let i = scopeStack.length - 1; i >= 0; i--) {
      if (scopeStack[i].declared.has(name)) {
        scopeStack[i].used.add(name);
        return;
      }
    }
  }


  function traverse(node) {
    if (!node || typeof node !== "object") return;

    if (
      node.type === "Program" ||
      node.type === "BlockStatement" ||
      node.type === "FunctionDeclaration" ||
      node.type === "FunctionExpression" ||
      node.type === "ArrowFunctionExpression" ||
      node.type === "CatchClause"
    ) {
      pushScope();

      if (node.params) {
        for (const param of node.params) {
          if (param.type === "Identifier") {
            declareVariable(param.name, param.loc?.start?.line || 0);
          }
        }
      }

      if (node.param && node.param.type === "Identifier") {
        declareVariable(node.param.name, node.param.loc?.start?.line || 0);
      }

      for (const value of Object.values(node)) {
        if (Array.isArray(value)) value.forEach(traverse);
        else if (typeof value === "object") traverse(value);
      }

      popScope();
      return;
    }

    if (node.type === "VariableDeclarator" && node.id?.name) {
      declareVariable(node.id.name, node.loc?.start?.line || 0);
      traverse(node.init);
      return;
    }

    if (node.type === "Identifier") {
      useVariable(node.name);
      return;
    }

    for (const value of Object.values(node)) {
      if (Array.isArray(value)) value.forEach(traverse);
      else if (typeof value === "object") traverse(value);
    }
  }

  pushScope();
  traverse(ast);
  popScope();

  return issues;
}
