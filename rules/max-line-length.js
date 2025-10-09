const MAX_LENGTH = 80;

export function check(code, ast,filePath) {
  const issues = [];
  const lines = code.split("\n");
  lines.forEach((line, index) => {
    if (line.length > MAX_LENGTH) {
      issues.push({
        message: `\x1b[31mLine too long (${line.length} characters). Max: ${MAX_LENGTH}\x1b[0m`,
        line: index + 1,
        column: MAX_LENGTH,
        file: filePath
      });
    }
  });

  return issues;
}
