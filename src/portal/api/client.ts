import createClient from 'openapi-fetch';
import { AXYS_API_KEY, AXYS_API_URL } from 'astro:env/server';
import type { components, paths } from './schema';

/**
 * Tipos gerados do contrato (`npm run types`). Nunca escreva à mão um tipo que vem da API.
 * Os nomes dos campos seguem o contrato (pt-BR); os aliases abaixo são os nomes usados no front.
 */
export type Schemas = components['schemas'];
export type Site = Schemas['Site'];
export type Seo = Schemas['Seo'];
export type Page = Schemas['Pagina'];
export type Menu = Schemas['Menu'];
export type MenuItem = Schemas['ItemMenu'];
export type Banner = Schemas['Banner'];
export type PostSummary = Schemas['NoticiaResumo'];
export type Post = Schemas['Noticia'];
export type PostList = Schemas['ListaNoticias'];
export type Form = Schemas['Formulario'];
export type FormFieldDefinition = Schemas['CampoFormulario'];
export type SitemapEntry = Schemas['EntradaSitemap'];

/** Chamada servidor a servidor: a chave nunca chega ao navegador (ADR-019 D5). */
export const api = createClient<paths>({
  baseUrl: AXYS_API_URL,
  headers: { 'X-Axys-Chave': AXYS_API_KEY },
});
