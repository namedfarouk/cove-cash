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
    docs: string;
    english: string;
    french: string;
    chinese: string;
    comingSoon: string;
    howItWorks: string;
    compare: string;
    getStarted: string;
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
  send: {
    liveTransferComposer: string;
    sendPrivatePayment: string;
    amount: string;
    minimumSol: string;
    generateClaimLink: string;
    readyToPrepare: string;
    connectWalletToBegin: string;
    preparingDeposit: string;
    waitingForSignature: string;
    submittingTransaction: string;
    confirmingOnChain: string;
    depositConfirmed: string;
    claimLinkLabel: string;
    signatureLabel: string;
    openDashboardPrefix: string;
    openDashboardSuffix: string;
    dashboardLinkText: string;
  };
  claim: {
    eyebrow: string;
    heroTitle: string;
    heroBody: string;
    bullet1: string;
    bullet2: string;
    bullet3: string;
    redemptionModule: string;
    claimAPrivatePayment: string;
    privateSpend: string;
    amountLabel: string;
    delivery: string;
    encryptedWitness: string;
    recipientWallet: string;
    claimToMyWallet: string;
    readyToClaim: string;
    connectWalletToBegin: string;
    preparingClaim: string;
    waitingForSignature: string;
    submittingTransaction: string;
    confirmingOnChain: string;
    claimConfirmed: string;
    claimedViaRelay: string;
    signatureLabel: string;
    viewOnSolscan: string;
    noPayloadInUrl: string;
    missingBlinding: string;
    failedToDecodePrefix: string;
  };
  dashboard: {
    eyebrow: string;
    title: string;
    subtitle: string;
    trackedDeposits: string;
    pendingClaims: string;
    claimedStat: string;
    complianceSafeExport: string;
    depositActivity: string;
    exportCsv: string;
    exporting: string;
    readingLocal: string;
    noDepositsFoundPrefix: string;
    noDepositsFoundLinkLabel: string;
    colAmount: string;
    colMint: string;
    colStatus: string;
    colDepositTx: string;
    colActions: string;
    copyClaimLink: string;
    loadingState: string;
    copied: string;
    errorPrefix: string;
    checkingBadge: string;
    claimedBadge: string;
    pendingClaimBadge: string;
  };
};

