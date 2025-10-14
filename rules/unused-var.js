export function check(code, ast, filePath) {
  const issues = [];
  const globalElements = new Set(["console", "window", "document", "global", "process"]);

  const scopeStack = [];

  function pushScope() {
    scopeStack.push({
      declared: new Map(),
      used: new Set(),
    });
  }

  function popScope() {
    const currentElement = scopeStack.pop();
    const parent = scopeStack[scopeStack.length - 1];

    for (const [name, line] of currentElement.declared.entries()) {
      const usedInCurrentOrChild =
        currentElement.used.has(name) || parent?.used.has(name);
      if (!usedInCurrentOrChild) {
        issues.push({
          message: `\x1b[31m'${name}' is declared but its value is never read\x1b[0m`,
          file: filePath,
          line,
        });
      }
    }

    if (parent) {
      for (const usedVar of currentElement.used) {
        parent.used.add(usedVar);
      }
    }
  }

  function declareVariable(name, line) {
    const currentElement = scopeStack[scopeStack.length - 1];
    currentElement.declared.set(name, line);
  }

  function useVariable(name) {
    if (globalElements.has(name)) return;
    for (let i = scopeStack.length - 1; i >= 0; i--) {
      if (scopeStack[i].declared.has(name)) {
        scopeStack[i].used.add(name);
        return;
      }
    }
  }


  function traverse(node) {
    if (!node || typeof node !== "object") return;
    const structuresFunctionAST = ["Program", "BlockStatement", "FunctionDeclaration", "FunctionExpression", "ArrowFunctionExpression"];
    
    if (structuresFunctionAST.includes(node.type)) {
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
        if (Array.isArray(value)) {
          value.forEach(traverse);
        } else if (typeof value === "object") {
          traverse(value);
        }
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
      if (Array.isArray(value)){
        value.forEach(traverse);
      } else if (typeof value === "object") {
        traverse(value);
      }
    }
  }

  pushScope();
  traverse(ast);
  popScope();

  return issues;
}
