# Etapa de compilação do frontend Next.js.
FROM node:20-alpine AS build

WORKDIR /app
ARG BACKEND_URL=http://backend:8080
ENV BACKEND_URL=$BACKEND_URL
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Imagem de execução com os artefatos gerados no build.
FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.ts ./next.config.ts
EXPOSE 3000
CMD ["npm", "run", "start"]
