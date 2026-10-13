import type { ReactNode } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { DiagonalCorner } from "./diagonal-shape";

interface HeroBannerProps {
  children: ReactNode;
  className?: string;
  /** Optional photo background (public path); darkened so text stays AA-readable. */
  image?: string;
  imageAlt?: string;
}

/** Dark hero section with the diagonal brand motif and an optional photo. */
export function HeroBanner({ children, className, image, imageAlt = "" }: HeroBannerProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl bg-ink px-6 py-10 text-white sm:px-10 sm:py-14",
        className,
      )}
    >
      {image && (
        <>
          <Image
            src={image}
            alt={imageAlt}
            fill
            sizes="(max-width: 1024px) 100vw, 992px"
            className="object-cover"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-ink/70" />
        </>
      )}
      <DiagonalCorner />
      <div className="relative z-10">{children}</div>
    </section>
  );
}
