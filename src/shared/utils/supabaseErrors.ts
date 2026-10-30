type ErroComCodigo = { code?: string; hint?: string | null } | null | undefined;

export function getErrorMessage(error: ErroComCodigo, fallback = '...'): string {
  switch (error?.hint) {
    case 'rate_limit':
      return "Você já enviou 5 reportes na última hora. Tente novamente mais tarde."
  }
  
  switch (error?.code) {
    case '23505': return 'Você já realizou esta ação.';
    case '42501': return 'Você não tem permissão para fazer isso.';
  }

  return fallback;
}