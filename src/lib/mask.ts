/** Personal data is masked by default in the admin portal. */

export function maskPhone(phone: string): string {
  // +255 712 345 789 -> +255 7** *** 789
  const digits = phone.replace(/[^\d+]/g, "");
  if (digits.length < 8) return "***";
  const head = digits.slice(0, 5);
  const tail = digits.slice(-3);
  return `${head}** *** ${tail}`;
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  const visible = local.slice(0, 2);
  return `${visible}***@${domain}`;
}

export function maskName(name: string): string {
  return name
    .split(" ")
    .map((part) => (part.length <= 1 ? part : `${part[0]}${"*".repeat(Math.min(part.length - 1, 4))}`))
    .join(" ");
}
