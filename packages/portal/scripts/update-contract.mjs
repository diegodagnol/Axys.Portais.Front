// Copia o contrato da API do repositório do back (Axys.Portais) para o pacote.
// Uso: npm run contract:update -w @axys/portal  (ou AXYS_CONTRACT=<caminho> para outra origem)
// Por padrão, espera o Axys.Portais ao lado deste repositório.
import { copyFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const packageRoot = resolve(import.meta.dirname, '..');
const source = resolve(
  process.env.AXYS_CONTRACT ?? resolve(packageRoot, '../../../Axys.Portais/docs/planejamento/api-publica/openapi-v1.json'),
);
const target = resolve(packageRoot, 'contract/openapi-v1.json');

if (!existsSync(source)) {
  console.error(`Contrato não encontrado em ${source}. Informe o caminho em AXYS_CONTRACT.`);
  process.exit(1);
}

copyFileSync(source, target);
console.log(`Contrato atualizado a partir de ${source}.`);
