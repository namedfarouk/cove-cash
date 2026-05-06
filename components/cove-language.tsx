"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export const supportedLanguages = [
  { value: "en", label: "English", flag: "🇺🇸" },
  { value: "fr", label: "Français", flag: "🇫🇷" },
  { value: "zh", label: "中文", flag: "🇨🇳", disabled: true },
] as const;

export type LanguageValue = "en" | "fr";
export type LanguageOption = (typeof supportedLanguages)[number];

type TranslationTree = {
  nav: {
    home: string;
    sendPayment: string;
    dashboard: string;
    launchApp: string;
    english: string;
    french: string;
    chinese: string;
    comingSoon: string;
  };
  landing: {
    eyebrow: string;
    heroTitle: string;
    heroBody: string;
    startSending: string;
    viewDashboard: string;
    liveOnSolana: string;
    privateTransfer: string;
    sendPrivatePayment: string;
    amountSol: string;
    privateOutput: string;
    minimumSol: string;
    generateClaimLink: string;
    claimFlow: string;
    noAddressTitle: string;
    noAddressBody: string;
    encryptedLink: string;
    singleUse: string;
    receiverClaims: string;
    receiverClaimsBody: string;
    howItWorksEyebrow: string;
    howItWorksTitle: string;
    howItWorksBody: string;
    stepDepositTitle: string;
    stepDepositBody: string;
    stepLinkTitle: string;
    stepLinkBody: string;
    stepDmTitle: string;
    stepDmBody: string;
    oldFlowEyebrow: string;
    comparisonTitle: string;
    comparisonBody: string;
    category: string;
    oldWay: string;
    cove: string;
    setupTime: string;
    setupTimeOld: string;
    setupTimeCove: string;
    recipientAction: string;
    recipientActionOld: string;
    recipientActionCove: string;
    friction: string;
    frictionOld: string;
    frictionCove: string;
    privacy: string;
    privacyOld: string;
    privacyCove: string;
    moveFasterEyebrow: string;
    finalTitle: string;
    finalBody: string;
    launchCove: string;
    footerBody: string;
    footerX: string;
    footerGithub: string;
  };
};

