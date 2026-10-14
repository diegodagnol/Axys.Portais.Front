import { createHmac, timingSafeEqual } from 'node:crypto';
import { ActionError } from 'astro:actions';
import { AXYS_FORM_SECRET } from 'astro:env/server';
import { api } from '../api/client';

/** Campos de controle: nunca vão para a API como resposta. */
export const CONTROL_FIELDS = {
  form: '_axys_form',
  timestamp: '_axys_timestamp',
  page: '_axys_page',
  honeypot: '_axys_honeypot',
} as const;

const CONTROL_PREFIX = '_axys_';
const MIN_FILL_TIME_MS = 3_000;
const TIMESTAMP_TTL_MS = 2 * 60 * 60 * 1_000;

export type SubmissionResult =
  | { accepted: true }
  | { accepted: false; message: string; errors: Record<string, string[]>; values: Record<string, string[]> };

/** O que o envio precisa do contexto da action (sem depender do tipo interno do Astro). */
export interface SubmissionContext {
  locals: App.Locals;
  clientAddress: string;
  request: Request;
}

const sign = (text: string) => createHmac('sha256', AXYS_FORM_SECRET).update(text).digest('base64url');

/** Carimbo de tempo assinado pelo site: barra robô que envia rápido demais ou reaproveita formulário antigo. */
export function createTimestamp(formId: string, now = Date.now()): string {
  return `${now}.${sign(`${formId}.${now}`)}`;
}

export function isTimestampValid(timestamp: string, formId: string, now = Date.now()): boolean {
  const [moment, signature] = timestamp.split('.');
  if (!moment || !signature) {
    return false;
  }
  const expected = Buffer.from(sign(`${formId}.${moment}`));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return false;
  }
  const elapsed = now - Number(moment);
  return elapsed >= MIN_FILL_TIME_MS && elapsed <= TIMESTAMP_TTL_MS;
}

const text = (value: FormDataEntryValue | null) => (typeof value === 'string' ? value.trim() : '');

function collectValues(data: FormData): Record<string, string[]> {
  const values: Record<string, string[]> = {};
  for (const [key, value] of data) {
    if (key.startsWith(CONTROL_PREFIX) || typeof value !== 'string') {
      continue;
    }
    (values[key] ??= []).push(value);
  }
  return values;
}

/** Um valor vai como texto; vários (múltipla escolha), como lista — formato do contrato. */
const toPayload = (values: Record<string, string[]>) =>
  Object.fromEntries(Object.entries(values).map(([key, list]) => [key, list.length === 1 ? list[0]! : list]));

/**
 * Envio pela Astro Action (ADR-020 D4): mesmo domínio, chave da API no servidor, funciona sem JavaScript.
 * Erro de validação volta como dado (para mostrar ao lado de cada campo); o resto vira `ActionError`.
 */
export async function processFormSubmission(data: FormData, context: SubmissionContext): Promise<SubmissionResult> {
  const formId = text(data.get(CONTROL_FIELDS.form));
  if (!formId) {
    throw new ActionError({ code: 'BAD_REQUEST', message: 'Formulário não informado.' });
  }

  // Campo isca preenchido: é robô. Finge sucesso para não ensinar o que foi detectado.
  if (text(data.get(CONTROL_FIELDS.honeypot))) {
    return { accepted: true };
  }

  if (!isTimestampValid(text(data.get(CONTROL_FIELDS.timestamp)), formId)) {
    throw new ActionError({
      code: 'BAD_REQUEST',
      message: 'O formulário expirou. Recarregue a página e envie de novo.',
    });
  }

  const values = collectValues(data);
  const { data: accepted, error, response } = await api.POST('/formularios/{id}/respostas', {
    params: {
      path: { id: formId },
      header: {
        'X-Axys-Host': context.locals.host,
        'X-Axys-Ip-Visitante': context.clientAddress,
        'X-Axys-Navegador': (context.request.headers.get('user-agent') ?? '').slice(0, 300),
      },
    },
    body: { valores: toPayload(values), paginaOrigem: text(data.get(CONTROL_FIELDS.page)) || null },
  });

  if (accepted) {
    return { accepted: true };
  }
  if (response.status === 422 && error && 'errors' in error) {
    return { accepted: false, message: error.title, errors: error.errors, values };
  }
  if (response.status === 429) {
    throw new ActionError({ code: 'TOO_MANY_REQUESTS', message: 'Muitos envios em pouco tempo. Aguarde alguns minutos e tente de novo.' });
  }
  if (response.status === 404) {
    throw new ActionError({ code: 'NOT_FOUND', message: 'Este formulário não está mais disponível.' });
  }
  throw new Error(`A API respondeu ${response.status} ao enviar o formulário.`);
}
