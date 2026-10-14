// Copia o contrato da API do repositório do back (Axys.Portais) para este projeto.
// Uso: npm run contract:update  (ou AXYS_CONTRACT=<caminho> para outra origem)
import { copyFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const source = resolve(process.env.AXYS_CONTRACT ?? '../Axys.Portais/docs/planejamento/api-publica/openapi-v1.json');
const target = resolve('contract/openapi-v1.json');

if (!existsSync(source)) {
  console.error(`Contrato não encontrado em ${source}. Informe o caminho em AXYS_CONTRACT.`);
  process.exit(1);
}

copyFileSync(source, target);
console.log(`Contrato atualizado a partir de ${source}.`);
