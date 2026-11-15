type ErroComCodigo = { code?: string; hint?: string | null } | null | undefined;

export function getErrorMessage(error: ErroComCodigo, fallback = '...'): string {
  switch (error?.hint) {
    case 'rate_limit':
      return "You have already sent 5 reports in the last hour. Please try again later."
  }
  
  switch (error?.code) {
    case '23505': return 'You have already done this.';
    case '42501': return 'You do not have permission to do this.';
  }

  return fallback;
}