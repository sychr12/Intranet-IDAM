import type { ReactNode } from "react";

// Base visual compartilhada pelos painéis da página inicial.
export function ShellCard({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={`relative overflow-hidden rounded-[16px] border border-[#e3e9df] bg-white shadow-[0_12px_30px_rgba(11,52,36,0.07)] ${className}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-[linear-gradient(90deg,#0a4b2b_0%,#b6dc25_100%)]" />
      {children}
    </section>
  );
}
