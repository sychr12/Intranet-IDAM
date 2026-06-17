"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Code2, Shield, Database, Layout } from "lucide-react";

// =================================================================
// TIPAGEM
// =================================================================

interface Creator {
  name: string;
  role: string;
  department: string;
  icon: React.ReactNode;
  initials: string;
}

type Approver = Creator;

// =================================================================
// TEMA DE CORES
// =================================================================

const theme = {
  primary: "#144b3f",
  secondary: "#227e6a",
  accent: "#e6f7f1",
  creators: "#0d3a32",
  approvers: "#1a5a4a",
  support: "#236859",
};

// =================================================================
// DADOS — substitua com os nomes e informações reais
// =================================================================

const creators: Creator[] = [
  {
    name: "Luiz Felipe da Silva e Silva",
    role: "Desenvolvedor Full Stack / Estagiario TI",
    department: "NTI — Núcleo de Tecnologia da Informação",
    icon: <Code2 className="w-6 h-6" />,
    initials: "R1",
  },
  {
    name: "Kevin Markes",
    role: "Desenvolvedor Full Stack / Ex Estagiario TI",
    department: "NTI — Núcleo de Tecnologia da Informação",
    icon: <Database className="w-6 h-6" />,
    initials: "R2",
  },
];

const approvers: Approver[] = [
  {
    name: "Leandro Lima da Silva",
    role: "Redes Infrastrutura / SUPERVISOR",
    department: "NTI — Núcleo de Tecnologia da Informação",
    icon: <Shield className="w-6 h-6" />,
    initials: "R3",
  },
  {
    name: "Elcides Ricardo de Oliveira Neto",
    role: "Redes Infrastrutura / Chefe / Engenheiro de Pesca",
    department: "NTI — Núcleo de Tecnologia da Informação",
    icon: <Shield className="w-6 h-6" />,
    initials: "R4",
  },
  {
    name: "William Denis Tundis Pereira",
    role: "Redes Infrastrutura / SUPERVISOR",
    department: "NTI — Núcleo de Tecnologia da Informação",
    icon: <Database className="w-6 h-6" />,
    initials: "R5",
  },
  {
    name: "Heldrey de Oliveira Lima",
    role: "Redes Infrastrutura / SUPERVISOR",
    department: "NTI — Núcleo de Tecnologia da Informação",
    icon: <Shield className="w-6 h-6" />,
    initials: "R6",
  },
];

const support: Creator[] = [
  {
    name: "Laysa Siqueira da Silva",
    role: "Redes Infrastrutura / Estagiario TI",
    department: "NTI — Núcleo de Tecnologia da Informação",

    icon: <Code2 className="w-6 h-6" />,

    initials: "R7",
  },
  {
    name: "Vinicius Gama Barroso",
    role: "Ex Jovem Aprendiz / Atual Estagiario do Instagram",
    department: "NTI — Núcleo de Tecnologia da Informação",

    icon: <Shield className="w-6 h-6" />,
    initials: "R8",
  },

    {
    name: "Beatriz Christine Azevedo Batista",
    role: "Ex Jovem Aprendiz / Atual Estagiario do Instagram",
    department: "NTI — Núcleo de Tecnologia da Informação",

    icon: <Code2 className="w-6 h-6" />,
    initials: "R9",
  },
];

// =================================================================
// ANIMAÇÕES
// =================================================================

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: "easeOut" },
  }),
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: "easeOut" },
  }),
};

const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: (i: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" },
  }),
};

const slideInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: (i: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" },
  }),
};

// =================================================================
// COMPONENTE CARD REUTILIZÁVEL
// =================================================================

interface CardProps {
  member: Creator;
  index: number;
  themeColor: string;
}

