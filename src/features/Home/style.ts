import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F7FA',
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingTop: 22,
    paddingBottom: 110,
  },

  /* =========================
     CLIMA DO TOPO
  ========================= */

  weatherHeader: {
    flexDirection: 'row',

    alignItems: 'center',
    justifyContent: 'center',

    minHeight: 150,

    marginTop: 8,
    marginBottom: 6,

    paddingHorizontal: 20,
  },

  sunContainer: {
    width: 125,
    height: 125,

    marginLeft: 0,
    marginRight: 10,

    alignItems: 'center',
    justifyContent: 'center',

    overflow: 'visible',
  },

  sunGlow: {
    position: 'absolute',

    width: 118,
    height: 118,

    borderRadius: 59,

    backgroundColor: '#FFF3C7',

    opacity: 0.65,
  },

  weatherInfo: {
    flex: 0,

    width: 155,

    marginLeft: 0,
    paddingRight: 0,
  },

  weatherDay: {
    fontSize: 17,

    fontWeight: '700',

    color: '#172033',

    marginBottom: 5,

    textAlign: 'left',
  },

  weatherCondition: {
    fontSize: 15,

    color: '#616A78',

    fontWeight: '500',

    marginBottom: 4,

    textAlign: 'left',
  },

  weatherTemperature: {
    fontSize: 15,

    color: '#172033',

    fontWeight: '500',

    textAlign: 'left',
  },

  /* =========================
     SAUDAÇÃO
  ========================= */

  greetingContainer: {
    alignItems: 'center',

    paddingHorizontal: 22,

    paddingTop: 14,
    paddingBottom: 28,

    marginTop: 2,
  },

  greetingSmall: {
    fontSize: 12,

    color: '#858D99',

    fontWeight: '500',

    marginBottom: 5,
  },

  greeting: {
    fontSize: 19,

    color: '#172033',

    fontWeight: '700',

    textAlign: 'center',

    lineHeight: 27,

    letterSpacing: -0.2,
  },

  greetingHighlight: {
    color: '#4F8EF7',

    fontWeight: '800',
  },

  greetingLine: {
    width: 34,
    height: 3,

    borderRadius: 2,

    backgroundColor: '#58B99B',

    marginTop: 11,
  },

  /* =========================
     RISCO
  ========================= */

  riskCard: {
    marginHorizontal: 20,

    borderRadius: 22,

    padding: 19,

    marginBottom: 24,

    borderWidth: 1,

    borderColor: 'rgba(255,255,255,0.9)',

    shadowColor: '#172033',

    shadowOffset: {
      width: 0,
      height: 5,
    },

    shadowOpacity: 0.055,

    shadowRadius: 11,

    elevation: 3,
  },

  riskHeader: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',
  },

  riskLabel: {
    fontSize: 11,

    fontWeight: '600',

    opacity: 0.75,

    letterSpacing: 0.2,
  },

  riskLevel: {
    fontSize: 25,

    fontWeight: '800',

    marginTop: 3,

    letterSpacing: -0.3,
  },

  iconBadge: {
    width: 48,
    height: 48,

    borderRadius: 24,

    alignItems: 'center',

    justifyContent: 'center',

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.08,

    shadowRadius: 5,

    elevation: 3,
  },

  riskLocation: {
    fontSize: 12,

    fontWeight: '500',

    marginTop: 11,

    lineHeight: 18,

    opacity: 0.88,
  },

  /* =========================
     SEÇÕES
  ========================= */

  section: {
    marginHorizontal: 20,

    marginBottom: 23,
  },

  sectionHeader: {
    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'center',

    marginBottom: 11,
  },

  sectionTitle: {
    fontSize: 17,

    fontWeight: '700',

    color: '#172033',

    letterSpacing: -0.2,
  },

  seeAll: {
    fontSize: 12.5,

    color: '#625BFF',

    fontWeight: '600',
  },

  /* =========================
     RESUMO DO CLIMA
  ========================= */

  weatherSummary: {
    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor: '#FFFFFF',

    borderRadius: 22,

    minHeight: 88,

    paddingHorizontal: 11,

    marginTop: 10,

    borderWidth: 1,

    borderColor: '#F0F1F5',

    shadowColor: '#172033',

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.04,

    shadowRadius: 10,

    elevation: 2,
  },

  weatherSummaryItem: {
    flex: 1,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',
  },

  weatherMiniIcon: {
    width: 37,
    height: 37,

    borderRadius: 19,

    alignItems: 'center',

    justifyContent: 'center',

    marginRight: 7,
  },

  weatherSummaryValue: {
    fontSize: 14,

    fontWeight: '800',

    color: '#172033',
  },

  weatherSummaryLabel: {
    fontSize: 9.5,

    color: '#7A8290',

    marginTop: 2,

    fontWeight: '500',
  },

  weatherDivider: {
    width: 1,

    height: 34,

    backgroundColor: '#ECEEF2',
  },

  /* =========================
     ALERTA
  ========================= */

  alertItem: {
    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor: '#FFFFFF',

    borderRadius: 20,

    minHeight: 80,

    paddingHorizontal: 13,

    paddingVertical: 11,

    borderWidth: 1,

    borderColor: '#F0F1F5',

    shadowColor: '#172033',

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.04,

    shadowRadius: 10,

    elevation: 2,
  },

  alertIcon: {
    width: 48,
    height: 48,

    borderRadius: 17,

    alignItems: 'center',

    justifyContent: 'center',

    marginRight: 12,
  },

  alertContent: {
    flex: 1,
  },

  alertTitle: {
    fontSize: 13,

    fontWeight: '700',

    color: '#172033',

    marginBottom: 3,
  },

  alertTime: {
    fontSize: 11,

    color: '#7A8290',

    fontWeight: '500',
  },

  /* =========================
     BOTÃO
  ========================= */

  actionButton: {
    marginHorizontal: 20,

    minHeight: 56,

    borderRadius: 19,

    backgroundColor: '#E94450',

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    marginTop: 2,

    shadowColor: '#E94450',

    shadowOffset: {
      width: 0,
      height: 6,
    },

    shadowOpacity: 0.20,

    shadowRadius: 11,

    elevation: 5,
  },

  actionButtonText: {
    color: '#FFFFFF',

    fontSize: 15,

    fontWeight: '700',

    marginLeft: 8,
  },

  bottomSpace: {
    height: 25,
  },
});