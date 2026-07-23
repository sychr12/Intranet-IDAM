"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { ChevronRight, FileText } from "lucide-react";
import {
  carouselSlides,
  departmentLinks,
  departmentMeta,
  officeApps,
  type DepartmentKey,
} from "../_data/home";
import { ShellCard } from "./shell-card";

// Atalhos para os aplicativos externos mais usados na rotina administrativa.
export function QuickAccess() {
  return (
    <ShellCard className="min-h-[148px] p-4 sm:p-5">
      <div className="mb-7 flex items-center gap-3">
        <h2 className="text-[17px] font-black text-[#0a2d1e]">Acessos rápidos</h2>
        <span className="h-px w-9 bg-[#75a90d]" />
      </div>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-4 sm:gap-5">
        {officeApps.map((app) => (
          <a
            key={app.title}
            href={app.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group w-[104px] text-center sm:w-[112px]"
          >
            <span className="mx-auto mb-2 flex aspect-square w-[50px] max-w-full items-center justify-center rounded-[11px] border border-[#e5eae0] bg-white shadow-[0_7px_16px_rgba(11,52,36,0.06)] transition group-hover:-translate-y-1 group-hover:border-[#9cc63a] sm:w-[56px]">
              <Image
                src={app.img}
                alt={app.title}
                width={36}
                height={36}
                className={`${app.imageClassName ?? "size-7"} object-contain`}
              />
            </span>
            <span className="block text-[17px] leading-tight text-[#101b15]">
              {app.title}
            </span>
          </a>
        ))}
      </div>
    </ShellCard>
  );
}

interface DepartmentHubProps {
  selectedDept: DepartmentKey;
  setSelectedDept: (department: DepartmentKey) => void;
}

// Abas de áreas internas e respectivos links para sistemas de terceiros.
export function DepartmentHub({
  selectedDept,
  setSelectedDept,
}: DepartmentHubProps) {
  const links = departmentLinks[selectedDept];

  return (
    <section className="h-full overflow-hidden rounded-[16px] border border-[#dfe7dc] bg-white shadow-[0_12px_30px_rgba(11,52,36,0.09)]">
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

            return (
              <button
                key={department}
                onClick={() => setSelectedDept(department)}
                aria-pressed={selectedDept === department}
                className={`flex min-h-[84px] flex-col items-center justify-center gap-1 rounded-[10px] px-1.5 text-center transition ${
                  selectedDept === department
                    ? "bg-white/[0.11] ring-1 ring-[#9bc914]/70"
                    : "hover:bg-white/[0.06]"
                }`}
              >
                <span className="text-[#9bc914]">
                  <Icon className="size-8" strokeWidth={1.8} />
                </span>
                <strong className="text-[17px] text-[#b6dc25]">{department}</strong>
                <span className="text-[17px] leading-tight text-white/90">
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

        <div className="grid grid-cols-1 gap-x-5 sm:grid-cols-2 sm:divide-x sm:divide-[#e8ece4]">
          {links.map((item) => (
            <a
              key={item.title}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[44px] items-center gap-2 border-b border-[#edf0ea] px-1 py-1.5 text-[17px] text-[#16251c] transition hover:bg-[#f7faf5] hover:text-[#5c940c]"
            >
              <span className="min-w-0 flex-1 leading-tight">{item.title}</span>
              <ChevronRight className="size-4 shrink-0" />
            </a>
          ))}
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
    }, 6000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="relative aspect-video min-h-[180px] w-full overflow-hidden rounded-[16px] bg-[#06351f] shadow-[0_14px_32px_rgba(11,52,36,0.14)] sm:min-h-0 xl:aspect-[2.32/1]">
      <AnimatePresence mode="wait">
        <motion.div
          key={carouselSlides[active].src}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.99 }}
          transition={{ duration: 0.45 }}
          className="absolute inset-0"
        >
          <Image
            src={carouselSlides[active].src}
            alt={carouselSlides[active].alt}
            fill
            priority={active === 0}
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 90vw, 70vw"
            className="object-cover object-center"
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-x-0 bottom-3 z-20 flex justify-center gap-2 sm:bottom-4">
        {carouselSlides.map((slide, index) => (
          <button
            key={slide.src}
            onClick={() => setActive(index)}
            className={`size-2.5 rounded-full border border-white/80 shadow transition sm:size-3 ${active === index ? "bg-[#9bc914]" : "bg-white/90"}`}
            aria-label={`Exibir banner ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
