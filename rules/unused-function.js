export function check(code, ast, filePath) {
  const issues = [];
  const scopeStack = [];

  function enterScope() {
    scopeStack.push({
      functionsDeclared: new Map(),
      functionsCalled: new Set(),
    });
  }

  function exitScope() {
    const scope = scopeStack.pop();
    if (!scope) return;

    for (const [name, line] of scope.functionsDeclared) {
      if (!scope.functionsCalled.has(name)) {
        issues.push({
          message: `\x1b[31mFunction '${name}' declared but never used in this scope\x1b[0m`,
          line,
          file: filePath,
        });
      }
    }

    const parentScope = scopeStack[scopeStack.length - 1];
    if (parentScope) {
      for (const name of scope.functionsCalled) {
        parentScope.functionsCalled.add(name);
      }
    }
  }

  function currentScope() {
    return scopeStack[scopeStack.length - 1];
  }

  function checkFunctions(node) {
    if (!node || typeof node !== "object") return;
    const line = node.loc?.start?.line || 0;

    const newScope = ["Program", "BlockStatement", "FunctionDeclaration", "FunctionExpression", "ArrowFunctionExpression"]

    if(newScope.includes(node.type)){
      enterScope();
      return;
    }
  
    switch (node.type) {
      case "FunctionDeclaration": {
        const name = node.id?.name;
        if (name) currentScope()?.functionsDeclared.set(name, line);
        break;
      }

      case "VariableDeclarator": {
        const name = node.id?.name;
        if (
          name &&
          (node.init?.type === "FunctionExpression" ||
            node.init?.type === "ArrowFunctionExpression")
        ) {
          currentScope()?.functionsDeclared.set(name, line);
        }
        break;
      }

      case "CallExpression": {
        const callee = node.callee;
        if (callee?.type === "Identifier") {
          currentScope()?.functionsCalled.add(callee.name);
        }
        break;
      }
    }

    for (const value of Object.values(node)) {
      if (Array.isArray(value)) {
        value.forEach(checkFunctions)
      } else if (typeof value === "object") {
        checkFunctions(value);
      }
    }

    switch (node.type) {
      case "Program":
      case "BlockStatement":
      case "FunctionDeclaration":
      case "FunctionExpression":
      case "ArrowFunctionExpression":
        exitScope();
        break;
    }
  }

  checkFunctions(ast);

  return issues;
}
