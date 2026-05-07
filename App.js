import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// Importar telas
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import IntroScreen from './src/screens/IntroScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import AlertScreen from './src/screens/AlertScreen';
import ReportScreen from './src/screens/ReportScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Paleta Moderna
const COLORS = {
  primary: '#4F46E5', // Indigo
  primaryLight: '#818CF8',
  background: '#F8FAFC',
  card: '#FFFFFF',
  text: '#1E293B',
  textLight: '#64748B',
};

// Stack para Autenticação
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Intro" component={IntroScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}

// Stack para App Principal
function AppStack() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Alertas') iconName = focused ? 'alert-circle' : 'alert-circle-outline';
          else if (route.name === 'Report') iconName = focused ? 'add-circle' : 'add-circle-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';

          return (
            <View style={focused ? styles.iconContainerFocused : styles.iconContainer}>
              <Ionicons name={iconName} size={24} color={color} />
            </View>
          );
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        headerShown: true,
        headerStyle: {
          backgroundColor: COLORS.card,
          elevation: 0, // Remover sombra no Android
          shadowOpacity: 0, // Remover sombra no iOS
          borderBottomWidth: 1,
          borderBottomColor: '#E2E8F0',
        },
        headerTitleAlign: 'center',
        headerTintColor: COLORS.text,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
          color: COLORS.text,
        },
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          elevation: 10,
          backgroundColor: '#ffffff',
          borderRadius: 25,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          shadowColor: COLORS.primary,
          shadowOffset: {
            width: 0,
            height: 10,
          },
          shadowOpacity: 0.15,
          shadowRadius: 15,
          borderTopWidth: 0,
        },
        tabBarShowLabel: false,
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Conf-IA' }}
      />
      <Tab.Screen
        name="Alertas"
        component={AlertScreen}
      />
      <Tab.Screen
        name="Report"
        component={ReportScreen}
        options={{ title: 'Reportar Evento' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Perfil' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        // Simulando delay inicial para Splash Screen
        setTimeout(() => {
          setIsLoading(false);
        }, 1500);
      } catch (e) {
        setIsLoading(false);
      }
    };
    bootstrapAsync();
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      {userToken == null ? <AuthStack /> : <AppStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  iconContainerFocused: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
  },
});
