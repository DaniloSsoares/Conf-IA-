import * as Location from 'expo-location';

// 3 casas decimais (~110 m): basta para raio em km e não guarda o endereço exato (LGPD)
export function arredondarCoordenada(n: number): number {
  return Math.round(n * 1000) / 1000;
}

const UF_POR_NOME: Record<string, string> = {
  'acre': 'AC', 'alagoas': 'AL', 'amapa': 'AP', 'amazonas': 'AM', 'bahia': 'BA',
  'ceara': 'CE', 'distrito federal': 'DF', 'espirito santo': 'ES', 'goias': 'GO',
  'maranhao': 'MA', 'mato grosso': 'MT', 'mato grosso do sul': 'MS', 'minas gerais': 'MG',
  'para': 'PA', 'paraiba': 'PB', 'parana': 'PR', 'pernambuco': 'PE', 'piaui': 'PI',
  'rio de janeiro': 'RJ', 'rio grande do norte': 'RN', 'rio grande do sul': 'RS',
  'rondonia': 'RO', 'roraima': 'RR', 'santa catarina': 'SC', 'sao paulo': 'SP',
  'sergipe': 'SE', 'tocantins': 'TO',
};

// O geocoder do celular devolve o estado por extenso no Android ("São Paulo")
// e às vezes já em sigla no iOS ("SP"). Padroniza para a sigla.
function siglaEstado(regiao: string | null): string | null {
  if (!regiao) return null;
  const limpo = regiao.trim();
  if (/^[A-Za-z]{2}$/.test(limpo)) return limpo.toUpperCase();
  const semAcento = limpo.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  return UF_POR_NOME[semAcento] ?? limpo;
}

// Coordenada → cidade e estado, pelo geocoder do próprio celular (sem API paga).
// Devolve null se não achar nada: quem chama segue sem preencher, não é erro.
export async function buscarCidadeEstado(
  latitude: number,
  longitude: number,
): Promise<{ cidade: string | null; estado: string | null } | null> {
  try {
    const [endereco] = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (!endereco) return null;
    // No Android, cidades grandes às vezes vêm só em subregion (city fica null)
    const cidade = endereco.city ?? endereco.subregion ?? null;
    const estado = siglaEstado(endereco.region);
    if (!cidade && !estado) return null;
    return { cidade, estado };
  } catch (error) {
    console.warn('Não foi possível descobrir a cidade pela localização:', error);
    return null;
  }
}
