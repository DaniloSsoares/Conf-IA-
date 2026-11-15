import { REPORT_CATEGORIES } from './reportCategories';

const HORA_MS = 60 * 60 * 1000;
const VALIDADE_PADRAO_HORAS = 6;

export const VALIDADE_MAXIMA_HORAS = Math.max(
  ...REPORT_CATEGORIES.map((c) => c.validadeHoras),
);

export function reporteAindaValido(tipo: string | null | undefined, criadoEm: string): boolean {
  const horas =
    REPORT_CATEGORIES.find((c) => c.id === tipo)?.validadeHoras ?? VALIDADE_PADRAO_HORAS;
  const idadeMs = Date.now() - new Date(criadoEm).getTime();
  return idadeMs < horas * HORA_MS;
}
