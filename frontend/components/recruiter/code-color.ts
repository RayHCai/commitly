/**
 * Maps a skill name to a code-editor palette CSS variable. Used across all
 * link-page variants (Poster / Scroll / Canvas) so the same skill is always
 * the same color no matter which narrative shape you're viewing.
 */
export type CodeAccent =
  | "code-fn"
  | "code-keyword"
  | "code-string"
  | "code-number"
  | "code-attr"
  | "code-comment";

const SKILL_ACCENT: Record<string, CodeAccent> = {
  TypeScript: "code-fn",
  React: "code-fn",
  "System Design": "code-keyword",
  "API Integration": "code-number",
  Authentication: "code-attr",
  "Async Patterns": "code-string",
  Python: "code-string",
  SQL: "code-number",
};

export function skillAccent(skill: string): CodeAccent {
  return SKILL_ACCENT[skill] ?? "code-comment";
}

export function accentVar(accent: CodeAccent): string {
  return `var(--${accent})`;
}

export function skillColorVar(skill: string): string {
  return accentVar(skillAccent(skill));
}
