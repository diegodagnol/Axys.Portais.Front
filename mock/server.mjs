// Mock da API pública (contrato v1) com dados fictícios. Só Node, sem dependências.
// Uso: npm run mock  → http://localhost:4010/v1
// Para conferir aderência ao contrato com dados gerados automaticamente: npm run mock:contract (Prism).
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';

const PORT = Number(process.env.MOCK_PORT ?? 4010);
const loadData = (file) => JSON.parse(readFileSync(new URL(`./data/${file}.json`, import.meta.url), 'utf8'));

const site = loadData('site');
const routes = loadData('routes');
const menus = loadData('menus');
const posts = loadData('news');
const banners = loadData('banners');
const forms = loadData('forms');

function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

function problem(res, status, code, title, extras = {}) {
  res.writeHead(status, { 'Content-Type': 'application/problem+json; charset=utf-8' });
  res.end(JSON.stringify({ title, status, codigo: code, ...extras }));
}

const toSummary = ({ corpoHtml, tags, seo, atualizadaEmUtc, ...post }) => post;

function listPosts(res, query) {
  const page = Math.max(1, Number(query.get('pagina') ?? 1));
  const size = Math.min(50, Math.max(1, Number(query.get('tamanho') ?? 12)));
  const categorySlug = query.get('categoria');
  const tagSlug = query.get('tag');

  const category = categorySlug ? posts.find((p) => p.categoria.slug === categorySlug)?.categoria : null;
  const tag = tagSlug ? posts.flatMap((p) => p.tags).find((t) => t.slug === tagSlug) : null;
  if ((categorySlug && !category) || (tagSlug && !tag)) {
    return problem(res, 404, 'noticias.filtro.nao-encontrado', 'Categoria ou tag não encontrada.');
  }

  const filtered = posts
    .filter((p) => !category || p.categoria.slug === category.slug)
    .filter((p) => !tag || p.tags.some((t) => t.slug === tag.slug))
    .sort((a, b) => b.publicadaEmUtc.localeCompare(a.publicadaEmUtc));

  json(res, 200, {
    pagina: page,
    tamanho: size,
    total: filtered.length,
    totalPaginas: Math.max(1, Math.ceil(filtered.length / size)),
    itens: filtered.slice((page - 1) * size, page * size).map(toSummary),
    filtro: { categoria: category ?? null, tag: tag ?? null },
  });
}

function sitemap() {
  const pages = Object.values(routes)
    .filter((r) => r.tipo === 'pagina' && r.pagina.seo.indexar)
    .map((r) => ({ url: r.pagina.seo.urlCanonica, ultimaAlteracaoUtc: r.pagina.atualizadaEmUtc, tipo: 'pagina' }));
  const postEntries = posts.map((p) => ({ url: p.seo.urlCanonica, ultimaAlteracaoUtc: p.atualizadaEmUtc, tipo: 'noticia' }));
  return site.indexacao.permitir ? [...pages, ...postEntries] : [];
}

/** Validação simplificada; a real é o ValidadorResposta do Domain. */
function validateSubmission(form, values) {
  const errors = {};
  for (const field of form.campos.filter((f) => f.recebeResposta)) {
    const value = values[field.chave];
    const texts = Array.isArray(value) ? value : value ? [String(value)] : [];
    if (field.obrigatorio && texts.every((t) => t.trim() === '')) {
      errors[field.chave] = [field.tipo === 'aceite' ? 'É preciso aceitar para enviar.' : 'Preencha este campo.'];
    } else if (field.tipo === 'email' && texts[0] && !/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(texts[0])) {
      errors[field.chave] = ['Informe um e-mail válido (ex.: nome@empresa.com.br).'];
    } else if (texts.some((t) => /<[a-z/!]/i.test(t))) {
      errors[field.chave] = ['Não use código ou HTML neste campo.'];
    }
  }
  return errors;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 100_000) reject(new Error('Corpo acima do limite.'));
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);
  const path = url.pathname.replace(/^\/v1/, '');
  console.log(`${req.method} ${url.pathname}${url.search}`);

  if (!req.headers['x-axys-chave']) {
    return problem(res, 401, 'api.chave.ausente', 'Chave do consumidor ausente.');
  }
  if (!req.headers['x-axys-host']) {
    return problem(res, 400, 'site.host.ausente', 'Informe o cabeçalho X-Axys-Host.');
  }

  let match;
  if (req.method === 'GET' && path === '/site') return json(res, 200, site);

  if (req.method === 'GET' && path === '/rotas') {
    const route = routes[url.searchParams.get('caminho') ?? ''];
    return route ? json(res, 200, route) : problem(res, 404, 'rota.nao-encontrada', 'Página não encontrada.');
  }

  if (req.method === 'GET' && (match = path.match(/^\/menus\/([a-z0-9-]+)$/))) {
    const menu = menus[match[1]];
    return menu ? json(res, 200, menu) : problem(res, 404, 'menu.nao-encontrado', 'Menu não encontrado.');
  }

  if (req.method === 'GET' && path === '/noticias') return listPosts(res, url.searchParams);

  if (req.method === 'GET' && path === '/noticias/categorias') {
    const categories = [...new Map(posts.map((p) => [p.categoria.slug, p.categoria])).values()];
    return json(res, 200, categories.sort((a, b) => a.nome.localeCompare(b.nome)));
  }

  if (req.method === 'GET' && (match = path.match(/^\/noticias\/([a-z0-9-]+)$/))) {
    const post = posts.find((p) => p.slug === match[1]);
    return post ? json(res, 200, post) : problem(res, 404, 'noticia.nao-encontrada', 'Notícia não encontrada.');
  }

  if (req.method === 'GET' && path === '/banners') {
    const position = url.searchParams.get('posicao');
    if (!['principal', 'rodape', 'modal'].includes(position ?? '')) {
      return problem(res, 400, 'banner.posicao.invalida', 'Informe a posição: principal, rodape ou modal.');
    }
    return json(res, 200, banners[position] ?? []);
  }

  if (req.method === 'GET' && path === '/sitemap') return json(res, 200, sitemap());

  if ((match = path.match(/^\/formularios\/([0-9a-f-]{36})(\/respostas)?$/))) {
    const form = forms[match[1]];
    if (!form) return problem(res, 404, 'formulario.nao-encontrado', 'Formulário não encontrado.');

    if (req.method === 'GET' && !match[2]) return json(res, 200, form);

    if (req.method === 'POST' && match[2]) {
      let submission;
      try {
        submission = JSON.parse(await readBody(req));
      } catch {
        return problem(res, 400, 'formularios.resposta.malformada', 'Corpo inválido.');
      }
      const errors = validateSubmission(form, submission.valores ?? {});
      if (Object.keys(errors).length > 0) {
        return problem(res, 422, 'formularios.resposta.invalida', 'Há campos para corrigir.', { errors });
      }
      console.log('  resposta recebida:', JSON.stringify(submission.valores), 'IP:', req.headers['x-axys-ip-visitante']);
      return json(res, 201, { mensagemSucesso: form.mensagemSucesso });
    }
  }

  problem(res, 404, 'api.recurso.inexistente', 'Recurso não encontrado.');
});

server.listen(PORT, () => console.log(`Mock da API pública em http://localhost:${PORT}/v1`));
