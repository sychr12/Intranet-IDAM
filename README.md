# Intranet IDAM 2.0

Portal interno do IDAM para centralizar sistemas institucionais, comunicados, contatos, documentos, calendário e informações úteis às equipes.

## Versão 2.0

A versão 2.0 apresenta uma reformulação completa da experiência da intranet, com nova identidade visual, navegação responsiva, acessos organizados por área, calendário institucional e um sistema aprimorado de avisos.

### Desenvolvimento e autoria

- **Versão 2.0 — desenvolvimento e reformulação:** [Beatriz Christine Azevedo Batista](https://github.com/BeatrizChristine)
- **Versão inicial:** desenvolvida colaborativamente pela equipe original da Intranet IDAM, com a autoria preservada no histórico de commits.

## Funcionalidades

- Página inicial responsiva com acessos rápidos.
- Sistemas organizados por área institucional.
- Menu de arquivos, contatos e dicas de segurança.
- Calendário com feriados e pontos facultativos.
- Mensagens diárias e indicadores informativos.
- Avisos com prioridade, período de publicação, mídia e links.
- Navegação acessível entre múltiplos avisos.
- APIs internas para avisos, calendário, mensagens, visitas e usuário atual.

## Tecnologias

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React

## Execução local

Requisitos: Node.js 20 ou superior e npm.

```bash
cd frontend
npm install
npm run dev
```

A aplicação ficará disponível em `http://localhost:3000`.

Para executar em outra porta:

```bash
npm run dev -- -H 0.0.0.0 -p 3100
```

## Validação

```bash
cd frontend
npm run lint
npm run build
```

Os arquivos em `frontend/data` são utilizados durante a execução. Dados reais de visitantes e conteúdo operacional não devem ser publicados no repositório.

## Histórico

Consulte o [histórico de versões](CHANGELOG.md) para conhecer as principais mudanças da versão 2.0.

## Licença

Distribuído sob a [Licença MIT](LICENSE).

Copyright (c) 2026 IDAM e colaboradores.
