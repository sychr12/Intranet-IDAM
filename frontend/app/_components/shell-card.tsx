import type { ReactNode } from "react";

// Base visual compartilhada pelos painéis da página inicial.
export function ShellCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[16px] border border-[#e3e9df] bg-white shadow-[0_12px_30px_rgba(11,52,36,0.07)] ${className}`}
    >
      {children}
    </section>
  );
}
