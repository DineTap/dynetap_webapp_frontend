/**
 * Format price in cents to South African Rand (R) currency format
 * @param amountInCents - Amount in cents (e.g., 12050 = R120.50)
 * @returns Formatted string with currency symbol (e.g., "R120.50")
 */
export function formatPrice(amountInCents: number): string {
  const rands = (amountInCents / 100).toFixed(2);
  return `R${rands}`;
}

/**
 * Format price with custom styling for display
 * Useful when you need the currency symbol and amount separate
 * @param amountInCents - Amount in cents
 * @returns Object with symbol and amount for display
 */
export function formatPriceDisplay(amountInCents: number) {
  const rands = (amountInCents / 100).toFixed(2);
  return {
    symbol: "R",
    amount: rands,
    full: `R${rands}`,
  };
}
