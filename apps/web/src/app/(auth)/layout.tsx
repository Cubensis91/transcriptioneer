import Image from "next/image";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[image:var(--hero-gradient-cosmic)] px-4 py-12">
      {/* Same faint portal art as IntakeThreshold — keeps the auth screens
          visually part of the same "threshold" world, not a bolted-on
          generic login form. */}
      <Image
        src="/brand/intake-bg.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="pointer-events-none absolute inset-0 object-cover opacity-10"
        aria-hidden
      />
      <div className="relative w-full max-w-md">{children}</div>
    </div>
  );
}
