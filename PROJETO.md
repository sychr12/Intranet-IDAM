# 📋 Intranet - Projeto

## 🎯 Visão Geral
Aplicação Intranet com arquitetura monorepo contendo:
- **Backend**: API REST em Java/Spring Boot
- **Frontend**: Aplicação web em Next.js 15+ com TypeScript e Tailwind CSS

## 🏗️ Arquitetura

### Backend (`/backend`)
- **Stack**: Java, Spring Boot, Maven
- **Build**: `mvnw` (Maven Wrapper)
- **Dependências**: Gerenciadas via `pom.xml`
- **Execução**: Docker Compose (`compose.yaml`)
- **Estrutura**:
  - `com.intranet.backend.BackendApplication` - Classe principal
  - `src/main/java` - Código-fonte
  - `src/test/java` - Testes
  - `src/main/resources` - Configurações e assets estáticos

### Frontend (`/frontend`)
- **Stack**: Next.js, React, TypeScript, Tailwind CSS
- **Build Tool**: npm
- **Dependências**: `package.json`
- **Linting**: ESLint
- **Estrutura**:
  - `app/` - Pages e layouts (App Router)
  - `app/criadores/` - Página de Criadores
  - `app/calendar.css` - Estilos de calendário
  - `public/` - Assets estáticos (Gov, icons, imagens)
  - `api/` - Utilitários de API (ex: date.ts)
  - Configurações: `next.config.ts`, `tsconfig.json`, `tailwind.config.js`

## 📦 Principais Funcionalidades
- Dashboard/Intranet
- Calendário (visualizado em `calendar.css` e página principal)
- Página de Criadores
- Integração com API backend

## 🔧 Stack Tecnológico
| Componente | Tecnologia |
|-----------|-----------|
| Backend API | Java + Spring Boot |
| Frontend | Next.js 15 + React + TypeScript |
| Estilização | Tailwind CSS |
| Gerenciamento de Estado | (a definir) |
| Containerização | Docker Compose |
| Versionamento | Git |

## 🚀 Como Usar Este Prompt
Cole o texto abaixo em conversas futuras para dar contexto ao projeto:

---
> Estou trabalhando em um projeto **Intranet** monorepo. 
> - **Backend**: Java/Spring Boot em `/backend` com Maven
> - **Frontend**: Next.js/TypeScript/Tailwind em `/frontend`
> - Funcionalidades: Calendário, página de criadores, dashboard
> - Estrutura: Backend em `/backend/src`, Frontend em `/frontend/app`
> - Docker Compose para orquestração

---

## 📝 Notas
- Projeto em português
- Layout responsivo com Tailwind CSS
- API backend em Java (porta a confirmar)
- Frontend moderno com Next.js App Router
