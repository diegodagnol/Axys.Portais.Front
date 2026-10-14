import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ locals }) => {
  const { site } = locals;
  const lines = site.indexacao.permitir
    ? ['User-agent: *', 'Allow: /', '', `Sitemap: ${new URL('/sitemap.xml', site.urlBase).href}`]
    : ['User-agent: *', 'Disallow: /'];
  return new Response(`${lines.join('\n')}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
