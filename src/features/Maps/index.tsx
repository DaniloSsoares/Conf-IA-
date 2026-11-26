import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import MapView, { Callout, Circle, Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { haversineKm } from '@/src/shared/utils/haversine';
import { useAppTheme } from '@/src/shared/constants/theme';
import { Load } from '@/src/components/ui';
import { Report } from '@/src/shared/types/report';
import { NivelRisco } from '@/src/shared/types/notification';
import { REPORT_CATEGORIES } from '@/src/shared/constants/reportCategories';
import { RISK_LABEL, getNivelRiscoReporte } from '@/src/shared/constants/nivelRisco';
import getStyles, { darkMapStyle } from './styles';
import { useMapData } from './useMapData';

type FilterType = 'todos' | 'alertas' | 'reportes';
type IconeIonicons = keyof typeof Ionicons.glyphMap;


function getOrigemAlerta(origem?: string | null): { texto: string; icone: IconeIonicons } {
    if (origem === 'colaborativo') {
        return { texto: 'Alerta da comunidade', icone: 'people' };
    }
    return { texto: 'Alerta Oficial', icone: 'shield-checkmark' };
}

export default function MapScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const mapRef = useRef<MapView>(null);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [filterType, setFilterType] = useState<FilterType>('todos');
    // No Android, tracksViewChanges ligado redesenha cada marcador sem parar.
    // Fica ligado só por 500 ms quando a lista muda (tempo de desenhar), depois congela
    const [marcadoresProntos, setMarcadoresProntos] = useState(false);

    const { theme, isDarkMode } = useAppTheme();
    // StyleSheet.create só roda de novo quando o tema muda, não a cada render
    const styles = useMemo(() => getStyles(theme), [theme]);

    const {
        location,
        raioKm,
        alerts,
        reports,
        weather,
        weatherLoaded,
        loadingLocation,
        permissionDenied,
        semConexao,
    } = useMapData();

    const handleOpenAlerta = (alerta: any) => {
        router.push({
            pathname: '/(screens)/ViewHistory',
            params: { type: 'alerta', id: alerta.id }
        });
    };

    const handleOpenReport = (report: Report) => {
        router.push({
            pathname: '/(screens)/ViewHistory',
            params: { type: 'reporte', id: report.id }
        });
    };

    const handleRecenterMap = () => {
        if (location && mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.04,
                longitudeDelta: 0.04,
            }, 1000);
        }
    };

    const getIconStyle = (nivelRisco: string) => {
        switch (nivelRisco?.toLowerCase()) {
            case 'alto':
            case 'critico':
                return styles.iconHighRisk;
            case 'moderado':
                return styles.iconMediumRisk;
            default:
                return styles.iconLowRisk;
        }
    };

    const getRiskBadgeStyle = (nivelRisco: string) => {
        switch (nivelRisco?.toLowerCase()) {
            case 'alto':
            case 'critico':
                return [styles.calloutRiskBadge, styles.riskBadgeHigh];
            case 'moderado':
                return [styles.calloutRiskBadge, styles.riskBadgeMedium];
            default:
                return [styles.calloutRiskBadge, styles.riskBadgeLow];
        }
    };

    const getRiskTextStyle = (nivelRisco: string) => {
        switch (nivelRisco?.toLowerCase()) {
            case 'alto':
            case 'critico':
                return [styles.riskBadgeText, styles.riskBadgeTextHigh];
            case 'moderado':
                return [styles.riskBadgeText, styles.riskBadgeTextMedium];
            default:
                return [styles.riskBadgeText, styles.riskBadgeTextLow];
        }
    };

    // O raio vem do hook: é o mesmo usado para buscar no banco
    const raioMetros = raioKm * 1000;

    // Filtra só o que está dentro do raio do usuário (o Circle é apenas visual)
    const filteredAlerts = useMemo(() => {
        if (!location) return alerts;
        return alerts.filter((a) => {
            const lat = Number(a.alerta_latitude);
            const lng = Number(a.alerta_longitude);
            // Alerta tem raio próprio: aparece se o raio dele alcança o raio do usuário,
            // mesmo com o centro fora (numeric chega como texto, por isso o Number)
            const raioAlertaKm = Number(a.alerta_raio_km ?? 0);
            return !isNaN(lat) && !isNaN(lng)
                && haversineKm(location.latitude, location.longitude, lat, lng) <= raioKm + raioAlertaKm;
        });
    }, [alerts, location, raioKm]);

    // Reporte que já virou alerta da comunidade: o alerta fica exatamente no mesmo ponto,
    // um marcador escondia o outro e o filtro contava os dois. Mostra só o alerta
    const reportesComAlerta = useMemo(
        () => new Set(alerts.map((a) => a.alerta_reporte_id).filter(Boolean)),
        [alerts],
    );

    const filteredReports = useMemo(() => {
        const semAlerta = reports.filter((r) => !reportesComAlerta.has(r.id));
        if (!location) return semAlerta;
        return semAlerta.filter((r) => {
            const lat = Number(r.reporte_latitude);
            const lng = Number(r.reporte_longitude);
            return !isNaN(lat) && !isNaN(lng)
                && haversineKm(location.latitude, location.longitude, lat, lng) <= raioKm;
        });
    }, [reports, location, raioKm, reportesComAlerta]);
    
    useEffect(() => {
        setMarcadoresProntos(false);
        const t = setTimeout(() => setMarcadoresProntos(true), 500);
        return () => clearTimeout(t);
    }, [filteredAlerts, filteredReports, filterType]);

    // A primeira posição pode vir do cache do celular (até 5 min). Quando a posição exata
    // chega e é diferente, a câmera vai até ela UMA vez. Depois disso, o deslocamento
    // (watchPosition) move só o ponto azul: puxar a câmera enquanto a pessoa olha outra
    // parte do mapa atrapalharia. Para voltar, o botão de centralizar
    const primeiraPosicao = useRef<typeof location>(null);
    const cameraAjustada = useRef(false);
    useEffect(() => {
        if (!location) return;
        if (!primeiraPosicao.current) {
            primeiraPosicao.current = location;
            return;
        }
        if (!cameraAjustada.current && location !== primeiraPosicao.current) {
            cameraAjustada.current = true;
            mapRef.current?.animateToRegion({
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            }, 800);
        }
    }, [location]);

    if (loadingLocation) {
        return (
            <View style={styles.loadingContainer}>
                <View style={styles.loadingCard}>
                    <Load />
                    <Text style={styles.loadingText}>Obtendo sua localização no mapa...</Text>
                </View>
            </View>
        );
    }

    if (permissionDenied || !location) {
        return (
            <View style={styles.loadingContainer}>
                <View style={styles.loadingCard}>
                    <Ionicons name="location-outline" size={40} color={theme.primary} />
                    <Text style={styles.loadingText}>
                        {permissionDenied
                            ? 'Permissão de localização negada. Habilite-a nas configurações para visualizar o mapa.'
                            : 'Não foi possível obter sua localização.'}
                    </Text>
                </View>
            </View>
        );
    }

    const showAlerts = filterType === 'todos' || filterType === 'alertas';
    const showReports = filterType === 'todos' || filterType === 'reportes';
    const origemSelecionada = getOrigemAlerta(selectedItem?.alerta_origem);

    return (
        <View style={styles.container}>
            <View style={[styles.topOverlay, { top: Math.max(insets.top + 8, 16) }]}>
                <View style={styles.headerCard}>
                    <View style={styles.headerTitleRow}>
                        <View style={styles.headerTitleContainer}>
                            <View style={styles.statusDot} />
                            <Text style={styles.headerTitle}>Mapa de Monitoramento</Text>
                        </View>
                        <View style={styles.radiusBadge}>
                            <Text style={styles.radiusBadgeText}>Raio: {raioKm}km</Text>
                        </View>
                    </View>

                    {weather && (
                        <View style={styles.weatherCard}>
                            <View style={styles.weatherMain}>
                                <Ionicons
                                    name={(weather.icone_ionicon as any) || 'partly-sunny-outline'}
                                    size={20}
                                    color={theme.primary}
                                />
                                <Text style={styles.weatherTempText}>{weather.clima_temperatura_c}°C</Text>
                                {weather.descricao ? (
                                    <Text style={styles.weatherDescText}>{weather.descricao}</Text>
                                ) : null}
                            </View>
                            <View style={styles.weatherStats}>
                                {weather.clima_umidade_pct !== null && (
                                    <View style={styles.weatherStatItem}>
                                        <Ionicons name="water-outline" size={13} color={theme.subtext} />
                                        <Text style={styles.weatherStatText}>{weather.clima_umidade_pct}%</Text>
                                    </View>
                                )}
                                {weather.clima_vento_kmh !== null && (
                                    <View style={styles.weatherStatItem}>
                                        <Ionicons name="swap-horizontal-outline" size={13} color={theme.subtext} />
                                        <Text style={styles.weatherStatText}>{weather.clima_vento_kmh} km/h</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    )}

                    {/* Tentou carregar e nenhuma API respondeu: avisa em vez de inventar um clima */}
                    {weatherLoaded && !weather && (
                        <View style={styles.weatherCard}>
                            <View style={styles.weatherMain}>
                                <Ionicons name="cloud-offline-outline" size={20} color={theme.subtext} />
                                <Text style={styles.weatherDescText}>Clima indisponível</Text>
                            </View>
                        </View>
                    )}

                    {/* A última atualização falhou: o que está no mapa pode estar desatualizado.
                        Sem este aviso, "0 ocorrências" pareceria "nenhum perigo" */}
                    {semConexao && (
                        <View style={[styles.weatherCard, styles.avisoSemConexao]}>
                            <View style={styles.weatherMain}>
                                <Ionicons name="warning-outline" size={18} color={theme.alertRed} />
                                <Text style={[styles.weatherDescText, styles.avisoSemConexaoTexto]}>
                                    Sem conexão: o mapa pode estar desatualizado
                                </Text>
                            </View>
                        </View>
                    )}

                    <View style={styles.filtersRow}>
                        <TouchableOpacity
                            style={[styles.filterChip, filterType === 'todos' && styles.filterChipActive]}
                            onPress={() => setFilterType('todos')}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.filterChipText, filterType === 'todos' && styles.filterChipTextActive]}>
                                Todos ({filteredAlerts.length + filteredReports.length})
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.filterChip, filterType === 'alertas' && styles.filterChipActive]}
                            onPress={() => setFilterType('alertas')}
                            activeOpacity={0.8}
                        >
                            <Ionicons
                                name="alert-circle"
                                size={14}
                                color={filterType === 'alertas' ? theme.buttonText : theme.alertRed}
                            />
                            <Text style={[styles.filterChipText, filterType === 'alertas' && styles.filterChipTextActive]}>
                                Alertas ({filteredAlerts.length})
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.filterChip, filterType === 'reportes' && styles.filterChipActive]}
                            onPress={() => setFilterType('reportes')}
                            activeOpacity={0.8}
                        >
                            <Ionicons
                                name="megaphone"
                                size={14}
                                color={filterType === 'reportes' ? theme.buttonText : theme.primary}
                            />
                            <Text style={[styles.filterChipText, filterType === 'reportes' && styles.filterChipTextActive]}>
                                Ocorrências ({filteredReports.length})
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

           
            <View style={[styles.fabContainer, { top: Math.max(insets.top + 120, 136) }]}>
                <TouchableOpacity
                    style={styles.fabButton}
                    onPress={handleRecenterMap}
                    accessibilityRole="button"
                    accessibilityLabel="Centralizar o mapa na minha localização"
                    activeOpacity={0.8}
                >
                    <Ionicons name="navigate-outline" size={22} color={theme.primary} />
                </TouchableOpacity>
            </View>

            <MapView
                ref={mapRef}
                style={styles.map}
                customMapStyle={isDarkMode ? darkMapStyle : []}
                initialRegion={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
            >
               
                <Marker
                    coordinate={{ latitude: location.latitude, longitude: location.longitude }}
                    title="Você está aqui"
                    tracksViewChanges={!marcadoresProntos}
                >
                    <View style={styles.userMarkerContainer}>
                        <View style={styles.userMarkerPulse} />
                        <View style={styles.userMarkerDot} />
                    </View>
                </Marker>

                
                {showAlerts && filteredAlerts.map((alerta: any) => {
                    const category = REPORT_CATEGORIES.find(item => item.id === alerta.alerta_tipo_ocorrencia);
                    const iconName = category?.icon || alerta.icon || 'alert-circle-outline';
                    const origem = getOrigemAlerta(alerta.alerta_origem);
                    const lat = Number(alerta.alerta_latitude);
                    const lng = Number(alerta.alerta_longitude);

                    if (isNaN(lat) || isNaN(lng)) return null;

                    return (
                        <Marker
                            key={`alerta-${alerta.id}`}
                            coordinate={{ latitude: lat, longitude: lng }}
                            onPress={() => setSelectedItem({...alerta, type :'alerta' })}
                            tracksViewChanges={!marcadoresProntos}
                        >
                            <View style={styles.markerWrapper}>
                                <View style={getIconStyle(alerta.alerta_nivel_risco)}>
                                    <Ionicons name={iconName as any} size={22} color={theme.white} />
                                </View>
                                {/* Selo depois do ícone para ficar por cima sem zIndex (ver markerBadgeOfficial) */}
                                <View style={styles.markerBadgeOfficial}>
                                    <Ionicons name={origem.icone} size={10} color={theme.white} />
                                </View>
                            </View>

                            <Callout tooltip onPress={() => handleOpenAlerta(alerta)}>
                                <View style={styles.calloutContainer}>
                                    <View style={styles.calloutHeader}>
                                        <Text style={styles.calloutTagAlerta}>{origem.texto}</Text>
                                        <Text style={getRiskBadgeStyle(alerta.alerta_nivel_risco)}>
                                            {RISK_LABEL[alerta.alerta_nivel_risco as NivelRisco] ?? RISK_LABEL.moderado}
                                        </Text>
                                    </View>
                                    <Text style={styles.calloutTitle} numberOfLines={1}>{alerta.alerta_titulo}</Text>
                                    <Text style={styles.calloutDescription} numberOfLines={2}>{alerta.alerta_descricao}</Text>
                                    <View style={styles.calloutFooter}>
                                        <Text style={styles.calloutHint}>Ver detalhes no histórico →</Text>
                                    </View>
                                </View>
                            </Callout>
                        </Marker>
                    );
                })}

               
                {showReports && filteredReports.map((report: any) => {
                    const category = REPORT_CATEGORIES.find(item => item.id === report.reporte_tipo_ocorrencia);
                    const iconName = category?.icon || report.icon || 'alert-circle-outline';
                    // Reporte não tem coluna de risco: vem da categoria (mesma regra do trigger A.10)
                    const nivel = getNivelRiscoReporte(report.reporte_tipo_ocorrencia);
                    const lat = Number(report.reporte_latitude);
                    const lng = Number(report.reporte_longitude);
                    if (isNaN(lat) || isNaN(lng)) return null;

                    return (
                        <Marker
                            key={`report-${report.id}`}
                            coordinate={{ latitude: lat, longitude: lng }}
                            onPress={() => setSelectedItem({...report, type : 'reporte' })}
                            tracksViewChanges={!marcadoresProntos}
                        >
                            <View style={styles.markerWrapper}>
                                <View style={getIconStyle(nivel)}>
                                    <Ionicons name={iconName as any} size={22} color={theme.white} />
                                </View>
                            </View>

                            <Callout tooltip onPress={() => handleOpenReport(report)}>
                                <View style={styles.calloutContainer}>
                                    <View style={styles.calloutHeader}>
                                        <Text style={styles.calloutTagReporte}>Ocorrência</Text>
                                        <Text style={getRiskBadgeStyle(nivel)}>
                                            {RISK_LABEL[nivel]}
                                        </Text>
                                    </View>
                                    <Text style={styles.calloutTitle} numberOfLines={1}>{category?.label || 'Ocorrência'}</Text>
                                    {report.reporte_descricao ? (
                                        <Text style={styles.calloutDescription} numberOfLines={2}>{report.reporte_descricao}</Text>
                                    ) : null}
                                    <View style={styles.calloutFooter}>
                                        <Text style={styles.calloutHint}>Ver detalhes no histórico →</Text>
                                    </View>
                                </View>
                            </Callout>
                        </Marker>
                    );
                })}

                <Circle
                    center={{
                        latitude: location.latitude,
                        longitude: location.longitude,
                    }}
                    radius={raioMetros}
                    fillColor={theme.badgeBg}
                    strokeColor={theme.cardBorder}
                    strokeWidth={2}
                />
            </MapView>

            {selectedItem && (
                <View style={[styles.previewCard, { bottom: insets.bottom + 80 }]}>
                    <View style={styles.previewHeader}>
                        <View style={styles.previewTypeTag}>
                            <Ionicons 
                                name={selectedItem.type === 'alerta' ? origemSelecionada.icone : 'megaphone'}
                                size={16} 
                                color={theme.primary} 
                            />
                            <Text style={styles.previewTypeText}>
                                {selectedItem.type === 'alerta' ? origemSelecionada.texto : 'Ocorrência Comunitária'}
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => setSelectedItem(null)}
                            style={{ padding: 4 }}
                            accessibilityRole="button"
                            accessibilityLabel="Fechar"
                        >
                            <Ionicons name="close-circle" size={24} color={theme.subtext || "#94A3B8"} />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.previewTitle}>
                        {selectedItem.alerta_titulo || REPORT_CATEGORIES.find(c => c.id === selectedItem.reporte_tipo_ocorrencia)?.label || "Detalhes"}
                    </Text>

                    <Text style={styles.previewDescription} numberOfLines={2}>
                        {selectedItem.alerta_descricao || selectedItem.reporte_descricao || "Sem descrição disponível."}
                    </Text>

                    <View style={styles.previewFooter}>
                        {(() => {
                            const riskLevelVal: NivelRisco = selectedItem.type === 'alerta'
                                ? (selectedItem.alerta_nivel_risco ?? 'moderado')
                                : getNivelRiscoReporte(selectedItem.reporte_tipo_ocorrencia);
                            return (
                                <View style={getRiskBadgeStyle(riskLevelVal)}>
                                    <Text style={getRiskTextStyle(riskLevelVal)}>
                                        Risco {RISK_LABEL[riskLevelVal].toUpperCase()}
                                    </Text>
                                </View>
                            );
                        })()}

                        <TouchableOpacity 
                            style={styles.detailsButton} 
                            onPress={() => {
                                if (selectedItem.type === 'alerta') handleOpenAlerta(selectedItem);
                                else handleOpenReport(selectedItem);
                            }}
                        >
                            <Text style={styles.detailsButtonText}>Ver detalhes</Text>
                            <Ionicons name="arrow-forward" size={16} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}
