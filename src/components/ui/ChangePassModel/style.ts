import { StyleSheet } from "react-native";


export const getStyles = (theme: any) => {
  const isDark = theme?.isDark;
  return StyleSheet.create({
    modalOverlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContainer: {
      backgroundColor: "white",
      borderRadius: 20,
      padding: 24,
      width: "90%",
      maxWidth: 400,
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
      color: theme.primary || "#333",
    },
    subtitle: {
      fontSize: 14,
      color: "#666",
      marginBottom: 20,
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.primaryBorder || "#ddd",
      borderRadius: 12,
      paddingHorizontal: 12,
      marginBottom: 16,
      backgroundColor: theme.primaryInput || "#f9f9f9",
    },
    input: {
      flex: 1,
      height: 50,
      paddingLeft: 12,
      fontSize: 16,
      color: theme.primaryText || "#333",
    },
    button: {
      backgroundColor: theme.primary || "#3AA77A",
      borderRadius: 12,
      padding: 16,
      alignItems: "center",
      marginTop: 10,
    },
    saveButtonText: {
      color: "white",
      fontSize: 18,
      fontWeight: "bold",
    },
  });
};
