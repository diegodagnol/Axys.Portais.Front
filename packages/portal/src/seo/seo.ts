import type { Seo, Site } from '../api/client';

const EDGE_SEPARATORS = /^[\s|\-–—·:•]+|[\s|\-–—·:•]+$/g;

/**
 * Mesmo resultado de `SeoPadroes.TituloDa` no back. Só existe porque páginas de módulo (home, blog, contato)
 * ainda não recebem o SEO pronto da API — ver pendência P9 no README.
 */
export function applyTitleTemplate(site: Site, title: string): string {
  return site.seo.modeloTitulo
    .replace('{pagina}', title.trim())
    .replace('{site}', site.seo.nomeSite?.trim() ?? '')
    .replace(EDGE_SEPARATORS, '');
}

export interface PageSeoInput {
  /** Título da página; `null` na home (usa só o nome do site). */
  title: string | null;
  path: string;
  description?: string | null;
  index?: boolean;
}

/** SEO de página que não vem da API (páginas de módulo do próprio site). */
export function pageSeo(site: Site, input: PageSeoInput): Seo {
  return {
    titulo: input.title ? applyTitleTemplate(site, input.title) : (site.seo.nomeSite ?? site.nome),
    descricao: input.description ?? site.seo.metaDescription ?? null,
    urlCanonica: new URL(input.path, site.urlBase).href,
    indexar: (input.index ?? true) && site.indexacao.permitir,
  };
}
