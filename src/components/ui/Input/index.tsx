import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/src/shared/constants/theme';
import { getStyles } from './style';

interface InputProps extends TextInputProps {
  label?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  error?: string;
  isPassword?: boolean;
}

export default function Input({ label, iconName, error, isPassword, ...rest }: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { theme, isDarkMode } = useAppTheme();
  const styles = getStyles(theme);

  const iconColor = isDarkMode ? "#FFFFFF" : (theme.primary || "#0047FF");
  const placeholderColor = isDarkMode ? "rgba(255, 255, 255, 0.6)" : "#858D99";

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, error ? styles.inputError : null]}>
        {iconName && (
          <Ionicons name={iconName} size={20} color={iconColor} style={styles.icon} />
        )}
        <TextInput
          style={styles.input}
          placeholderTextColor={placeholderColor}
          secureTextEntry={isPassword && !showPassword}
          {...rest}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showPassword ? 'eye' : 'eye-off'}
              size={20}
              color={iconColor}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}
