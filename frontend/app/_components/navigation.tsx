"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { motion, type Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Clock3, Menu } from "lucide-react";
import {
  quickFiles,
  securityTips,
  headerShortcuts,
  type LinkItem,
} from "../_data/home";

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
      <span className="hidden size-9 items-center justify-center rounded-full bg-[#6da711] text-white shadow-[0_5px_14px_rgba(0,0,0,0.18)] sm:flex">
        <Clock3 className="size-[18px]" strokeWidth={2} />
      </span>
      <time
        className="min-w-[76px] text-right leading-none tabular-nums sm:min-w-[92px]"
        dateTime={currentTime?.toISOString()}
      >
        <strong className="block text-[17px] font-black tracking-normal text-white">
          {time}
        </strong>
        <span className="mt-1 block text-[17px] font-semibold tracking-normal text-[#b9d59e]">
          {date}
        </span>
      </time>
    </div>
  );
}

// Cabeçalho: visual externo (fundo gradiente + animação de entrada + logo) do design 2,
// com os dropdowns "Áreas"/"Sistemas" e atalhos rápidos do design 1.
export function Header({ onToggleMenu }: { onToggleMenu: () => void }) {
  const smoothScrollToElement = (el: HTMLElement) => {
    const headerOffset = 80;
    const top = el.getBoundingClientRect().top + window.pageYOffset - headerOffset;

    window.scrollTo({ top, behavior: "smooth" });

    setTimeout(() => {
      el.classList.remove("flash-highlight");
      void el.getBoundingClientRect();
      el.classList.add("flash-highlight");

      const priorTab = el.getAttribute("tabindex");
      if (priorTab === null) {
        el.setAttribute("tabindex", "-1");
      }

      el.focus({ preventScroll: true } as FocusOptions);

      if (priorTab === null) {
        setTimeout(() => el.removeAttribute("tabindex"), 1200);
      }
    }, 600);
  };

  const scrollToHash = (href: string) => {
    const hashIndex = href.indexOf("#");
    if (hashIndex === -1) {
      window.location.href = href;
      return;
    }

    const id = href.slice(hashIndex + 1);
    const el = document.getElementById(id);
    if (!el) {
      window.location.href = href;
      return;
    }

    smoothScrollToElement(el);
  };

  const handleHeaderLinkClick = (
    href: string,
    event: MouseEvent<HTMLAnchorElement>
  ) => {
    if (href.includes("#")) {
      event.preventDefault();
      scrollToHash(href);
      return;
    }

    if (href.startsWith("/")) {
      const idCandidate = href.replace(/^\//, "").replace(/\/.*/, "");
      const el = document.getElementById(idCandidate);
      if (el) {
        event.preventDefault();
        smoothScrollToElement(el);
      }
    }
  };

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="sticky top-0 z-50 h-[70px] overflow-hidden border-b border-white/10 bg-[linear-gradient(105deg,#073821,#052f1f_55%,#004025)] text-white shadow-[0_8px_24px_rgba(3,42,27,0.16)] lg:h-[78px]"
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
            <span className="mt-1 hidden text-[17px] font-medium uppercase text-[#a9cc78] sm:block">
              Intranet corporativa
            </span>
          </span>
        </Link>

        {/* Atalhos centrais do cabeçalho */}
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-wrap items-center gap-2 -translate-x-12">
            {headerShortcuts.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.a
                  key={item.title}
                  href={item.href}
                  onClick={(event) => handleHeaderLinkClick(item.href, event)}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05, ease: "easeOut" }}
                  whileHover={{ y: -2, scale: 1.02 }}
                  className="flex h-10 items-center justify-center gap-2 rounded-[10px] bg-white/5 px-3 text-[15px] font-semibold text-white/90 transition hover:bg-white/10"
                >
                  <Icon className="size-5" />
                  <span className="hidden lg:inline">{item.title}</span>
                </motion.a>
              );
            })}
          </div>
        </div>

        {/* Relógio — design da direita, mantido sem alteração */}
        <HeaderClock />
      </div>
    </motion.header>
  );
}

