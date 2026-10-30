import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useViewHistoryStyles } from '../styles';

export function DetailsHeader({ title }: { title: string }) {
  const router = useRouter();
  const { styles, isDarkMode } = useViewHistoryStyles();
  const iconColor = isDarkMode ? '#FFFFFF' : '#2C2B30';

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={22} color={iconColor} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={{ width: 40 }} />
    </View>
  );
}
