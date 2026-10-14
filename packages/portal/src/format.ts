/**
 * Fuso para exibir datas. O contrato ainda não informa o fuso da instalação (pendência P10 no README);
 * até lá, fica fixo.
 */
export const DEFAULT_TIME_ZONE = 'America/Sao_Paulo';

export function formatDate(isoUtc: string, culture: string): string {
  return new Intl.DateTimeFormat(culture, { dateStyle: 'long', timeZone: DEFAULT_TIME_ZONE }).format(new Date(isoUtc));
}
