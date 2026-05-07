/**
 * EXEMPLOS DE USO - Conf-IA API
 * 
 * Este arquivo contém exemplos de como usar os serviços
 * da API da aplicação Conf-IA
 */

import {
  authService,
  weatherService,
  alertService,
  reportService,
  userService,
} from '../services/api';

// ============================================
// EXEMPLOS DE AUTENTICAÇÃO
// ============================================

/**
 * Exemplo: Registrar novo usuário
 */
export async function exampleRegister() {
  const result = await authService.register(
    'usuario@example.com',
    'senha123',
    {
      name: 'João Silva',
      city: 'São Paulo',
      state: 'SP',
    }
  );

  if (result.success) {
    console.log('Usuário registrado:', result.user);
  } else {
    console.error('Erro no registro:', result.error);
  }
}

/**
 * Exemplo: Fazer login
 */
export async function exampleLogin() {
  const result = await authService.login(
    'usuario@example.com',
    'senha123'
  );

  if (result.success) {
    console.log('Login bem-sucedido');
    console.log('Sessão:', result.session);
  } else {
    console.error('Erro no login:', result.error);
  }
}

/**
 * Exemplo: Obter usuário atual
 */
export async function exampleGetCurrentUser() {
  const result = await authService.getCurrentUser();

  if (result.success) {
    console.log('Usuário atual:', result.user);
  } else {
    console.error('Erro ao obter usuário:', result.error);
  }
}

/**
 * Exemplo: Fazer logout
 */
export async function exampleLogout() {
  const result = await authService.logout();

  if (result.success) {
    console.log('Logout bem-sucedido');
  } else {
    console.error('Erro no logout:', result.error);
  }
}

// ============================================
// EXEMPLOS DE CLIMA
// ============================================

/**
 * Exemplo: Obter clima atual
 */
export async function exampleGetCurrentWeather() {
  // São Paulo, SP - Brasil
  const latitude = -23.5505;
  const longitude = -46.6333;

  const result = await weatherService.getCurrentWeather(latitude, longitude);

  if (result.success) {
    const weather = result.data;
    console.log('Clima atual:');
    console.log(`- Temperatura: ${weather.main.temp}°C`);
    console.log(`- Umidade: ${weather.main.humidity}%`);
    console.log(`- Descrição: ${weather.weather[0].description}`);
  } else {
    console.error('Erro ao obter clima:', result.error);
  }
}

/**
 * Exemplo: Obter previsão
 */
export async function exampleGetForecast() {
  const latitude = -23.5505;
  const longitude = -46.6333;

  const result = await weatherService.getForecast(latitude, longitude);

  if (result.success) {
    console.log('Previsão de clima:');
    result.data.list.forEach((forecast) => {
      console.log(`- ${forecast.dt_txt}: ${forecast.main.temp}°C`);
    });
  } else {
    console.error('Erro ao obter previsão:', result.error);
  }
}

// ============================================
// EXEMPLOS DE ALERTAS
// ============================================

/**
 * Exemplo: Buscar alertas ativos
 */
export async function exampleGetActiveAlerts() {
  const result = await alertService.getActiveAlerts();

  if (result.success) {
    console.log(`Total de alertas ativos: ${result.data.length}`);
    result.data.forEach((alert) => {
      console.log(`- ${alert.title} (${alert.severity})`);
    });
  } else {
    console.error('Erro ao buscar alertas:', result.error);
  }
}

/**
 * Exemplo: Buscar alertas próximos
 */
export async function exampleGetAlertsByLocation() {
  // São Paulo, SP
  const latitude = -23.5505;
  const longitude = -46.6333;
  const radius = 25; // 25 km

  const result = await alertService.getAlertsByLocation(
    latitude,
    longitude,
    radius
  );

  if (result.success) {
    console.log(`Alertas em um raio de ${radius}km:`);
    result.data.forEach((alert) => {
      console.log(`- ${alert.title}: ${alert.description}`);
    });
  } else {
    console.error('Erro ao buscar alertas por localização:', result.error);
  }
}

/**
 * Exemplo: Criar novo alerta
 */
export async function exampleCreateAlert() {
  const alertData = {
    title: 'Chuva Forte Prevista',
    description: 'Chuva intensa esperada para as próximas 6 horas',
    latitude: -23.5505,
    longitude: -46.6333,
    severity: 'alto',
    status: 'active',
    location: 'São Paulo, SP',
  };

  const result = await alertService.createAlert(alertData);

  if (result.success) {
    console.log('Alerta criado:', result.data);
  } else {
    console.error('Erro ao criar alerta:', result.error);
  }
}

