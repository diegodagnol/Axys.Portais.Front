import { defineMiddleware } from 'astro:middleware';
import { AXYS_FIXED_HOST } from 'astro:env/server';
import { getSite } from './api/queries';

/**
 * Resolve o site pelo host (sem site padrão, ADR-011), normaliza a URL e garante o domínio canônico.
 * Todo o resto do site lê `Astro.locals.site` e `Astro.locals.host`.
 */
export const portalMiddleware = defineMiddleware(async (context, next) => {
  const { url } = context;

  // Uma só forma de URL: sem barra no final (exceto a home).
  if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
    return context.redirect(url.pathname.replace(/\/+$/, '') + url.search, 301);
  }

  const host = AXYS_FIXED_HOST ?? url.hostname;
  const site = await getSite(host);
  if (!site) {
    return new Response('Site não encontrado.', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }

  // Outro host do mesmo site (ex.: sem www) vai para o canônico. No desenvolvimento o host é fixo.
  if (!AXYS_FIXED_HOST) {
    const canonical = new URL(site.urlBase);
    if (canonical.host !== url.host) {
      return context.redirect(new URL(url.pathname + url.search, canonical).href, 301);
    }
  }

  context.locals.site = site;
  context.locals.host = host;

  const response = await next();
  if (!site.indexacao.permitir && !response.headers.has('X-Robots-Tag')) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }
  return response;
});
