function singlePosToLoc(code: string, pos: number) {
  const rows = code.substring(0, pos).split("\n");
  return { line: rows.length, column: rows[rows.length - 1].length };
}

export function posToLoc(code: string, start: number, end: number) {
  const startLoc = singlePosToLoc(code, start);
  const endLoc = singlePosToLoc(code, end);

  return { start: startLoc, end: endLoc };
}
