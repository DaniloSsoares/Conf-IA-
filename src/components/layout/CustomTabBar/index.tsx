import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useAppTheme } from '@/src/shared/constants/theme';
import getStyles from './styles';

type RouteInfo = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  type: string;
};

const ROUTE_CONFIG: Record<string, RouteInfo> = {
  'index': { label: 'Home', icon: 'home-outline', activeIcon: 'home', type: 'home' },
  'Maps/index': { label: 'Mapa', icon: 'map-outline', activeIcon: 'map', type: 'map' },
  'Alerts/index': { label: 'Mapa', icon: 'map-outline', activeIcon: 'map', type: 'map' },
  'Report/index': { label: '', icon: 'warning-outline', activeIcon: 'warning', type: 'alert' },
  'History/index': { label: 'Histórico', icon: 'search-outline', activeIcon: 'search', type: 'history' },
  'Profile/index': { label: 'Usuário', icon: 'person-outline', activeIcon: 'person', type: 'profile' },
};

const DEFAULT_ROUTE: RouteInfo = {
  label: '',
  icon: 'ellipse-outline',
  activeIcon: 'ellipse',
  type: 'default',
};

export default function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { theme, isDarkMode } = useAppTheme();
  const styles = getStyles(theme);

  const [barWidth, setBarWidth] = useState(0);

  // Cálculos de dimensões e centralização
  const paddingHorizontal = 4;
  const innerBarWidth = barWidth > 0 ? barWidth - (paddingHorizontal * 2) : 0;
  const tabWidth = innerBarWidth > 0 ? innerBarWidth / 5 : 0;
  const indicatorMargin = 4;
  const indicatorWidth = Math.max(tabWidth - (indicatorMargin * 2), 0);
  const initialX = paddingHorizontal + indicatorMargin + (state.index * tabWidth);

  const indicatorX = useRef(new Animated.Value(initialX)).current;
  const indicatorOpacity = useRef(new Animated.Value(state.index === 2 ? 0 : 1)).current;
  const alertScale = useRef(new Animated.Value(1)).current;
  const alertGlow = useRef(new Animated.Value(0)).current;

  const isAlertTab = state.index === 2;

  // Animação do Indicador Ativo
  useEffect(() => {
    if (tabWidth <= 0) return;
    const targetX = paddingHorizontal + indicatorMargin + (state.index * tabWidth);

    Animated.parallel([
      Animated.spring(indicatorX, {
        toValue: targetX,
        damping: 18,
        stiffness: 180,
        mass: 0.8,
        useNativeDriver: true,
      }),
      Animated.spring(indicatorOpacity, {
        toValue: isAlertTab ? 0 : 1,
        damping: 18,
        stiffness: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [state.index, tabWidth, isAlertTab]);

  // Animação de Pulso do Botão de Alerta Central
  useEffect(() => {
    alertScale.stopAnimation();
    alertGlow.stopAnimation();

    if (!isAlertTab) {
      Animated.parallel([
        Animated.spring(alertScale, { toValue: 1, damping: 14, stiffness: 180, useNativeDriver: true }),
        Animated.timing(alertGlow, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
      return;
    }

    alertScale.setValue(0.78);
    Animated.spring(alertScale, { toValue: 1, damping: 8, stiffness: 190, mass: 0.7, useNativeDriver: true }).start();

    alertGlow.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(alertGlow, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(alertGlow, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    return () => alertGlow.stopAnimation();
  }, [isAlertTab]);

  const handleTabPress = (route: typeof state.routes[number], index: number) => {
    const isFocused = state.index === index;
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name, route.params);
    }
  };

  const inactiveColor = theme?.subtext || (isDarkMode ? 'rgba(255, 255, 255, 0.7)' : '#616A78');

  return (
    <View style={[styles.wrapper, { bottom: Math.max(insets.bottom + 6, 8) }]}>
      <View
        style={styles.tabBar}
        onLayout={(event) => {
          const width = event.nativeEvent.layout.width;
          if (width > 0) setBarWidth(width);
        }}
      >
        {/* INDICADOR SELECIONADO */}
        {barWidth > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.activeIndicator,
              {
                width: indicatorWidth,
                opacity: indicatorOpacity,
                transform: [{ translateX: indicatorX }],
              },
            ]}
          >
            {state.index === 1 ? (
              <LinearGradient
                colors={isDarkMode ? ['#3F7FC4', '#5D9F55'] : ['#0047FF', '#3B82F6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientFill}
              />
            ) : (
              <View style={styles.indicatorFill} />
            )}
          </Animated.View>
        )}

        {/* LISTA DE ABAS */}
        {state.routes.map((route, index) => {
          const info = ROUTE_CONFIG[route.name] || DEFAULT_ROUTE;
          const focused = state.index === index;
          const isAlert = route.name === 'Report/index';

          return (
            <View key={route.key} style={styles.tabItem}>
              <Pressable onPress={() => handleTabPress(route, index)} style={styles.pressable}>
                {isAlert ? (
                  <Animated.View style={[styles.alertArea, { transform: [{ scale: alertScale }] }]}>
                    <Animated.View
                      pointerEvents="none"
                      style={[
                        styles.alertPulse,
                        {
                          opacity: alertGlow.interpolate({ inputRange: [0, 1], outputRange: [0.28, 0] }),
                          transform: [{ scale: alertGlow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.55] }) }],
                        },
                      ]}
                    />
                    <View style={styles.alertButton}>
                      <Ionicons name={focused ? info.activeIcon : info.icon} size={24} color="#FFFFFF" />
                    </View>
                  </Animated.View>
                ) : (
                  <>
                    <Ionicons
                      name={focused ? info.activeIcon : info.icon}
                      size={18}
                      color={focused ? '#FFFFFF' : inactiveColor}
                    />
                    <Text style={[styles.label, { color: focused ? '#FFFFFF' : inactiveColor }]}>
                      {info.label}
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}