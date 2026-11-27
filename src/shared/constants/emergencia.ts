// Números de emergência do Brasil mostrados na Home. Os termos de uso (seção 2) já
// orientam a ligar para a Defesa Civil e os Bombeiros: aqui eles ficam à mão
export interface NumeroEmergencia {
  numero: string;
  nome: string;
  icone: string;
}

export const NUMEROS_EMERGENCIA: NumeroEmergencia[] = [
  { numero: '199', nome: 'Defesa Civil', icone: 'shield-outline' },
  { numero: '193', nome: 'Bombeiros', icone: 'flame-outline' },
  { numero: '192', nome: 'SAMU', icone: 'medkit-outline' },
];
