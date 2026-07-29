"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import Image from "next/image";
import { ChevronRight, FileText } from "lucide-react";
import {
  carouselSlides,
  departmentLinks,
  departmentMeta,
  officeApps,
  quickAccessLinks,
  type DepartmentKey,
} from "../_data/home";

const gridContainerVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.045, delayChildren: 0.05 },
  },
};

const gridItemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: "easeOut" } },
};

// Atalhos para os aplicativos externos mais usados na rotina administrativa.
export function QuickAccess() {
  return (
    <section className="overflow-hidden rounded-[16px] border border-[#e3e9df] bg-white p-4 shadow-[0_12px_30px_rgba(11,52,36,0.07)] sm:p-5">
      <div className="mb-4 flex items-end justify-between gap-4 border-b border-[#e7ece7] pb-3">
        <div>
          <h2 className="text-[21px] font-black tracking-[-0.01em] text-[#0a2d1e]">
            Acessos rápidos
          </h2>
          <p className="mt-0.5 text-[14px] font-medium text-[#638070]">
            Sistemas institucionais
          </p>
        </div>
        <span className="h-1 w-12 rounded-full bg-[#9bc914]" aria-hidden="true" />
      </div>
      <motion.div
        variants={gridContainerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-3 xl:grid-cols-7"
      >
        {quickAccessLinks.map((app) => {
          const Icon = app.icon;

          return (
            <motion.a
              key={app.title}
              variants={gridItemVariants}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.94 }}
              href={app.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex min-h-[94px] flex-col items-center justify-center gap-2.5 rounded-[12px] border border-white/10 bg-[#073821] px-2 text-center text-white shadow-[0_4px_8px_rgba(8,48,35,0.16)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#0a4b2b] hover:shadow-[0_8px_14px_rgba(8,48,35,0.2)]"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-white/10 text-[#b6dc25] transition group-hover:bg-white/15">
                <Icon className="size-5" strokeWidth={2} aria-hidden="true" />
              </span>
              <span className="text-[16px] font-extrabold tracking-[0.015em] leading-none">{app.title}</span>
            </motion.a>
          );
        })}
      </motion.div>

      <div className="mt-4 border-t border-[#e7ece7] pt-3.5">
        <p className="mb-2.5 text-[12.5px] font-bold uppercase tracking-[0.09em] text-[#5d9115]">
          Aplicativos Microsoft 365
        </p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 sm:gap-2.5">
          {officeApps.map((app) => (
            <motion.a
              key={app.title}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              href={app.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[54px] items-center justify-center gap-2 rounded-[9px] border border-[#e1e8e1] bg-[#fafcf9] px-1.5 text-[#173425] transition hover:border-[#9bc914] hover:bg-[#edf7df]"
            >
              <Image
                src={app.img}
                alt=""
                width={23}
                height={23}
                className={`${app.imageClassName ?? "size-5"} object-contain`}
              />
              <span className="text-[15px] font-semibold leading-none">{app.title}</span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

interface DepartmentHubProps {
  selectedDept: DepartmentKey;
  setSelectedDept: (department: DepartmentKey) => void;
}

const linkListVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.035 },
  },
};

const linkItemVariants: Variants = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0, transition: { duration: 0.22, ease: "easeOut" } },
};

// Abas de áreas internas e respectivos links para sistemas de terceiros.
export function DepartmentHub({
  selectedDept,
  setSelectedDept,
}: DepartmentHubProps) {
  const links = departmentLinks[selectedDept];

  return (
    <section className="overflow-hidden rounded-[16px] border border-[#dfe7dc] bg-white shadow-[0_12px_30px_rgba(11,52,36,0.09)]">
      <div className="bg-[linear-gradient(135deg,#07391f,#004427)] p-4 text-white sm:p-5">
        <div className="mb-3 flex items-center justify-between border-b border-[#9bc914]/70 pb-3">
          <h2 className="text-[17px] font-black">Áreas e sistemas</h2>
          <span className="text-[17px] font-bold uppercase text-white/65">
            {selectedDept}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {(Object.keys(departmentMeta) as DepartmentKey[]).map((department) => {
            const Icon = departmentMeta[department].icon;
            const isSelected = selectedDept === department;

            return (
              <button
                key={department}
                onClick={() => setSelectedDept(department)}
                aria-pressed={isSelected}
                className={`relative flex min-h-[84px] flex-col items-center justify-center gap-1 overflow-hidden rounded-[10px] px-1.5 text-center transition ${
                  isSelected ? "" : "hover:bg-white/[0.06]"
                }`}
              >
                {isSelected && (
                  <motion.span
                    layoutId="deptActivePill"
                    className="absolute inset-0 rounded-[10px] bg-white/[0.11] ring-1 ring-[#9bc914]/70"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative z-10 text-[#9bc914]">
                  <Icon className="size-8" strokeWidth={1.8} />
                </span>
                <strong className="relative z-10 text-[17px] text-[#b6dc25]">
                  {department}
                </strong>
                <span className="relative z-10 text-[17px] leading-tight text-white/90">
                  {departmentMeta[department].short}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3 border-b border-[#e4eae1] pb-3">
          <h3 className="flex min-w-0 items-center gap-2.5 text-[17px] font-black text-[#0a2d1e]">
            <FileText className="size-6 shrink-0 text-[#0a6132]" />
            <span className="truncate">{departmentMeta[selectedDept].title}</span>
          </h3>
          <span className="shrink-0 rounded-full bg-[#edf7df] px-3 py-1.5 text-[17px] font-bold text-[#56880c]">
            {links.length} {links.length === 1 ? "acesso" : "acessos"}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDept}
            variants={linkListVariants}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            className="grid grid-cols-1 gap-x-5 sm:grid-cols-2 sm:divide-x sm:divide-[#e8ece4]"
          >
            {links.map((item) => (
              <motion.a
                key={item.title}
                variants={linkItemVariants}
                whileHover={{ x: 3 }}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[44px] items-center gap-2 border-b border-[#edf0ea] px-1 py-1.5 text-[17px] text-[#16251c] transition-colors hover:bg-[#f7faf5] hover:text-[#5c940c]"
              >
                <span className="min-w-0 flex-1 leading-tight">{item.title}</span>
                <ChevronRight className="size-4 shrink-0" />
              </motion.a>
            ))}
          </motion.div>
        </AnimatePresence>

        <div className="mt-4 rounded-[14px] border border-[#e8ece4] bg-[#f7f9f5] p-4 text-[#2b4c35] shadow-sm">
          <p className="text-[15px] font-semibold">Dica rápida</p>
          <p className="mt-2 text-[14px] leading-relaxed text-[#516854]">
            Use as abas de departamento acima para chegar rapidamente ao sistema que você precisa hoje.
          </p>
        </div>
      </div>
    </section>
  );
}

// Carrossel automático de campanhas e comunicados visuais institucionais.
export function BannerCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % carouselSlides.length);
    }, 9000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="relative aspect-video min-h-[180px] w-full overflow-hidden rounded-[16px] bg-[#06351f] shadow-[0_14px_32px_rgba(11,52,36,0.14)] sm:min-h-0 xl:aspect-[2.32/1]">
      <AnimatePresence mode="wait">
        <motion.a
          key={carouselSlides[active].src}
          href={carouselSlides[active].onClick}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.99 }}
          transition={{ duration: 0.45 }}
          className="absolute inset-0 cursor-pointer"
        >
          <Image
            src={carouselSlides[active].src}
            alt={carouselSlides[active].alt}
            fill
            priority={active === 0}
            sizes="100vw"
            className="object-contain object-center"
          />
        </motion.a>
      </AnimatePresence>

      <div className="absolute inset-x-0 bottom-3 z-20 flex justify-center gap-2 sm:bottom-4">
        {carouselSlides.map((slide, index) => (
          <motion.button
            key={slide.src}
            onClick={() => setActive(index)}
            whileHover={{ scale: 1.25 }}
            whileTap={{ scale: 0.9 }}
            animate={{ scale: active === index ? 1.2 : 1 }}
            transition={{ duration: 0.2 }}
            className={`size-2.5 rounded-full border border-white/80 shadow sm:size-3 ${active === index ? "bg-[#9bc914]" : "bg-white/90"}`}
            aria-label={`Exibir banner ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
