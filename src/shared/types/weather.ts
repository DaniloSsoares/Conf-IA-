export interface WeatherData {
  clima_latitude: number;
  clima_longitude: number;
  clima_temperatura_c: number | null;
  clima_precipitacao_mm: number;
  clima_umidade_pct: number | null;
  clima_vento_kmh: number | null;
  clima_fonte: string;
  clima_referente_a: string;
  descricao?: string;
  cidade?: string;
  icone_ionicon?: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap | string;
}