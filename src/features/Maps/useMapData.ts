import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Location from "expo-location";
import Toast from "react-native-toast-message";
import { supabaseConfig } from "@/src/config/supabase";
import { Report } from "@/src/shared/types/report";
import { getActiveReports } from "@/src/shared/service/reportService";
import { getProfile } from "@/src/shared/service/profileService";
import { DEFAULT_ALERT_PREFERENCES } from "@/src/shared/constants/alertCategories";
import { useFocusEffect } from "expo-router";
import {
  getCurrentWeather,
  saveWeatherReading,
} from "@/src/shared/service/weatherService";
import { WeatherData } from "@/src/shared/types/weather";

function getEnabledCategories(preferences: any): string[] {
  const merged = { ...DEFAULT_ALERT_PREFERENCES, ...(preferences || {}) };
  return Object.entries(merged)
    .filter(([_, enabled]) => enabled === true)
    .map(([categoria]) => categoria);
}

export function useMapData() {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Controla se é a primeira conexão do WebSocket (para não re-sincronizar no subscribe inicial)
  const isFirstSubscription = useRef(true);

  useEffect(() => {
    const getLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setPermissionDenied(true);
          return;
        }
        let currentPosition = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: currentPosition.coords.latitude,
          longitude: currentPosition.coords.longitude,
        });
      } catch (error) {
        console.error("Erro ao obter localização:", error);
      } finally {
        setLoadingLocation(false);
      }
    };
    getLocation();
  }, []);

  useEffect(() => {
    if (!location) return;
    const fetchWeather = async () => {
      try {
        const weatherData = await getCurrentWeather(
          location.latitude,
          location.longitude,
        );
        if (weatherData) {
          setWeather(weatherData);
          await saveWeatherReading(weatherData);
        }
      } catch (error) {
        console.error("Erro ao obter dados meteorológicos:", error);
      }
    };
    fetchWeather();
  }, [location]);

  const fetchReports = useCallback(async () => {
    const activeReports = await getActiveReports();
    setReports(activeReports);
  }, []);

  const fetchProfile = useCallback(async () => {
    const { data, error } = await supabaseConfig.auth.getUser();
    if (error || !data.user) return;

    const perfilData = await getProfile(data.user.id);
    if (perfilData) {
      setProfile(perfilData);
    }
  }, []);

  // Chaves estáveis derivadas do perfil. O getProfile devolve um objeto novo a cada
  // chamada, então depender de [profile] recriava os callbacks e gerava loop de fetch.
  const profileId: string | undefined = profile?.id;
  const prefsKey = JSON.stringify(profile?.perfil_preferencias_alertas ?? {});
  const categoriasAtivas = useMemo(
    () => getEnabledCategories(JSON.parse(prefsKey)),
    [prefsKey],
  );

  const fetchAlertas = useCallback(async () => {
    if (!profileId) return;

    if (categoriasAtivas.length === 0) {
      setAlerts([]);
      return;
    }

    const { data, error } = await supabaseConfig
      .from("alertas")
      .select("*")
      .eq("alerta_status", "ativo")
      .in("alerta_tipo_ocorrencia", categoriasAtivas);

    if (!error && data) {
      setAlerts(data);
    }
  }, [profileId, categoriasAtivas]);

  // Ref para o foco/polling sempre chamarem a versão mais recente sem
  // precisar colocar fetchAlertas nas dependências do useFocusEffect
  const fetchAlertasRef = useRef(fetchAlertas);
  fetchAlertasRef.current = fetchAlertas;

  // Busca os alertas quando o perfil carrega ou as preferências mudam
  useEffect(() => {
    fetchAlertas();
  }, [fetchAlertas]);

  // Recarrega todos os dados do mapa ao entrar na tela (Foco)
  // E agenda uma atualização automática a cada 10 segundos enquanto a tela estiver visível
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
      fetchReports();
      fetchAlertasRef.current();

      const intervalId = setInterval(() => {
        fetchReports();
        fetchAlertasRef.current();
      }, 10000);

      return () => {
        clearInterval(intervalId);
      };
    }, [fetchProfile, fetchReports]),
  );

  // Realtime — depende das categorias, porque o filtro fica "congelado" dentro
  // do closure no momento em que o canal é criado.
  // Se as preferências mudarem, precisa recriar o canal pra pegar o filtro novo.
  useEffect(() => {
    if (!profileId) return;

    const subscription = supabaseConfig
      .channel("mapa-realtime")

      // --- REPORTES (sem filtro de preferência — comunidade é sempre visível) ---
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "reportes" },
        (payload) => {
          const novoReporte = payload.new as Report;
          setReports((current) => [...current, novoReporte]);
          Toast.show({
            type: "info",
            text1: "Novo reporte comunitário!",
            text2: "Uma nova ocorrência foi registrada próxima a você.",
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "reportes" },
        (payload) => {
          const atualizado = payload.new as Report;
          setReports((current) => {
            if (atualizado.reporte_status === "rejeitado") {
              return current.filter((r) => r.id !== atualizado.id);
            }
            const existe = current.some((r) => r.id === atualizado.id);
            return existe
              ? current.map((r) => (r.id === atualizado.id ? atualizado : r))
              : [...current, atualizado];
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "reportes" },
        (payload) => {
          const idRemovido = payload.old.id;
          setReports((current) => current.filter((r) => r.id !== idRemovido));
        },
      )

      // --- ALERTAS (com filtro de preferência) ---
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "alertas",
          filter: "alerta_status=eq.ativo",
        },
        (payload) => {
          const novoAlerta = payload.new as any;
          if (!categoriasAtivas.includes(novoAlerta.alerta_tipo_ocorrencia))
            return;

          setAlerts((current) => [...current, novoAlerta]);
          Toast.show({
            type: "info",
            text1: "Novo alerta oficial!",
            text2: novoAlerta.alerta_titulo,
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "alertas" },
        (payload) => {
          const atualizado = payload.new as any;
          const relevante = categoriasAtivas.includes(
            atualizado.alerta_tipo_ocorrencia,
          );

          setAlerts((current) => {
            if (atualizado.alerta_status !== "ativo" || !relevante) {
              return current.filter((a) => a.id !== atualizado.id);
            }
            const existe = current.some((a) => a.id === atualizado.id);
            return existe
              ? current.map((a) => (a.id === atualizado.id ? atualizado : a))
              : [...current, atualizado];
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "alertas" },
        (payload) => {
          const idRemovido = payload.old.id;
          setAlerts((current) => current.filter((a) => a.id !== idRemovido));
        },
      )
      .subscribe(async (status) => {
        // Na primeira conexão os dados já foram carregados pelo fetch inicial.
        // A partir da segunda vez que 'SUBSCRIBED' dispara (reconexão após queda
        // de rede), fazemos um re-sync compulsório via HTTP REST para recuperar
        // todos os eventos que o WebSocket perdeu durante a desconexão.
        if (status === "SUBSCRIBED") {
          if (isFirstSubscription.current) {
            isFirstSubscription.current = false;
            return;
          }

          // Re-sync de reportes via REST
          const activeReports = await getActiveReports();
          setReports(activeReports);

          // Re-sync de alertas via REST (reutiliza a lógica com filtro de categorias)
          fetchAlertas();
        }
      });

    return () => {
      supabaseConfig.removeChannel(subscription);
    };
  }, [profileId, categoriasAtivas, fetchAlertas]);

  return {
    location,
    alerts,
    reports,
    profile,
    weather,
    loadingLocation,
    permissionDenied,
  };
}
