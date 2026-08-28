import { StyleSheet, Dimensions } from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export const getStyles = (theme: any) => {
  const isDark = theme?.isDark;
  return StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.70)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    modalContainer: {
      width: "100%",
      maxHeight: SCREEN_HEIGHT * 0.85,
      backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
      borderRadius: 24,
      padding: 24,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255, 255, 255, 0.15)" : "#E2E8F0",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 10,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "rgba(255, 255, 255, 0.1)" : "#E2E8F0",
    },
    headerTitleContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme?.text || (isDark ? "#FFFFFF" : "#2C2B30"),
    },
    closeButton: {
      padding: 6,
      borderRadius: 8,
      backgroundColor: isDark ? "rgba(255, 255, 255, 0.1)" : "#F4F5F7",
    },
    scrollContent: {
      paddingVertical: 8,
    },
    subtitle: {
      fontSize: 13,
      lineHeight: 18,
      color: isDark ? "#CBD5E1" : "#475569",
      marginBottom: 16,
    },
    sectionBadge: {
      alignSelf: "flex-start",
      backgroundColor: isDark ? "rgba(59, 130, 246, 0.2)" : "#EFF6FF",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDark ? "rgba(59, 130, 246, 0.4)" : "#BFDBFE",
    },
    sectionBadgeText: {
      fontSize: 12,
      fontWeight: "600",
      color: isDark ? "#60A5FA" : "#1D4ED8",
    },
    comparisonCard: {
      backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
      borderRadius: 16,
      padding: 14,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
    },
    cardLabel: {
      fontSize: 12,
      fontWeight: "700",
      textTransform: "uppercase",
      color: isDark ? "#94A3B8" : "#64748B",
      marginBottom: 8,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 6,
    },
    fieldTitle: {
      fontSize: 13,
      fontWeight: "600",
      color: isDark ? "#E2E8F0" : "#334155",
    },
    originalValue: {
      fontSize: 13,
      color: "#EF4444",
      textDecorationLine: "line-through",
    },
    anonValue: {
      fontSize: 13,
      fontWeight: "700",
      color: "#10B981",
    },
    divider: {
      height: 1,
      backgroundColor: isDark ? "rgba(255, 255, 255, 0.06)" : "#E2E8F0",
      marginVertical: 4,
    },
    testButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: theme?.primary || "#0047FF",
      borderRadius: 14,
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginTop: 16,
    },
    testButtonText: {
      color: "#FFFFFF",
      fontWeight: "700",
      fontSize: 14,
    },
    closeFooterButton: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      marginTop: 8,
    },
    closeFooterButtonText: {
      color: isDark ? "#94A3B8" : "#64748B",
      fontWeight: "600",
      fontSize: 14,
    },
  });
};
