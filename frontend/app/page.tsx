"use client";
// Indica ao Next.js que este componente será renderizado no lado do cliente (client-side).

import React, { JSX, useEffect, useMemo, useState } from "react";
// Importa React e hooks: useEffect (efeitos colaterais), useState (estado local) e useMemo (memorização).

import { motion, AnimatePresence, Variants } from "framer-motion";
// 'motion' para componentes animados, 'AnimatePresence' para transições de saída/entrada e 'Variants' para tipar variantes.

import {
  Menu,
  Home,
  Phone,
  Mail as MailIcon,
  User,
  Bell,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Lock,
  Headphones,
  Megaphone,
  Users2,
  Award,
  Settings,
  Newspaper,
  FileText,
  Gavel,
  Scale,
  FileSearch,
  FolderOpen,
  Briefcase,
  ClipboardList,
  FileSpreadsheet,
  Globe,
  Wrench,
  Leaf,
  Clock,
} from "lucide-react";
// Importa os ícones SVG da biblioteca 'lucide-react' usados na interface.

import Image from "next/image";
// Importa o componente de imagem otimizado do Next.js.

import Link from "next/link";
// Importa o componente Link do Next.js para navegação interna sem reload completo.

// =================================================================
// 1. TIPAGEM
// =================================================================

type DepartmentKey = "PJ" | "RH" | "SGC";

interface NewsItem {
  id: number;
  title: string;
  href: string;
}

interface BackendHealthResponse {
  success: boolean;
  data?: {
    status?: string;
    timestamp?: string;
  };
}

// =================================================================
// 2. TOKENS DE DESIGN
// =================================================================
// Paleta: verde-mata profundo (base institucional) + um verde-sálvia orgânico
// como único acento (remete à vegetação amazônica) + papel levemente quente
// no lugar de cinza frio. Um único acento evita a "sopa" de cores.
//
//   --mata-950  #0b2620   painéis mais escuros (header / sidebar / hero)
//   --salvia    #8fae6a   acento único (ativo, botões primários, destaques)
//   --salvia-50 #eef4e6   tinta clara do acento
//   --papel     #f7f6f1   fundo da página (branco quente, não cinza)
//   --tinta     #1f2a24   texto principal

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.45, ease: "easeOut" },
  }),
};

// =================================================================
// 3. DADOS
// =================================================================

const headerLinks = [
  { title: "Email", icon: <MailIcon className="w-4 h-4" />, href: "https://portal.office.com" },
  { title: "Sefaz", icon: <FileText className="w-4 h-4" />, href: "https://www.sefaz.am.gov.br/" },
  { title: "Siged", icon: <FolderOpen className="w-4 h-4" />, href: "https://sistemas.sefaz.am.gov.br/siged/login" },
  { title: "Sigatex", icon: <FileText className="w-4 h-4" />, href: "https://www.e-compras.am.gov.br/publico/" },
  { title: "Site IDAM", icon: <Globe className="w-4 h-4" />, href: "https://www.idam.am.gov.br/" },
  { title: "Suporte", icon: <Headphones className="w-4 h-4" />, href: "https://nti.idam.am.gov.br/front/helpdesk.public.php" },
  { title: "TI", icon: <Wrench className="w-4 h-4" />, href: "https://nti.idam.am.gov.br/front/helpdesk.public.php" },
];

const officeApps = [
  { img: "/image/outlook.png", title: "Outlook", href: "https://outlook.office365.com/mail/" },
  { img: "/image/Word.png", title: "Word", href: "https://www.office.com/launch/word" },
  { img: "/image/excel.png", title: "Excel", href: "https://excel.office.com" },
  { img: "/image/powerpoint.png", title: "PowerPoint", href: "https://www.office.com/launch/powerpoint" },
  { img: "/image/one.png", title: "OneDrive", href: "https://www.office.com/launch/onedrive" },
  { img: "/image/teans.png", title: "Teams", href: "https://teams.microsoft.com" },
  { img: "/image/formulario.png", title: "Forms", href: "https://forms.office.com" },
];

const departmentMeta: Record<DepartmentKey, { label: string; icon: JSX.Element }> = {
  PJ: { label: "Diário Oficial", icon: <Users2 className="w-[18px] h-[18px]" /> },
  RH: { label: "Recursos Humanos", icon: <Award className="w-[18px] h-[18px]" /> },
  SGC: { label: "Sistema de Gestão", icon: <Settings className="w-[18px] h-[18px]" /> },
};