const translations: Record<LanguageValue, TranslationTree> = {
  en: {
    nav: {
      home: "Home",
      sendPayment: "Send Payment",
      dashboard: "Dashboard",
      launchApp: "Launch App",
      english: "English",
      french: "Français",
      chinese: "中文",
      comingSoon: "Coming soon",
    },
    landing: {
      eyebrow: "Private settlement for Solana",
      heroTitle: "Send SOL privately. No wallet address required.",
      heroBody:
        "Deposit funds. Generate a private link. DM it to anyone. Stop asking for public keys and start settling instantly.",
      startSending: "Start Sending",
      viewDashboard: "View Dashboard",
      liveOnSolana: "Live on Solana",
      privateTransfer: "Private transfer",
      sendPrivatePayment: "Send a private payment",
      amountSol: "Amount (SOL)",
      privateOutput: "Private output",
      minimumSol: "Minimum 0.02 SOL",
      generateClaimLink: "Generate claim link",
      claimFlow: "Claim flow",
      noAddressTitle: "No address. No back-and-forth.",
      noAddressBody:
        "Generate the link. Drop it in the DM. The receiver clicks, connects, and claims.",
      encryptedLink: "Encrypted link",
      singleUse: "Single-use",
      receiverClaims: "Receiver claims instantly",
      receiverClaimsBody:
        "Funds settle without exposing a public key in chat.",
      howItWorksEyebrow: "How it works",
      howItWorksTitle: "Three moves. That's it.",
      howItWorksBody:
        "Built for people who already move fast on Solana and do not want another settlement ritual in the middle of a chat.",
      stepDepositTitle: "Deposit",
      stepDepositBody:
        "Connect your wallet and lock SOL in the Cove smart contract.",
      stepLinkTitle: "Generate Link",
      stepLinkBody:
        "Cove creates a single-use, cryptographic claim link.",
      stepDmTitle: "Drop it in the DM",
      stepDmBody:
        "Send it anywhere. The receiver connects their wallet and claims instantly.",
      oldFlowEyebrow: "The old flow is broken",
      comparisonTitle: "Cove vs. the old way",
      comparisonBody:
        "Wallet-address choreography kills momentum. Cove compresses the entire interaction into one private link.",
      category: "Category",
      oldWay: "The Old Way",
      cove: "Cove",
      setupTime: "Setup Time",
      setupTimeOld: "Ask for address -> Wait -> Verify -> Send",
      setupTimeCove: "Instantly generate link",
      recipientAction: "Recipient Action",
      recipientActionOld: "Must provide pubkey upfront",
      recipientActionCove: "Just click and claim",
      friction: "Friction",
      frictionOld: "High",
      frictionCove: "Zero",
      privacy: "Privacy",
      privacyOld: "Publicly linked to your identity",
      privacyCove: "Sender/Receiver remain detached",
      moveFasterEyebrow: "Move faster",
      finalTitle: "Frictionless peer-to-peer liquidity.",
      finalBody:
        "Private by default. Native to chat. Built for how Solana users actually move money.",
      launchCove: "Launch Cove",
      footerBody: "Private claim-link payments on Solana.",
      footerX: "Twitter/X",
      footerGithub: "Github",
    },
  },
  fr: {
    nav: {
      home: "Accueil",
      sendPayment: "Envoyer",
      dashboard: "Tableau de bord",
      launchApp: "Ouvrir l'app",
      english: "English",
      french: "Français",
      chinese: "中文",
      comingSoon: "Bientôt disponible",
    },
    landing: {
      eyebrow: "Règlement privé pour Solana",
      heroTitle: "Envoyez du SOL en privé. Aucune adresse wallet requise.",
      heroBody:
        "Déposez les fonds. Générez un lien privé. Envoyez-le en DM. Arrêtez de demander des clés publiques et réglez instantanément.",
      startSending: "Commencer l'envoi",
      viewDashboard: "Voir le tableau de bord",
      liveOnSolana: "En direct sur Solana",
      privateTransfer: "Transfert privé",
      sendPrivatePayment: "Envoyer un paiement privé",
      amountSol: "Montant (SOL)",
      privateOutput: "Sortie privée",
      minimumSol: "Minimum 0,02 SOL",
      generateClaimLink: "Générer le lien",
      claimFlow: "Flux de réclamation",
      noAddressTitle: "Pas d'adresse. Pas d'aller-retour.",
      noAddressBody:
        "Générez le lien. Déposez-le en DM. Le destinataire clique, connecte son wallet et réclame.",
      encryptedLink: "Lien chiffré",
      singleUse: "Usage unique",
      receiverClaims: "Le destinataire réclame instantanément",
      receiverClaimsBody:
        "Les fonds se règlent sans exposer une clé publique dans la conversation.",
      howItWorksEyebrow: "Comment ça marche",
      howItWorksTitle: "Trois gestes. C'est tout.",
      howItWorksBody:
        "Pensé pour les utilisateurs Solana qui avancent vite et ne veulent pas d'un rituel de règlement au milieu d'un chat.",
      stepDepositTitle: "Déposer",
      stepDepositBody:
        "Connectez votre wallet et verrouillez du SOL dans le smart contract Cove.",
      stepLinkTitle: "Générer le lien",
      stepLinkBody:
        "Cove crée un lien de réclamation cryptographique à usage unique.",
      stepDmTitle: "Envoyer en DM",
      stepDmBody:
        "Envoyez-le n'importe où. Le destinataire connecte son wallet et réclame instantanément.",
      oldFlowEyebrow: "L'ancien flux est cassé",
      comparisonTitle: "Cove vs. l'ancienne méthode",
      comparisonBody:
        "La chorégraphie autour des adresses wallet casse l'élan. Cove compresse toute l'interaction en un seul lien privé.",
      category: "Catégorie",
      oldWay: "Ancienne méthode",
      cove: "Cove",
      setupTime: "Temps de mise en place",
      setupTimeOld: "Demander l'adresse -> Attendre -> Vérifier -> Envoyer",
      setupTimeCove: "Générer un lien instantanément",
      recipientAction: "Action du destinataire",
      recipientActionOld: "Doit fournir sa pubkey à l'avance",
      recipientActionCove: "Cliquer et réclamer",
      friction: "Friction",
      frictionOld: "Élevée",
      frictionCove: "Zéro",
      privacy: "Confidentialité",
      privacyOld: "Publiquement liée à votre identité",
      privacyCove: "Expéditeur et destinataire restent détachés",
      moveFasterEyebrow: "Aller plus vite",
      finalTitle: "Une liquidité pair-à-pair sans friction.",
      finalBody:
        "Privé par défaut. Natif dans le chat. Construit pour la façon dont les utilisateurs Solana déplacent réellement l'argent.",
      launchCove: "Lancer Cove",
      footerBody: "Paiements Solana par lien de réclamation privé.",
      footerX: "Twitter/X",
      footerGithub: "Github",
    },
  },
};

type LanguageContextValue = {
  language: LanguageValue;
  setLanguage: (language: LanguageValue) => void;
  t: TranslationTree;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function CoveLanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<LanguageValue>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem("cove:language");
    if (stored === "en" || stored === "fr") {
      setLanguage(stored);
    }
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage: (nextLanguage) => {
        setLanguage(nextLanguage);
        window.localStorage.setItem("cove:language", nextLanguage);
      },
      t: translations[language],
    }),
    [language],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useCoveLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useCoveLanguage must be used within CoveLanguageProvider");
  }
  return context;
}