const translations: Record<LanguageValue, TranslationTree> = {
  en: {
    nav: {
      home: "Home",
      sendPayment: "Send Payment",
      dashboard: "Dashboard",
      launchApp: "Launch App",
      docs: "Docs",
      english: "English",
      french: "Français",
      chinese: "中文",
      comingSoon: "Coming soon",
      howItWorks: "How it works",
      compare: "Compare",
      getStarted: "Get started",
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
    send: {
      liveTransferComposer: "Live transfer composer",
      sendPrivatePayment: "Send a private payment",
      amount: "Amount (SOL)",
      minimumSol: "Minimum 0.02 SOL",
      generateClaimLink: "Generate claim link",
      readyToPrepare: "Ready to prepare the deposit.",
      connectWalletToBegin: "Connect a wallet to begin.",
      preparingDeposit: "Preparing deposit and generating proof...",
      waitingForSignature: "Waiting for wallet signature...",
      submittingTransaction: "Submitting transaction to Solana...",
      confirmingOnChain: "Confirming on chain...",
      depositConfirmed: "Deposit confirmed.",
      claimLinkLabel: "Claim link",
      signatureLabel: "Signature:",
      openDashboardPrefix: "Open ",
      openDashboardSuffix: " to manage and re-copy this link later.",
      dashboardLinkText: "Dashboard",
    },
    claim: {
      eyebrow: "Claim flow",
      heroTitle: "Redeem a private payment in one click.",
      heroBody:
        "Cove reconstructs the proof path behind the claim link so the recipient can connect a wallet and settle instantly.",
      bullet1: "Claim links are single-use and carry the private spend witness.",
      bullet2: "Relay mode can cover submission without charging the wallet a fee.",
      bullet3: "The recipient wallet stays detached from the original DM thread.",
      redemptionModule: "Redemption module",
      claimAPrivatePayment: "Claim a private payment",
      privateSpend: "Private spend",
      amountLabel: "Amount",
      delivery: "Delivery",
      encryptedWitness: "Encrypted claim witness included",
      recipientWallet: "Recipient wallet",
      claimToMyWallet: "Claim to my wallet",
      readyToClaim: "Ready to claim.",
      connectWalletToBegin: "Connect a wallet to begin.",
      preparingClaim: "Preparing claim proof and transaction...",
      waitingForSignature: "Waiting for wallet signature...",
      submittingTransaction: "Submitting transaction...",
      confirmingOnChain: "Confirming on chain...",
      claimConfirmed: "Claim confirmed.",
      claimedViaRelay:
        "Claimed via Cove relay. No transaction fee was paid by your wallet.",
      signatureLabel: "Signature:",
      viewOnSolscan: "View on Solscan",
      noPayloadInUrl: "No claim payload in URL.",
      missingBlinding:
        "This claim link is missing the blinding factor (r) and cannot be redeemed. It was likely generated by an older version of Cove.",
      failedToDecodePrefix: "Failed to decode claim link: ",
    },
    dashboard: {
      eyebrow: "Private settlement ledger",
      title: "Your deposits",
      subtitle:
        "Monitor claim status, re-copy links, and export the deposit trail without leaving the Cove flow.",
      trackedDeposits: "Tracked deposits",
      pendingClaims: "Pending claims",
      claimedStat: "Claimed",
      complianceSafeExport: "Compliance-safe export and claim management",
      depositActivity: "Deposit activity",
      exportCsv: "Export CSV",
      exporting: "Exporting...",
      readingLocal: "Reading local deposits...",
      noDepositsFoundPrefix: "No deposits found yet. Start with ",
      noDepositsFoundLinkLabel: "/send",
      colAmount: "Amount",
      colMint: "Mint",
      colStatus: "Status",
      colDepositTx: "Deposit tx",
      colActions: "Actions",
      copyClaimLink: "Copy claim link",
      loadingState: "Loading...",
      copied: "Copied",
      errorPrefix: "Error: ",
      checkingBadge: "Checking",
      claimedBadge: "Claimed",
      pendingClaimBadge: "Pending claim",
    },
  },
  fr: {
    nav: {
      home: "Accueil",
      sendPayment: "Envoyer",
      dashboard: "Tableau de bord",
      launchApp: "Ouvrir l'app",
      docs: "Docs",
      english: "English",
      french: "Français",
      chinese: "中文",
      comingSoon: "Bientôt disponible",
      howItWorks: "Comment ça marche",
      compare: "Comparer",
      getStarted: "Commencer",
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
    send: {
      liveTransferComposer: "Compositeur de transfert",
      sendPrivatePayment: "Envoyer un paiement privé",
      amount: "Montant (SOL)",
      minimumSol: "Minimum 0,02 SOL",
      generateClaimLink: "Générer le lien",
      readyToPrepare: "Prêt à préparer le dépôt.",
      connectWalletToBegin: "Connectez un wallet pour commencer.",
      preparingDeposit: "Préparation du dépôt et de la preuve...",
      waitingForSignature: "En attente de la signature du wallet...",
      submittingTransaction: "Envoi de la transaction sur Solana...",
      confirmingOnChain: "Confirmation on-chain...",
      depositConfirmed: "Dépôt confirmé.",
      claimLinkLabel: "Lien de réclamation",
      signatureLabel: "Signature :",
      openDashboardPrefix: "Ouvrez le ",
      openDashboardSuffix:
        " pour gérer et recopier ce lien plus tard.",
      dashboardLinkText: "tableau de bord",
    },
    claim: {
      eyebrow: "Flux de réclamation",
      heroTitle: "Réclamez un paiement privé en un clic.",
      heroBody:
        "Cove reconstruit le chemin de la preuve derrière le lien de réclamation afin que le destinataire connecte son wallet et règle instantanément.",
      bullet1:
        "Les liens de réclamation sont à usage unique et contiennent la preuve de dépense privée.",
      bullet2:
        "Le mode relais peut couvrir l'envoi sans débiter de frais sur votre wallet.",
      bullet3:
        "Le wallet du destinataire reste détaché du fil DM d'origine.",
      redemptionModule: "Module de réclamation",
      claimAPrivatePayment: "Réclamer un paiement privé",
      privateSpend: "Dépense privée",
      amountLabel: "Montant",
      delivery: "Livraison",
      encryptedWitness: "Preuve de réclamation chiffrée incluse",
      recipientWallet: "Wallet du destinataire",
      claimToMyWallet: "Réclamer vers mon wallet",
      readyToClaim: "Prêt à réclamer.",
      connectWalletToBegin: "Connectez un wallet pour commencer.",
      preparingClaim: "Préparation de la preuve et de la transaction...",
      waitingForSignature: "En attente de la signature du wallet...",
      submittingTransaction: "Envoi de la transaction...",
      confirmingOnChain: "Confirmation on-chain...",
      claimConfirmed: "Réclamation confirmée.",
      claimedViaRelay:
        "Réclamé via le relais Cove. Aucun frais de transaction n'a été débité de votre wallet.",
      signatureLabel: "Signature :",
      viewOnSolscan: "Voir sur Solscan",
      noPayloadInUrl: "Aucun contenu de réclamation dans l'URL.",
      missingBlinding:
        "Ce lien de réclamation n'a pas le facteur d'aveuglement (r) et ne peut pas être réclamé. Il a probablement été généré par une ancienne version de Cove.",
      failedToDecodePrefix: "Impossible de décoder le lien de réclamation : ",
    },
    dashboard: {
      eyebrow: "Registre de règlement privé",
      title: "Vos dépôts",
      subtitle:
        "Suivez l'état des réclamations, recopiez les liens et exportez l'historique sans quitter Cove.",
      trackedDeposits: "Dépôts suivis",
      pendingClaims: "Réclamations en attente",
      claimedStat: "Réclamés",
      complianceSafeExport:
        "Export conforme et gestion des réclamations",
      depositActivity: "Activité des dépôts",
      exportCsv: "Exporter CSV",
      exporting: "Export en cours...",
      readingLocal: "Lecture des dépôts locaux...",
      noDepositsFoundPrefix: "Aucun dépôt trouvé pour le moment. Commencez par ",
      noDepositsFoundLinkLabel: "/send",
      colAmount: "Montant",
      colMint: "Mint",
      colStatus: "État",
      colDepositTx: "Tx du dépôt",
      colActions: "Actions",
      copyClaimLink: "Copier le lien",
      loadingState: "Chargement...",
      copied: "Copié",
      errorPrefix: "Erreur : ",
      checkingBadge: "Vérification",
      claimedBadge: "Réclamé",
      pendingClaimBadge: "En attente",
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
