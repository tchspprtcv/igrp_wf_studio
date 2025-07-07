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
  
  webpack: (config, { isServer }) => {
    // Handle Node.js built-in modules
    if (!isServer) {
      // Usar shims para módulos Node.js no lado do cliente
      config.resolve.fallback = {
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        buffer: false,
        http: false,
        https: false,
        zlib: false,
        util: false,
        net: false,
        tls: false,
        child_process: false,
      };
      
      // Handle node: protocol imports
      config.resolve.alias = {
        ...config.resolve.alias,
        'node:fs': false,
        'node:path': false,
        'node:os': false,
        'node:crypto': false,
        'node:stream': false,
        'node:buffer': false,
        'node:http': false,
        'node:https': false,
        'node:zlib': false,
        'node:util': false,
        'node:net': false,
        'node:tls': false,
        'node:child_process': false,
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;