const TeamCard: React.FC<CardProps> = ({ member, index, themeColor }) => (
  <motion.div
    custom={index}
    variants={scaleIn}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-50px" }}
    className="group relative h-full"
  >
    {/* Gradient Border Effect with enhanced blur */}
    <div className="absolute inset-0 bg-gradient-to-br from-[#1a5a4a]/25 via-[#227e6a]/15 to-transparent rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-0 group-hover:opacity-100" />

    <div className="relative bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 h-full flex flex-col group-hover:border-gray-200">
      {/* Topo com Gradiente */}
      <div
        style={{
          background: `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}DD 100%)`,
        }}
        className="px-6 pt-6 pb-14 relative overflow-hidden flex-shrink-0"
      >
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-28 h-28 bg-white/8 rounded-full -mr-14 -mt-14 group-hover:-mr-12 group-hover:-mt-12 transition-all duration-500" />
        <div className="absolute -bottom-10 left-0 w-20 h-20 bg-white/5 rounded-full" />

        {/* ID Badge */}
        <motion.div
          whileHover={{ scale: 1.15, rotate: 5 }}
          className="absolute right-5 top-5 rounded-lg bg-white/20 backdrop-blur-md px-3 py-1.5 text-[0.55rem] uppercase tracking-[0.35em] text-white font-geomanist font-bold shadow-lg border border-white/30"
        >
          {member.initials}
        </motion.div>

        {/* Content */}
        <div className="flex items-center gap-4 relative z-10">
          <motion.div
            whileHover={{ scale: 1.15, rotate: 10 }}
            whileTap={{ scale: 0.95 }}
            className="w-14 h-14 rounded-xl bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-sm flex items-center justify-center text-white border border-white/40 shadow-md"
          >
            {member.icon}
          </motion.div>
          <div className="flex-1">
            <p className="text-white/75 text-xs font-geomanist uppercase tracking-[0.1em] font-light leading-tight">
              {member.role}
            </p>
            <h3 className="text-white font-geomanist font-bold text-sm leading-tight mt-1.5">
              {member.name}
            </h3>
          </div>
        </div>
      </div>

      {/* Corpo do card */}
      <div className="px-6 py-6 flex-1 flex flex-col justify-between">
        <p className="text-xs text-gray-600 font-geomanist leading-relaxed">
          {member.department}
        </p>
        <motion.div
          whileHover={{ y: -2 }}
          className="flex items-center gap-2 mt-4"
        >
          <span
            style={{ 
              backgroundColor: `${themeColor}10`,
              color: themeColor,
              borderColor: `${themeColor}20`
            }}
            className="inline-flex items-center rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider border transition-all duration-300 group-hover:shadow-md"
          >
            ✓ NTI - IDAM
          </span>
        </motion.div>
      </div>

      {/* Bottom accent line */}
      <div
        style={{ background: `linear-gradient(90deg, ${themeColor}00 0%, ${themeColor}40 50%, ${themeColor}00 100%)` }}
        className="h-1 w-full"
      />
    </div>
  </motion.div>
);

