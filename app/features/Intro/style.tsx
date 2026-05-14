import { colors } from '@/app/shared/constants/theme';
import { StyleSheet, Platform, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 16,
        alignItems: 'flex-end',
    },
    skipText: {
        fontSize: 16,
        color: '#64748B',
        fontWeight: '600',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingBottom: 40,
        justifyContent: 'center',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 30,
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
        minHeight: 420,
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 5,
    },
    iconContainer: {
        width: 160,
        height: 160,
        borderRadius: 80,
        marginBottom: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 16,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 26,
        paddingHorizontal: 10,
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 32,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#CBD5E1',
        marginHorizontal: 5,
    },
    activeDot: {
        width: 28,
        backgroundColor: '#4F46E5',
    },
    bottomSection: {
        alignItems: 'center',
    },
    nextButton: {
        flexDirection: 'row',
        backgroundColor: '#4F46E5',
        borderRadius: 16,
        paddingVertical: 18,
        paddingHorizontal: 24,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    nextButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 8,
    },
    footerText: {
        fontSize: 14,
        color: '#94A3B8',
        fontWeight: '500',
    },
});
