import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import MapView, { Callout, Circle, Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/src/shared/constants/theme';
import { Load } from '@/src/components/ui';
import { Report } from '@/src/shared/types/report';
import { REPORT_CATEGORIES } from '@/src/shared/constants/reportCategories';
import getStyles, { darkMapStyle } from './styles';
import { useMapData } from './useMapData';

type FilterType = 'todos' | 'alertas' | 'reportes';

export default function MapScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const mapRef = useRef<MapView>(null);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [filterType, setFilterType] = useState<FilterType>('todos');

    const { theme, isDarkMode } = useAppTheme();
    const styles = getStyles(theme);

    const {
        location,
        alerts,
        reports,
        profile,
        loadingLocation,
        permissionDenied,
    } = useMapData();

    const handleOpenAlerta = (alerta: any) => {
        router.push({
            pathname: '/(screens)/ViewHistory',
            params: {
                type: 'alerta',
                data: JSON.stringify(alerta),
            },
        });
    };

    const handleOpenReport = (report: Report) => {
        router.push({
            pathname: '/(screens)/ViewHistory',
            params: {
                type: 'reporte',
                data: JSON.stringify(report),
            },
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

    const raioKm = profile?.perfil_raio_notificacao_km ?? 5;
    const raioMetros = raioKm * 1000;

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

                    <View style={styles.filtersRow}>
                        <TouchableOpacity
                            style={[styles.filterChip, filterType === 'todos' && styles.filterChipActive]}
                            onPress={() => setFilterType('todos')}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.filterChipText, filterType === 'todos' && styles.filterChipTextActive]}>
                                Todos ({alerts.length + reports.length})
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
                                Alertas ({alerts.length})
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
                                Ocorrências ({reports.length})
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

           
            <View style={[styles.fabContainer, { top: Math.max(insets.top + 120, 136) }]}>
                <TouchableOpacity
                    style={styles.fabButton}
                    onPress={handleRecenterMap}
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
                >
                    <View style={styles.userMarkerContainer}>
                        <View style={styles.userMarkerPulse} />
                        <View style={styles.userMarkerDot} />
                    </View>
                </Marker>

                
                {showAlerts && alerts.map((alerta: any) => {
                    const category = REPORT_CATEGORIES.find(item => item.id === alerta.alerta_tipo_ocorrencia);
                    const iconName = category?.icon || alerta.icon || 'alert-circle-outline';
                    const lat = Number(alerta.alerta_latitude);
                    const lng = Number(alerta.alerta_longitude);

                    if (isNaN(lat) || isNaN(lng)) return null;

                    return (
                        <Marker
                            key={`alerta-${alerta.id}`}
                            coordinate={{ latitude: lat, longitude: lng }}
                            onPress={() => setSelectedItem({...alerta, type :'alerta' })}
                                
                        >
                            <View style={styles.markerWrapper}>
                                <View style={styles.markerBadgeOfficial}>
                                    <Ionicons name="shield-checkmark" size={10} color={theme.white} />
                                </View>
                                <View style={getIconStyle(alerta.alerta_nivel_risco)}>
                                    <Ionicons name={iconName as any} size={22} color={theme.white} />
                                </View>
                            </View>

                            <Callout onPress={() => handleOpenAlerta(alerta)}>
                                <View style={styles.calloutContainer}>
                                    <View style={styles.calloutHeader}>
                                        <Text style={styles.calloutTagAlerta}>Alerta Oficial</Text>
                                        <Text style={getRiskBadgeStyle(alerta.alerta_nivel_risco)}>
                                            {alerta.alerta_nivel_risco || 'Alerta'}
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

               
                {showReports && reports.map((report: any) => {
                    const category = REPORT_CATEGORIES.find(item => item.id === report.reporte_tipo_ocorrencia);
                    const iconName = category?.icon || report.icon || 'alert-circle-outline';
                    const lat = Number(report.reporte_latitude);
                    const lng = Number(report.reporte_longitude);
                    if (isNaN(lat) || isNaN(lng)) return null;

                    return (
                        <Marker
                            key={`report-${report.id}`}
                            coordinate={{ latitude: lat, longitude: lng }}
                            onPress={() => setSelectedItem({...report, type : 'reporte' })} 
                        >
                            <View style={styles.markerWrapper}>
                                <View style={getIconStyle(report.reporte_nivel_risco)}>
                                    <Ionicons name={iconName as any} size={22} color={theme.white} />
                                </View>
                            </View>

                            <Callout onPress={() => handleOpenReport(report)}>
                                <View style={styles.calloutContainer}>
                                    <View style={styles.calloutHeader}>
                                        <Text style={styles.calloutTagReporte}>Ocorrência</Text>
                                        <Text style={getRiskBadgeStyle(report.reporte_nivel_risco)}>
                                            {report.reporte_nivel_risco || 'Risco'}
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

            {selectedItem &&(
                 <View style={[styles.previewCard, { bottom: insets.bottom + 80 }]}>
        <View style={styles.previewHeader}>
            <View style={styles.previewTypeTag}>
                <Ionicons 
                    name={selectedItem.type === 'alerta' ? "shield-checkmark" : "megaphone"} 
                    size={16} 
                    color={theme.primary} 
                />
                <Text style={styles.previewTypeText}>
                    {selectedItem.type === 'alerta' ? "Alerta Oficial" : "Ocorrência Comunitária"}
                </Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedItem(null)}>
                <Ionicons name="close-circle" size={24} color="#999" />
            </TouchableOpacity>
        </View>

        <Text style={styles.previewTitle}>
            {selectedItem.alerta_titulo || REPORT_CATEGORIES.find(c => c.id === selectedItem.reporte_tipo_ocorrencia)?.label || "Detalhes"}
        </Text>

        <Text style={styles.previewDescription} numberOfLines={2}>
            {selectedItem.alerta_descricao || selectedItem.reporte_descricao || "Sem descrição disponível."}
        </Text>

        <View style={styles.previewFooter}>
            <View style={getRiskBadgeStyle(selectedItem.alerta_nivel_risco || selectedItem.reporte_nivel_risco)}>
                <Text style={styles.riskBadgeText}>
                    Risco {selectedItem.alerta_nivel_risco || selectedItem.reporte_nivel_risco}
                </Text>
            </View>

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
