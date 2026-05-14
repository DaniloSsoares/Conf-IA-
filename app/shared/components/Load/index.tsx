import {
  ActivityIndicator,
  Image,
  ImageSourcePropType,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors } from "../../constants/theme";
export function Load() {
  const backgroundImage: ImageSourcePropType[] = [
    require("../../img/backgroundInicio.png"),
  ];

  return (
    <View style={style.container2}>
        {backgroundImage && (
          <Image
            source={backgroundImage[0]}
            style={style.backgroundImage}
            resizeMode="cover"
          />
        )}
      <View style={style.carregando}>
      
        <Image
          resizeMode="contain"
          source={require("../../img/logo.png")}
          style={style.logo}
        />
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={style.text}>Carregando...</Text>
      </View>
    </View>
  );
}

const style = StyleSheet.create({
  container2: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: Platform.OS === "ios" ? -100 : 0,
  },

  carregando: {

    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 250,
    height: 250,
  },
  text: {
    color: colors.white,
    fontSize: 20,
  },
});
