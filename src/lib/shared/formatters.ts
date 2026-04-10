export function formatPercentage(value: string | number) {
  const numericValue = typeof value === "string" ? Number(value) : value;
  return `${numericValue.toFixed(2)}%`;
}

export function formatUsd(value: string | number) {
  const numericValue = typeof value === "string" ? Number(value) : value;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(numericValue) ? numericValue : 0);
}
