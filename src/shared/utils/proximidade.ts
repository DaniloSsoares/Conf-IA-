import { haversineKm } from './haversine';

// Alerta tem raio próprio: o centro pode estar fora do raio do usuário e ainda
// assim cobrir a posição dele. A caixa de busca dos alertas é maior por essa margem.
// Limite conhecido: alertas com raio maior que isso, e centro longe, não chegam.
export const MARGEM_ALERTA_KM = 20;

type Ponto = { latitude: number; longitude: number };

// numeric do banco chega como texto: por isso o Number em tudo
function distanciaKm(usuario: Ponto, lat: unknown, lng: unknown): number | null {
  const latN = Number(lat);
  const lngN = Number(lng);
  if (isNaN(latN) || isNaN(lngN)) return null;
  return haversineKm(usuario.latitude, usuario.longitude, latN, lngN);
}

// Reporte: vale se está dentro do raio de notificação do usuário
export function reportePerto(
  usuario: Ponto,
  raioKm: number,
  reporte: { reporte_latitude: unknown; reporte_longitude: unknown },
): boolean {
  const d = distanciaKm(usuario, reporte.reporte_latitude, reporte.reporte_longitude);
  return d !== null && d <= raioKm;
}

// Alerta: vale se o raio dele alcança o raio do usuário (mesma regra do trigger A.8)
export function alertaPerto(
  usuario: Ponto,
  raioKm: number,
  alerta: { alerta_latitude?: unknown; alerta_longitude?: unknown; alerta_raio_km?: unknown },
): boolean {
  const d = distanciaKm(usuario, alerta.alerta_latitude, alerta.alerta_longitude);
  return d !== null && d <= raioKm + Number(alerta.alerta_raio_km ?? 0);
}
