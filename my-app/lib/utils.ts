export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatCurrency(value: number) {
  const formattedNumber = new Intl.NumberFormat("ar-EG", {
    maximumFractionDigits: 0,
  }).format(value);

  return `${formattedNumber} ج.م`;
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
