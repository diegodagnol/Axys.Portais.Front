# Axys.Portais.Front — monorepo do site público em Astro

Monorepo de front-end do ADR-018 (site público em Astro), com npm workspaces:

- **`packages/portal`** — o pacote **`@axys/portal`**: a plataforma, igual para todos os clientes (integração
  Astro, cliente da API pública de conteúdo, SEO, formulários). Ver o README do pacote.
- **`sites/demo`** — site **white label** em **wireframe**, com a estrutura típica de um site institucional
  simples — home com banners e CTAs, páginas de conteúdo, blog e fale conosco — consumindo o pacote. É a base do
  futuro `create-axys-site`.

A API pública de conteúdo é servida, por enquanto, por um mock (`mock/`).

Referências no repositório Axys.Portais: ADR-018 (site público em Astro), ADR-019 (API pública de conteúdo) e o
contrato v1 em `docs/planejamento/api-publica`.

> Wireframe: só estrutura, em cinza. Cada seção mostra uma **etiqueta de origem** — azul quando o dado vem do CMS,
> laranja quando está fixo no projeto porque a plataforma ainda não tem o recurso. Textos em Lorem Ipsum, sem marca
> nem segmento: botões de chamada aparecem como **CTA / Call To Action** (componentes `Cta.astro` e `CtaSection.astro`).

**Estado:** etapa 1 do roteiro concluída — o demo consome o `@axys/portal` por workspace; `astro check` sem erros,
build ok, rotas, sitemap/robots injetados e envio de formulário verificados no navegador (14/10/2026).

## Como rodar

Node **22.12 ou mais novo** (`.nvmrc`: 24). Comandos na raiz do repositório:

```bash
npm install                                   # instala tudo e liga o @axys/portal ao demo (workspaces)
cp sites/demo/.env.example sites/demo/.env
npm run mock                                  # API de exemplo em http://localhost:4010/v1 (deixe rodando)
npm run dev                                   # gera os tipos do contrato e sobe o demo em http://localhost:4321
```

No Claude Code, a partir do repositório `Axys.Portais`: configurações `front-mock` e `front-site` do `.claude/launch.json`.

| Script (raiz) | O que faz |
| --- | --- |
| `npm run types` | Gera `packages/portal/src/api/schema.d.ts` a partir do contrato do pacote (roda antes de `dev` e `build`) |
| `npm run contract:update` | Copia o contrato do `Axys.Portais` para o pacote e regera os tipos |
| `npm run mock` | Mock com dados fictícios (`mock/data/*.json`), validados contra os schemas do contrato |
| `npm run mock:contract` | Prism sobre o contrato, para conferir aderência (dados gerados) |
| `npm run dev` / `build` / `check` / `start` | Executam no `sites/demo` (`build` = `astro check` + build; servidor em `sites/demo/dist/server/entry.mjs`) |

## Páginas

| Rota | Conteúdo |
| --- | --- |
| `/` | Topo com banners, cartões, passos, listas de links, faixa de CTA, destaques, localização, últimos posts do blog, perguntas frequentes |
| `/{path}` | Páginas do CMS (`[...path].astro`) (`/lorem-ipsum`, `/dolor-sit`, `/amet-consectetur`, `/adipiscing-elit`, `/politica-de-privacidade`): topo, conteúdo do editor, CTA e localização. Caminho antigo → 301 (ex.: `/contato`) |
| `/noticias`, `/noticias/{slug}` | Blog: lista paginada com filtro por categoria/tag e artigo |
| `/fale-conosco` | Formulário (nome, telefone/WhatsApp, e-mail, mensagem, aceite) + canais + localização |
| `/sitemap.xml`, `/robots.txt` | Gerados a partir da API |

## Mapa de origem dos dados

O resultado principal do case: o que um site desse tipo precisa e de onde vem hoje.

