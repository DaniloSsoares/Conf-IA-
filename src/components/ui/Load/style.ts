import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  overlayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',

    paddingHorizontal: 24,
  },
  inlineContainer: {
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    width: Math.min(width * 0.82, 320),
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  glowRing: {
    position: 'absolute',
    top: 24,
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: 'rgba(0, 209, 255, 0.25)',
  },
  iconWrapper: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  logoIa: {
    fontSize: 26,
    fontWeight: '800',
    color: '#00D1FF',
    marginLeft: 2,
    letterSpacing: 0.5,
  },
  spinner: {
    marginVertical: 12,
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
  },
  subMessageText: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 13,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 6,
  },
});
