import type { APIRoute } from 'astro';
import { getSitemap } from '../portal/api/queries';
import { buildSitemapXml } from '../portal/seo/sitemap';

export const GET: APIRoute = async ({ locals }) => {
  const entries = await getSitemap(locals.host);
  return new Response(buildSitemapXml(entries), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
