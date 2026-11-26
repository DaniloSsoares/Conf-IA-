// Quantos itens o Histórico busca por vez. Sem limite, a tela baixava todas as
// notificações (com o alerta junto) e todos os reportes do usuário a cada foco
export const TAMANHO_PAGINA = 20;

// Faixa de linhas da página (o .range do Supabase inclui as duas pontas)
export function faixaDaPagina(pagina: number): [number, number] {
  const inicio = pagina * TAMANHO_PAGINA;
  return [inicio, inicio + TAMANHO_PAGINA - 1];
}
