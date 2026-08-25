import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/src/shared/constants/theme';
import { getStyles } from './style';

interface ButtonBackProps {
  onPress?: () => void;
}

export default function ButtonBack({ onPress }: ButtonBackProps) {
  const { theme, isDarkMode } = useAppTheme();
  const styles = getStyles(theme);
  const router = useRouter();

  const iconColor = isDarkMode ? "#FFFFFF" : "#2C2B30";

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.button}>
      <Ionicons name="arrow-back" size={22} color={iconColor} />
    </TouchableOpacity>
  );
}