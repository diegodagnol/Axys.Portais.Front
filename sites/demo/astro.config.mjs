// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';
import axysPortal from '@axys/portal';

export default defineConfig({
  // Toda página é renderizada no servidor: o conteúdo vem da API a cada requisição (ADR-018 D1).
  output: 'server',
  adapter: node({ mode: 'standalone' }),

  security: {
    // Recusa POST de outra origem (Sec-Fetch-Site/Origin): é a proteção dos formulários (ADR-020 D6).
    checkOrigin: true,
    // Atrás do IIS, liste aqui os hosts do cliente para o Astro confiar no X-Forwarded-Host.
    allowedDomains: [],
  },

  // A plataforma: variáveis AXYS_*, middleware de site, /sitemap.xml, /robots.txt e tipos de Astro.locals.
  integrations: [axysPortal()],

  vite: {
    plugins: [tailwindcss()],
  },
});
