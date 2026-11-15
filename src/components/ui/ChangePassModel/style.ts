import { StyleSheet } from "react-native";

export const getStyles = (theme: any, isDarkMode: boolean) => {
  return StyleSheet.create({
    modalOverlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: isDarkMode ? "rgba(0, 0, 0, 0.75)" : "rgba(0, 0, 0, 0.5)",
    },
    modalContainer: {
      backgroundColor: isDarkMode ? "#1E1E24" : "#FFFFFF",
      borderRadius: 20,
      padding: 24,
      width: "90%",
      maxWidth: 400,
      borderWidth: isDarkMode ? 1 : 0,
      borderColor: theme.inputBorder || "rgba(255, 255, 255, 0.12)",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: isDarkMode ? "#FFFFFF" : (theme.primary || "#333333"),
    },
    subtitle: {
      fontSize: 14,
      color: isDarkMode ? "#A1A1AA" : "#666666",
      marginBottom: 20,
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.inputBorder || (isDarkMode ? "#333" : "#ddd"),
      borderRadius: 12,
      paddingHorizontal: 12,
      marginBottom: 16,
      backgroundColor: isDarkMode ? "#2A2A32" : "#f9f9f9",
    },
    input: {
      flex: 1,
      height: 50,
      paddingLeft: 12,
      fontSize: 16,
      color: isDarkMode ? "#FFFFFF" : "#333333",
    },
    button: {
      backgroundColor: theme.primary || "#3AA77A",
      borderRadius: 12,
      padding: 16,
      alignItems: "center",
      marginTop: 10,
    },
    saveButtonText: {
      color: theme.white || "#FFFFFF",
      fontSize: 18,
      fontWeight: "bold",
    },
  });
};