const departamentos: Record<DepartmentKey, { title: string; icon: JSX.Element; href: string }[]> = {
  PJ: [
    { title: "Diário Oficial", icon: <Newspaper className="w-4 h-4" />, href: "https://diario.imprensaoficial.am.gov.br/" },
    { title: "Diário MP AM", icon: <FileText className="w-4 h-4" />, href: "https://diario.mpam.mp.br/pages/home.jsf" },
    { title: "Doe TCE", icon: <ClipboardList className="w-4 h-4" />, href: "https://doe.tce.am.gov.br/" },
    { title: "Comunica PJE", icon: <Gavel className="w-4 h-4" />, href: "https://comunica.pje.jus.br/" },
    { title: "DEJT", icon: <FileText className="w-4 h-4" />, href: "https://dejt.jt.jus.br/dejt/" },
    { title: "Imprensa Nacional", icon: <Newspaper className="w-4 h-4" />, href: "https://www.gov.br/imprensanacional/pt-br" },
    { title: "Diário da Justiça Eletrônico (SAJ)", icon: <Scale className="w-4 h-4" />, href: "https://consultasaj.tjam.jus.br/cdje/index.do" },
    { title: "DEC TCE", icon: <FileSearch className="w-4 h-4" />, href: "https://dec.tce.am.gov.br/dec/login.jsf" },
    { title: "Consulta e-SAJ", icon: <FileSearch className="w-4 h-4" />, href: "https://consultasaj.tjam.jus.br/esaj/portal.do?servico=740000" },
    { title: "PROJUDI", icon: <Gavel className="w-4 h-4" />, href: "https://projudi.tjam.jus.br/projudi/" },
    { title: "PJE TRT11", icon: <Scale className="w-4 h-4" />, href: "https://pje.trt11.jus.br/primeirograu/login.seam" },
  ],
  RH: [
    { title: "Prodam RH", icon: <Users2 className="w-4 h-4" />, href: "https://prodamrh.prodam.am.gov.br/" },
    { title: "SEAD", icon: <FolderOpen className="w-4 h-4" />, href: "http://servicos.sead.am.gov.br/passivosam/auth/login" },
    { title: "SISPREV", icon: <ClipboardList className="w-4 h-4" />, href: "https://www.portaldosegurado.am.gov.br/conectado.php" },
    { title: "CIEE", icon: <Users2 className="w-4 h-4" />, href: "https://web.ciee.org.br/empresa/relatorios/estudantes-contratados" },
    { title: "FAP", icon: <FileSpreadsheet className="w-4 h-4" />, href: "https://fap.dataprev.gov.br/consultar-fap" },
    { title: "E-SOCIAL", icon: <Briefcase className="w-4 h-4" />, href: "https://www.esocial.gov.br/portal/Assinadoc" },
    { title: "IOA NEWS", icon: <Newspaper className="w-4 h-4" />, href: "https://ioanews.imprensaoficial.am.gov.br/" },
  ],
  SGC: [
    { title: "Sistema de Gestão de Contratos (SGC)", icon: <FolderOpen className="w-4 h-4" />, href: "http://sistemas.sefaz.am.gov.br/sgc-am/login.do" },
  ],
};

const securityTips: NewsItem[] = [
  { id: 1, title: "O que é malware e como se proteger?", href: "https://www.kaspersky.com.br/resource-center/preemptive-safety/what-is-malware-and-how-to-protect-against-it" },
  { id: 2, title: "Por que você não deve compartilhar suas senhas?", href: "https://digitalsecurityguide.eset.com/br/por-que-voce-nao-deve-compartilhar-suas-senhas" },
  { id: 3, title: "Como fazer um chamado", href: "https://office365prodam-my.sharepoint.com/:b:/g/personal/nti_idam_am_gov_br/EedyNcwHiHFIvvURrOX9Z-oBVP-bAnKVXMgpW1AndAFW6Q?e=RNoSew" },
];
const tipIcons = [ShieldCheck, Lock, Headphones];

const RAMAIS_PDF_URL = "https://office365prodam-my.sharepoint.com/:x:/g/personal/nti_idam_am_gov_br/EfqRFyXpB7dJme1xxhXjOYMBTJmkM7EoTfn_yk3wBfZuMQ?e=wK1SQ7";
const EMAILS_PDF_URL = "https://docs.google.com/document/d/1Kil4NcZkgZUqnPt5o687z3eBD0W6YNfVXsn2J-t3MSQ/edit?pli=1&tab=t.0";
const CONTATOS_PDF_URL = "https://docs.google.com/document/d/1cHB5TwcjBeatoFZkSdiDsl4-pKsixxy0AdgM4dLTan8/edit?invite=CL6n4Y8O&tab=t.0";

