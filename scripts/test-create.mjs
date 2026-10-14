// Teste do inicializador: gera um site de cada base fora do monorepo, com o @axys/portal empacotado (npm pack,
// como viria do feed), e roda npm install, astro check e build em cada um. Uso: npm run test:create [-- --keep]
import { execSync } from 'node:child_process';
import { mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const keep = process.argv.includes('--keep');
const workDir = mkdtempSync(join(tmpdir(), 'create-axys-site-'));

const run = (command, cwd) => {
  console.log(`\n> ${command}  (${cwd})`);
  execSync(command, { cwd, stdio: 'inherit' });
};

try {
  run(`npm pack -w @axys/portal --pack-destination "${workDir}"`, repoRoot);
  const tarball = join(workDir, readdirSync(workDir).find((file) => file.endsWith('.tgz')));
  const portalSpec = `file:${tarball.replaceAll('\\', '/')}`;

  for (const base of ['completa', 'minima']) {
    const name = `site-${base}`;
    run(`node "${join(repoRoot, 'packages', 'create-axys-site', 'index.mjs')}" ${name} --base ${base} --portal "${portalSpec}" --yes`, workDir);
    const siteDir = join(workDir, name);
    run('npm install --no-audit --no-fund', siteDir);
    run('npm run build', siteDir); // astro check + astro build
  }
  console.log(`\nOk: as bases completa e minima passaram em astro check e build.${keep ? ` Sites em ${workDir}` : ''}`);
} finally {
  if (!keep) rmSync(workDir, { recursive: true, force: true });
}