| Seção | Origem | O que falta na plataforma |
| --- | --- | --- |
| Menu principal e rodapé | **CMS** · Menus | — |
| Topo da home (chamada, apoio, CTA) | **CMS** · Banners | Imagem desktop/celular: módulo **Mídia** |
| Páginas de conteúdo | **CMS** · Páginas | Seções ricas (cartões, passos) dentro da página: **motor de blocos** (A2) |
| Blog (lista, categoria, tag, artigo) | **CMS** · Notícias | Imagem de capa: **Mídia**. Busca: módulo de **busca** (fora da v1) |
| Formulário de contato | **CMS** · Formulários | Vínculo com a página e destinatários do aviso (ADR-020 D1) |
| Telefones, WhatsApp, e-mail, redes | **CMS** · Configurações | — |
| Cartões, passos, destaques | Fixo (`src/data/home.ts`) | **Motor de blocos** (A2) e/ou home editável no CMS (P9) |
| Listas de links por grupo | Fixo | Um 4º menu (limite atual: 3 por site) ou bloco de lista |
| Endereço e horário de funcionamento | Fixo | — (conteúdo do projeto do cliente) |
| Perguntas frequentes | Fixo | — (conteúdo do projeto do cliente) |
| Equipe | Texto dentro de uma página de conteúdo | — (conteúdo da página, editado no CMS) |

## Estrutura

```text
package.json                    workspaces (packages/*, sites/*) e scripts da raiz
mock/
  server.mjs                    servidor de mock (Node puro)
  data/                         site, routes, menus, news, banners, forms (dados fictícios)
packages/portal/                ← @axys/portal: plataforma, igual para todos os clientes
  contract/openapi-v1.json      cópia do contrato (fonte: Axys.Portais/docs/planejamento/api-publica)
  scripts/update-contract.mjs   copia o contrato do Axys.Portais
  src/
    index.ts                    integração axysPortal(): variáveis AXYS_*, middleware, rotas, tipos de Astro.locals
    middleware.ts               site pelo host, URL sem barra final, domínio canônico, X-Robots-Tag
    api/                        cliente tipado (openapi-fetch), consultas (404 vira null), schema.d.ts gerado
    seo/                        SEO de páginas de módulo e sitemap.xml
    forms/submission.ts         envio pela Astro Action: campo isca, carimbo de tempo assinado, erros por campo
    format.ts                   formatação de datas
    components/                 AxysHead, AxysHtml, AxysForm, FormField, SpeculationRules
    routes/                     sitemap.xml.ts e robots.txt.ts (injetadas pela integração)
sites/demo/                     ← site do cliente (aqui, white label em wireframe)
  astro.config.mjs              output server + adaptador Node + integrations: [axysPortal()]
  src/
    data/home.ts                conteúdo que ainda não vem do CMS, com a origem de cada seção
    components/                 Header, Footer, Menu, Breadcrumb, Hero, Section, Cta, CtaSection, PostCard,
                                Pagination, Location, Faq, ImagePlaceholder, NotFound
    layouts/BaseLayout.astro    html, head e estrutura comum
    pages/                      rotas do site (nomes em pt-BR porque viram URLs públicas)
    actions/index.ts            Astro Action do envio de formulário (delegada ao pacote)
    scripts/carousel.ts         <axys-carousel>, Web Component do topo da home
    styles/wireframe.css        estilo de wireframe; o design do cliente substitui (Tailwind + 7-1, ADR-018 D6)
```

**Convenção de nomes** — tudo que é código fica em inglês:

| O quê | Padrão | Exemplo |
| --- | --- | --- |
| Componentes | PascalCase | `Header.astro`, `PostCard.astro` |
| Módulos e pastas | minúsculas | `queries.ts`, `components/` |
| Variáveis, funções, props, tipos | camelCase / PascalCase | `listPosts`, `pageSeo`, `PostSummary` |
| Constantes e variáveis de ambiente | UPPER_SNAKE_CASE | `CONTROL_FIELDS`, `AXYS_FORM_SECRET` |
| Classes CSS | BEM em inglês, kebab-case | `header__menu`, `axys-form__field--half` |

Ficam em pt-BR, por não serem identificadores do front:

- **Rotas em `src/pages/`** (`fale-conosco.astro`, `noticias/`): o nome do arquivo é a URL pública, no idioma do site.
- **Campos da API** (`site.contato.telefones`, `post.titulo`, `/formularios/{id}`): vêm do contrato. Os tipos têm
  aliases em inglês em `@axys/portal/api` (`packages/portal/src/api/client.ts`) (`Post`, `MenuItem`, `FormFieldDefinition`...).
- **Textos exibidos na tela e comentários.**