const quickFiles = [
  { title: "Lista de Ramais", icon: <Phone className="w-4 h-4" />, href: RAMAIS_PDF_URL },
  { title: "Lista de Emails", icon: <MailIcon className="w-4 h-4" />, href: EMAILS_PDF_URL },
  { title: "Lista de Contatos", icon: <User className="w-4 h-4" />, href: CONTATOS_PDF_URL },
];

const WEEKDAYS = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];
const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

// =================================================================
// 4. TEXTURA DE ASSINATURA — linhas topográficas sutis (identidade
//    amazônica/florestal do IDAM), usadas como fundo do banner.
// =================================================================

function TopoTexture({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 800 400" fill="none" preserveAspectRatio="xMidYMid slice">
      {[60, 110, 165, 225, 290, 360].map((y, i) => (
        <path
          key={y}
          d={`M -20 ${y} C 140 ${y - 40}, 260 ${y + 50}, 420 ${y - 10} S 700 ${y + 30}, 860 ${y - 20}`}
          stroke="white"
          strokeOpacity={0.06 + i * 0.01}
          strokeWidth="1.5"
          fill="none"
        />
      ))}
    </svg>
  );
}

// =================================================================
// 5. CALENDÁRIO
// =================================================================

function MiniCalendar({ today }: { today: Date }) {
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  useEffect(() => {
    setCursor(new Date(today.getFullYear(), today.getMonth(), 1));
  }, [today]);

  const weeks = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = [
      ...Array(startOffset).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    while (cells.length % 7 !== 0) cells.push(null);
    const rows: (number | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    return rows;
  }, [cursor]);

  const isToday = (day: number | null) =>
    !!day &&
    cursor.getFullYear() === today.getFullYear() &&
    cursor.getMonth() === today.getMonth() &&
    day === today.getDate();

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <span className="flex items-center gap-2 text-[0.95rem] font-semibold text-[#1f2a24]">
          <Clock className="w-4 h-4 text-[#8fae6a]" />
          {MONTHS[cursor.getMonth()]} <span className="text-[#8fae6a]">{cursor.getFullYear()}</span>
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            className="w-7 h-7 rounded-full border border-[#e7e4da] text-[#8b8577] hover:border-[#8fae6a] hover:text-[#1f2a24] transition flex items-center justify-center"
            aria-label="Mês anterior"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            className="w-7 h-7 rounded-full border border-[#e7e4da] text-[#8b8577] hover:border-[#8fae6a] hover:text-[#1f2a24] transition flex items-center justify-center"
            aria-label="Próximo mês"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-2 text-center">
        {WEEKDAYS.map((d) => (
          <span key={d} className="text-[0.6rem] font-semibold tracking-wide text-[#b3ae9f]">
            {d}
          </span>
        ))}
        {weeks.map((row, ri) =>
          row.map((day, ci) => (
            <span
              key={`${ri}-${ci}`}
              className={`text-[0.8rem] mx-auto w-7 h-7 rounded-full flex items-center justify-center transition ${
                day === null
                  ? ""
                  : isToday(day)
                  ? "bg-[#123a2f] text-white font-semibold"
                  : "text-[#4a5450] hover:bg-[#f2f0e8]"
              }`}
            >
              {day ?? ""}
            </span>
          ))
        )}
      </div>
    </div>
  );
}

// =================================================================
// 6. COMPONENTE PRINCIPAL
// =================================================================