interface SidebarSectionProps {
  title: string;
  items: LinkItem[];
  boxed?: boolean;
  collapsed?: boolean;
  secretAction?: () => void;
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

// Grupo reutilizável de links externos da barra lateral.
function SidebarSection({
  title,
  items,
  boxed = false,
  collapsed = false,
  secretAction,
}: SidebarSectionProps) {
  return (
    <div
      className={
        boxed && !collapsed
          ? "rounded-[14px] border border-[#e4e8df] p-3 shadow-[0_8px_20px_rgba(11,52,36,0.05)]"
          : ""
      }
    >
      <h2
        onClick={secretAction}
        className={`mb-4 cursor-pointer border-b border-[#79a629] pb-2.5 text-[17px] font-black uppercase text-[#5d9115] ${collapsed ? "lg:hidden" : ""}`}
      >
        {title}
      </h2>
      <motion.div
        variants={sectionListVariants}
        initial="hidden"
        animate="show"
        className={boxed && !collapsed ? "divide-y divide-[#edf0ea]" : "space-y-2"}
      >
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <motion.a
              key={item.title}
              variants={sectionItemVariants}
              whileHover={{ x: collapsed ? 0 : 3 }}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              title={collapsed ? item.title : undefined}
              className={`group flex min-h-[58px] items-center gap-3 rounded-[10px] px-1.5 py-2.5 text-[#17281d] transition-colors hover:bg-[#f1f7ec] hover:text-[#5b930b] ${collapsed ? "lg:justify-center lg:px-0" : ""}`}
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full text-[#073821] group-hover:bg-[#edf7df]">
                <Icon className="size-6" strokeWidth={1.8} />
              </span>
              <span
                className={`min-w-0 flex-1 text-[17px] leading-snug ${collapsed ? "lg:hidden" : ""}`}
              >
                {item.title}
              </span>
              <ChevronRight
                className={`size-4 shrink-0 ${collapsed ? "lg:hidden" : ""}`}
              />
            </motion.a>
          );
        })}
      </motion.div>
    </div>
  );
}

interface SidebarProps {
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
}

// Navegação lateral responsiva: gaveta no celular e versão compacta no desktop.
export function Sidebar({ open, collapsed, onClose }: SidebarProps) {
  const [showCreators, setShowCreators] = useState(false);
  const [secretClicks, setSecretClicks] = useState(0);

  const revealCreators = () => {
    setSecretClicks((current) => {
      const next = current + 1;
      if (next >= 7) {
        setShowCreators(true);
      }
      return next;
    });
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-[70] w-[88vw] max-w-[340px] overflow-y-auto border-r border-[#e4e8df] bg-white px-3.5 py-5 shadow-2xl transition-[width,transform,padding] duration-300 lg:static lg:z-auto lg:block lg:max-w-none lg:shrink-0 lg:translate-x-0 lg:py-5 lg:shadow-none ${collapsed ? "lg:w-[78px] lg:px-2.5" : "lg:w-[280px] lg:px-3.5"} ${open ? "translate-x-0" : "-translate-x-full"}`}
    >
      <div className="mb-6 flex items-center justify-between lg:hidden">
        <div className="relative flex items-center gap-2">
          <Image
            src="/Gov/logo-idam.png"
            alt="IDAM Amazonas"
            width={510}
            height={283}
            className="h-10 w-[72px] object-contain"
          />
          <span className="leading-none">
            <strong className="block text-[17px]">IDAM</strong>
            <small className="text-[17px] uppercase text-[#5d9115]">Intranet</small>
          </span>
          <button
            type="button"
            onClick={revealCreators}
            aria-label="Segredo dos criadores"
            className="absolute inset-0 opacity-0"
          />
        </div>
        <motion.button
          onClick={onClose}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="flex size-10 items-center justify-center rounded-full border border-[#dfe7dc] text-[#073821]"
          aria-label="Fechar menu"
        >
          <ChevronLeft className="size-6" />
        </motion.button>
      </div>

      <SidebarSection
        title="Arquivos e contatos"
        items={quickFiles}
        collapsed={collapsed}
        secretAction={revealCreators}
      />
      {showCreators ? (
        <div
          className={`mt-4 rounded-[12px] bg-[#f9fff4] p-3 text-[#18321d] shadow-[0_8px_18px_rgba(11,52,36,0.08)] ${collapsed ? "lg:hidden" : ""}`}
        >
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-[14px] font-bold">Equipe de criação</p>
            <span className="rounded-full bg-[#dcecc4] px-2.5 py-1 text-[12px] font-semibold text-[#4d7f10]">
              Cliques: {secretClicks}
            </span>
          </div>
          <ul className="space-y-1 text-[13px] leading-snug text-[#3f5637]">
            <li>• Luiz Felipe da Silva e Silva</li>
            <li>• Beatriz Christine</li>
            <li>• Luiz Miguel</li>
          </ul>
        </div>
      ) : null}
      <motion.div
        className={`mt-7 ${collapsed ? "lg:hidden" : ""}`}
        animate={{
          scale: [1, 1.02, 1],
          y: [0, -2, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <SidebarSection title="Dicas de Segurança" items={securityTips} boxed />
      </motion.div>
    </aside>
  );
}