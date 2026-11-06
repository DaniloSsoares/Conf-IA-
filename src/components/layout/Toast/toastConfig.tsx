import { View, Text, TouchableOpacity } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { getStyles } from './style';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/src/shared/constants/theme';
import Toast from 'react-native-toast-message';

interface ToastConfigProps {
  text1?: string;
  text2?: string;
  props?: any;
  animationType?: string;
}

// Cada tipo de toast é um componente de verdade (nome com letra maiúscula), porque usa o hook
// useAppTheme. Hooks só podem ser chamados dentro de componentes ou de outros hooks.

function SuccessToast({ text1, text2 }: ToastConfigProps) {
  const { theme } = useAppTheme();
  const styles = getStyles(theme);
  const isDark = theme.background === '#020617' || theme.text === '#FFFFFF';
  return (
    <View style={styles.sucessheaderContainerToast}>
      <View style={styles.sucessheaderIndicatorToast} />
      <View style={styles.sucessheaderContentToast}>
        <View style={styles.sucesstitleRowToast}>
          <Text style={styles.sucessheaderTitleToast}>{text1}</Text>
        </View>
        {!!text2 && (
          <Text style={styles.sucessheaderSubtitleToast}>{text2}</Text>
        )}
      </View>
      <TouchableOpacity onPress={() => Toast.hide()}>
        <MaterialCommunityIcons name="close-circle" size={24} color={isDark ? (theme.neonVerde || '#00FF88') : '#10B981'} />
      </TouchableOpacity>
    </View>
  );
}

function ErrorToast({ text1, text2 }: ToastConfigProps) {
  const { theme } = useAppTheme();
  const styles = getStyles(theme);
  return (
    <View style={styles.headerContainerToast}>
      <View style={styles.headerIndicatorToast} />
      <View style={styles.headerContentToast}>
        <View style={styles.titleRowToast}>
          <Text style={styles.headerTitleToast}>{text1}</Text>
        </View>
        {!!text2 && (
          <Text style={styles.headerSubtitleToast}>{text2}</Text>
        )}
      </View>
      <TouchableOpacity onPress={() => Toast.hide()}>
        <MaterialCommunityIcons name="close-circle" size={24} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );
}

function EdicaoToast({ text1, text2 }: ToastConfigProps) {
  const { theme } = useAppTheme();
  const styles = getStyles(theme);
  const isDark = theme.background === '#020617' || theme.text === '#FFFFFF';
  return (
    <View style={styles.edicaoToast}>
      <View style={styles.edicaoIndicatorToast} />
      <View style={styles.edicaoContentToast}>
        <View style={styles.edicaotitleRowToast}>
          <Text style={styles.edicaoTitleToast}>{text1}</Text>
        </View>
        {!!text2 && (
          <Text style={styles.edicaoSubtitleToast}>{text2}</Text>
        )}
      </View>
      <TouchableOpacity onPress={() => Toast.hide()}>
        <MaterialCommunityIcons name="close-circle" size={24} color={isDark ? (theme.neon || '#00D1FF') : '#0284C7'} />
      </TouchableOpacity>
    </View>
  );
}

function LoginToast({ text1, text2, props, animationType = 'fadeInDown' }: ToastConfigProps) {
  const { theme } = useAppTheme();
  const styles = getStyles(theme);
  return (
    <Animatable.View animation={animationType} duration={500} style={styles.toastContainer}>
      <View style={styles.errorToastLogin}>
        {props?.icon && <Text style={{ fontSize: 24 }}>{props.icon}</Text>}
        <View style={{ flex: 1 }}>
          <Text style={styles.errorTextLogin}>{text1}</Text>
          {!!text2 && <Text style={styles.errorSubTextLogin}>{text2}</Text>}
        </View>
      </View>
    </Animatable.View>
  );
}

function ResetSenhaToast({ text1, text2, props, animationType = 'fadeInDown' }: ToastConfigProps) {
  const { theme } = useAppTheme();
  const styles = getStyles(theme);
  return (
    <Animatable.View animation={animationType} duration={500} style={styles.toastContainer}>
      <View style={styles.EnvioToastSenha}>
        {props?.icon && <Text style={{ fontSize: 24 }}>{props.icon}</Text>}
        <View style={{ flex: 1 }}>
          <Text style={styles.EnvioTextSenha}>{text1}</Text>
          {!!text2 && <Text style={styles.EnvioSubTextSenha}>{text2}</Text>}
        </View>
      </View>
    </Animatable.View>
  );
}

function CadastroToast({ text1, text2, props, animationType = 'fadeInDown' }: ToastConfigProps) {
  const { theme } = useAppTheme();
  const styles = getStyles(theme);
  return (
    <Animatable.View animation={animationType} duration={500} style={styles.toastContainer}>
      <View style={styles.DocToast}>
        {props?.icon && <Text style={{ fontSize: 24 }}>{props.icon}</Text>}
        <View style={{ flex: 1 }}>
          <Text style={styles.DocText}>{text1}</Text>
          {!!text2 && <Text style={styles.DocSubText}>{text2}</Text>}
        </View>
      </View>
    </Animatable.View>
  );
}

function InfoToast({ text1, text2, props, animationType = 'fadeInDown' }: ToastConfigProps) {
  const { theme } = useAppTheme();
  const styles = getStyles(theme);
  return (
    <Animatable.View animation={animationType} duration={500} style={styles.toastContainer}>
      <View style={styles.infoToast}>
        {props?.icon && <Text style={{ fontSize: 24 }}>{props.icon}</Text>}
        <View style={{ flex: 1 }}>
          <Text style={styles.infoText}>{text1}</Text>
          {!!text2 && <Text style={styles.infoSubText}>{text2}</Text>}
        </View>
      </View>
    </Animatable.View>
  );
}

const toastConfig = {
  success: (p: ToastConfigProps) => <SuccessToast {...p} />,
  error: (p: ToastConfigProps) => <ErrorToast {...p} />,
  edicaoToast: (p: ToastConfigProps) => <EdicaoToast {...p} />,
  Login: (p: ToastConfigProps) => <LoginToast {...p} />,
  ResetSenha: (p: ToastConfigProps) => <ResetSenhaToast {...p} />,
  cadastro: (p: ToastConfigProps) => <CadastroToast {...p} />,
  info: (p: ToastConfigProps) => <InfoToast {...p} />,
};

export default toastConfig;
