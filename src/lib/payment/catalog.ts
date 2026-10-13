/**
 * Catalogue des pays et réseaux Mobile Money compatibles
 * Avec gestion granulaire des spécificités opérateurs (OTP préalable, push USSD, redirection)
 */

export interface PaymentNetwork {
  code: string;
  name: string;
  brand: "mtn" | "orange" | "moov" | "wave" | "celtiis" | "wizall" | "card" | "other";
  type: "ussd_push" | "prepayment_otp" | "postpayment_otp" | "redirect";
  instruction: string;
  otpPlaceholder?: string;
  otpHelp?: string;
  badge?: string;
  color?: string; // Accent color hex
}

export interface PaymentCountry {
  iso: string;
  name: string;
  flag: string;
  currency: string;
  dialCode: string;
  phoneFormat: string;
  phonePlaceholder: string;
  phoneMinDigits: number;
  networks: PaymentNetwork[];
}

export const PAYMENT_COUNTRIES: PaymentCountry[] = [
  {
    iso: "CI",
    name: "Côte d'Ivoire",
    flag: "🇨🇮",
    currency: "XOF",
    dialCode: "+225",
    phoneFormat: "10 chiffres (ex: 07 01 02 03 04)",
    phonePlaceholder: "07 00 00 00 00",
    phoneMinDigits: 10,
    networks: [
      {
        code: "wave_ci",
        name: "Wave",
        brand: "wave",
        type: "redirect",
        instruction: "Paiement 1-clic direct via l'application Wave ou QR code.",
        badge: "Instantané (0% frais)",
        color: "#1dc4fe",
      },
      {
        code: "orange_ci",
        name: "Orange Money",
        brand: "orange",
        type: "prepayment_otp",
        instruction: "Générez d'abord votre code temporaire sur votre mobile Orange.",
        otpPlaceholder: "Code OTP (4 chiffres)",
        otpHelp: "Tapez le code USSD #144*82# sur votre téléphone (option 2 : Code de paiement) pour obtenir votre code temporaire.",
        color: "#ff7900",
      },
      {
        code: "mtn_ci",
        name: "MTN MoMo",
        brand: "mtn",
        type: "ussd_push",
        instruction: "Une demande s'affiche sur votre téléphone. Validez avec votre code secret MoMo.",
        color: "#ffcc00",
      },
      {
        code: "moov_ci",
        name: "Moov Money",
        brand: "moov",
        type: "ussd_push",
        instruction: "Une demande s'affiche sur votre téléphone. Validez avec votre code secret Moov.",
        color: "#0066b2",
      },
    ],
  },
  {
    iso: "BJ",
    name: "Bénin",
    flag: "🇧🇯",
    currency: "XOF",
    dialCode: "+229",
    phoneFormat: "10 chiffres (ex: 01 97 00 00 00)",
    phonePlaceholder: "01 97 00 00 00",
    phoneMinDigits: 10,
    networks: [
      {
        code: "mtn_bj",
        name: "MTN MoMo",
        brand: "mtn",
        type: "ussd_push",
        instruction: "Une invite USSD s'affiche sur votre mobile. Confirmez avec votre code PIN MoMo.",
        color: "#ffcc00",
      },
      {
        code: "moov_bj",
        name: "Moov Money",
        brand: "moov",
        type: "ussd_push",
        instruction: "Une invite de paiement s'affiche sur votre mobile (*855#). Confirmez avec votre PIN.",
        color: "#0066b2",
      },
      {
        code: "celtiis_bj",
        name: "Celtiis Cash",
        brand: "celtiis",
        type: "ussd_push",
        instruction: "Une invite de débit s'affiche sur votre téléphone Celtiis. Validez avec votre PIN.",
        color: "#00a859",
      },
    ],
  },
  {
    iso: "SN",
    name: "Sénégal",
    flag: "🇸🇳",
    currency: "XOF",
    dialCode: "+221",
    phoneFormat: "9 chiffres (ex: 77 123 45 67)",
    phonePlaceholder: "77 123 45 67",
    phoneMinDigits: 9,
    networks: [
      {
        code: "wave_sn",
        name: "Wave",
        brand: "wave",
        type: "redirect",
        instruction: "Redirection vers Wave pour valider en un clic.",
        badge: "Recommandé",
        color: "#1dc4fe",
      },
      {
        code: "orange_sn",
        name: "Orange Money",
        brand: "orange",
        type: "ussd_push",
        instruction: "Une invite s'affiche sur votre téléphone. Entrez votre code secret Orange Money.",
        color: "#ff7900",
      },
      {
        code: "freemoney_sn",
        name: "Free Money",
        brand: "other",
        type: "ussd_push",
        instruction: "Une invite USSD s'affiche sur votre mobile Free. Validez avec votre code PIN.",
        color: "#e2001a",
      },
      {
        code: "wizall_sn",
        name: "Wizall Money",
        brand: "wizall",
        type: "postpayment_otp",
        instruction: "Vous recevrez un code SMS à 6 chiffres après validation à saisir sur cette page.",
        otpPlaceholder: "Code SMS reçu",
        otpHelp: "Un SMS Wizall contenant votre code de confirmation vous sera envoyé instantanément.",
        color: "#009688",
      },
    ],
  },
  {
    iso: "CM",
    name: "Cameroun",
    flag: "🇨🇲",
    currency: "XAF",
    dialCode: "+237",
    phoneFormat: "9 chiffres (ex: 6 90 00 00 00)",
    phonePlaceholder: "6 90 00 00 00",
    phoneMinDigits: 9,
    networks: [
      {
        code: "mtn_cm",
        name: "MTN MoMo",
        brand: "mtn",
        type: "ussd_push",
        instruction: "Une invite de débit s'affiche sur votre téléphone. Validez avec votre code secret.",
        color: "#ffcc00",
      },
      {
        code: "orange_cm",
        name: "Orange Money",
        brand: "orange",
        type: "ussd_push",
        instruction: "Une notification Orange Money s'affiche sur votre écran. Validez avec votre PIN.",
        color: "#ff7900",
      },
    ],
  },
  {
    iso: "BF",
    name: "Burkina Faso",
    flag: "🇧🇫",
    currency: "XOF",
    dialCode: "+226",
    phoneFormat: "8 chiffres (ex: 70 00 00 00)",
    phonePlaceholder: "70 00 00 00",
    phoneMinDigits: 8,
    networks: [
      {
        code: "orange_bf",
        name: "Orange Money",
        brand: "orange",
        type: "prepayment_otp",
        instruction: "Générez votre code d'autorisation OTP sur votre mobile avant de payer.",
        otpPlaceholder: "Code OTP Orange",
        otpHelp: "Composez le code USSD *144*4*6# sur votre téléphone pour générer votre code d'autorisation temporaire.",
        color: "#ff7900",
      },
      {
        code: "moov_bf",
        name: "Moov Money",
        brand: "moov",
        type: "ussd_push",
        instruction: "Une demande s'affiche sur votre téléphone. Validez avec votre code PIN.",
        color: "#0066b2",
      },
    ],
  },
  {
    iso: "TG",
    name: "Togo",
    flag: "🇹🇬",
    currency: "XOF",
    dialCode: "+228",
    phoneFormat: "8 chiffres (ex: 90 00 00 00)",
    phonePlaceholder: "90 00 00 00",
    phoneMinDigits: 8,
    networks: [
      {
        code: "moov_tg",
        name: "Moov Money",
        brand: "moov",
        type: "ussd_push",
        instruction: "Une invite de paiement s'affiche sur votre téléphone. Validez avec votre PIN.",
        color: "#0066b2",
      },
      {
        code: "togocel",
        name: "T-Money",
        brand: "other",
        type: "ussd_push",
        instruction: "Une demande T-Money s'affiche sur votre écran. Validez avec votre code secret.",
        color: "#0088cc",
      },
    ],
  },
  {
    iso: "ML",
    name: "Mali",
    flag: "🇲🇱",
    currency: "XOF",
    dialCode: "+223",
    phoneFormat: "8 chiffres (ex: 70 00 00 00)",
    phonePlaceholder: "70 00 00 00",
    phoneMinDigits: 8,
    networks: [
      {
        code: "orange_ml",
        name: "Orange Money",
        brand: "orange",
        type: "ussd_push",
        instruction: "Une invite s'affiche sur votre mobile Orange Mali. Validez avec votre code PIN.",
        color: "#ff7900",
      },
      {
        code: "moov_ml",
        name: "Moov Money",
        brand: "moov",
        type: "ussd_push",
        instruction: "Une invite s'affiche sur votre mobile Moov. Validez avec votre code PIN.",
        color: "#0066b2",
      },
    ],
  },
  {
    iso: "INT",
    name: "Carte bancaire (Visa / Mastercard)",
    flag: "💳",
    currency: "USD",
    dialCode: "",
    phoneFormat: "Numéro de contact avec indicatif",
    phonePlaceholder: "+33 6 00 00 00 00",
    phoneMinDigits: 6,
    networks: [
      {
        code: "card",
        name: "Carte Bancaire",
        brand: "card",
        type: "redirect",
        instruction: "Paiement sécurisé par carte bancaire internationale Visa ou Mastercard.",
        badge: "International",
        color: "#6366f1",
      },
    ],
  },
];

