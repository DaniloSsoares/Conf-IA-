// Estende o app.json com valores que vêm de variáveis de ambiente.
// O Expo lê o app.json primeiro e passa o conteúdo em `config`.
//
// GOOGLE_MAPS_API_KEY: o react-native-maps no Android precisa de uma chave do Google Maps.
// No Expo Go não precisa (ele usa a chave da Expo), mas no APK gerado pelo CD,
// sem a chave, a tela do Mapa fecha o app.
module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    config: {
      ...config.android?.config,
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
    },
  },
});
