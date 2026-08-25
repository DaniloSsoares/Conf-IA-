import { StyleSheet } from "react-native";

export const getStyles = (theme: any) => StyleSheet.create({
    button: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(44, 43, 48, 0.05)",
        justifyContent: "center",
        alignItems: "center",
    },
});