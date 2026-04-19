import * as React from "react";

import { cn } from "@/lib/utils";

export type CodeLanguage = "ts" | "tsx" | "py" | "sql";

type Tok =
  | { text: string; type: "comment" }
  | { text: string; type: "string" }
  | { text: string; type: "number" }
  | { text: string; type: "keyword" }
  | { text: string; type: "ident" }
  | { text: string; type: "other" };

const KEYWORDS: Record<CodeLanguage, Set<string>> = {
  ts: new Set([
    "const", "let", "var", "function", "return", "if", "else", "for", "while",
    "async", "await", "try", "catch", "throw", "import", "export", "from",
    "class", "new", "type", "interface", "as", "in", "of", "break", "continue",
    "default", "enum", "extends", "implements", "true", "false", "null",
    "undefined", "this", "void", "yield", "public", "private", "protected",
    "readonly", "static",
  ]),
  tsx: new Set([
    "const", "let", "var", "function", "return", "if", "else", "for", "while",
    "async", "await", "try", "catch", "throw", "import", "export", "from",
    "class", "new", "type", "interface", "as", "in", "of", "break", "continue",
    "default", "enum", "extends", "implements", "true", "false", "null",
    "undefined", "this", "void", "yield", "public", "private", "protected",
    "readonly", "static",
  ]),
  py: new Set([
    "def", "class", "import", "from", "return", "if", "elif", "else", "for",
    "while", "try", "except", "finally", "with", "as", "pass", "break",
    "continue", "in", "not", "and", "or", "is", "None", "True", "False",
    "async", "await", "yield", "lambda", "global", "nonlocal", "raise",
  ]),
  sql: new Set([
    "SELECT", "FROM", "WHERE", "JOIN", "LEFT", "RIGHT", "INNER", "OUTER", "ON",
    "GROUP", "BY", "ORDER", "HAVING", "UNION", "INSERT", "UPDATE", "DELETE",
    "INTO", "VALUES", "SET", "WITH", "AS", "AND", "OR", "NOT", "IN", "IS",
    "NULL", "DISTINCT", "LIMIT", "OFFSET", "CASE", "WHEN", "THEN", "ELSE",
    "END", "OVER", "PARTITION",
  ]),
};

function commentPattern(lang: CodeLanguage): string {
  if (lang === "py") return "#[^\\n]*";
  if (lang === "sql") return "--[^\\n]*";
  return "\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/";
}

function tokenize(code: string, lang: CodeLanguage): Tok[] {
  const re = new RegExp(
    `(${commentPattern(lang)})` +
      `|("[^"\\\\]*(?:\\\\.[^"\\\\]*)*"|'[^'\\\\]*(?:\\\\.[^'\\\\]*)*'|\`[^\`\\\\]*(?:\\\\.[^\`\\\\]*)*\`)` +
      `|(\\b\\d+(?:\\.\\d+)?(?:_\\d+)*\\b)` +
      `|([A-Za-z_][A-Za-z0-9_]*)` +
      `|(\\s+|[^\\s])`,
    "g",
  );
  const words = KEYWORDS[lang];
  const tokens: Tok[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) {
    if (m[1]) tokens.push({ text: m[1], type: "comment" });
    else if (m[2]) tokens.push({ text: m[2], type: "string" });
    else if (m[3]) tokens.push({ text: m[3], type: "number" });
    else if (m[4]) {
      const probe = lang === "sql" ? m[4].toUpperCase() : m[4];
      tokens.push({
        text: m[4],
        type: words.has(probe) ? "keyword" : "ident",
      });
    } else if (m[5]) tokens.push({ text: m[5], type: "other" });
  }
  return tokens;
}

function colorFor(type: Tok["type"]): string | undefined {
  switch (type) {
    case "comment":
      return "var(--code-comment)";
    case "string":
      return "var(--code-string)";
    case "number":
      return "var(--code-number)";
    case "keyword":
      return "var(--code-keyword)";
    default:
      return undefined;
  }
}

export function CodeSnippet({
  code,
  language,
  className,
}: {
  code: string;
  language?: CodeLanguage;
  className?: string;
}) {
  const tokens = React.useMemo(
    () => (language ? tokenize(code, language) : null),
    [code, language],
  );
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[6px] border border-[color:var(--paper-line-soft)] bg-[color:var(--paper-bg)]",
        className,
      )}
    >
      {language && (
        <span className="pointer-events-none absolute right-2 top-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-[color:var(--code-comment)]">
          {language}
        </span>
      )}
      <pre className="overflow-x-auto px-3 py-2.5 pr-10 font-mono text-[11.5px] leading-[1.55] text-[color:var(--ink)]">
        <code>
          {tokens
            ? tokens.map((t, i) => (
                <span key={i} style={{ color: colorFor(t.type) }}>
                  {t.text}
                </span>
              ))
            : code}
        </code>
      </pre>
    </div>
  );
}
