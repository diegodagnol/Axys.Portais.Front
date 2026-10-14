// Onde está o template: no pacote publicado, em template/ (copiado no prepack); no monorepo, direto do sites/demo e
// do mock, para o inicializador nunca divergir do demo.
import { existsSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const PACKAGE_ROOT = fileURLToPath(new URL('..', import.meta.url));
export const BUNDLED_TEMPLATE = join(PACKAGE_ROOT, 'template');

/** Pastas e arquivos do demo que não vão para o site gerado (gerados, locais ou com segredo). */
const EXCLUDED = new Set(['node_modules', 'dist', '.astro', '.env', '.vercel', '.netlify']);

/** Filtro de cópia: deixa de fora os itens de EXCLUDED, mas mantém `.env.example`. */
export const copyFilter = (source) => !EXCLUDED.has(basename(source));

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));

/**
 * @returns {{ siteDir: string, mockDir: string, portalVersion: string }}
 */
export function resolveTemplate() {
  const manifest = join(BUNDLED_TEMPLATE, 'template.json');
  if (existsSync(manifest)) {
    const { portalVersion } = readJson(manifest);
    return { siteDir: join(BUNDLED_TEMPLATE, 'site'), mockDir: join(BUNDLED_TEMPLATE, 'mock'), portalVersion };
  }

  const repoRoot = join(PACKAGE_ROOT, '..', '..');
  const siteDir = join(repoRoot, 'sites', 'demo');
  if (!existsSync(siteDir)) {
    throw new Error('Template não encontrado: rode "npm run sync-template" no pacote create-axys-site.');
  }
  return {
    siteDir,
    mockDir: join(repoRoot, 'mock'),
    portalVersion: readJson(join(repoRoot, 'packages', 'portal', 'package.json')).version,
  };
}