export default function CriadoresPage() {
  return (
    <div className="relative w-full min-h-screen bg-gradient-to-b from-[#f8faf9] to-[#f0f5f3]">

      {/* ====== CABEÇALHO ====== */}
      <motion.header
        className="border-b border-gray-100 bg-[#227e6a] shadow-sm sticky top-0 z-50"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/Gov/logo-idam.png"
              alt="Logo IDAM"
              width={64}
              height={64}
              className="object-contain"
            />
            <div>
              <h1 className="text-[1.10rem] leading-none tracking-tight font-geomanist font-semibold text-white">
                INTRANET
              </h1>
              <p className="text-xs text-white font-geomanist font-normal">
                Instituto de Desenvolvimento Agropecuário e Florestal Sustentável do Amazonas
              </p>
            </div>
          </div>
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-sm text-white font-geomanist font-medium px-4 py-2 rounded-lg border border-white/30 hover:bg-white/10 transition"
            >
              ← Voltar
            </motion.button>
          </Link>
        </div>
      </motion.header>

      {/* ====== HERO ====== */}
      <section className="relative py-28 text-center overflow-hidden">
        {/* Gradient Background with multiple layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d3a32] via-[#144b3f] to-[#227e6a]" />
        
        {/* Animated Gradient Overlay */}
        <motion.div 
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-t from-[#227e6a]/20 to-transparent"
        />

        {/* Decorative Blob Elements */}
        <motion.div 
          animate={{ y: [-20, 20, -20] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-10 left-10 w-24 h-24 bg-white/8 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ y: [20, -20, 20], x: [-10, 10, -10] }}
          transition={{ duration: 8, repeat: Infinity, delay: 1 }}
          className="absolute bottom-20 right-20 w-40 h-40 bg-white/6 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ x: [-15, 15, -15] }}
          transition={{ duration: 7, repeat: Infinity, delay: 2 }}
          className="absolute top-1/2 left-1/4 w-32 h-32 bg-white/5 rounded-full blur-3xl"
        />

        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {/* Subtitle with animation */}
          <motion.p 
            initial={{ opacity: 0, letterSpacing: "0em" }}
            animate={{ opacity: 1, letterSpacing: "0.2em" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-white/70 text-sm font-geomanist uppercase tracking-[0.2em] mb-4 font-light"
          >
            Conheça Nossos Profissionais
          </motion.p>

          {/* Main Title */}
          <motion.h2 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-5xl md:text-6xl lg:text-7xl font-geomanist font-black text-white mb-6 leading-tight tracking-tight"
          >
            Equipe NTI
          </motion.h2>

          {/* Animated Divider */}
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 80, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="h-1.5 bg-gradient-to-r from-transparent via-white to-transparent mx-auto mb-8"
          />

          {/* Description with fade-in */}
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-white/85 mt-4 text-lg md:text-xl max-w-3xl mx-auto font-geomanist font-normal leading-relaxed"
          >
            Conheça os profissionais dedicados que desenvolveram, aprovam e mantêm a Intranet do IDAM.
          </motion.p>
        </motion.div>
      </section>

      {/* ====== LINHA DIVISÓRIA DECORATIVA COM EFEITO ====== */}
      <motion.div 
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full h-1.5 bg-gradient-to-r from-[#0d3a32] via-[#227e6a] to-[#0d3a32] origin-left"
      />

      {/* ====== CARDS DOS CRIADORES ====== */}
      <main className="max-w-6xl mx-auto px-6 py-16">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div 
            className="inline-flex items-center gap-3 mb-5"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <motion.div 
              animate={{ width: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-[#0d3a32] shadow-lg"
            />
            <p className="text-sm text-[#0d3a32] uppercase tracking-[0.2em] font-geomanist font-bold">
              Desenvolvimento
            </p>
            <motion.div 
              animate={{ width: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
              className="w-2 h-2 rounded-full bg-[#0d3a32] shadow-lg"
            />
          </motion.div>
          <h3 className="text-4xl md:text-5xl font-geomanist font-black text-[#0d3a32] mb-4">
            Equipe de Criadores
          </h3>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 font-geomanist text-lg max-w-2xl mx-auto leading-relaxed"
          >
            Os desenvolvedores que construíram esta plataforma inovadora
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {creators.map((creator, i) => (
            <TeamCard key={creator.name} member={creator} index={i} themeColor="#0d3a32" />
          ))}
        </div>

        {/* ====== DIVIDER COM EFEITO ====== */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="my-24 relative"
        >
          <div className="flex items-center gap-4 justify-center">
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: 40 }}
              transition={{ duration: 0.8 }}
              className="h-px bg-gradient-to-r from-transparent to-gray-300"
            />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-2 h-2 rounded-full bg-gradient-to-r from-[#0d3a32] to-[#1a5a4a]"
            />
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: 40 }}
              transition={{ duration: 0.8 }}
              className="h-px bg-gradient-to-l from-transparent to-gray-300"
            />
          </div>
        </motion.div>

        {/* ====== CARDS DOS APROVADORES ====== */}
        <section>
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div 
              className="inline-flex items-center gap-3 mb-5"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <motion.div 
                animate={{ width: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-[#1a5a4a] shadow-lg"
              />
              <p className="text-sm text-[#1a5a4a] uppercase tracking-[0.2em] font-geomanist font-bold">
                Supervisão
              </p>
              <motion.div 
                animate={{ width: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                className="w-2 h-2 rounded-full bg-[#1a5a4a] shadow-lg"
              />
            </motion.div>
            <h3 className="text-4xl md:text-5xl font-geomanist font-black text-[#1a5a4a] mb-4">
              Equipe de Aprovação
            </h3>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gray-600 font-geomanist text-lg max-w-2xl mx-auto leading-relaxed"
            >
              Os supervisores que validam e aprovam as alterações do sistema
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {approvers.map((approver, i) => (
              <TeamCard key={approver.name} member={approver} index={i} themeColor="#1a5a4a" />
            ))}
          </div>
        </section>

        {/* ====== DIVIDER COM EFEITO ====== */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="my-24 relative"
        >
          <div className="flex items-center gap-4 justify-center">
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: 40 }}
              transition={{ duration: 0.8 }}
              className="h-px bg-gradient-to-r from-transparent to-gray-300"
            />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-2 h-2 rounded-full bg-gradient-to-r from-[#1a5a4a] to-[#236859]"
            />
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: 40 }}
              transition={{ duration: 0.8 }}
              className="h-px bg-gradient-to-l from-transparent to-gray-300"
            />
          </div>
        </motion.div>

        {/* ====== CARDS DE SUPORTE ====== */}
        <section>
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div 
              className="inline-flex items-center gap-3 mb-5"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <motion.div 
                animate={{ width: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-[#236859] shadow-lg"
              />
              <p className="text-sm text-[#236859] uppercase tracking-[0.2em] font-geomanist font-bold">
                Manutenção
              </p>
              <motion.div 
                animate={{ width: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                className="w-2 h-2 rounded-full bg-[#236859] shadow-lg"
              />
            </motion.div>
            <h3 className="text-4xl md:text-5xl font-geomanist font-black text-[#236859] mb-4">
              Equipe de Suporte
            </h3>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gray-600 font-geomanist text-lg max-w-2xl mx-auto leading-relaxed"
            >
              Os profissionais que garantem o funcionamento contínuo da plataforma
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {support.map((member, i) => (
              <TeamCard key={member.name} member={member} index={i} themeColor="#236859" />
            ))}
          </div>
        </section>

        {/* ====== DIVIDER COM EFEITO ====== */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="my-24 relative"
        >
          <div className="flex items-center gap-4 justify-center">
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: 40 }}
              transition={{ duration: 0.8 }}
              className="h-px bg-gradient-to-r from-transparent to-gray-300"
            />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-2 h-2 rounded-full bg-gradient-to-r from-[#0d3a32] to-[#1a5a4a]"
            />
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: 40 }}
              transition={{ duration: 0.8 }}
              className="h-px bg-gradient-to-l from-transparent to-gray-300"
            />
          </div>
        </motion.div>

        {/* ====== NOTA DO PROJETO ====== */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-br from-[#0d3a32] via-[#144b3f] to-[#1a5a4a] rounded-3xl p-16 text-center relative overflow-hidden border border-white/10 shadow-2xl"
        >
          {/* Animated Decorative Background Elements */}
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"
          />
          <motion.div 
            animate={{ scale: [1.2, 1, 1.2] }}
            transition={{ duration: 7, repeat: Infinity, delay: 1 }}
            className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24 blur-3xl"
          />
          
          <motion.div className="relative z-10">
            {/* Header */}
            <motion.div 
              className="inline-flex items-center gap-3 mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div 
                animate={{ width: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-3 h-3 rounded-full bg-white/40"
              />
              <p className="text-white/70 text-xs uppercase tracking-[0.25em] font-geomanist font-light">
                Sobre o Projeto
              </p>
              <motion.div 
                animate={{ width: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                className="w-3 h-3 rounded-full bg-white/40"
              />
            </motion.div>

            {/* Title */}
            <motion.h3 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="text-white font-geomanist font-black text-4xl md:text-5xl mb-6"
            >
              Intranet IDAM
            </motion.h3>

            {/* Divider */}
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              whileInView={{ width: 60, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="h-1 bg-gradient-to-r from-transparent via-white/60 to-transparent mx-auto mb-8"
            />

            {/* Description */}
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-white/85 text-lg font-geomanist max-w-3xl mx-auto leading-relaxed mb-10"
            >
              Esta plataforma inovadora foi desenvolvida pelo NTI com o objetivo de centralizar
              ferramentas, documentos e sistemas utilizados pelos servidores do Instituto
              de Desenvolvimento Agropecuário e Florestal Sustentável do Amazonas.
            </motion.p>

            {/* Footer */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col md:flex-row justify-center gap-6 md:gap-8 text-white/60 text-xs font-geomanist uppercase tracking-wider"
            >
              <span>© {new Date().getFullYear()} NTI — IDAM</span>
              <span className="hidden md:inline">•</span>
              <span>Todos os direitos reservados</span>
            </motion.div>
          </motion.div>
        </motion.div>
      </main>

      {/* ====== RODAPÉ ====== */}
      <div className="w-full h-1 bg-gradient-to-r from-[#0d3a32] via-[#227e6a] to-[#0d3a32]" />
      <div className="w-full h-8 bg-gradient-to-r from-[#0d3a32] to-[#1a5a4a]" />
      <footer className="bg-gradient-to-r from-[#0d3a32] to-[#144b3f] text-white font-geomanist font-normal">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col text-center md:text-left">
            <p className="text-base leading-relaxed">NÚCLEO DE TECNOLOGIA DA INFORMAÇÃO</p>
            <p className="text-xs text-gray-200 mt-1">
              © {new Date().getFullYear()} NTI - Todos os direitos reservados.
            </p>
          </div>
          <div className="flex justify-end space-x-4">
            <Image src="/Gov/logo-idam.png" alt="Logo IDAM" width={100} height={100} className="object-contain" />
            <Image src="/Gov/sepror.png" alt="Logo Sepror" width={100} height={100} className="object-contain" />
            <Image src="/Gov/logo-govam.png" alt="Logo Gov AM" width={100} height={100} className="object-contain" />
          </div>
        </div>
      </footer>
    </div>
  );
}