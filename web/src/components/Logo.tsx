import Image from "next/image";

const VARIANTS = {
  // The SVGs share a 1010x295 box (full logo) or 280x295 (mark only).
  dark: { src: "/logo.svg", ratio: 1010 / 295 },
  light: { src: "/logo-light.svg", ratio: 1010 / 295 },
  markLight: { src: "/logo-mark-light.svg", ratio: 280 / 295 },
} as const;

interface LogoProps {
  /** `dark` = navy logo for light backgrounds, `light` = white logo for dark backgrounds. */
  variant?: keyof typeof VARIANTS;
  /** Rendered height in pixels. */
  height?: number;
  priority?: boolean;
}

export function Logo({ variant = "dark", height = 40, priority = false }: LogoProps) {
  const { src, ratio } = VARIANTS[variant];
  return (
    <Image
      src={src}
      alt="Taller Ruiz"
      width={Math.round(height * ratio)}
      height={height}
      priority={priority}
      unoptimized
      className="block h-auto"
      style={{ height, width: "auto" }}
    />
  );
}