// ============================================
// EXEMPLOS DE REPORTES
// ============================================

/**
 * Exemplo: Criar novo reporte
 */
export async function exampleCreateReport() {
  const reportData = {
    user_id: 'uuid-do-usuario',
    report_type: 'alagamento',
    description: 'Alagamento na Av. Paulista próximo à Rua Augusta',
    latitude: -23.5614,
    longitude: -46.6561,
    photo_url: null,
    verified: false,
  };

  const result = await reportService.createReport(reportData);

  if (result.success) {
    console.log('Reporte criado com sucesso');
    console.log('ID do reporte:', result.data[0].id);
  } else {
    console.error('Erro ao criar reporte:', result.error);
  }
}

/**
 * Exemplo: Buscar reportes recentes
 */
export async function exampleGetRecentReports() {
  const result = await reportService.getRecentReports(50);

  if (result.success) {
    console.log(`Total de reportes verificados: ${result.data.length}`);
    result.data.forEach((report) => {
      console.log(`- ${report.report_type}: ${report.description}`);
    });
  } else {
    console.error('Erro ao buscar reportes:', result.error);
  }
}

/**
 * Exemplo: Votar em um reporte
 */
export async function exampleVoteReport() {
  const reportId = 'uuid-do-reporte';
  const vote = 'helpful'; // helpful ou not_helpful

  const result = await reportService.voteReport(reportId, vote);

  if (result.success) {
    console.log('Voto registrado com sucesso');
  } else {
    console.error('Erro ao votar no reporte:', result.error);
  }
}

// ============================================
// EXEMPLOS DE PERFIL DE USUÁRIO
// ============================================

/**
 * Exemplo: Obter perfil do usuário
 */
export async function exampleGetUserProfile() {
  const userId = 'uuid-do-usuario';

  const result = await userService.getUserProfile(userId);

  if (result.success) {
    console.log('Perfil do usuário:', result.data);
  } else {
    console.error('Erro ao obter perfil:', result.error);
  }
}

/**
 * Exemplo: Atualizar perfil do usuário
 */
export async function exampleUpdateUserProfile() {
  const userId = 'uuid-do-usuario';
  const updates = {
    name: 'João Silva Santos',
    phone: '(11) 98765-4321',
    location: 'São Paulo, SP',
  };

  const result = await userService.updateUserProfile(userId, updates);

  if (result.success) {
    console.log('Perfil atualizado com sucesso');
  } else {
    console.error('Erro ao atualizar perfil:', result.error);
  }
}

/**
 * Exemplo: Salvar preferências de notificação
 */
export async function exampleSaveNotificationPreferences() {
  const userId = 'uuid-do-usuario';
  const preferences = {
    notifications_enabled: true,
    weather_alerts: true,
    community_reports: true,
  };

  const result = await userService.saveNotificationPreferences(userId, preferences);

  if (result.success) {
    console.log('Preferências salvas com sucesso');
  } else {
    console.error('Erro ao salvar preferências:', result.error);
  }
}

// ============================================
// EXEMPLO DE USO COMPLETO EM UM COMPONENTE
// ============================================

/**
 * Hook customizado para usar em componentes React
 * 
 * Exemplo de uso em um componente:
 * 
 * function MeuComponente() {
 *   const { alerts, loading, error } = useAlerts();
 *   
 *   if (loading) return <Text>Carregando...</Text>;
 *   if (error) return <Text>Erro: {error}</Text>;
 *   
 *   return (
 *     <FlatList
 *       data={alerts}
 *       renderItem={({ item }) => <Text>{item.title}</Text>}
 *     />
 *   );
 * }
 */
export function useAlerts() {
  const [alerts, setAlerts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    loadAlerts();
  }, []);

  async function loadAlerts() {
    try {
      setLoading(true);
      const result = await alertService.getActiveAlerts();
      if (result.success) {
        setAlerts(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { alerts, loading, error, refetch: loadAlerts };
}

export default {
  // Autenticação
  exampleRegister,
  exampleLogin,
  exampleGetCurrentUser,
  exampleLogout,

  // Clima
  exampleGetCurrentWeather,
  exampleGetForecast,

  // Alertas
  exampleGetActiveAlerts,
  exampleGetAlertsByLocation,
  exampleCreateAlert,

  // Reportes
  exampleCreateReport,
  exampleGetRecentReports,
  exampleVoteReport,

  // Usuário
  exampleGetUserProfile,
  exampleUpdateUserProfile,
  exampleSaveNotificationPreferences,

  // Hooks
  useAlerts,
};
