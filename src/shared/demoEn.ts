// DEMO (pitch em inglês) — só existe na branch demo/pitch-en, nunca vai para a main.
// Textos que vêm prontos do banco (gerados pelo trigger do alerta colaborativo)
// são traduzidos na hora de exibir, sem mexer no banco.
const DB_EN: Record<string, string> = {
  'Ocorrência confirmada pela comunidade': 'Incident confirmed by the community',
  'Reporte confirmado por moradores da região.': 'Report confirmed by local residents.',
};

export function demoEn(texto?: string | null): string | undefined {
  if (!texto) return undefined;
  return DB_EN[texto] ?? texto;
}
