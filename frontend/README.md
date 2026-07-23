# Intranet IDAM - Frontend

Interface da intranet corporativa do IDAM, construída com Next.js, React e Tailwind CSS.

## Execução com Docker

Na raiz do projeto:

```powershell
docker compose up --build
```

A aplicação fica disponível em `http://localhost:3000`.

## Desenvolvimento local

Dentro da pasta `frontend`:

```powershell
npm install
npm run dev
```

Comandos de validação:

```powershell
npm run lint
npm run build
```

## Integração com o backend

O frontend consulta `GET /backend-api/health`. O `next.config.ts` encaminha esse caminho para `GET /api/health` no Spring Boot.

Os feriados exibidos no calendário e em Avisos são obtidos por `GET /api/holidays?year=AAAA`. Essa rota do Next.js combina os feriados nacionais da BrasilAPI com os feriados legais do Amazonas e de Manaus e mantém uma lista nacional de contingência para uso sem conexão externa.

A variável `BACKEND_URL` define o endereço interno do backend:

```env
BACKEND_URL=http://localhost:8080
```

No Docker Compose, o valor usado é `http://backend:8080`.

## Estrutura principal

- `app/page.tsx`: estado, integrações e composição da tela inicial.
- `app/_components`: componentes organizados por responsabilidade visual.
- `app/_data/home.ts`: links, atalhos e dados exibidos na tela inicial.
- `app/_hooks/use-holidays.ts`: carregamento dos feriados no navegador.
- `app/_lib/holidays.ts`: regras e normalização do calendário de feriados.
- `app/api/holidays/route.ts`: integração em cache com a BrasilAPI.
- `app/globals.css`: estilos globais e regras de acessibilidade.
- `public/Gov`: logo e banners institucionais.
- `public/image`: ícones dos aplicativos Microsoft 365.
