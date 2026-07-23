module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Reanimated 4: worklets plugin. LİSTEDE EN SON olmalı.
      'react-native-worklets/plugin',
    ],
  };
};
