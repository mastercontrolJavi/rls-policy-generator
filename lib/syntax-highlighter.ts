const KEYWORDS = new Set([
  "CREATE",
  "POLICY",
  "ON",
  "FOR",
  "TO",
  "USING",
  "WITH",
  "CHECK",
  "ALTER",
  "TABLE",
  "ENABLE",
  "ROW",
  "LEVEL",
  "SECURITY",
  "SELECT",
  "INSERT",
  "UPDATE",
  "DELETE",
  "AND",
  "OR",
  "NOT",
  "TRUE",
  "FALSE",
  "FROM",
  "WHERE",
  "IN",
  "EXISTS",
]);

export type TokenType = "keyword" | "string" | "comment" | "punct" | "ident" | "ws";

export interface Token {
  type: TokenType;
  value: string;
}

export function tokenize(sql: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const n = sql.length;

  while (i < n) {
    const c = sql[i];

    if (c === "-" && sql[i + 1] === "-") {
      const end = sql.indexOf("\n", i);
      const stop = end === -1 ? n : end;
      tokens.push({ type: "comment", value: sql.slice(i, stop) });
      i = stop;
      continue;
    }

    if (c === '"' || c === "'") {
      const quote = c;
      let end = i + 1;
      while (end < n && sql[end] !== quote) {
        if (sql[end] === "\\") end++;
        end++;
      }
      end = Math.min(end + 1, n);
      tokens.push({ type: "string", value: sql.slice(i, end) });
      i = end;
      continue;
    }

    if (/\s/.test(c)) {
      let end = i;
      while (end < n && /\s/.test(sql[end])) end++;
      tokens.push({ type: "ws", value: sql.slice(i, end) });
      i = end;
      continue;
    }

    if (/[a-zA-Z_]/.test(c)) {
      let end = i;
      while (end < n && /[a-zA-Z0-9_]/.test(sql[end])) end++;
      const word = sql.slice(i, end);
      if (KEYWORDS.has(word.toUpperCase())) {
        tokens.push({ type: "keyword", value: word });
      } else {
        tokens.push({ type: "ident", value: word });
      }
      i = end;
      continue;
    }

    tokens.push({ type: "punct", value: c });
    i++;
  }

  return tokens;
}
