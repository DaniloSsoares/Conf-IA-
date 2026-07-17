import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 30, // For Android spacing
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '400',
    marginLeft: 8,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -40,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 40,
    paddingHorizontal: 8,
    fontWeight: '400',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: '#FFFFFF',
  },
  footer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  nextButton: {
    flexDirection: 'row',
    backgroundColor: '#3069E8', // Match the dark blue in the layout
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 24,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  loginLink: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
