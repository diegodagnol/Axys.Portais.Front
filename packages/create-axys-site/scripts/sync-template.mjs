// Copia o sites/demo e o mock para template/, que vai no pacote publicado (roda no prepack).
// No monorepo não é preciso: o inicializador lê direto do demo quando template/ não existe.
import { cpSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { BUNDLED_TEMPLATE, copyFilter, resolveTemplate } from '../src/template.mjs';

rmSync(BUNDLED_TEMPLATE, { recursive: true, force: true });
const { siteDir, mockDir, portalVersion } = resolveTemplate();

cpSync(siteDir, join(BUNDLED_TEMPLATE, 'site'), { recursive: true, filter: copyFilter });
cpSync(mockDir, join(BUNDLED_TEMPLATE, 'mock'), { recursive: true, filter: copyFilter });
writeFileSync(join(BUNDLED_TEMPLATE, 'template.json'), `${JSON.stringify({ portalVersion }, null, 2)}\n`);

console.log(`Template copiado do sites/demo (@axys/portal ${portalVersion}).`);
