# @axys/portal

Plataforma do site público Axys.Portal (ADR-018): tudo o que é **igual para todos os clientes** — integração Astro,
cliente da API pública de conteúdo (ADR-019), SEO, formulários (ADR-020). O site de cada cliente cuida só do
visual; regra de negócio chega pronta da API ou deste pacote.

## Uso

```js
// astro.config.mjs do site
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import axysPortal from '@axys/portal';

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [axysPortal()],
});
```

```ts
// src/actions/index.ts do site
import { defineAction } from 'astro:actions';
import { processFormSubmission } from '@axys/portal/forms';

export const server = {
  submitForm: defineAction({ accept: 'form', handler: (data, context) => processFormSubmission(data, context) }),
};
```

### O que a integração `axysPortal()` faz

| Recurso | Detalhe |
| --- | --- |
| Variáveis de ambiente | Declara e valida `AXYS_API_URL`, `AXYS_API_KEY`, `AXYS_FIXED_HOST` (só desenvolvimento), `AXYS_CONTACT_FORM_ID`, `AXYS_FORM_SECRET` |
| Middleware | Site pelo host (sem site padrão), domínio canônico (301), URL sem barra final, `X-Robots-Tag` com indexação desligada |
| Rotas | `/sitemap.xml` e `/robots.txt` |
| Tipos | `Astro.locals.site` (configurações efetivas do site) e `Astro.locals.host` |
| Vite | Processa o pacote como código-fonte (`ssr.noExternal`) |

O site continua dono de `output`, adaptador, `security` (`checkOrigin`, `allowedDomains`) e das próprias integrações.

## Exports

| Caminho | Conteúdo |
| --- | --- |
| `@axys/portal` | Integração `axysPortal()` (default) |
| `@axys/portal/api` | Consultas (`getSite`, `resolveRoute`, `getMenu`, `listPosts`, `getPost`, `listBanners`, `getSitemap`, `getForm`) e tipos (`Site`, `Page`, `Post`, `MenuItem`, `Banner`, `Form`...) |
| `@axys/portal/seo` | `pageSeo`, `applyTitleTemplate`, `buildSitemapXml` |
| `@axys/portal/forms` | `processFormSubmission`, `CONTROL_FIELDS`, carimbo de tempo |
| `@axys/portal/format` | `formatDate` |
| `@axys/portal/components/AxysHead.astro` | `<head>`: title, canonical, robots, Open Graph, JSON-LD |
| `@axys/portal/components/AxysHtml.astro` | Única saída permitida para HTML do CMS |
| `@axys/portal/components/AxysForm.astro` | Formulário automático a partir da definição da API (usa `FormField.astro`) |
| `@axys/portal/components/SpeculationRules.astro` | Pré-renderização da próxima página ao passar o mouse |

## Contrato e tipos

O contrato da API fica em `contract/openapi-v1.json` (cópia do `Axys.Portais`). Os tipos são gerados em
`src/api/schema.d.ts` (fora do git) por `npm run types`, que roda no `prepare` e antes do `dev`/`build` do
monorepo. A versão maior do pacote acompanha a da API (pacote 1.x ↔ API v1).

```bash
npm run contract:update -w @axys/portal   # copia o contrato do Axys.Portais e regera os tipos
```

## Decisões

- **Código-fonte, sem build:** `.ts` e `.astro` são publicados como estão e processados pelo Vite do site
  (`ssr.noExternal`, configurado pela integração). Menos uma etapa a manter; rever se surgir consumidor fora do Astro.
- **`astro` como peerDependency:** o site define a versão do Astro; o pacote declara a faixa compatível.
