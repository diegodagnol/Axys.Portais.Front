/**
 * Conteúdo das seções da home que ainda NÃO vem do CMS. Cada bloco indica o que falta na plataforma para ele sair
 * daqui (ver "Mapa de origem dos dados" no README). Textos de preenchimento (Lorem Ipsum): o case é white label.
 */

export interface Source {
  /** `cms`: vem da API; `static`: está neste arquivo até a plataforma ter o recurso. */
  kind: 'cms' | 'static';
  label: string;
}

const shortText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.';

export const cards = {
  source: { kind: 'static', label: 'Fixo · candidato a bloco "Cartões" (motor de blocos, decisão A2)' } satisfies Source,
  title: 'Lorem ipsum dolor sit amet',
  items: [
    { title: 'Lorem ipsum', text: shortText, url: '/lorem-ipsum' },
    { title: 'Dolor sit', text: shortText, url: '/dolor-sit' },
    { title: 'Amet consectetur', text: shortText, url: '/amet-consectetur' },
    { title: 'Adipiscing elit', text: shortText, url: '/adipiscing-elit' },
  ],
};

export const steps = {
  source: { kind: 'static', label: 'Fixo · candidato a bloco "Passos" (motor de blocos)' } satisfies Source,
  title: 'Lorem ipsum em 3 passos',
  items: ['Lorem ipsum dolor sit', 'Consectetur adipiscing elit', 'Sed do eiusmod tempor'],
};

export const linkGroups = {
  source: { kind: 'static', label: 'Fixo · poderia ser um menu do CMS, mas o limite é de 3 menus por site' } satisfies Source,
  title: 'Lorem ipsum dolor sit',
  groups: [
    {
      title: 'Dolor sit',
      url: '/dolor-sit',
      items: ['Lorem ipsum 1', 'Lorem ipsum 2', 'Lorem ipsum 3', 'Lorem ipsum 4', 'Lorem ipsum 5', 'Lorem ipsum 6'],
    },
    { title: 'Amet consectetur', url: '/amet-consectetur', items: ['Dolor sit 1', 'Dolor sit 2', 'Dolor sit 3', 'Dolor sit 4'] },
    { title: 'Adipiscing elit', url: '/adipiscing-elit', items: ['Amet elit 1', 'Amet elit 2', 'Amet elit 3'] },
  ],
};

export const highlights = {
  source: { kind: 'static', label: 'Fixo · candidato a bloco "Destaques" (motor de blocos)' } satisfies Source,
  title: 'Lorem ipsum dolor sit amet',
  items: [
    { title: '+00 lorem', text: shortText },
    { title: 'Ipsum dolor', text: shortText },
    { title: 'Sit amet', text: shortText },
  ],
};

export const location = {
  source: {
    kind: 'static',
    label: 'Telefones: CMS (Configurações) · Endereço e horário: fixos, conteúdo do projeto do cliente',
  } satisfies Source,
  address: 'Rua Lorem Ipsum, 123 — Dolor — Sit Amet/UF — 00000-000',
  openingHours: ['Lorem a ipsum: 0h às 00h', 'Dolor: 0h às 00h'],
};

export const faq = {
  source: { kind: 'static', label: 'Fixo · conteúdo do projeto do cliente' } satisfies Source,
  title: 'Perguntas frequentes',
  items: [
    { question: 'Lorem ipsum dolor sit amet?', answer: shortText },
    { question: 'Consectetur adipiscing elit sed do?', answer: shortText },
    { question: 'Eiusmod tempor incididunt ut labore?', answer: shortText },
    { question: 'Ut enim ad minim veniam quis?', answer: shortText },
  ],
};

export const cmsSources = {
  banners: { kind: 'cms', label: 'CMS · Banners (posição principal)' },
  latestPosts: { kind: 'cms', label: 'CMS · Notícias (3 mais recentes)' },
  postList: { kind: 'cms', label: 'CMS · Notícias (lista paginada, filtro por categoria e tag)' },
  post: { kind: 'cms', label: 'CMS · Notícias (artigo)' },
  pages: { kind: 'cms', label: 'CMS · Páginas (rota pelo menu estrutural)' },
  pageContent: { kind: 'cms', label: 'CMS · Apresentação da página (HTML do editor, sanitizado)' },
  form: { kind: 'cms', label: 'CMS · Formulários (definição e envio)' },
  contact: { kind: 'cms', label: 'CMS · Configurações (e-mail, telefones, WhatsApp, redes)' },
} satisfies Record<string, Source>;

export const staticSources = {
  ctaSection: { kind: 'static', label: 'Fixo · faixa de CTA do tema (repetida nas páginas)' },
  moduleHeader: { kind: 'static', label: 'Fixo · título da página de módulo (pendência P9)' },
  blogSearch: { kind: 'static', label: 'Fixo · busca no blog fica para o módulo de busca (fora do contrato v1)' },
} satisfies Record<string, Source>;
