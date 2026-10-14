// Gera o site a partir do template (o próprio sites/demo) e aplica a base escolhida.
import { copyFileSync, cpSync, existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { PACKAGE_ROOT, copyFilter, resolveTemplate } from './template.mjs';

export const BASES = {
  completa: 'Completa: home com carrossel e seções de exemplo, páginas do CMS, blog, contato e SEO',
  minima: 'Mínima: layout, páginas do CMS, blog, contato e SEO; home só com título e últimas notícias',
};

/** O que a base mínima tira do demo (caminhos relativos ao site). */
const MINIMA_REMOVED = [
  'src/components/Hero.astro',
  'src/components/Faq.astro',
  'src/scripts',
  'public/mock',
];

/** Arquivos com trechos marcados que só existem na base completa. */
const MARKED_FILES = ['src/styles/wireframe.css'];
const MARKED_REGION = /^\/\* create-axys-site: início do trecho só da base completa \*\/\r?\n[\s\S]*?^\/\* create-axys-site: fim do trecho \*\/\r?\n(\r?\n)?/gm;
const MARKER_LINE = /^\/\* create-axys-site: (início do trecho só da base completa|fim do trecho) \*\/\r?\n(\r?\n)?/gm;

/** Nome de pacote npm válido (minúsculas, números, `-`, `.`, `_`; sem começar por `.` ou `_`). */
export function validateName(name) {
  if (!name) return 'Informe o nome do site.';
  if (name.length > 214) return 'O nome pode ter no máximo 214 caracteres.';
  if (!/^[a-z0-9][a-z0-9._-]*$/.test(name)) {
    return 'Use só letras minúsculas, números, "-", "." e "_", começando por letra ou número (ex.: site-cliente).';
  }
  return null;
}

/**
 * @param {{ targetDir: string, name: string, base: keyof typeof BASES, portalSpec?: string }} options
 *   `portalSpec`: versão do @axys/portal no package.json gerado (padrão: `^` + versão do pacote no template).
 */
export function createSite({ targetDir, name, base, portalSpec }) {
  if (!(base in BASES)) throw new Error(`Base desconhecida: ${base}. Use ${Object.keys(BASES).join(' ou ')}.`);
  const nameError = validateName(name);
  if (nameError) throw new Error(nameError);
  if (existsSync(targetDir) && readdirSync(targetDir).length > 0) {
    throw new Error(`A pasta ${targetDir} já existe e não está vazia.`);
  }

  const { siteDir, mockDir, portalVersion } = resolveTemplate();
  cpSync(siteDir, targetDir, { recursive: true, filter: copyFilter });
  cpSync(mockDir, join(targetDir, 'mock'), { recursive: true, filter: copyFilter });

  // O npm não publica .gitignore: os arquivos de apoio vão sem o ponto e ganham o nome final aqui.
  const files = join(PACKAGE_ROOT, 'files');
  copyFileSync(join(files, 'gitignore'), join(targetDir, '.gitignore'));
  copyFileSync(join(files, 'nvmrc'), join(targetDir, '.nvmrc'));
  const readme = readFileSync(join(files, 'README.md'), 'utf8')
    .replaceAll('{{name}}', name)
    .replaceAll('{{base}}', BASES[base]);
  writeFileSync(join(targetDir, 'README.md'), readme);

  writePackageJson(targetDir, name, portalSpec ?? `^${portalVersion}`);

  if (base === 'minima') {
    for (const path of MINIMA_REMOVED) rmSync(join(targetDir, path), { recursive: true, force: true });
    cpSync(join(PACKAGE_ROOT, 'bases', 'minima'), targetDir, { recursive: true });
  }
  for (const path of MARKED_FILES) {
    const file = join(targetDir, path);
    const content = readFileSync(file, 'utf8');
    writeFileSync(file, content.replace(base === 'minima' ? MARKED_REGION : MARKER_LINE, ''));
  }

  // Pronto para `npm run dev` contra o mock; em servidores, as variáveis vêm do ambiente.
  copyFileSync(join(targetDir, '.env.example'), join(targetDir, '.env'));
}

function writePackageJson(targetDir, name, portalSpec) {
  const file = join(targetDir, 'package.json');
  const pkg = JSON.parse(readFileSync(file, 'utf8'));
  const site = {
    name,
    version: '0.1.0',
    private: true,
    type: 'module',
    description: `Site público ${name} sobre o @axys/portal.`,
    engines: pkg.engines,
    scripts: { ...pkg.scripts, mock: 'node mock/server.mjs' },
    dependencies: { ...pkg.dependencies, '@axys/portal': portalSpec },
    devDependencies: pkg.devDependencies,
  };
  writeFileSync(file, `${JSON.stringify(site, null, 2)}\n`);
}
