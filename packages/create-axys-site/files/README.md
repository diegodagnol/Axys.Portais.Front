# {{name}}

Site público sobre o **`@axys/portal`** (ADR-018 do Axys.Portais), criado pelo `create-axys-site`.

**Base:** {{base}}.

O visual é um **wireframe** em cinza, para o time de front substituir pelo design do cliente. Cada seção mostra
uma etiqueta de origem — azul quando o dado vem do CMS, laranja quando está fixo no projeto
(`src/data/home.ts`). Regra de negócio (API, SEO, formulários, sitemap) chega pronta do `@axys/portal`: este
projeto cuida só do visual.

## Como rodar

Node **22.12 ou mais novo** (`.nvmrc`: 24).

```bash
npm install
npm run mock    # API de exemplo em http://localhost:4010/v1 (deixe rodando)
npm run dev     # site em http://localhost:4321
```

O `.env` foi criado a partir do `.env.example` e aponta para o mock. Para a API de verdade, ajuste
`AXYS_API_URL` e `AXYS_API_KEY`; em servidores, use variáveis de ambiente (nunca arquivo versionado) e troque
`AXYS_FORM_SECRET` em cada ambiente.

| Script | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run check` | `astro check` (tipos e templates) |
| `npm run build` | `astro check` + build (servidor Node em `dist/server/entry.mjs`) |
| `npm run start` | Sobe o build |
| `npm run mock` | Mock da API pública com dados fictícios (`mock/data/*.json`) |

## Estrutura

```text
astro.config.mjs        output server + adaptador Node + integrations: [axysPortal()]
mock/                   mock da API pública (só desenvolvimento)
src/
  actions/index.ts      Astro Action do envio de formulário (delegada ao pacote)
  components/           Header, Footer, Menu, Section, Cta, PostCard...
  data/home.ts          conteúdo que ainda não vem do CMS e etiquetas de origem
  layouts/              BaseLayout (html, head, header, footer)
  pages/                rotas (nomes em pt-BR porque viram URLs públicas)
  styles/wireframe.css  estilo de wireframe; o design do cliente substitui
```

Componentes e funções da plataforma: README do pacote `@axys/portal` (`node_modules/@axys/portal/README.md`).
