"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FolderOpen,
  LayoutGrid,
  Menu,
  ShieldCheck,
  X,
  type LucideIcon,
} from "lucide-react";
import { createPortal } from "react-dom";
import {
  departmentLinks,
  departmentMeta,
  quickFiles,
  securityTips,
  type DepartmentKey,
  type LinkItem,
} from "../_data/home";
import { useModalFocus } from "../_hooks/use-modal-focus";

function formatHeaderDateTime(date: Date | null) {
  if (!date) {
    return {
      time: "--:--:--",
      date: "--/--/----",
      dateTime: undefined,
    };
  }

  return {
    time: date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    date: date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    dateTime: date.toISOString(),
  };
}

// Relógio em tempo real exibido no canto direito do cabeçalho.
// (design mantido idêntico ao original — não foi alterado)
function HeaderClock() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    const updateClock = () => setCurrentTime(new Date());
    updateClock();
    const timer = window.setInterval(updateClock, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const { time, date } = formatHeaderDateTime(currentTime);

  return (
    <div
      className="ml-auto flex shrink-0 items-center gap-2.5 rounded-[12px] bg-white/[0.07] px-3 py-2 sm:gap-3 sm:px-4"
      aria-label="Data e hora atuais"
    >
      <span className="hidden size-9 items-center justify-center rounded-full bg-[#0F897A] text-white shadow-[0_5px_14px_rgba(0,0,0,0.18)] sm:flex">
        <Clock3 className="size-[18px]" strokeWidth={2} />
      </span>
      <time
        className="min-w-[76px] text-right leading-none tabular-nums sm:min-w-[92px]"
        dateTime={currentTime?.toISOString()}
      >
        <strong className="block text-[17px] font-black tracking-normal text-white">
          {time}
        </strong>
        <span className="mt-1 block text-[17px] font-semibold tracking-normal text-[#DFF2EC]">
          {date}
        </span>
      </time>
    </div>
  );
}

// Cabeçalho: visual externo (fundo gradiente + animação de entrada + logo) do design 2,
// com os dropdowns "Áreas"/"Sistemas" e atalhos rápidos do design 1.
export function Header({ onToggleMenu }: { onToggleMenu: () => void }) {
  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="sticky top-0 z-50 h-[70px] overflow-hidden border-b border-white/10 bg-[linear-gradient(105deg,#0B3F43,#0D5A54_55%,#0F6E63)] text-white shadow-[0_8px_24px_rgba(11,63,67,0.22)] lg:h-[78px]"
    >
      <div className="relative mx-auto flex h-full max-w-[1920px] items-center gap-3 px-4 sm:px-5 xl:gap-6 xl:px-6">
        {/* Botão do menu lateral */}
        <motion.button
          onClick={onToggleMenu}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="flex size-10 shrink-0 items-center justify-center rounded-[11px] border border-white/20 text-white/95 transition-colors hover:bg-white/10"
          aria-label="Alternar menu"
        >
          <Menu className="size-5.5" />
        </motion.button>

        {/* Logo + marca (design 2) */}
        <Link
          href="/"
          className="flex h-[56px] w-[120px] shrink-0 items-center gap-2 overflow-hidden sm:w-[250px]"
        >
          <Image
            src="/Gov/logo-idam.png"
            alt="IDAM Amazonas"
            width={510}
            height={283}
            priority
            className="h-9 w-16 shrink-0 object-contain sm:h-[42px] sm:w-[76px]"
          />
          <span className="min-w-0 border-l border-white/20 pl-2.5 leading-none">
            <strong className="block text-[17px] font-black">IDAM</strong>
            <span className="mt-1 hidden text-[17px] font-medium uppercase text-[#DFF2EC] sm:block">
              Intranet corporativa
            </span>
          </span>
        </Link>

        <div className="flex-1" aria-hidden="true" />

        {/* Relógio — design da direita, mantido sem alteração */}
        <HeaderClock />
      </div>
    </motion.header>
  );
}

const sectionListVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.05, delayChildren: 0.05 },
  },
};

const sectionItemVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { duration: 0.25, ease: "easeOut" } },
};

interface SidebarProps {
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
}

interface AccordionTabProps {
  id: string;
  title: string;
  icon: LucideIcon;
  expanded: boolean;
  collapsed: boolean;
  onToggle: () => void;
  contentClassName?: string;
  children: ReactNode;
}

function AccordionTab({
  id,
  title,
  icon: Icon,
  expanded,
  collapsed,
  onToggle,
  contentClassName = "",
  children,
}: AccordionTabProps) {
  return (
    <section
      className={`relative overflow-hidden rounded-[12px] transition-colors ${expanded && !collapsed ? "bg-[#F8FAF9] ring-1 ring-[#D7E1DE]" : ""}`}
    >
      <span
        className={`absolute inset-y-2 left-0 w-1 rounded-r-full bg-[#0F897A] transition-opacity ${expanded && !collapsed ? "opacity-100" : "opacity-0"}`}
        aria-hidden="true"
      />
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded && !collapsed}
        aria-controls={id}
        title={collapsed ? title : undefined}
        className={`group flex min-h-[54px] w-full items-center gap-2.5 rounded-[12px] px-2 py-2 text-left transition ${expanded && !collapsed ? "text-[#0D675D]" : "text-[#173849] hover:bg-[#F8FAF9]"} ${collapsed ? "lg:justify-center lg:px-0" : ""}`}
      >
        <span
          className={`flex size-9 shrink-0 items-center justify-center rounded-[10px] transition ${expanded && !collapsed ? "bg-[#14786C] text-white shadow-[0_4px_8px_rgba(13,103,93,0.2)]" : "bg-[#DFF2EC] text-[#14786C] group-hover:bg-[#CDEBE2]"}`}
        >
          <Icon className="size-5" strokeWidth={1.9} aria-hidden="true" />
        </span>
        <span className={`min-w-0 flex-1 text-[15px] font-bold leading-snug ${collapsed ? "lg:hidden" : ""}`}>
          {title}
        </span>
        <ChevronDown
          className={`size-5 shrink-0 text-[#14786C] transition-transform duration-200 ${expanded ? "rotate-180" : ""} ${collapsed ? "lg:hidden" : ""}`}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence initial={false}>
        {expanded && !collapsed && (
          <motion.div
            id={id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className={`overflow-hidden ${contentClassName}`}
          >
            <div className="px-2 pb-2.5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

const securityInformation: Record<string, { introduction: string; recommendations: string[] }> = {
  "Proteja seus dispositivos contra malware": {
    introduction:
      "Malware é todo programa criado para prejudicar um equipamento, espionar atividades, roubar informações ou bloquear arquivos. Ele pode chegar por anexos, links falsos, programas não autorizados e dispositivos externos infectados.",
    recommendations: [
      "Mantenha o Windows, o navegador e o antivírus sempre atualizados.",
      "Instale somente programas autorizados pelo NTI.",
      "Não abra anexos ou links inesperados, mesmo quando parecem urgentes.",
      "Ao perceber lentidão, telas estranhas ou arquivos alterados, desconecte o equipamento da rede e acione o suporte.",
    ],
  },
  "Nunca compartilhe suas senhas": {
    introduction:
      "A senha identifica você nos sistemas institucionais. Quando ela é compartilhada, outras pessoas podem acessar dados, realizar alterações e gerar registros em seu nome, dificultando a proteção e a auditoria das informações.",
    recommendations: [
      "Use uma senha longa, exclusiva e difícil de adivinhar.",
      "Nunca envie senhas por e-mail, mensagem ou formulário não oficial.",
      "Não reutilize a senha institucional em serviços pessoais.",
      "Se suspeitar de exposição, altere a senha imediatamente e comunique o NTI.",
    ],
  },
  "Guia rápido: como abrir um chamado": {
    introduction:
      "Um chamado bem descrito ajuda a equipe técnica a entender o impacto e resolver o problema com mais rapidez. Informe o que aconteceu, quando começou e qual atividade ficou impedida.",
    recommendations: [
      "Informe seu setor, contato e identificação do equipamento.",
      "Descreva a mensagem de erro e os passos que levaram ao problema.",
      "Anexe uma captura de tela, evitando expor senhas ou dados sensíveis.",
      "Não abra vários chamados para o mesmo problema; acompanhe a solicitação original.",
    ],
  },
  "Cuidado com e-mails suspeitos": {
    introduction:
      "Mensagens fraudulentas tentam criar urgência para induzir cliques, downloads ou entrega de informações. O nome exibido pode parecer conhecido, mas o endereço real do remetente pode ser falso.",
    recommendations: [
      "Confira o endereço completo do remetente e o domínio utilizado.",
      "Desconfie de cobranças, prêmios, ameaças ou pedidos urgentes de senha.",
      "Passe o mouse sobre os links antes de clicar e não abra anexos inesperados.",
      "Em caso de dúvida, confirme o pedido por outro canal e encaminhe a mensagem ao NTI.",
    ],
  },
};

function SecurityInformationModal({ item, onClose }: { item: LinkItem; onClose: () => void }) {
  const modalRef = useRef<HTMLDivElement>(null);
  useModalFocus(true, modalRef, onClose);

  const content = securityInformation[item.title];
  const Icon = item.icon;

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-[#0B3F43]/65 px-4 py-6 backdrop-blur-[3px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="security-information-title"
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        onClick={(event) => event.stopPropagation()}
        className="max-h-[88dvh] w-full max-w-2xl overflow-y-auto rounded-[20px] border border-[#D7E1DE] bg-white p-5 shadow-[0_24px_64px_rgba(11,63,67,0.28)] sm:p-7"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#D7E1DE] pb-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-[12px] bg-[#DFF2EC] text-[#14786C]">
              <Icon className="size-6" strokeWidth={1.9} aria-hidden="true" />
            </span>
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#0F897A]">Dica de segurança</p>
              <h2 id="security-information-title" className="mt-1 text-[21px] font-black leading-tight text-[#173849]">
                {item.title}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar dica de segurança"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#F7FAF9] text-[#173849] transition hover:bg-[#DFF2EC]"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <p className="mt-5 text-[16px] leading-relaxed text-[#365563]">{content.introduction}</p>

        <div className="mt-5 rounded-[14px] border border-[#D7E1DE] bg-[#F7FAF9] p-4">
          <h3 className="text-[15px] font-black text-[#173849]">Boas práticas</h3>
          <ul className="mt-3 space-y-3">
            {content.recommendations.map((recommendation) => (
              <li key={recommendation} className="flex gap-3 text-[15px] leading-relaxed text-[#365563]">
                <span className="mt-2 size-2 shrink-0 rounded-full bg-[#0F897A]" aria-hidden="true" />
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 rounded-[10px] bg-[#14786C] px-6 text-[15px] font-bold text-white transition hover:bg-[#0D675D]"
          >
            Fechar
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}

type SidebarPanel = "files" | "security" | "areas";

interface SideFlyoutProps {
  id: string;
  collapsed: boolean;
  title: string;
  subtitle: string;
  fullHeight?: boolean;
  escapeDisabled?: boolean;
  onClose: () => void;
  children: ReactNode;
}

// Painel largo do desktop, aberto ao lado da barra lateral.
function SideFlyout({
  id,
  collapsed,
  title,
  subtitle,
  fullHeight = false,
  escapeDisabled = false,
  onClose,
  children,
}: SideFlyoutProps) {
  useEffect(() => {
    if (escapeDisabled) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [escapeDisabled, onClose]);

  return (
    <>
      <motion.button
        type="button"
        aria-label={`Fechar ${title.toLowerCase()}`}
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 top-[78px] z-[64] hidden bg-[#0B3F43]/25 backdrop-blur-[1px] lg:block ${collapsed ? "lg:left-[78px]" : "lg:left-[280px]"}`}
      />
      <motion.section
        role="dialog"
        aria-labelledby={`${id}-title`}
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -16 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className={`fixed top-[94px] z-[65] hidden max-h-[calc(100dvh-110px)] w-[min(760px,calc(100vw-320px))] flex-col overflow-hidden rounded-[18px] border border-[#D7E1DE] bg-white shadow-[0_24px_64px_rgba(11,63,67,0.22)] lg:flex ${fullHeight ? "bottom-4" : ""} ${collapsed ? "lg:left-[90px]" : "lg:left-[292px]"}`}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-[linear-gradient(90deg,#0D675D_0%,#DFF2EC_100%)]" />

        <div className="flex items-start justify-between gap-4 border-b border-[#D7E1DE] px-6 pb-4 pt-6">
          <div>
            <h2 id={`${id}-title`} className="text-[21px] font-black tracking-[-0.01em] text-[#173849]">
              {title}
            </h2>
            <p className="mt-0.5 text-[14px] font-medium text-[#6F858C]">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={`Fechar ${title.toLowerCase()}`}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#F7FAF9] text-[#173849] transition hover:bg-[#DFF2EC]"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        {children}
      </motion.section>
    </>
  );
}

const quickFileDescriptions: Record<string, string> = {
  "Lista de Ramais": "Telefones internos de cada setor",
  "Lista de Emails": "Endereços de e-mail institucionais",
  "Lista de Contatos": "Contatos das unidades e equipes",
};

function FilesFlyout({ collapsed, onClose }: { collapsed: boolean; onClose: () => void }) {
  return (
    <SideFlyout
      id="files-flyout"
      collapsed={collapsed}
      title="Arquivos e contatos"
      subtitle="Ramais, e-mails e contatos institucionais"
      onClose={onClose}
    >
      <motion.div
        variants={sectionListVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-3 gap-3 overflow-y-auto p-6"
      >
        {quickFiles.map((item) => {
          const Icon = item.icon;
          return (
            <motion.a
              key={item.title}
              variants={sectionItemVariants}
              whileHover={{ y: -3 }}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col gap-4 rounded-[14px] border border-[#D7E1DE] bg-white p-4 text-[#173849] transition hover:border-[#0F897A] hover:bg-[#F8FAF9]"
            >
              <span className="flex size-12 items-center justify-center rounded-[12px] bg-[#14786C] text-white shadow-[0_4px_8px_rgba(13,103,93,0.2)]">
                <Icon className="size-6" strokeWidth={1.9} aria-hidden="true" />
              </span>
              <span>
                <span className="block text-[16px] font-black leading-tight group-hover:text-[#0D675D]">{item.title}</span>
                {quickFileDescriptions[item.title] ? (
                  <span className="mt-1 block text-[13.5px] leading-snug text-[#6F858C]">
                    {quickFileDescriptions[item.title]}
                  </span>
                ) : null}
              </span>
              <span className="mt-auto flex items-center gap-1 text-[13px] font-bold text-[#14786C]">
                Abrir
                <ChevronRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </motion.a>
          );
        })}
      </motion.div>
    </SideFlyout>
  );
}

interface SecurityFlyoutProps {
  collapsed: boolean;
  tipOpen: boolean;
  onSelectTip: (item: LinkItem) => void;
  onClose: () => void;
}

function SecurityFlyout({ collapsed, tipOpen, onSelectTip, onClose }: SecurityFlyoutProps) {
  return (
    <SideFlyout
      id="security-flyout"
      collapsed={collapsed}
      title="Dicas de segurança"
      subtitle="Boas práticas para proteger você e as informações do IDAM"
      escapeDisabled={tipOpen}
      onClose={onClose}
    >
      <motion.div
        variants={sectionListVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3 overflow-y-auto p-6"
      >
        {securityTips.map((item) => {
          const Icon = item.icon;
          return (
            <motion.button
              type="button"
              key={item.title}
              variants={sectionItemVariants}
              whileHover={{ y: -3 }}
              onClick={() => onSelectTip(item)}
              className="group flex flex-col gap-3 rounded-[14px] border border-[#D7E1DE] bg-white p-4 text-left text-[#173849] transition hover:border-[#0F897A] hover:bg-[#F8FAF9]"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-[12px] bg-[#14786C] text-white shadow-[0_4px_8px_rgba(13,103,93,0.2)]">
                  <Icon className="size-5" strokeWidth={1.9} aria-hidden="true" />
                </span>
                <span className="text-[16px] font-black leading-tight group-hover:text-[#0D675D]">{item.title}</span>
              </div>
              {securityInformation[item.title] ? (
                <span className="line-clamp-2 text-[13.5px] leading-snug text-[#6F858C]">
                  {securityInformation[item.title].introduction}
                </span>
              ) : null}
              <span className="mt-auto flex items-center gap-1 text-[13px] font-bold text-[#14786C]">
                Ler dica
                <ChevronRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </motion.button>
          );
        })}
      </motion.div>
    </SideFlyout>
  );
}

interface AreasFlyoutProps {
  collapsed: boolean;
  selectedDepartment: DepartmentKey;
  onSelectDepartment: (department: DepartmentKey) => void;
  onClose: () => void;
}

function AreasFlyout({ collapsed, selectedDepartment, onSelectDepartment, onClose }: AreasFlyoutProps) {
  const accesses = departmentLinks[selectedDepartment];

  return (
    <SideFlyout
      id="areas-flyout"
      collapsed={collapsed}
      title="Áreas e sistemas"
      subtitle="Escolha a área para ver os sistemas disponíveis"
      fullHeight
      onClose={onClose}
    >
        <div className="grid grid-cols-3 gap-3 px-6 pt-5">
          {(Object.keys(departmentMeta) as DepartmentKey[]).map((department) => {
            const Icon = departmentMeta[department].icon;
            const active = selectedDepartment === department;
            return (
              <button
                key={department}
                type="button"
                onClick={() => onSelectDepartment(department)}
                aria-pressed={active}
                className={`flex items-center gap-3 rounded-[12px] px-4 py-3 text-left transition ${active ? "bg-[#14786C] text-white shadow-[0_6px_16px_rgba(13,103,93,0.2)]" : "bg-[#F8FAF9] text-[#173849] ring-1 ring-[#D7E1DE] hover:bg-[#DFF2EC]"}`}
              >
                <span className={`flex size-10 shrink-0 items-center justify-center rounded-[10px] ${active ? "bg-white/15 text-white" : "bg-[#DFF2EC] text-[#14786C]"}`}>
                  <Icon className="size-5" strokeWidth={1.9} aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[16px] font-black leading-tight">{department}</span>
                  <span className={`block text-[13px] leading-snug ${active ? "text-[#DFF2EC]" : "text-[#6F858C]"}`}>
                    {departmentMeta[department].title}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 px-6">
          <h3 className="text-[12.5px] font-bold uppercase tracking-[0.09em] text-[#14786C]">
            {departmentMeta[selectedDepartment].title}
          </h3>
          <span className="rounded-full bg-[#DFF2EC] px-2.5 py-1 text-[12px] font-bold text-[#0D675D]">
            {accesses.length} {accesses.length === 1 ? "acesso" : "acessos"}
          </span>
        </div>

        <motion.div
          key={selectedDepartment}
          variants={sectionListVariants}
          initial="hidden"
          animate="show"
          className="mt-3 grid flex-1 auto-rows-min grid-cols-2 gap-2.5 overflow-y-auto px-6 pb-6 xl:grid-cols-3"
        >
          {accesses.map((item) => {
            const Icon = item.icon;
            return (
              <motion.a
                key={item.title}
                variants={sectionItemVariants}
                whileHover={{ y: -2 }}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex min-h-[64px] items-center gap-3 rounded-[12px] border border-[#D7E1DE] bg-white px-3 py-2.5 text-[#173849] transition hover:border-[#0F897A] hover:bg-[#F8FAF9] hover:text-[#0D675D]"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-[#DFF2EC] text-[#14786C]">
                  <Icon className="size-5" strokeWidth={1.8} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1 text-[14px] font-semibold leading-snug">{item.title}</span>
                <ChevronRight className="size-4 shrink-0 text-[#6F858C] transition group-hover:text-[#0D675D]" aria-hidden="true" />
              </motion.a>
            );
          })}
        </motion.div>
    </SideFlyout>
  );
}

// Navegação lateral: gaveta no celular; no desktop as abas abrem painéis ao lado.
export function Sidebar({ open, collapsed, onClose }: SidebarProps) {
  const [expandedPanel, setExpandedPanel] = useState<SidebarPanel | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentKey>("PJ");
  const [selectedSecurityTip, setSelectedSecurityTip] = useState<LinkItem | null>(null);
  const closeSecurityTip = useCallback(() => setSelectedSecurityTip(null), []);
  const closeFlyout = useCallback(() => setExpandedPanel(null), []);
  const togglePanel = (panel: SidebarPanel) => {
    setExpandedPanel((current) => (current === panel ? null : panel));
  };

  const renderExternalLinks = (items: LinkItem[]) => (
    <motion.div variants={sectionListVariants} initial="hidden" animate="show" className="divide-y divide-[#D7E1DE]">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <motion.a
            key={item.title}
            variants={sectionItemVariants}
            whileHover={{ x: 3 }}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex min-h-[50px] items-center gap-2.5 rounded-[9px] px-1.5 py-2 text-[#173849] transition-colors hover:bg-white hover:text-[#0D675D]"
          >
            <span className="flex size-8 shrink-0 items-center justify-center text-[#14786C]">
              <Icon className="size-5" strokeWidth={1.8} aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1 text-[14px] leading-snug">{item.title}</span>
            <ChevronRight className="size-4 shrink-0" aria-hidden="true" />
          </motion.a>
        );
      })}
    </motion.div>
  );

  const departmentAccesses = departmentLinks[selectedDepartment];

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-[70] w-[88vw] max-w-[340px] overflow-y-auto border-r border-[#D7E1DE] bg-white px-3.5 py-5 shadow-2xl transition-[width,transform,padding] duration-300 lg:static lg:z-auto lg:block lg:max-w-none lg:shrink-0 lg:translate-x-0 lg:py-5 lg:shadow-none ${collapsed ? "lg:w-[78px] lg:px-2.5" : "lg:w-[280px] lg:px-3.5"} ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="mb-6 flex items-center justify-between lg:hidden">
          <div className="flex items-center gap-2">
            <Image src="/Gov/logo-idam.png" alt="IDAM Amazonas" width={510} height={283} className="h-10 w-[72px] object-contain" />
            <span className="leading-none">
              <strong className="block text-[17px]">IDAM</strong>
              <small className="text-[17px] uppercase text-[#14786C]">Intranet</small>
            </span>
          </div>
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="flex size-10 items-center justify-center rounded-full border border-[#D7E1DE] text-[#14786C]"
            aria-label="Fechar menu"
          >
            <ChevronLeft className="size-6" />
          </motion.button>
        </div>

        <div>
          <p className={`mb-3 border-b border-[#D7E1DE] px-1 pb-2.5 text-[12.5px] font-bold uppercase tracking-[0.09em] text-[#14786C] ${collapsed ? "lg:hidden" : ""}`}>
            Menu rápido
          </p>
          <div className="space-y-1.5">
          <AccordionTab
            id="sidebar-files"
            title="Arquivos e contatos"
            icon={FolderOpen}
            expanded={expandedPanel === "files"}
            collapsed={collapsed}
            onToggle={() => togglePanel("files")}
            contentClassName="lg:hidden"
          >
            {renderExternalLinks(quickFiles)}
          </AccordionTab>

          <AccordionTab
            id="sidebar-security"
            title="Dicas de segurança"
            icon={ShieldCheck}
            expanded={expandedPanel === "security"}
            collapsed={collapsed}
            onToggle={() => togglePanel("security")}
            contentClassName="lg:hidden"
          >
            <motion.div variants={sectionListVariants} initial="hidden" animate="show" className="divide-y divide-[#D7E1DE]">
              {securityTips.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    type="button"
                    key={item.title}
                    variants={sectionItemVariants}
                    whileHover={{ x: 3 }}
                    onClick={() => setSelectedSecurityTip(item)}
                    className="group flex min-h-[56px] w-full items-center gap-2.5 rounded-[9px] px-1.5 py-2 text-left text-[#173849] transition-colors hover:bg-white hover:text-[#0D675D]"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center text-[#14786C]">
                      <Icon className="size-5" strokeWidth={1.8} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1 text-[14px] leading-snug">{item.title}</span>
                    <ChevronRight className="size-4 shrink-0" aria-hidden="true" />
                  </motion.button>
                );
              })}
            </motion.div>
          </AccordionTab>

          <AccordionTab
            id="sidebar-areas"
            title="Áreas e sistemas"
            icon={LayoutGrid}
            expanded={expandedPanel === "areas"}
            collapsed={collapsed}
            onToggle={() => togglePanel("areas")}
            contentClassName="lg:hidden"
          >
            <div className="grid grid-cols-3 gap-1.5">
              {(Object.keys(departmentMeta) as DepartmentKey[]).map((department) => {
                const Icon = departmentMeta[department].icon;
                const active = selectedDepartment === department;
                return (
                  <button
                    key={department}
                    type="button"
                    onClick={() => setSelectedDepartment(department)}
                    aria-pressed={active}
                    className={`flex min-h-[70px] flex-col items-center justify-center gap-1 rounded-[10px] px-1 text-[13px] font-black transition ${active ? "bg-[#14786C] text-white shadow-[0_6px_16px_rgba(13,103,93,0.2)]" : "bg-white text-[#173849] ring-1 ring-[#D7E1DE] hover:bg-[#DFF2EC]"}`}
                  >
                    <Icon className={`size-5 ${active ? "text-[#DFF2EC]" : "text-[#0F897A]"}`} strokeWidth={1.9} aria-hidden="true" />
                    {department}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between gap-2 border-b border-[#D7E1DE] pb-2.5">
              <h3 className="min-w-0 truncate text-[14px] font-black text-[#173849]">{departmentMeta[selectedDepartment].title}</h3>
              <span className="shrink-0 rounded-full bg-[#DFF2EC] px-2 py-1 text-[11px] font-bold text-[#0D675D]">
                {departmentAccesses.length} {departmentAccesses.length === 1 ? "acesso" : "acessos"}
              </span>
            </div>

            <motion.div key={selectedDepartment} variants={sectionListVariants} initial="hidden" animate="show" className="mt-1 divide-y divide-[#D7E1DE]">
              {departmentAccesses.map((item) => (
                <motion.a
                  key={item.title}
                  variants={sectionItemVariants}
                  whileHover={{ x: 3 }}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-[45px] items-center gap-2 rounded-[8px] px-1.5 py-2 text-[13px] leading-snug text-[#173849] transition hover:bg-white hover:text-[#0D675D]"
                >
                  <span className="min-w-0 flex-1">{item.title}</span>
                  <ChevronRight className="size-4 shrink-0" aria-hidden="true" />
                </motion.a>
              ))}
            </motion.div>
          </AccordionTab>
          </div>
        </div>
      </aside>

      <AnimatePresence>
        {expandedPanel === "files" && <FilesFlyout collapsed={collapsed} onClose={closeFlyout} />}
      </AnimatePresence>

      <AnimatePresence>
        {expandedPanel === "security" && (
          <SecurityFlyout
            collapsed={collapsed}
            tipOpen={selectedSecurityTip !== null}
            onSelectTip={setSelectedSecurityTip}
            onClose={closeFlyout}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {expandedPanel === "areas" && (
          <AreasFlyout
            collapsed={collapsed}
            selectedDepartment={selectedDepartment}
            onSelectDepartment={setSelectedDepartment}
            onClose={closeFlyout}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedSecurityTip && (
          <SecurityInformationModal item={selectedSecurityTip} onClose={closeSecurityTip} />
        )}
      </AnimatePresence>
    </>
  );
}
