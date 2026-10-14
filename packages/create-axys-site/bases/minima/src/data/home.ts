/**
 * Conteúdo que ainda NÃO vem do CMS e etiquetas de origem das seções do wireframe (ver "Mapa de origem dos dados"
 * no README do monorepo Axys.Portais.Front). Textos de preenchimento (Lorem Ipsum) até o conteúdo do cliente chegar.
 */

export interface Source {
  /** `cms`: vem da API; `static`: está neste arquivo até a plataforma ter o recurso. */
  kind: 'cms' | 'static';
  label: string;
}

export const location = {
  source: {
    kind: 'static',
    label: 'Telefones: CMS (Configurações) · Endereço e horário: fixos, conteúdo do projeto do cliente',
  } satisfies Source,
  address: 'Rua Lorem Ipsum, 123 — Dolor — Sit Amet/UF — 00000-000',
  openingHours: ['Lorem a ipsum: 0h às 00h', 'Dolor: 0h às 00h'],
};

export const cmsSources = {
  latestPosts: { kind: 'cms', label: 'CMS · Notícias (3 mais recentes)' },
  postList: { kind: 'cms', label: 'CMS · Notícias (lista paginada, filtro por categoria e tag)' },
  post: { kind: 'cms', label: 'CMS · Notícias (artigo)' },
  pages: { kind: 'cms', label: 'CMS · Páginas (rota pelo menu estrutural)' },
  pageContent: { kind: 'cms', label: 'CMS · Apresentação da página (HTML do editor, sanitizado)' },
  form: { kind: 'cms', label: 'CMS · Formulários (definição e envio)' },
  contact: { kind: 'cms', label: 'CMS · Configurações (e-mail, telefones, WhatsApp, redes)' },
} satisfies Record<string, Source>;

export const staticSources = {
  homeHeader: { kind: 'static', label: 'Fixo · título da home: nome do site (pendência P9)' },
  ctaSection: { kind: 'static', label: 'Fixo · faixa de CTA do tema (repetida nas páginas)' },
  moduleHeader: { kind: 'static', label: 'Fixo · título da página de módulo (pendência P9)' },
  blogSearch: { kind: 'static', label: 'Fixo · busca no blog fica para o módulo de busca (fora do contrato v1)' },
} satisfies Record<string, Source>;
