import { AlertPreferences } from "../types/profile";

export const ALERT_CATEGORIES: {
  key: keyof AlertPreferences;
  label: string;
  icon: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap;
}[] = [
    { key: 'alagamento', label: 'Alagamento', icon: 'water' },
    { key: 'deslizamento', label: 'Deslizamento', icon: 'warning' },
    { key: 'bloqueio_via', label: 'Bloqueio de via', icon: 'car' },
    { key: 'fogo_em_mata', label: 'Fogo em mata', icon: 'flame' },
    { key: 'queda_de_galho', label: 'Queda de galho', icon: 'leaf' },
    { key: 'falta_de_luz', label: 'Falta de luz', icon: 'flash-off' },
    { key: 'outro', label: 'Outros', icon: 'ellipsis-horizontal' },
  ];

export const DEFAULT_ALERT_PREFERENCES: AlertPreferences = {
  alagamento: true,
  deslizamento: true,
  bloqueio_via: true,
  fogo_em_mata: true,
  queda_de_galho: true,
  falta_de_luz: true,
  outro: true,
};

// O JSON de preferências salvo no perfil pode ter chaves antigas que não existem mais
// no enum tipo_ocorrencia do banco (ex.: "chuva", "acidente"). Mandar uma delas numa
// consulta derruba a consulta inteira (erro 22P02 do Postgres). Por isso a lista
// oficial do app (ALERT_CATEGORIES) é a fonte da verdade, nunca as chaves do JSON.
export function normalizeAlertPreferences(raw: unknown): AlertPreferences {
  const salvas = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const preferencias = { ...DEFAULT_ALERT_PREFERENCES };
  for (const { key } of ALERT_CATEGORIES) {
    if (typeof salvas[key] === 'boolean') preferencias[key] = salvas[key] as boolean;
  }
  return preferencias;
}

// Categorias ligadas, prontas para usar num filtro .in() da consulta de alertas
export function getEnabledCategories(raw: unknown): (keyof AlertPreferences)[] {
  const preferencias = normalizeAlertPreferences(raw);
  return ALERT_CATEGORIES.map((c) => c.key).filter((key) => preferencias[key]);
}
