import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Animated,
  Modal,
  ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/src/shared/constants/theme";
import styles from "./style";

export interface LoadProps {
  message?: string;
  subMessage?: string;
  visible?: boolean;
  overlay?: boolean;
  iconName?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
}

export function Load({
  message = "Carregando...",
  subMessage,
  visible = true,
  overlay = true,
  iconName = "shield-checkmark",
  style,
}: LoadProps) {
  const { theme } = useAppTheme();

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (visible) {
      const pulseLoop = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.15,
              duration: 900,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 900,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(opacityAnim, {
              toValue: 0.95,
              duration: 900,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0.6,
              duration: 900,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      pulseLoop.start();

      return () => pulseLoop.stop();
    }
  }, [visible, pulseAnim, opacityAnim]);

  if (!visible) return null;

  const cardContent = (
    <View style={[styles.cardContainer, style]}>
      {/* Brilho pulsante atrás do ícone */}
      <Animated.View
        style={[
          styles.glowRing,
          {
            transform: [{ scale: pulseAnim }],
            opacity: opacityAnim,
          },
        ]}
      />

      {/* Ícone do escudo/marca */}
      <View style={styles.iconWrapper}>
        <Ionicons name={iconName} size={40} color="#FFFFFF" />
      </View>

      {/* Marca Conf-IA */}
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>Conf</Text>
        <Text style={styles.logoIa}>-IA</Text>
      </View>

      {/* Spinner de carregamento */}
      <ActivityIndicator size="large" color="#00D1FF" style={styles.spinner} />

      {/* Mensagem e subtítulo */}
      <Text style={styles.messageText}>{message}</Text>
      {subMessage ? (
        <Text style={styles.subMessageText}>{subMessage}</Text>
      ) : null}
    </View>
  );

  if (overlay) {
    return (
      <Modal
        transparent
        visible={visible}
        animationType="fade"
        statusBarTranslucent
      >
        <LinearGradient
          colors={
            theme.primaryGradient || [
              "rgba(10, 25, 49, 0.92)",
              "rgba(2, 6, 23, 0.95)",
            ]
          }
          style={styles.overlayContainer}
        >
          {cardContent}
        </LinearGradient>
      </Modal>
    );
  }

  return <View style={styles.inlineContainer}>{cardContent}</View>;
}

export default Load;
