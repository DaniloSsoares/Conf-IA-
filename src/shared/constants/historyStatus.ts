import { REPORT_CATEGORIES } from '@/src/shared/constants/reportCategories';

export interface StatusStyleConfig {
  bg: string;
  text: string;
  label: string;
  border: string;
}

export interface RiskStyleConfig {
  bg: string;
  text: string;
  label: string;
  border: string;
}

export function getStatusStyle(status?: string, theme?: any): StatusStyleConfig {
  const primaryColor = theme?.primary || '#3B82F6';
  const lightBlue = theme?.azulClaro || '#60A5FA';

  const STATUS_MAP: Record<string, StatusStyleConfig> = {
    pendente: {
      bg: 'rgba(245, 166, 35, 0.18)',
      text: '#F5A623',
      label: 'Pendente',
      border: '#F5A623',
    },
    validado: {
      bg: 'rgba(34, 197, 94, 0.18)',
      text: '#22C55E',
      label: 'Validado',
      border: '#22C55E',
    },
    rejeitado: {
      bg: 'rgba(239, 68, 68, 0.18)',
      text: '#EF4444',
      label: 'Rejeitado',
      border: '#EF4444',
    },
    resolvido: {
      bg: 'rgba(59, 130, 246, 0.18)',
      text: lightBlue,
      label: 'Resolvido',
      border: primaryColor,
    },
  };

  return (status && STATUS_MAP[status]) || STATUS_MAP.pendente;
}

export function getRiskStyle(riskKey?: string, theme?: any): RiskStyleConfig {
  const secondColor = theme?.second || '#00D1FF';

  const RISK_MAP: Record<string, RiskStyleConfig> = {
    critico: {
      bg: '#DC2626',
      text: '#FFFFFF',
      label: 'ALTO RISCO',
      border: '#DC2626',
    },
    alto: {
      bg: '#EF4444',
      text: '#FFFFFF',
      label: 'ALTO RISCO',
      border: '#EF4444',
    },
    moderado: {
      bg: '#F97316',
      text: '#FFFFFF',
      label: 'MÉDIO RISCO',
      border: '#F97316',
    },
    baixo: {
      bg: '#CA8A04',
      text: '#FFFFFF',
      label: 'ATENÇÃO',
      border: '#EAB308',
    },
  };

  const key = riskKey?.toLowerCase();
  return (
    (key && RISK_MAP[key]) || {
      bg: secondColor,
      text: '#FFFFFF',
      label: 'INFORMATIVO',
      border: secondColor,
    }
  );
}

export function getCategoryMeta(tipo?: string) {
  const found = REPORT_CATEGORIES.find((c) => c.id === tipo);
  return found || { label: tipo || 'Ocorrência', icon: 'help-circle-outline' };
}

export function formatRelativeTime(dateString?: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMin < 1) return 'agora mesmo';
  if (diffMin < 60) return `há ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `há ${diffH} h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return 'ontem';
  if (diffD < 7) return `${diffD} dias atrás`;
  return date.toLocaleDateString('pt-BR');
}