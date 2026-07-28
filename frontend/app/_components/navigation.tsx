"use client";

import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Clock3, Home, Menu } from "lucide-react";
import {
  headerLinks,
  quickFiles,
  securityTips,
  type LinkItem,
} from "../_data/home";

// Relógio em tempo real exibido no canto direito do cabeçalho.
function HeaderClock() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    const updateClock = () => setCurrentTime(new Date());
    updateClock();
    const timer = window.setInterval(updateClock, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const time =
    currentTime?.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }) ?? "--:--:--";
  const date =
    currentTime?.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }) ?? "--/--/----";

  return (
    <div
      className="ml-auto flex shrink-0 items-center gap-2.5 border-l border-white/15 pl-3 sm:gap-3 sm:pl-4"
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

// Cabeçalho com a marca e os links para sistemas externos do IDAM.
export function Header({ onToggleMenu }: { onToggleMenu: () => void }) {
  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="sticky top-0 z-50 h-[78px] overflow-hidden bg-[linear-gradient(105deg,#073821,#052f1f_55%,#004025)] text-white shadow-[0_8px_24px_rgba(3,42,27,0.16)] lg:h-[92px]"
    >
      <div className="relative mx-auto flex h-full max-w-[1920px] items-center gap-3 px-4 sm:px-5 xl:gap-6 xl:px-6">
        <motion.button
          onClick={onToggleMenu}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/30 text-white/95 transition-colors hover:bg-white/10 lg:border-transparent"
          aria-label="Alternar menu"
        >
          <Menu className="size-5.5" />
        </motion.button>

        <Link
          href="/"
          className="flex h-[56px] w-[120px] shrink-0 items-center gap-2 overflow-hidden sm:w-[220px]"
        >
          <Image
            src="/Gov/logo-idam.png"
            alt="IDAM Amazonas"
            width={510}
            height={283}
            priority
            className="h-9 w-16 shrink-0 object-contain sm:h-[42px] sm:w-[76px]"
          />
          <span className="min-w-0 leading-none">
            <strong className="block text-[17px] font-black">IDAM</strong>
            <span className="mt-1 hidden text-[17px] font-medium uppercase text-[#a9cc78] sm:block">
              Intranet corporativa
            </span>
          </span>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-3 xl:absolute xl:left-1/2 xl:flex xl:-translate-x-1/2 2xl:gap-6">
          {headerLinks.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.a
                key={item.title}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.08 + index * 0.04 }}
                whileHover={{ y: -1 }}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex shrink-0 items-center gap-2 text-[17px] font-bold uppercase text-white/90 transition-colors hover:text-[#b5d90f]"
              >
                <Icon className="size-5" strokeWidth={1.8} />
                {item.title}
              </motion.a>
            );
          })}
        </nav>

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
        className={`mb-4 border-b border-[#79a629] pb-2.5 text-[17px] font-black uppercase text-[#5d9115] ${collapsed ? "lg:hidden" : ""}`}
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
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-[70] w-[320px] max-w-[90vw] overflow-y-auto border-r border-[#e4e8df] bg-white px-5 py-5 shadow-2xl transition-[width,transform,padding] duration-300 lg:static lg:z-auto lg:block lg:max-w-none lg:shrink-0 lg:translate-x-0 lg:py-5 lg:shadow-none ${collapsed ? "lg:w-[78px] lg:px-2.5" : "lg:w-[280px] lg:px-5"} ${open ? "translate-x-0" : "-translate-x-full"}`}
    >
      <div className="mb-6 flex items-center justify-between lg:hidden">
        <div className="flex items-center gap-2">
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

      <Link
        href="/"
        onClick={onClose}
        className={`mb-7 flex h-[64px] w-full items-center gap-3 rounded-[12px] bg-[linear-gradient(135deg,#66a80f,#4f9208)] px-3 text-left text-[17px] font-bold text-white shadow-[0_10px_20px_rgba(82,145,6,0.22)] transition-transform hover:-translate-y-0.5 ${collapsed ? "lg:justify-center lg:gap-0 lg:px-0" : ""}`}
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-white text-[#4e9208] shadow-[0_3px_8px_rgba(36,88,4,0.18)]">
          <Home className="size-4.5" strokeWidth={2.2} />
        </span>
        <span className={collapsed ? "lg:hidden" : ""}>Início</span>
      </Link>

      <SidebarSection title="Arquivos e contatos" items={quickFiles} collapsed={collapsed} />
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
        <SidebarSection
          title="Dicas de Segurança"
          items={securityTips}
          boxed
        />
      </motion.div>
    </aside>
  );
}