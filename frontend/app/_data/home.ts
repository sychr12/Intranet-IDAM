import { link } from "fs";
import type { LucideIcon } from "lucide-react";
import {
  ClipboardList,
  FileText,
  Globe,
  Headphones,
  Lock,
  Mail,
  Newspaper,
  Phone,
  Settings,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";


export interface CarouselSlide {
  src: string;
  alt: string;
  onClick: string;
}

export type DepartmentKey = "PJ" | "RH" | "SGC";

export interface LinkItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

interface OfficeApp {
  title: string;
  img: string;
  href: string;
  imageClassName?: string;
}

export const NEWS_URL = "https://www.idam.am.gov.br/category/noticias/";

// Links de sistemas externos exibidos na navegação superior.
export const headerLinks: LinkItem[] = [
  { title: "Email", icon: Mail, href: "https://portal.office.com" },
  { title: "Sefaz", icon: FileText, href: "https://www.sefaz.am.gov.br/" },
  { title: "Siged", icon: ClipboardList, href: "https://sistemas.sefaz.am.gov.br/siged/login" },
  { title: "Site IDAM", icon: Globe, href: "https://www.idam.am.gov.br/" },
  { title: "Suporte", icon: Headphones, href: "https://nti.idam.am.gov.br/front/helpdesk.public.php" },
];

// Aplicativos do Microsoft 365 exibidos como acessos rápidos.
export const officeApps: OfficeApp[] = [
  { title: "Outlook", img: "/image/outlook.png", href: "https://outlook.office365.com/mail/" },
  { title: "Word", img: "/image/word.png", href: "https://www.office.com/launch/word" },
  { title: "Excel", img: "/image/excel.png", href: "https://excel.office.com" },
  { title: "PowerPoint", img: "/image/powerpoint.png", href: "https://www.office.com/launch/powerpoint" },
  { title: "OneDrive", img: "/image/one.png", href: "https://www.office.com/launch/onedrive" },
  {
    title: "Teams",
    img: "/image/teams.png",
    href: "https://teams.microsoft.com",
    imageClassName: "size-9",
  },
];

const RAMAIS_URL =
  "https://office365prodam-my.sharepoint.com/:x:/g/personal/nti_idam_am_gov_br/EfqRFyXpB7dJme1xxhXjOYMBTJmkM7EoTfn_yk3wBfZuMQ?e=wK1SQ7";
const EMAILS_URL =
  "https://docs.google.com/document/d/1Kil4NcZkgZUqnPt5o687z3eBD0W6YNfVXsn2J-t3MSQ/edit?pli=1&tab=t.0";
const CONTATOS_URL =
  "https://docs.google.com/document/d/1cHB5TwcjBeatoFZkSdiDsl4-pKsixxy0AdgM4dLTan8/edit?invite=CL6n4Y8O&tab=t.0";

// Documentos institucionais mantidos em serviços externos.
export const quickFiles: LinkItem[] = [
  { title: "Lista de Ramais", icon: Phone, href: RAMAIS_URL },
  { title: "Lista de Emails", icon: Mail, href: EMAILS_URL },
  { title: "Lista de Contatos", icon: Users, href: CONTATOS_URL },
];



// Materiais de orientação exibidos na barra lateral.
export const securityTips: LinkItem[] = [
  
  {
    title: "Proteja seus dispositivos contra malware",
    icon: ShieldCheck,
    href: "https://www.kaspersky.com.br/resource-center/preemptive-safety/what-is-malware-and-how-to-protect-against-it",
  },
  {
    title: "Nunca compartilhe suas senhas",
    icon: Lock,
    href: "https://digitalsecurityguide.eset.com/br/por-que-voce-nao-deve-compartilhar-suas-senhas",
  },
  {
    title: "Guia rápido: como abrir um chamado",
    icon: Headphones,
    href: "https://office365prodam-my.sharepoint.com/:b:/g/personal/nti_idam_am_gov_br/EedyNcwHiHFIvvURrOX9Z-oBVP-bAnKVXMgpW1AndAFW6Q?e=RNoSew",
  },
    {
    title: "Cuidado com e-mails suspeitos",
    icon: Mail,
    href: "https://www.showmetech.com.br/como-verificar-a-identidade-de-um-e-mail/",
  },
];

export const departmentMeta: Record<
  DepartmentKey,
  { title: string; short: string; icon: LucideIcon }
> = {
  PJ: { title: "Diário Oficial", short: "Usuários", icon: Users },
  RH: { title: "Recursos Humanos", short: "Recursos Humanos", icon: User },
  SGC: { title: "Sistema de Gestão", short: "Sistema de Gestão", icon: Settings },
};

// Links externos organizados pelas abas PJ, RH e SGC.
export const departmentLinks: Record<DepartmentKey, LinkItem[]> = {
  PJ: [
    { title: "Diário MP AM", icon: Newspaper, href: "https://diario.mpam.mp.br/pages/home.jsf" },
    { title: "Comunica PJE", icon: FileText, href: "https://comunica.pje.jus.br/" },
    { title: "Doe TCE", icon: ClipboardList, href: "https://doe.tce.am.gov.br/" },
    { title: "Imprensa Nacional", icon: Newspaper, href: "https://www.gov.br/imprensanacional/pt-br" },
    { title: "DEJT", icon: FileText, href: "https://dejt.jt.jus.br/dejt/" },
    { title: "DEC TCE", icon: FileText, href: "https://dec.tce.am.gov.br/dec/login.jsf" },
    {
      title: "Diário de Justiça Eletrônico (SAJ)",
      icon: FileText,
      href: "https://consultasaj.tjam.jus.br/cdje/index.do",
    },
    { title: "PROJUDI", icon: FileText, href: "https://projudi.tjam.jus.br/projudi/" },
    {
      title: "Consulta e-SAJ",
      icon: FileText,
      href: "https://consultasaj.tjam.jus.br/esaj/portal.do?servico=740000",
    },
    { title: "PJE TRT11", icon: FileText, href: "https://pje.trt11.jus.br/primeirograu/login.seam" },
  ],
  RH: [
    { title: "Prodam RH", icon: Users, href: "https://prodamrh.prodam.am.gov.br/" },
    { title: "SEAD", icon: ClipboardList, href: "http://servicos.sead.am.gov.br/passivosam/auth/login" },
    { title: "SISPREV", icon: ClipboardList, href: "https://www.portaldosegurado.am.gov.br/conectado.php" },
    { title: "CIEE", icon: Users, href: "https://web.ciee.org.br/empresa/relatorios/estudantes-contratados" },
    { title: "FAP", icon: FileText, href: "https://fap.dataprev.gov.br/consultar-fap" },
    { title: "E-SOCIAL", icon: FileText, href: "https://www.esocial.gov.br/portal/Assinadoc" },
  ],
  SGC: [
    {
      title: "Sistema de Gestão de Contratos",
      icon: ClipboardList,
      href: "http://sistemas.sefaz.am.gov.br/sgc-am/login.do",
    },
  ],
};

// Imagens institucionais usadas pelo carrossel da página inicial.
export const carouselSlides: CarouselSlide[] = [
  {
    src: "/Gov/banner-idam-intranet.png",
    alt: "Banner IDAM Amazonas - Conectados com o que importa",
    onClick: "https://www.idam.am.gov.br/intranet/",
  },
  {
    src: "/Gov/banner-idam-producao.png",
    alt: "Produção Rural Sustentável",
    onClick: "https://www.idam.am.gov.br/",
  },
  {
    src: "/Gov/banner-malware.png",
    alt: "Aprenda sobre malware e proteja seus dispositivos",
    onClick:
      "https://www.kaspersky.com.br/resource-center/preemptive-safety/what-is-malware-and-how-to-protect-against-it",
  },
  {
    src: "/Gov/banner-senhas.png",
    alt: "Por que você não deve compartilhar suas senhas",
    onClick:
      "https://digitalsecurityguide.eset.com/br/por-que-voce-nao-deve-compartilhar-suas-senhas",
  },
  {
    src: "/Gov/banner-chamados-nti.png",
    alt: "Manual de Abertura de Chamados - NTI",
    onClick:
      "https://office365prodam-my.sharepoint.com/:b:/g/personal/nti_idam_am_gov_br/EedyNcwHiHFIvvURrOX9Z-oBVP-bAnKVXMgpW1AndAFW6Q?e=RNoSew",
  },

  {
    src: "/Gov/banner-email.png",
    alt: "Como identificar e-mails suspeitos",
    onClick:
      "https://www.showmetech.com.br/como-verificar-a-identidade-de-um-e-mail/",
  },
];
// Rótulos usados na montagem do calendário mensal.
export const weekdays = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];
export const months = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];
