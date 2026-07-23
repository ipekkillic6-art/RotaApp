// Ücretsiz Apple hesabı Push Notifications'ı imzalayamaz. Bu plugin, prebuild
// sırasında expo-notifications'ın eklediği aps-environment yetkisini kaldırır —
// böylece uygulama kişisel takımla cihaza kurulabilir. Push (uzaktan teslim)
// zaten ücretli hesap gerektiriyor (#15); bu, kod kalırken imzalama engelini kaldırır.
const { withEntitlementsPlist, withInfoPlist } = require('@expo/config-plugins');

const withoutPushEntitlement = (config) => {
  config = withEntitlementsPlist(config, (c) => {
    delete c.modResults['aps-environment'];
    return c;
  });
  config = withInfoPlist(config, (c) => {
    const modes = c.modResults.UIBackgroundModes;
    if (Array.isArray(modes)) {
      c.modResults.UIBackgroundModes = modes.filter((m) => m !== 'remote-notification');
    }
    return c;
  });
  return config;
};

module.exports = withoutPushEntitlement;
