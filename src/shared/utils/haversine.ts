export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export interface BoundingBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}
// Quadrado que contém o círculo de raio `raioKm` em volta do ponto.
// Serve para filtrar no banco; o recorte fino do círculo continua com haversineKm.
export function boundingBox(
  lat: number,
  lng: number,
  raioKm: number,
): BoundingBox {
  const deltaLat = raioKm / 111;
  const deltaLng = raioKm / (111 * Math.cos((lat * Math.PI) / 180));

  return {
    minLat: lat - deltaLat,
    maxLat: lat + deltaLat,
    minLng: lng - deltaLng,
    maxLng: lng + deltaLng,
  };
}
