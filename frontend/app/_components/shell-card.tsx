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
      className={`relative overflow-hidden rounded-[16px] border border-[#D7E1DE] bg-white shadow-[0_12px_30px_rgba(11,63,67,0.07)] ${className}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-[linear-gradient(90deg,#0D675D_0%,#DFF2EC_100%)]" />
      {children}
    </section>
  );
}
