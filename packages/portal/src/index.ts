import type { AstroIntegration } from 'astro';
import { envField } from 'astro/config';

/**
 * Integração da plataforma: o site do cliente só precisa de `integrations: [axysPortal()]`.
 *
 * - Declara as variáveis de ambiente `AXYS_*` (validadas pelo `astro:env`).
 * - Registra o middleware de site (host → site, domínio canônico, URL sem barra final, X-Robots-Tag).
 * - Injeta `/sitemap.xml` e `/robots.txt`.
 * - Tipa `Astro.locals.site` e `Astro.locals.host`.
 * - Faz o Vite processar o pacote como código-fonte (`.ts` e `.astro`), sem etapa de build própria.
 */
export default function axysPortal(): AstroIntegration {
  return {
    name: '@axys/portal',
    hooks: {
      'astro:config:setup': ({ config, updateConfig, addMiddleware, injectRoute, logger }) => {
        if (config.output !== 'server') {
          logger.warn('O site público precisa de output: "server" — o conteúdo vem da API a cada requisição (ADR-018 D1).');
        }

        updateConfig({
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
            ssr: { noExternal: ['@axys/portal'] },
          },
        });

        addMiddleware({ entrypoint: '@axys/portal/middleware', order: 'pre' });
        injectRoute({ pattern: '/sitemap.xml', entrypoint: '@axys/portal/routes/sitemap.xml.ts', prerender: false });
        injectRoute({ pattern: '/robots.txt', entrypoint: '@axys/portal/routes/robots.txt.ts', prerender: false });
      },

      'astro:config:done': ({ injectTypes }) => {
        injectTypes({
          filename: 'locals.d.ts',
          content: `declare namespace App {
  interface Locals {
    /** Site resolvido pelo host, com as configurações efetivas (middleware do @axys/portal). */
    site: import('@axys/portal/api').Site;
    /** Host enviado à API em cada chamada. */
    host: string;
  }
}
`,
        });
      },
    },
  };
}
