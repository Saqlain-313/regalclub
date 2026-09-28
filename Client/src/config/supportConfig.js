// ======================================================
// SUPPORT CONFIG
// Apni support details yahan update karo:
//
// 1. Tawk.to (live chat) — https://dashboard.tawk.to
//    Property > Administration > Chat Widget > Direct Chat Link
//    e.g. "https://embed.tawk.to/65f1a2b3c4d5e6f7a8b9c0d1/1hijklmnop"
//         PROPERTY_ID = 65f1a2b3c4d5e6f7a8b9c0d1
//         WIDGET_ID   = 1hijklmnop
//    Jab tak ID empty hai, live chat card "unavailable" dikhayega.
//
// 2. WhatsApp — country code ke saath, sirf digits
//    e.g. "919876543210"
//
// 3. Telegram — username without @
//    e.g. "regalclub_support"
// ======================================================

export const SUPPORT_CONFIG = {
  tawk: {
    propertyId: "6aba3107d338ef344337ab25",
    widgetId: "1k3jkv1rv",
  },
  whatsapp: {
    number: "919876543210",
    defaultMessage: "Hi! I need help with my RegalClub account.",
  },
  telegram: {
    username: "regalclub_support",
  },
  email: "support@regalclub.live",
};

export const isTawkConfigured = () =>
  Boolean(SUPPORT_CONFIG.tawk.propertyId && SUPPORT_CONFIG.tawk.widgetId);

export const getWhatsAppLink = () =>
  `https://wa.me/${SUPPORT_CONFIG.whatsapp.number}?text=${encodeURIComponent(
    SUPPORT_CONFIG.whatsapp.defaultMessage,
  )}`;

export const getTelegramLink = () =>
  `https://t.me/${SUPPORT_CONFIG.telegram.username}`;
