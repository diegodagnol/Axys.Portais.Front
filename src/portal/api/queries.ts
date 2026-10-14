import { api } from './client';

/** 404 vira `null` (a página decide o que mostrar); qualquer outra falha é erro de verdade. */
async function read<T>(request: Promise<{ data?: T; response: Response }>): Promise<T | null> {
  const { data, response } = await request;
  if (data !== undefined) {
    return data;
  }
  if (response.status === 404) {
    return null;
  }
  throw new Error(`A API respondeu ${response.status} em ${new URL(response.url).pathname}.`);
}

const siteHeader = (host: string) => ({ 'X-Axys-Host': host });

export const getSite = (host: string) =>
  read(api.GET('/site', { params: { header: siteHeader(host) } }));

export const resolveRoute = (host: string, path: string) =>
  read(api.GET('/rotas', { params: { header: siteHeader(host), query: { caminho: path } } }));

export const getMenu = (host: string, key: string) =>
  read(api.GET('/menus/{chave}', { params: { header: siteHeader(host), path: { chave: key } } }));

export interface PostFilter {
  page?: number;
  size?: number;
  category?: string;
  tag?: string;
}

export const listPosts = (host: string, filter: PostFilter = {}) =>
  read(
    api.GET('/noticias', {
      params: {
        header: siteHeader(host),
        query: { pagina: filter.page, tamanho: filter.size, categoria: filter.category, tag: filter.tag },
      },
    }),
  );

export const getPost = (host: string, slug: string) =>
  read(api.GET('/noticias/{slug}', { params: { header: siteHeader(host), path: { slug } } }));

export const listBanners = async (host: string, position: 'principal' | 'rodape' | 'modal') =>
  (await read(api.GET('/banners', { params: { header: siteHeader(host), query: { posicao: position } } }))) ?? [];

export const getSitemap = async (host: string) =>
  (await read(api.GET('/sitemap', { params: { header: siteHeader(host) } }))) ?? [];

export const getForm = (host: string, id: string) =>
  read(api.GET('/formularios/{id}', { params: { header: siteHeader(host), path: { id } } }));
