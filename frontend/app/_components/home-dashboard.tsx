"use client";

import { motion, type Variants } from "framer-motion";
import Image from "next/image";
import { officeApps, quickAccessLinks } from "../_data/home";
import { useCurrentUser } from "../_hooks/use-current-user";

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
    <section className="overflow-hidden rounded-[16px] border border-[#D7E1DE] bg-white p-4 shadow-[0_12px_30px_rgba(11,63,67,0.07)] sm:p-5">
      <div className="mb-4 flex items-end justify-between gap-4 border-b border-[#D7E1DE] pb-3">
        <div>
          <h2 className="text-[21px] font-black tracking-[-0.01em] text-[#173849]">
            Acessos rápidos
          </h2>
          <p className="mt-0.5 text-[14px] font-medium text-[#6F858C]">
            Sistemas institucionais
          </p>
        </div>
        <span className="h-1 w-12 rounded-full bg-[#0F897A]" aria-hidden="true" />
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
              className="group flex min-h-[94px] flex-col items-center justify-center gap-2.5 rounded-[12px] border border-white/10 bg-[#14786C] px-2 text-center text-white shadow-[0_4px_8px_rgba(13,103,93,0.16)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#0D675D] hover:shadow-[0_8px_14px_rgba(13,103,93,0.2)]"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-white/10 text-[#DFF2EC] transition group-hover:bg-white/15">
                <Icon className="size-5" strokeWidth={2} aria-hidden="true" />
              </span>
              <span className="text-[16px] font-extrabold tracking-[0.015em] leading-none">{app.title}</span>
            </motion.a>
          );
        })}
      </motion.div>

      <div className="mt-4 border-t border-[#D7E1DE] pt-3.5">
        <p className="mb-2.5 text-[12.5px] font-bold uppercase tracking-[0.09em] text-[#14786C]">
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
              className="flex min-h-[54px] items-center justify-center gap-2 rounded-[9px] border border-[#D7E1DE] bg-[#F8FAF9] px-1.5 text-[#173849] transition hover:border-[#0F897A] hover:bg-[#DFF2EC]"
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

// Banner institucional de boas-vindas com a identidade recebida do AD.
export function BannerCarousel() {
  const user = useCurrentUser();
  const firstName = user?.firstName;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="relative h-[185px] w-full overflow-hidden rounded-[16px] bg-[#DCEEE9] shadow-[0_14px_32px_rgba(11,63,67,0.12)] sm:h-[205px] xl:h-[220px]"
    >
      <Image
        src="/Gov/banner-boas-vindas.png"
        alt="Sede do IDAM"
        fill
        priority
        sizes="(min-width: 1024px) calc(100vw - 320px), 100vw"
        className="object-cover object-center"
      />

      <motion.div
        initial={{ opacity: 0, x: -14 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.12 }}
        className="absolute inset-y-0 left-0 z-10 flex w-[68%] flex-col justify-center px-5 sm:w-[58%] sm:px-8 lg:w-[52%] lg:px-10"
      >
        <h1 className="text-[clamp(1.65rem,3.2vw,2.8rem)] font-black leading-[1.05] tracking-[-0.035em] text-[#14786C] drop-shadow-[0_1px_0_rgba(255,255,255,0.7)]">
          {user === null ? "Olá!" : firstName ? `Olá, ${firstName}!` : "Olá!"}
        </h1>
        <p className="mt-2 max-w-[500px] text-[clamp(0.78rem,1.25vw,1.05rem)] font-medium leading-snug text-[#365563]">
          Acesse os principais sistemas e fique por dentro das informações do IDAM.
        </p>
      </motion.div>
    </motion.section>
  );
}
