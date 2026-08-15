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