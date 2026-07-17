import { useColorScheme } from 'react-native';

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

// Maintain the generic colors object for backward compatibility if it's imported elsewhere
export const colors = {
  background: "#fff",
  white: "#F8FAFC",
  text: "#FFFFFF",  
  primary: "#0047FF",
  second: "#00F0FF",
  ternary: "#8B5CF6",
  neutral: "#F8FAFC",
  black: "#000",
  transparency: "rgba(15, 23, 42, 0.8)",
  transparencyWhite: "rgba(197, 201, 211, 0.5)",
  inputTransparency: "rgba(255, 255, 255, 0.1)",
  neon: "#00D1FF",
  neonClaro: "rgba(0, 255, 136, 0.47)",
  azulClaro: "#3B82F6",
  azulEscuro: "#1D3FAD",
  azulCrepusculo: "#031c6e",
  neonVerde: "#00FF88", 
  neonVerdeTransparente: "rgba(0, 255, 136, 0.15)", 
  primaryGradient: ['#246DF8', '#1495F7', '#01C6F5'],
};

export const lightTheme = {
  background: "#fff",
  text: "#000000",
  white: "#F8FAFC",
  primary: "#0047FF",
  second: "#00F0FF",
  ternary: "#8B5CF6",
  neutral: "#F8FAFC",
  black: "#000",
  transparency: "rgba(15, 23, 42, 0.8)",
  transparencyWhite: "rgba(197, 201, 211, 0.5)",
  inputTransparency: "rgba(255, 255, 255, 0.1)",
  neon: "#00D1FF",
  neonClaro: "rgba(0, 255, 136, 0.47)",
  azulClaro: "#3B82F6",
  azulEscuro: "#1D3FAD",
  azulCrepusculo: "#031c6e",
  neonVerde: "#00FF88", 
  neonVerdeTransparente: "rgba(0, 255, 136, 0.15)", 
  primaryGradient: ['#246DF8', '#1495F7', '#01C6F5'] as const, 
};

export const darkTheme = {
  background: "#020617", 
  text: "#FFFFFF",
  white: "#FFFFFF",
  primary: "#3B82F6",
  second: "#00F0FF",
  ternary: "#8B5CF6",
  neutral: "#0F172A",
  black: "#000",
  transparency: "rgba(15, 23, 42, 0.9)",
  transparencyWhite: "rgba(255, 255, 255, 0.1)",
  inputTransparency: "rgba(255, 255, 255, 0.05)",
  neon: "#00D1FF",
  neonClaro: "rgba(0, 255, 136, 0.3)",
  azulClaro: "#60A5FA",
  azulEscuro: "#1E3A8A",
  azulCrepusculo: "#031c6e",
  neonVerde: "#00FF88",
  neonVerdeTransparente: "rgba(0, 255, 136, 0.15)", 
  primaryGradient: ['#0A1931', '#112240', '#050D1A'] as const, 
};

export const useAppTheme = () => {
  const colorScheme = useColorScheme();
  
  const isDarkMode = colorScheme === 'dark';
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  return {
    isDarkMode,
    theme,
    colors: theme,
  };
};