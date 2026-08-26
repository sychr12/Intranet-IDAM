"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, BellRing, ChevronLeft, ChevronRight, ExternalLink, X } from "lucide-react";

type Aviso = {
  id: string;
  title: string;
  message: string;
  priority: string;
  criticality: string;
  link?: string | null;
  publishedDate?: string | null;
  expirationDate?: string | null;
  imageBase64?: string | null;
  imageMimeType?: string | null;
  active: boolean;
  closable: boolean;
};

function estaDisponivel(aviso: Aviso) {
  const now = Date.now();
  return aviso.active
    && (!aviso.publishedDate || Date.parse(aviso.publishedDate) <= now)
    && (!aviso.expirationDate || Date.parse(aviso.expirationDate) > now);
}

export function PopupAvisos() {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [popupAberto, setPopupAberto] = useState(true);
  const [indiceAtual, setIndiceAtual] = useState(0);

  useEffect(() => {
    fetch("/api/avisos", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : [])
      .then((data: unknown) => setAvisos(Array.isArray(data) ? data as Aviso[] : []))
      .catch(() => setAvisos([]));
  }, []);

  const avisosDisponiveis = useMemo(
    () => avisos.filter(estaDisponivel),
    [avisos],
  );

  useEffect(() => {
    if (indiceAtual >= avisosDisponiveis.length) setIndiceAtual(0);
  }, [indiceAtual, avisosDisponiveis.length]);

  if (avisosDisponiveis.length === 0) return null;

  const aviso = avisosDisponiveis[indiceAtual];
  const trocarAviso = (direcao: number) => {
    setIndiceAtual((atual) => (atual + direcao + avisosDisponiveis.length) % avisosDisponiveis.length);
  };

  const prioridadeUrgente = ["urgent", "immediate", "urgente", "imediata"].includes(aviso.priority);
  const niveis = {
    criticidade: {
      informative: ["Informativa", "bg-blue-100 text-blue-700"],
      low: ["Baixa", "bg-emerald-100 text-emerald-700"],
      moderate: ["Moderada", "bg-amber-100 text-amber-800"],
      high: ["Alta", "bg-orange-100 text-orange-800"],
      critical: ["Crítica", "bg-red-100 text-red-700"],
    },
    prioridade: {
      low: ["Baixa", "bg-slate-100 text-slate-700"],
      normal: ["Normal", "bg-blue-100 text-blue-700"],
      high: ["Alta", "bg-orange-100 text-orange-800"],
      urgent: ["Urgente", "bg-red-100 text-red-700"],
      immediate: ["Imediata", "bg-rose-100 text-rose-700"],
    },
  } as const;
  const criticidade = niveis.criticidade[aviso.criticality as keyof typeof niveis.criticidade] ?? niveis.criticidade.informative;
  const prioridade = niveis.prioridade[aviso.priority as keyof typeof niveis.prioridade] ?? niveis.prioridade.normal;
  const imageSource = aviso.imageBase64 && aviso.imageMimeType
    ? `data:${aviso.imageMimeType};base64,${aviso.imageBase64}`
    : null;

  return (
    <>
      <button
        onClick={() => setPopupAberto(true)}
        aria-label="Abrir central de avisos"
        className="fixed right-4 top-4 z-[90] inline-flex h-11 items-center gap-2 rounded-full bg-[#073821] px-4 text-sm font-bold text-white shadow-lg transition hover:bg-[#0a4b2b] sm:right-6"
      >
        <BellRing className="size-4" />
        Avisos
        <span className="rounded-full bg-[#b6dc25] px-1.5 py-0.5 text-[11px] font-black text-[#073821]">{avisosDisponiveis.length}</span>
      </button>

      {popupAberto ? (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#001b10]/60 p-4 backdrop-blur-sm" role="presentation">
      <section role="dialog" aria-modal="true" aria-labelledby="aviso-titulo" className="w-full max-w-lg overflow-hidden rounded-[20px] bg-white shadow-2xl">
        <div className={`h-1.5 ${prioridadeUrgente ? "bg-red-600" : "bg-[#0a4b2b]"}`} />
        <div className="p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <span className={`flex size-11 shrink-0 items-center justify-center rounded-full ${prioridadeUrgente ? "bg-red-50 text-red-600" : "bg-[#e9f4e5] text-[#0a4b2b]"}`}>
              {prioridadeUrgente ? <AlertTriangle className="size-5" /> : <BellRing className="size-5" />}
            </span>
            {aviso.closable ? (
              <button onClick={() => setPopupAberto(false)} aria-label="Fechar aviso" className="rounded-full bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200 hover:text-slate-900"><X className="size-5" /></button>
            ) : null}
          </div>
          {avisosDisponiveis.length > 1 ? (
            <div className="mt-5 flex items-center justify-between rounded-xl border border-[#dce8d8] bg-[#f6fbf5] px-2 py-1.5">
              <button onClick={() => trocarAviso(-1)} className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-bold text-[#184521] transition hover:bg-[#e2f0dd]"><ChevronLeft className="size-4" />Anterior</button>
              <span className="text-xs font-semibold text-[#56705b]">Aviso {indiceAtual + 1} de {avisosDisponiveis.length}</span>
              <button onClick={() => trocarAviso(1)} className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-bold text-[#184521] transition hover:bg-[#e2f0dd]">Próximo<ChevronRight className="size-4" /></button>
            </div>
          ) : null}
          <h2 id="aviso-titulo" className="mt-5 text-xl font-black text-[#0a2d1e]">{aviso.title}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${criticidade[1]}`}>Criticidade: {criticidade[0]}</span>
            <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${prioridade[1]}`}>Prioridade: {prioridade[0]}</span>
          </div>
          <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-[#294634]">{aviso.message}</p>
          {imageSource ? <div className="mt-5 overflow-hidden rounded-[14px] border border-[#dce8d8] bg-[#f6fbf5] p-1"><img src={imageSource} alt="Imagem do aviso" className="max-h-64 w-full rounded-[10px] object-cover" /></div> : null}
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            {aviso.link ? <a href={aviso.link} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#073821] px-4 text-sm font-bold text-white transition hover:bg-[#0a4b2b]"><ExternalLink className="size-4" />Acessar link</a> : null}
            {aviso.closable ? <button onClick={() => setPopupAberto(false)} className="h-10 rounded-[10px] border border-[#d9e7d0] bg-[#f6fbf5] px-4 text-sm font-semibold text-[#184521] transition hover:bg-[#e6f1e1]">Entendi</button> : null}
          </div>
        </div>
      </section>
      </div>
      ) : null}
    </>
  );
}
