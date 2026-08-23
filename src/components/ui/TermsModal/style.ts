import { StyleSheet, Dimensions } from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export const getStyles = (theme: any) => {
  const isDark = theme?.isDark;
  return StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.65)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    modalContainer: {
      width: "100%",
      maxHeight: SCREEN_HEIGHT * 0.8,
      backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
      borderRadius: 24,
      padding: 24,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255, 255, 255, 0.15)" : "#E2E8F0",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: isDark ? 0.4 : 0.15,
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
      padding: 4,
      borderRadius: 8,
      backgroundColor: isDark ? "rgba(255, 255, 255, 0.1)" : "#F4F5F7",
    },
    scrollContent: {
      paddingVertical: 8,
    },
    lastUpdated: {
      fontSize: 12,
      color: theme?.subtext || "#616A78",
      marginBottom: 16,
      fontStyle: "italic",
    },
    section: {
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: theme?.primary || "#0047FF",
      marginBottom: 6,
    },
    paragraph: {
      fontSize: 14,
      color: theme?.text || (isDark ? "#E2E8F0" : "#475569"),
      lineHeight: 22,
    },
    footer: {
      marginTop: 16,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: isDark ? "rgba(255, 255, 255, 0.1)" : "#E2E8F0",
    },
    button: {
      backgroundColor: theme?.primary || "#0047FF",
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    buttonText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "700",
    },
  });
};