**Variáveis de ambiente** (`.env.example`): `AXYS_API_URL`, `AXYS_API_KEY`, `AXYS_FIXED_HOST` (só desenvolvimento),
`AXYS_CONTACT_FORM_ID`, `AXYS_FORM_SECRET`.

## O que o case demonstra

- HTML completo no servidor e **nenhum JavaScript de framework** no navegador.
- Rotas do CMS por uma rota única; 301 (caminho antigo), 302 (agrupador) e 404 reais.
- SEO no `<head>`, JSON-LD (`Organization`, `Article`, `FAQPage`), `sitemap.xml` e `robots.txt`.
- Topo da home em full bleed com carrossel (`<axys-carousel>`, Web Component sobre scroll-snap: funciona sem JavaScript), FAQ com `<details>`, transição entre páginas com `@view-transition`.
- Fale conosco **sem JavaScript**: POST nativo, erro ao lado do campo com os valores mantidos, POST/redirect/GET,
  checagem de origem do Astro, campo isca e carimbo de tempo assinado (ADR-020).

## Pendências

Continuam as P1 a P8 do contrato.

| # | Pendência |
| --- | --- |
| P9 | A home e as páginas de módulo (blog, fale conosco) não são páginas do CMS e não recebem SEO pronto da API; o case repete a regra do título (`applyTitleTemplate`). |
| P10 | O contrato não informa o fuso da instalação (fixo em `packages/portal/src/format.ts`). |
| P12 | Com cache de página, o carimbo de tempo do formulário fica congelado no HTML: cache curto em páginas com formulário. |
| P13 | Atrás do IIS, conferir se `clientAddress` recebe o IP do visitante e não o do proxy. |

## Roteiro: pacote `@axys/portal` e inicializador `create-axys-site`

Este repositório evolui para o monorepo de front-end do ADR-018, em etapas verificáveis:

| Etapa | Entrega | Pronto quando |
| --- | --- | --- |
| 1. Pacote ✅ | npm workspaces: `packages/portal` (`@axys/portal`) + `sites/demo`. O pacote expõe a integração `axysPortal()` (middleware, rotas de sitemap/robots, variáveis `AXYS_*`, tipos de `Astro.locals`) e componentes/funções por caminhos estáveis. `.ts` e `.astro` como código-fonte, processados pelo Vite do site (`ssr.noExternal`), sem build próprio | O demo roda e builda igual, sem `src/portal/` (concluída em 14/10/2026) |
| 2. Inicializador | `packages/create-axys-site`: `npm create axys-site@latest <nome>`. O template é o próprio demo | No CI, gerar um site de cada base e passar em `check` e `build` |
| 3. Qualidade | Changesets (versão e changelog; maior casada com a API), Vitest no pacote, Playwright no demo, GitHub Actions | Pipeline verde a cada mudança no pacote |
| 4. Publicação | Azure Artifacts, escopo `@axys` (não publicar no repositório pessoal) | Instalar o pacote e criar um site a partir do feed |

**Bases do inicializador** (decidido em 14/10/2026):

| Base | O que vem |
| --- | --- |
| **Completa** (padrão) | Tudo deste case: home com carrossel full bleed e seções de exemplo (cartões, passos, listas, destaques, localização, perguntas frequentes), páginas do CMS, blog, contato, SEO |
| **Mínima** | Layout, header, footer, páginas do CMS, blog, contato e SEO; home só com título e últimas notícias, sem seções de exemplo e sem carrossel. Para quando o design já chega definido |

As duas saem funcionando contra a API (ou o mock) logo após `npm run dev`; o visual é o wireframe, para o time de
front substituir pelo design do cliente.

## Próximos passos

1. Etapa 2 do roteiro acima: o inicializador `create-axys-site`, com as bases completa e mínima.
2. Decidir com produto a home editável (P9) — ela define o que entra no CMS antes do piloto.
3. Cache HTTP com tags e o endpoint do webhook `conteudoAlterado` (ADR-019 D8).
4. Consentimento LGPD antes de GTM, Meta Pixel e mapa incorporado (ADR-018 D10).
5. Aplicar um design real sobre o wireframe (Tailwind + 7-1) e medir com Lighthouse CI (ADR-018 D8).
6. Hospedagem: serviço Node atrás do IIS/ARR, `security.allowedDomains` com os hosts do cliente.
