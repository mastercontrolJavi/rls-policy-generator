/**
 * Line indices in `next` that were not carried over from `prev`, found by
 * walking a longest-common-subsequence table. Using LCS rather than a
 * positional compare means inserting one policy flags that policy, not
 * every line after it.
 */
export function addedLineIndices(prev: string[], next: string[]): Set<number> {
  const added = new Set<number>();
  const n = prev.length;
  const m = next.length;

  if (n === 0) return added;

  // The generated SQL is small. Bail out rather than build a huge table.
  if (n * m > 4_000_000) {
    for (let j = 0; j < m; j++) added.add(j);
    return added;
  }

  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array<number>(m + 1).fill(0)
  );
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] =
        prev[i] === next[j]
          ? dp[i + 1][j + 1] + 1
          : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (prev[i] === next[j]) {
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      i++;
    } else {
      added.add(j);
      j++;
    }
  }
  while (j < m) {
    added.add(j);
    j++;
  }
  return added;
}
