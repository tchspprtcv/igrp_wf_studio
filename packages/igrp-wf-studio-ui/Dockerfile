# Build stage
FROM node:20-alpine as build

# Instalar dependências necessárias
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copiar arquivos de configuração
COPY package.json yarn.lock ./
COPY packages/igrp-wf-engine/package.json ./packages/igrp-wf-engine/
COPY packages/igrp-wf-studio-ui/package.json ./packages/igrp-wf-studio-ui/

# Copiar arquivos de configuração do Tailwind e PostCSS
COPY packages/igrp-wf-studio-ui/tailwind.config.js ./packages/igrp-wf-studio-ui/
COPY packages/igrp-wf-studio-ui/postcss.config.js ./packages/igrp-wf-studio-ui/

# Copiar arquivos do engine (SDK)
COPY packages/igrp-wf-engine/tsconfig*.json ./packages/igrp-wf-engine/
COPY packages/igrp-wf-engine/src ./packages/igrp-wf-engine/src

# Copiar arquivos do frontend
COPY packages/igrp-wf-studio-ui/tsconfig*.json ./packages/igrp-wf-studio-ui/
COPY packages/igrp-wf-studio-ui/index.html ./packages/igrp-wf-studio-ui/
COPY packages/igrp-wf-studio-ui/vite.config.ts ./packages/igrp-wf-studio-ui/
COPY packages/igrp-wf-studio-ui/src ./packages/igrp-wf-studio-ui/src

# Instalar dependências e construir
RUN yarn install --frozen-lockfile
RUN yarn workspace @igrp/wf-engine build
RUN cd packages/igrp-wf-studio-ui && yarn build

# Production stage
FROM nginx:alpine

# Criar diretórios necessários
RUN mkdir -p /var/log/nginx
RUN touch /var/log/nginx/app.access.log /var/log/nginx/app.error.log

# Copiar arquivos de build
COPY --from=build /app/packages/igrp-wf-studio-ui/dist /usr/share/nginx/html

# Copiar configuração do nginx
COPY packages/igrp-wf-studio-ui/nginx.conf /etc/nginx/conf.d/default.conf

# Expor porta
EXPOSE 80

# Comando para iniciar
CMD ["nginx", "-g", "daemon off;"] 