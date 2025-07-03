/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true, // Habilitar suporte a styled-components
  },
  // Se você tem alias de path no tsconfig/jsconfig (ex: "@/*": ["src/*"])
  // o Next.js já os suporta por padrão se o tsconfig.json estiver configurado.
  // No entanto, se o alias aponta para fora do diretório `src` (como o `igrp-wf-engine`),
  // pode ser necessário configurar experimental.externalDir aqui ou ajustar os caminhos.
  // Por enquanto, vamos manter simples e ajustar se for preciso.

  // O `basePath` do Vite (`base: './'`) pode precisar ser mapeado para `basePath` ou `assetPrefix` no Next.js
  // se a aplicação não for servida da raiz do domínio.
  // Por agora, não vou configurar, assumindo que será servida da raiz.
};

export default nextConfig;