/**
 * Retrouve la configuration d'un pays par son code ISO
 */
export function getCountryByIso(iso: string): PaymentCountry | undefined {
  return PAYMENT_COUNTRIES.find((c) => c.iso.toUpperCase() === iso.toUpperCase());
}

/**
 * Retrouve un réseau précis par son code (ex: "orange_ci", "wave_ci")
 */
export function getNetworkByCode(networkCode: string): { network: PaymentNetwork; country: PaymentCountry } | null {
  for (const country of PAYMENT_COUNTRIES) {
    const net = country.networks.find((n) => n.code === networkCode);
    if (net) return { network: net, country };
  }
  return null;
}

/**
 * Normalise un numéro de téléphone selon le pays
 */
export function normalizePhoneNumber(rawPhone: string, countryIso: string): string {
  const digits = rawPhone.replace(/\D/g, "");
  const country = getCountryByIso(countryIso);
  if (!country) return rawPhone.trim();

  // Si c'est déjà un format international avec le dialCode
  const dialDigits = country.dialCode.replace(/\D/g, "");
  if (dialDigits && digits.startsWith(dialDigits)) {
    return `+${digits}`;
  }

  // Spécificité Bénin : numéro à 10 chiffres (commence par 01)
  if (countryIso === "BJ") {
    if (digits.length === 8) {
      // Ancien numéro à 8 chiffres -> rajoute 01
      return `+22901${digits}`;
    }
    if (digits.length === 10) {
      return `+229${digits}`;
    }
  }

  // Spécificité Côte d'Ivoire : numéro à 10 chiffres
  if (countryIso === "CI") {
    if (digits.length === 10) {
      return `+225${digits}`;
    }
  }

  // Par défaut, concatène l'indicatif pays si absent
  if (country.dialCode) {
    return `${country.dialCode}${digits}`;
  }

  return rawPhone.trim();
}
