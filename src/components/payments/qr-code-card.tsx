import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface QrSvgProps {
  code: string;
  label: string;
  className?: string;
}

/**
 * Deterministic QR-style placeholder seeded by the code — a visual stand-in,
 * not a scannable QR.
 */
export function QrSvg({ code, label, className }: QrSvgProps) {
  const t = useTranslations("pay");
  const cells: boolean[] = Array.from({ length: 81 }, (_, i) => {
    const ch = code.charCodeAt(i % code.length);
    return ((ch * 31 + i * 7) & 5) > 2;
  });

  return (
    <svg
      viewBox="0 0 9 9"
      className={cn("size-36 rounded-lg border bg-white p-1.5", className)}
      role="img"
      aria-label={t("qrAria", { label })}
    >
      {cells.map((on, i) =>
        on ? (
          <rect
            key={i}
            x={i % 9}
            y={Math.floor(i / 9)}
            width="0.9"
            height="0.9"
            fill="#0A0A0A"
          />
        ) : null,
      )}
      <rect x="0" y="0" width="2.9" height="2.9" fill="#E31E24" />
      <rect x="0.7" y="0.7" width="1.5" height="1.5" fill="#FFFFFF" />
    </svg>
  );
}
