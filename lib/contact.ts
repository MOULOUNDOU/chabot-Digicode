export const BRAND_NAME = "Digicode";
export const CONTACT_PHONE_DISPLAY = "+221 77 726 94 84";
export const CONTACT_PHONE_E164 = "221777269484";
export const CONTACT_WHATSAPP_LINK = `https://wa.me/${CONTACT_PHONE_E164}`;
export const PAYMENT_METHODS = ["Wave", "Orange Money"] as const;
export const PAYMENT_METHODS_LABEL = PAYMENT_METHODS.join(" ou ");
export const PAYMENT_DETAILS_SENTENCE = `Le paiement se fait par ${PAYMENT_METHODS_LABEL} au ${CONTACT_PHONE_DISPLAY}.`;
