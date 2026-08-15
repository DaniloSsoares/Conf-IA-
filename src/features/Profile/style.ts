import { StyleSheet, Platform, StatusBar } from "react-native";

export const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      paddingBottom: 100,
    },
    profileHeader: {
      alignItems: 'center',
      paddingVertical: 32,


      marginBottom: 20,

    },
    avatarContainer: {
      position: 'relative',
      marginBottom: 16,
    },
    avatar: {
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    editAvatarButton: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: '#3069E8',
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#FFFFFF',
    },
    userName: {
      fontSize: 22,
      fontWeight: '800',
      color: '#FFFFFF',
      marginBottom: 4,
      letterSpacing: 0.5,
    },
    userEmail: {
      fontSize: 15,
      color: 'rgba(255, 255, 255, 0.8)',
      fontWeight: '500',
    },
    section: {
      marginBottom: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 24,
      padding: 24,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: '#FFFFFF',
      marginBottom: 20,
      letterSpacing: 0.3,
    },
    infoItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    infoLabel: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconBg: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    infoTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: 'rgba(255, 255, 255, 0.8)',
    },
    infoValue: {
      fontSize: 14,
      color: '#FFFFFF',
      fontWeight: '700',
    },
    divider: {
      height: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      marginVertical: 14,
    },
    editButton: {
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255, 255, 255, 0.2)',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    editButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '700',
      marginLeft: 8,
    },
    notificationItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    notificationLabel: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    notificationTitle: {
      fontSize: 15,
      color: '#FFFFFF',
      fontWeight: '600',
    },
    menuItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 6,
    },
    menuLabel: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    menuTitle: {
      fontSize: 15,
      color: '#FFFFFF',
      fontWeight: '600',
    },
    dangerSection: {
      marginTop: 10,
      marginBottom: 20,
      gap: 12,
    },
    dangerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      backgroundColor: 'rgba(225, 29, 72, 0.1)',
      borderRadius: 20,
      borderWidth: 1,
      borderColor: 'rgba(225, 29, 72, 0.4)',
    },
    dangerButtonText: {
      fontSize: 16,
      fontWeight: '700',
      marginLeft: 10,
      color: '#FF6B6B',
    },
    deleteButton: {
      paddingVertical: 16,
      alignItems: 'center',
    },
    deleteButtonText: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.6)',
      fontWeight: '600',
    },
    versionText: {
      textAlign: 'center',
      color: 'rgba(255, 255, 255, 0.4)',
      fontSize: 13,
      fontWeight: '600',
      marginBottom: 20,
    },
  });
