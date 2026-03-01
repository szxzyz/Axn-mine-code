export const APP_VERSION = "1.0.0";
export const AXN_TO_TON = 10000; // 10,000 AXN = 1 TON

/**
 * Convert AXN to TON
 * @param axnAmount - Amount in AXN
 * @returns Amount in TON (AXN / 10,000)
 */
export function axnToTon(axnAmount: number | string): number {
  const numValue = typeof axnAmount === 'string' ? parseFloat(axnAmount) : axnAmount;
  return numValue / AXN_TO_TON;
}

/**
 * Convert TON to AXN
 * @param tonAmount - Amount in TON
 * @returns Amount in AXN (* 10,000)
 */
export function tonToAXN(tonAmount: number | string): number {
  const numValue = typeof tonAmount === 'string' ? parseFloat(tonAmount) : tonAmount;
  return Math.round(numValue * AXN_TO_TON);
}

/**
 * Format large numbers into compact format (1k, 1.2M, 1B, 1T)
 * @param num - Number to format
 * @returns Formatted string (e.g., "1.2M", "154k", "24B", "1.5T")
 */
export function formatCompactNumber(num: number): string {
  if (num >= 1_000_000_000_000) {
    return (num / 1_000_000_000_000).toFixed(1).replace(/\.0/, '') + 'T';
  }
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1).replace(/\.0/, '') + 'B';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0/, '') + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0/, '') + 'k';
  }
  return num.toString();
}
