import { colors } from '@/src/constants/theme';
import { StyleSheet, Platform, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4F46E5',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 24,
    borderRadius: 30,
    marginBottom: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  logoIa: {
    fontSize: 48,
    fontWeight: '800',
    color: '#818CF8', // Indigo-400
    marginLeft: 2,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#E0E7FF', // Indigo-100
    marginTop: 10,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  loader: {
    marginBottom: 40,
  },
});
