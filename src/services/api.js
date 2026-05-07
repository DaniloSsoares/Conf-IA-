import axios from 'axios';
import { createClient } from '@supabase/supabase-js';


const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = 'YOUR_SUPABASE_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);


const INMET_API = 'https://api.inmet.gov.br';

const OPENWEATHER_API = 'https://api.openweathermap.org';
const OPENWEATHER_KEY = 'YOUR_OPENWEATHER_KEY';


const NOAA_API = 'https://api.weather.gov';


export const apiClient = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});


apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.message);
    return Promise.reject(error);
  }
);

export const authService = {

  async register(email, password, userData) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });
      if (error) throw error;
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async login(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return { success: true, user: data.user, session: data.session };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },


  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

 
  async getCurrentUser() {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'confia://reset-password',
      });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};


export const weatherService = {

  async getCurrentWeather(latitude, longitude) {
    try {
      const response = await apiClient.get(`${OPENWEATHER_API}/data/2.5/weather`, {
        params: {
          lat: latitude,
          lon: longitude,
          appid: OPENWEATHER_KEY,
          units: 'metric',
          lang: 'pt_br',
        },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  
  async getForecast(latitude, longitude) {
    try {
      const response = await apiClient.get(`${OPENWEATHER_API}/data/2.5/forecast`, {
        params: {
          lat: latitude,
          lon: longitude,
          appid: OPENWEATHER_KEY,
          units: 'metric',
          lang: 'pt_br',
        },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

export const alertService = {

  async getActiveAlerts() {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

 
  async getAlertsByLocation(latitude, longitude, radius = 25) {
    try {
      const { data, error } = await supabase
        .rpc('get_alerts_by_location', {
          lat: latitude,
          lng: longitude,
          radius_km: radius,
        });
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Criar novo alerta
   */
  async createAlert(alertData) {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .insert([alertData])
        .select();
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

// ============================================
// FUNÇÕES DE REPORTES (Community)
// ============================================

export const reportService = {
  /**
   * Criar novo reporte
   */
  async createReport(reportData) {
    try {
      const { data, error } = await supabase
        .from('reports')
        .insert([reportData])
        .select();
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Buscar reportes recentes
   */
  async getRecentReports(limit = 50) {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('verified', true)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Votar em um reporte
   */
  async voteReport(reportId, vote) {
    try {
      const { data, error } = await supabase
        .from('report_votes')
        .insert([{ report_id: reportId, vote }])
        .select();
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

// ============================================
// FUNÇÕES DE USUÁRIO (User Profile)
// ============================================

export const userService = {
  /**
   * Obter perfil do usuário
   */
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Atualizar perfil do usuário
   */
  async updateUserProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', userId)
        .select();
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Salvar preferências de notificação
   */
  async saveNotificationPreferences(userId, preferences) {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
        })
        .select();
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

export default {
  supabase,
  apiClient,
  authService,
  weatherService,
  alertService,
  reportService,
  userService,
};