export default function Page() {
  const [selectedDept, setSelectedDept] = useState<DepartmentKey>("PJ");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [now, setNow] = useState<Date>(new Date());
  const [loadingDate, setLoadingDate] = useState(true);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    async function fetchBackendHealth() {
      setLoadingDate(true);
      try {
        const res = await fetch("/backend-api/health", { cache: "no-store" });
        if (!res.ok) throw new Error("Erro ao obter o status do backend");
        const response: BackendHealthResponse = await res.json();
        const serverDate = new Date(response.data?.timestamp ?? "");
        if (!isNaN(serverDate.getTime())) setNow(serverDate);
        setBackendOnline(response.success && response.data?.status === "UP");
      } catch (err) {
        console.error("❌ Erro ao buscar hora do servidor:", err);
        setBackendOnline(false);
      } finally {
        setLoadingDate(false);
      }
    }
    fetchBackendHealth();
  }, []);

  const formattedDateTime = now.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="w-full min-h-screen bg-[#f7f6f1] font-geomanist font-normal flex text-[#1f2a24]">
      {/* ====== BARRA LATERAL ====== */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 272, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="hidden lg:flex flex-col shrink-0 bg-[#0b2620] text-white overflow-hidden sticky top-0 h-screen"
          >
            <div className="w-[272px] flex flex-col h-full px-5 py-6 overflow-y-auto">
              {/* Logo */}
              <div className="flex items-center gap-3 mb-9 px-1">
                <Image src="/Gov/logo-idam.png" alt="Logo IDAM" width={38} height={38} className="object-contain" />
                <div>
                  <p className="text-sm font-semibold leading-tight">IDAM</p>
                  <p className="text-[0.65rem] text-[#87a794] leading-tight tracking-wide">INTRANET CORPORATIVA</p>
                </div>
              </div>

              {/* Início */}
              <button className="group flex items-center gap-3 bg-[#8fae6a] hover:bg-[#9dbb7c] transition-colors rounded-xl px-4 py-3 mb-8 font-semibold text-sm text-[#0b2620] shadow-[0_8px_20px_-8px_rgba(143,174,106,0.6)]">
                <Home className="w-[18px] h-[18px]" />
                Início
              </button>

              {/* Arquivos e contatos */}
              <p className="text-[0.65rem] font-semibold tracking-[0.15em] text-[#5f7d6c] mb-3 px-1">
                ARQUIVOS E CONTATOS
              </p>
              <div className="space-y-0.5 mb-9">
                {quickFiles.map((f) => (
                  <a
                    key={f.title}
                    href={f.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/[0.06] transition text-[0.85rem] text-white/80 hover:text-white"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-[#8fae6a]">{f.icon}</span>
                      {f.title}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-white/25" />
                  </a>
                ))}
              </div>

              {/* Dicas de segurança */}
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 mt-auto">
                <p className="flex items-center gap-2 text-[0.65rem] font-semibold tracking-[0.12em] text-[#87a794] mb-3">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  DICAS DE SEGURANÇA
                </p>
                <div className="space-y-0.5">
                  {securityTips.map((tip, i) => {
                    const Icon = tipIcons[i % tipIcons.length];
                    return (
                      <a
                        key={tip.id}
                        href={tip.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/[0.06] transition"
                      >
                        <span className="w-8 h-8 rounded-full bg-[#8fae6a]/15 flex items-center justify-center shrink-0">
                          <Icon className="w-[15px] h-[15px] text-[#8fae6a]" />
                        </span>
                        <span className="text-[0.72rem] leading-snug text-white/80">{tip.title}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ====== ÁREA PRINCIPAL ====== */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* ====== CABEÇALHO ====== */}
        <header className="bg-[#0b2620]/95 backdrop-blur text-white sticky top-0 z-40 border-b border-white/[0.06]">
          <div className="px-4 md:px-8 py-4 flex items-center justify-between gap-4">
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="p-2 rounded-lg hover:bg-white/[0.08] transition shrink-0"
              aria-label="Alternar menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <nav className="hidden md:flex items-center gap-7 flex-1 justify-center overflow-x-auto">
              {headerLinks.map((l) => (
                <a
                  key={l.title}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[0.78rem] font-medium tracking-wide text-white/70 hover:text-white transition whitespace-nowrap"
                >
                  {l.icon}
                  {l.title.toUpperCase()}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-1.5 shrink-0">
              <button className="relative p-2 rounded-full hover:bg-white/[0.08] transition" aria-label="Notificações">
                <Bell className="w-[18px] h-[18px]" />
                <span className="absolute top-1 right-1 bg-[#8fae6a] text-[#0b2620] text-[0.55rem] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  3
                </span>
              </button>
              <button className="p-2 rounded-full hover:bg-white/[0.08] transition" aria-label="Ajuda">
                <HelpCircle className="w-[18px] h-[18px]" />
              </button>
              <Link href="/login" className="ml-1">
                <button className="w-8 h-8 rounded-full bg-[#8fae6a] text-[#0b2620] hover:brightness-110 transition flex items-center justify-center" aria-label="Perfil">
                  <User className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </header>

        {/* ====== CONTEÚDO ====== */}
        <main className="flex-1 px-4 md:px-8 py-7 grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-7">
          {/* COLUNA ESQUERDA / CENTRAL */}
          <div className="space-y-7 min-w-0">
            {/* Banner principal */}
            <motion.section
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="relative rounded-[28px] overflow-hidden bg-[#0b2620] min-h-[300px] flex items-center"
            >
              <div className="absolute inset-0">
                <Image src="/Gov/predio-idam.jpg" alt="Sede do IDAM" fill className="object-cover opacity-[0.28]" priority />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0b2620] via-[#0b2620]/90 to-[#0b2620]/20" />
                <TopoTexture className="absolute inset-0 w-full h-full" />
              </div>

              <div className="relative z-10 px-8 md:px-12 py-10 max-w-lg">
                <span className="inline-block text-[0.65rem] tracking-[0.35em] font-semibold text-[#0b2620] bg-[#8fae6a] rounded-full px-3 py-1 mb-5">
                  INTRANET
                </span>
                <h2 className="text-[2rem] md:text-[2.4rem] font-bold text-white leading-[1.1] mb-4">
                  Instituto de Desenvolvimento<br />Agropecuário e Florestal
                </h2>
                <p className="text-white/60 text-sm leading-relaxed mb-8 max-w-sm">
                  Sustentável do Amazonas — informações, sistemas e comunicados do IDAM reunidos em um só lugar.
                </p>
                <div className="flex items-center gap-2.5">
                  <Leaf className="w-7 h-7 text-[#8fae6a]" strokeWidth={1.75} />
                  <div className="leading-none">
                    <p className="text-white font-bold text-lg">IDAM</p>
                    <p className="text-[0.6rem] text-white/45 tracking-[0.25em] mt-0.5">AMAZONAS</p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Acessos rápidos + Departamentos */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
              <motion.section
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={1}
                className="md:col-span-3 bg-white rounded-3xl border border-black/[0.04] shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-6"
              >
                <h3 className="text-[0.95rem] font-semibold text-[#0b2620] mb-5">Acessos rápidos</h3>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
                  {officeApps.map((app) => (
                    <motion.a
                      key={app.title}
                      href={app.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      className="flex flex-col items-center gap-2 text-center"
                    >
                      <span className="w-12 h-12 rounded-2xl bg-[#f7f6f1] flex items-center justify-center transition group-hover:bg-[#eef4e6]">
                        <img src={app.img} alt={app.title} className="w-6 h-6 object-contain" />
                      </span>
                      <span className="text-[0.65rem] text-[#8b8577]">{app.title}</span>
                    </motion.a>
                  ))}
                </div>
              </motion.section>

              <motion.section
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={2}
                className="md:col-span-2 bg-[#0b2620] rounded-3xl p-6 text-white flex flex-col"
              >
                <div className="relative flex items-center gap-1 mb-5 border-b border-white/10 pb-3">
                  {(Object.keys(departamentos) as DepartmentKey[]).map((dep) => (
                    <button
                      key={dep}
                      onClick={() => setSelectedDept(dep)}
                      className={`relative px-3 py-1 text-xs font-semibold tracking-wide rounded-full transition ${
                        selectedDept === dep ? "text-[#0b2620]" : "text-white/55 hover:text-white"
                      }`}
                    >
                      {selectedDept === dep && (
                        <motion.span
                          layoutId="dept-pill"
                          className="absolute inset-0 bg-[#8fae6a] rounded-full -z-10"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      {dep}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2 mt-auto">
                  {(Object.keys(departmentMeta) as DepartmentKey[]).map((dep) => (
                    <button
                      key={dep}
                      onClick={() => setSelectedDept(dep)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition text-center ${
                        selectedDept === dep ? "bg-white/[0.08]" : "hover:bg-white/[0.04]"
                      }`}
                    >
                      <span className="w-9 h-9 rounded-full bg-[#8fae6a]/15 flex items-center justify-center text-[#8fae6a]">
                        {departmentMeta[dep].icon}
                      </span>
                      <span className="text-[0.62rem] leading-tight text-white/70">{departmentMeta[dep].label}</span>
                    </button>
                  ))}
                </div>
              </motion.section>
            </div>

            {/* Calendário + Avisos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <motion.section
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={3}
                className="bg-white rounded-3xl border border-black/[0.04] shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-6"
              >
                {loadingDate ? (
                  <p className="text-sm text-[#b3ae9f] text-center py-10">Carregando calendário…</p>
                ) : (
                  <MiniCalendar today={now} />
                )}
              </motion.section>

              <motion.section
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={4}
                className="relative overflow-hidden bg-[#0b2620] rounded-3xl p-6 text-white flex flex-col"
              >
                <Megaphone className="absolute -right-3 -bottom-3 w-24 h-24 text-white/[0.04]" strokeWidth={1} />
                <div className="relative flex items-center gap-2 mb-3">
                  <span className="w-8 h-8 rounded-full bg-[#8fae6a]/15 flex items-center justify-center">
                    <Megaphone className="w-4 h-4 text-[#8fae6a]" />
                  </span>
                  <h4 className="font-semibold text-sm">Avisos</h4>
                </div>
                <p className="relative text-[0.85rem] text-white/55 leading-relaxed mb-6">
                  Fique por dentro dos comunicados e informações importantes do IDAM.
                </p>
                <button className="relative mt-auto flex items-center justify-center gap-2 bg-[#8fae6a] hover:brightness-110 transition rounded-xl px-4 py-2.5 text-sm font-semibold text-[#0b2620] w-fit">
                  Ver comunicados
                  <ChevronRight className="w-4 h-4" />
                </button>
              </motion.section>
            </div>

            {/* Arquivos */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { title: "Lista de Ramais", icon: <Phone className="w-4 h-4" />, href: RAMAIS_PDF_URL },
                { title: "Lista de Emails", icon: <MailIcon className="w-4 h-4" />, href: EMAILS_PDF_URL },
                { title: "Lista de Contatos", icon: <User className="w-4 h-4" />, href: CONTATOS_PDF_URL },
              ].map((f, i) => (
                <motion.div
                  key={f.title}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={5 + i}
                  className="bg-white rounded-2xl border border-black/[0.04] shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-4 flex items-center gap-3"
                >
                  <span className="w-10 h-10 rounded-full bg-[#eef4e6] text-[#0b2620] flex items-center justify-center shrink-0">
                    {f.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.85rem] font-semibold text-[#1f2a24] truncate">{f.title}</p>
                    <p className="text-[0.65rem] text-[#b3ae9f]">Abre em nova aba</p>
                  </div>
                  <a
                    href={f.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[0.7rem] font-medium text-[#0b2620] border border-black/[0.08] rounded-lg px-2.5 py-1.5 hover:border-[#8fae6a] hover:bg-[#eef4e6] transition shrink-0"
                  >
                    PDF
                  </a>
                </motion.div>
              ))}
            </div>
          </div>

          {/* COLUNA DIREITA */}
          <motion.aside
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="bg-white rounded-3xl border border-black/[0.04] shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-6 h-fit xl:sticky xl:top-24"
          >
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-semibold text-[0.95rem] text-[#0b2620]">{departmentMeta[selectedDept].label}</h4>
              <button className="flex items-center gap-1 text-[0.7rem] font-medium text-[#b3ae9f] hover:text-[#0b2620] transition">
                Ver todos
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <p className="text-[0.7rem] text-[#b3ae9f] mb-4">Sistemas do departamento {selectedDept}</p>

            <AnimatePresence mode="wait">
              <motion.div
                key={selectedDept}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="divide-y divide-black/[0.04]"
              >
                {departamentos[selectedDept].map((item) => (
                  <a
                    key={item.title}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 py-2.5 text-[0.82rem] text-[#4a5450] hover:text-[#0b2620] transition group"
                  >
                    <span className="w-7 h-7 rounded-full bg-[#f7f6f1] group-hover:bg-[#eef4e6] flex items-center justify-center text-[#0b2620] shrink-0 transition">
                      {item.icon}
                    </span>
                    <span className="truncate flex-1">{item.title}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#d8d4c8] shrink-0" />
                  </a>
                ))}
              </motion.div>
            </AnimatePresence>
          </motion.aside>
        </main>

        {/* ====== RODAPÉ ====== */}
        <footer className="bg-[#0b2620] text-white/60 mt-auto border-t border-white/[0.06]">
          <div className="px-4 md:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[0.72rem]">
            <span className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#8fae6a]" />
              {formattedDateTime}
            </span>
            <span className="flex items-center gap-2 text-center">
              <Leaf className="w-3.5 h-3.5 text-[#8fae6a]" />
              NÚCLEO DE TECNOLOGIA DA INFORMAÇÃO · © {now.getFullYear()} NTI — Todos os direitos reservados.
            </span>
            <span className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-[#8fae6a]" />
              <span
                className={`w-2 h-2 rounded-full ${
                  backendOnline === false ? "bg-red-400" : backendOnline ? "bg-[#8fae6a]" : "bg-white/30"
                }`}
              />
              Backend {backendOnline === false ? "indisponível" : backendOnline ? "conectado" : "verificando"}
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
