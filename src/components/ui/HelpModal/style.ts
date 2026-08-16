import { StyleSheet } from "react-native";

export const getStyles = (theme: any) => {
  const isDark = theme?.isDark;
  return StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
    },
    modalContent: {
      width: "100%",
      backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
      borderRadius: 20,
      padding: 24,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255, 255, 255, 0.15)" : "#E2E8F0",
      shadowColor: "#2C2B30",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: isDark ? 0.35 : 0.15,
      shadowRadius: 20,
      elevation: 10,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 16,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme?.text || "#2C2B30",
      flex: 1,
    },
    modalBody: {
      fontSize: 14,
      color: theme?.subtext || "#616A78",
      lineHeight: 22,
      marginBottom: 20,
    },
    modalButton: {
      backgroundColor: theme?.primary || "#0047FF",
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: "center",
    },
    modalButtonText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "700",
    },
  });
};
