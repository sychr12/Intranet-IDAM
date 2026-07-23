import { Globe, ShieldCheck } from "lucide-react";

// Rodapé institucional e indicador visual da conexão com o backend.
export function Footer({ backendOnline }: { backendOnline: boolean | null }) {
  return (
    <footer className="border-t border-[#e4e8df] bg-white px-5 py-3 shadow-[0_-8px_22px_rgba(11,52,36,0.05)] sm:px-6">
      <div className="mx-auto grid max-w-[1860px] gap-4 text-[17px] text-[#111d16] md:grid-cols-2 md:items-center">
        <span className="flex items-center gap-4 md:justify-start">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#5e9b07] text-white">
            <ShieldCheck className="size-5" />
          </span>
          <span>
            NÚCLEO DE TECNOLOGIA DA INFORMAÇÃO
            <br />© 2026 NTI - Todos os direitos reservados.
          </span>
        </span>
        <span className="flex min-w-0 items-center gap-4 md:justify-end">
          <span className="flex size-9 items-center justify-center rounded-full bg-[#5e9b07] text-white">
            <Globe className="size-5" />
          </span>
          <a
            href="https://intranet.idam.am.gov.br"
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-w-0 items-center gap-2 break-all transition hover:text-[#56880c]"
          >
            <span
              className={`size-2.5 rounded-full ${
                backendOnline === null
                  ? "bg-[#c5ccbf]"
                  : backendOnline
                    ? "bg-[#73a900]"
                    : "bg-red-500"
              }`}
            />
            https://intranet.idam.am.gov.br
          </a>
        </span>
      </div>
    </footer>
  );
}
