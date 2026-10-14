# create-axys-site

Inicializador do site de um cliente sobre o **`@axys/portal`** (ADR-018). O template é o próprio `sites/demo`
deste monorepo, com o mock da API: o site gerado sobe com `npm run mock` e `npm run dev`, sem configurar nada.

```bash
npm create axys-site@latest site-cliente                      # pergunta a base (padrão: completa)
npm create axys-site@latest site-cliente -- --base minima     # sem perguntas sobre a base
npm create axys-site@latest site-cliente -- --yes             # tudo no padrão (útil no CI)
```

O `--` separa as opções do inicializador das do npm. No monorepo, sem publicar: `npm run create-site -- <pasta> --base minima`.
Passo a passo para iniciar o site de um cliente, antes e depois da publicação: seção "Criando um site novo" do
README da raiz.

| Opção | Efeito |
| --- | --- |
| `-b`, `--base` | `completa` (padrão) ou `minima` |
| `--portal <versão>` | Versão do `@axys/portal` no `package.json` gerado (padrão: `^` + a versão do pacote no monorepo). Ex.: `file:../axys-portal-0.1.0.tgz` |
| `-y`, `--yes` | Não pergunta nada |

## Bases

| Base | O que vem |
| --- | --- |
| **Completa** (padrão) | O demo inteiro: home com carrossel full bleed e seções de exemplo (cartões, passos, listas, destaques, localização, perguntas frequentes), páginas do CMS, blog, contato, SEO |
| **Mínima** | Layout, header, footer, páginas do CMS, blog, contato e SEO; home só com título e últimas notícias. Para quando o design já chega definido |

A base mínima é o demo com uma sobreposição:

- **remove** `Hero.astro`, `Faq.astro`, `src/scripts/` (carrossel) e `public/mock/` (imagens dos banners) —
  lista `MINIMA_REMOVED` em `src/create-site.mjs`;
- **substitui** pelos arquivos de `bases/minima/` (`src/pages/index.astro` e `src/data/home.ts`);
- **corta** do `wireframe.css` os trechos entre os marcadores abaixo (na completa, só os marcadores saem):

```css
/* create-axys-site: início do trecho só da base completa */
...
/* create-axys-site: fim do trecho */
```

Ao mudar o demo, confira se a base mínima continua coerente: um componente novo usado só pela home completa entra
em `MINIMA_REMOVED`; estilo só dele, entre os marcadores.

## O que o site gerado recebe

- Cópia do `sites/demo` (sem `node_modules`, `dist`, `.astro`, `.env`) e do `mock/` da raiz, com o script `mock`.
- `package.json` com o nome do site e o `@axys/portal` por versão (no demo é `*`, pelo workspace).
- `.gitignore`, `.nvmrc` e `README.md` (de `files/`; o npm não publica arquivos `.gitignore`, por isso vão sem ponto).
- `.env` copiado do `.env.example`, apontando para o mock.

## Estrutura

```text
index.mjs                 CLI (argumentos e perguntas)
src/create-site.mjs       geração: cópia, package.json, bases
src/template.mjs          onde está o template: template/ (pacote publicado) ou sites/demo + mock (monorepo)
bases/minima/             arquivos que substituem os do demo na base mínima
files/                    README.md, gitignore e nvmrc do site gerado
scripts/sync-template.mjs copia sites/demo e mock para template/ (prepack; template/ fica fora do git)
```

## Teste

Na raiz do monorepo, `npm run test:create` empacota o `@axys/portal` (`npm pack`, como viria do feed), gera um
site de cada base numa pasta temporária fora do monorepo e roda `npm install` e `npm run build` (`astro check` +
build) em cada um. `-- --keep` mantém os sites gerados para inspecionar.
