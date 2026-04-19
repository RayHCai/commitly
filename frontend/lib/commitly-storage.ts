/**
 * Clears every localStorage key used by Commitly (prefix `commitly` or known keys).
 * Call on reset demo so no stale wizard or slug state remains.
 */
export function clearAllCommitlyLocalStorage(): void {
  if (typeof window === "undefined") return;
  const toRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k) continue;
    if (k.toLowerCase().startsWith("commitly")) toRemove.push(k);
  }
  for (const k of toRemove) {
    localStorage.removeItem(k);
  }
}
