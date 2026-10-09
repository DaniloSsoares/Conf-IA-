import { supabaseConfig } from "@/src/config/supabase";
import { WeatherData } from "../types/weather";

const WEATHERAPI_BASE_URL = "https://api.weatherapi.com/v1/current.json";
const OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

const WEATHERAPI_KEY = process.env.EXPO_PUBLIC_WEATHERAPI_KEY;
const OPENWEATHER_API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;

function getIoniconFromCondition(description: string, isDay: boolean = true): string {
  const desc = description.toLowerCase();
  if (desc.includes('sol') || desc.includes('limpo') || desc.includes('clear') || desc.includes('sunny')) {
    return isDay ? 'sunny' : 'moon';
  }
  if (desc.includes('parcial') || desc.includes('poucas nuvens') || desc.includes('partly')) {
    return isDay ? 'partly-sunny' : 'cloudy-night';
  }
  if (desc.includes('nuven') || desc.includes('nublado') || desc.includes('cloud') || desc.includes('overcast')) {
    return 'cloudy';
  }
  if (desc.includes('tempestade') || desc.includes('trovão') || desc.includes('thunder') || desc.includes('raio')) {
    return 'thunderstorm';
  }
  if (desc.includes('chuva') || desc.includes('chuv') || desc.includes('rain') || desc.includes('garoa') || desc.includes('drizzle')) {
    return 'rainy';
  }
  if (desc.includes('neve') || desc.includes('snow')) {
    return 'snow';
  }
  return 'partly-sunny';
}

export async function getCurrentWeather(
  latitude: number,
  longitude: number
): Promise<WeatherData | null> {
  // 1. Tentar WeatherAPI primeiro se tiver chave
  if (WEATHERAPI_KEY) {
    try {
      const url = `${WEATHERAPI_BASE_URL}?key=${WEATHERAPI_KEY}&q=${latitude},${longitude}&lang=pt`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        const desc = data.current.condition?.text || 'Ensolarado';
        const isDay = data.current.is_day !== 0;
        return {
          clima_latitude: latitude,
          clima_longitude: longitude,
          clima_temperatura_c: Math.round(data.current.temp_c),
          clima_precipitacao_mm: data.current.precip_mm ?? 0,
          clima_umidade_pct: Math.round(data.current.humidity),
          clima_vento_kmh: Math.round(data.current.wind_kph),
          clima_fonte: 'WeatherAPI',
          clima_referente_a: new Date().toISOString(),
          descricao: desc,
          cidade: data.location?.name || data.location?.region || undefined,
          icone_ionicon: getIoniconFromCondition(desc, isDay),
        };
      }
    } catch (err) {
      console.warn("WeatherAPI falhou, tentando fallback OpenWeather:", err);
    }
  }

  // 2. Tentar OpenWeather se chave estiver disponível
  if (OPENWEATHER_API_KEY) {
    try {
      const url = `${OPENWEATHER_BASE_URL}?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=pt_br`;
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        const desc = data.weather[0]?.description || 'Ensolarado';
        // OpenWeather speed é em m/s -> converter para km/h (* 3.6)
        const windKmh = data.wind?.speed ? Math.round(data.wind.speed * 3.6) : 0;
        const rainMm = data.rain?.['1h'] || data.rain?.['3h'] || 0;

        return {
          clima_latitude: data.coord?.lat ?? latitude,
          clima_longitude: data.coord?.lon ?? longitude,
          clima_temperatura_c: Math.round(data.main.temp),
          clima_precipitacao_mm: rainMm,
          clima_umidade_pct: Math.round(data.main.humidity),
          clima_vento_kmh: windKmh,
          clima_fonte: 'OpenWeather',
          clima_referente_a: new Date().toISOString(),
          descricao: desc,
          cidade: data.name || undefined,
          icone_ionicon: getIoniconFromCondition(desc, true),
        };
      }
    } catch (error) {
      console.error('Erro ao obter dados meteorológicos da OpenWeather:', error);
    }
  }

  // 3. Fallback de dados para simulação local se APIs externas não responderem
  return {
    clima_latitude: latitude,
    clima_longitude: longitude,
    clima_temperatura_c: 24,
    clima_precipitacao_mm: 0,
    clima_umidade_pct: 68,
    clima_vento_kmh: 12,
    clima_fonte: 'Estimado',
    clima_referente_a: new Date().toISOString(),
    descricao: 'Ensolarado com poucas nuvens',
    cidade: 'Sua Região',
    icone_ionicon: 'sunny',
  };
}

export async function saveWeatherReading(weather: WeatherData): Promise<void> {
  try {
    const { descricao, cidade, icone_ionicon, ...dbFields } = weather as any;
    const { error } = await supabaseConfig.from("dados_climaticos").insert(dbFields);
    if (error) {
      if (error.code === '42501') {
        console.warn(
          "Aviso RLS (dados_climaticos): Permissão de inserção restrita pelas políticas RLS do Supabase. Para permitir o salvamento, configure a política de INSERT no Supabase."
        );
      } else {
        console.error("Erro ao salvar leitura climática:", error.message || error);
      }
    }
  } catch (error) {
    console.error("Erro ao salvar leitura climática:", error);
  }
}