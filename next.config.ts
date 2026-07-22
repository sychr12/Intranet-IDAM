import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuração para aumentar o limite de upload para 50MB (resolvendo o erro 413)
  serverActions: {
    bodySizeLimit: '50mb', 
  },
  
  eslint: {
    ignoreDuringBuilds: true, // Ignora erros do ESLint durante o build (útil no Docker)
  },
};

// Next.js requer a exportação no formato CommonJS (module.exports)
// No entanto, para usar a tipagem `NextConfig` com `import` e `export default`,
// você pode deixar o arquivo com a extensão `.mjs` ou usar a sintaxe abaixo 
// que é mais comum e compatível com a maioria dos setups.
module.exports = nextConfig;