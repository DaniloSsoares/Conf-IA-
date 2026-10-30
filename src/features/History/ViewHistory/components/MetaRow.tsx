import React from 'react';
import { View, Text } from 'react-native';
import { useViewHistoryStyles } from '../styles';

export function MetaRow({ label, value }: { label: string; value: string }) {
  const { styles } = useViewHistoryStyles();
  return (
    <View style={styles.metaRow}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

export function Divider() {
  const { styles } = useViewHistoryStyles();
  return <View style={styles.divider} />;
}
