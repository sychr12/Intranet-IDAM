import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // O serverActions foi removido porque não é mais uma config válida no Next.js
  // Caso precise aumentar limite de upload, isso deve ser feito na rota (ver abaixo).

  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
