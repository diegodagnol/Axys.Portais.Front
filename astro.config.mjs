// @ts-check
import { defineConfig, envField } from 'astro/config';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

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

  env: {
    schema: {
      AXYS_API_URL: envField.string({ context: 'server', access: 'public' }),
      AXYS_API_KEY: envField.string({ context: 'server', access: 'secret' }),
      AXYS_FIXED_HOST: envField.string({ context: 'server', access: 'public', optional: true }),
      AXYS_CONTACT_FORM_ID: envField.string({ context: 'server', access: 'public', optional: true }),
      AXYS_FORM_SECRET: envField.string({ context: 'server', access: 'secret' }),
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
