#!/usr/bin/env node
// npm create axys-site@latest <nome> [-- --base completa|minima]
import { resolve } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { parseArgs } from 'node:util';
import { BASES, createSite, validateName } from './src/create-site.mjs';

const HELP = `Uso: npm create axys-site@latest <nome> [-- opções]

Opções:
  -b, --base <base>     completa (padrão) ou minima
      --portal <versão> versão do @axys/portal no package.json (padrão: a do template)
  -y, --yes             não pergunta nada: usa os padrões
  -h, --help            mostra esta ajuda

Bases:
  completa  ${BASES.completa}
  minima    ${BASES.minima}`;

const BASE_ALIASES = { completa: 'completa', minima: 'minima', 'mínima': 'minima', 1: 'completa', 2: 'minima' };

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      base: { type: 'string', short: 'b' },
      portal: { type: 'string' },
      yes: { type: 'boolean', short: 'y' },
      help: { type: 'boolean', short: 'h' },
    },
  });
  if (values.help) {
    console.log(HELP);
    return;
  }

  const interactive = process.stdin.isTTY && !values.yes;
  const prompt = interactive ? createInterface({ input: process.stdin, output: process.stdout }) : null;
  try {
    let target = positionals[0];
    while (!target && prompt) {
      target = (await prompt.question('Nome do site (pasta e pacote npm): ')).trim();
    }
    if (!target) throw new Error('Informe o nome do site: npm create axys-site@latest <nome>');

    // O nome do pacote é o último trecho do caminho (permite gerar em outra pasta).
    const name = target.replace(/[\\/]+$/, '').split(/[\\/]/).pop();
    const nameError = validateName(name);
    if (nameError) throw new Error(nameError);

    let base = values.base ? BASE_ALIASES[values.base.toLowerCase()] : undefined;
    if (values.base && !base) throw new Error(`Base desconhecida: ${values.base}. Use completa ou minima.`);
    if (!base && prompt) {
      console.log(`\nBases:\n  1) ${BASES.completa}\n  2) ${BASES.minima}`);
      const answer = (await prompt.question('Qual base? [1] ')).trim().toLowerCase();
      base = answer ? BASE_ALIASES[answer] : 'completa';
      if (!base) throw new Error(`Base desconhecida: ${answer}. Use 1 (completa) ou 2 (minima).`);
    }
    base ??= 'completa';

    const targetDir = resolve(target);
    createSite({ targetDir, name, base, portalSpec: values.portal });

    console.log(`
Site "${name}" criado em ${targetDir} (base ${base}).

Próximos passos:
  cd ${target}
  npm install
  npm run mock    # API de exemplo em http://localhost:4010/v1 (deixe rodando)
  npm run dev     # site em http://localhost:4321

O .env já aponta para o mock; para a API de verdade, ajuste AXYS_API_URL e AXYS_API_KEY.`);
  } finally {
    prompt?.close();
  }
}

main().catch((error) => {
  console.error(`\n${error.message}`);
  process.exit(1);
});
