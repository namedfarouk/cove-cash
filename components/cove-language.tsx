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
    footerCopyright: string;
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
    alreadyClaimed: string;
    alreadyClaimedBody: string;
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
  legal: {
    common: {
      eyebrow: string;
      atAGlance: string;
      quickSummary: string;
      openApp: string;
      termsShort: string;
      privacyShort: string;
    };
    terms: {
      title: string;
      intro: string;
      ctaPrivacy: string;
      takeaways: string[];
      sections: Array<{
        title: string;
        points: string[];
      }>;
    };
    privacy: {
      title: string;
      intro: string;
      ctaTerms: string;
      takeaways: string[];
      sections: Array<{
        title: string;
        points: string[];
      }>;
    };
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
      heroTitle: "Send SOL & Stablecoins privately. No wallet address required.",
      heroBody:
        "Deposit SOL, USDC, or USDT. Generate an encrypted link. DM it to anyone. Stop asking for public keys and start settling instantly.",
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
      footerCopyright: "© 2026 Cove. All rights reserved.",
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
      alreadyClaimed: "Already Claimed",
      alreadyClaimedBody: "This claim link has already been used and can no longer be redeemed.",
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
    legal: {
      common: {
        eyebrow: "Legal",
        atAGlance: "At a Glance",
        quickSummary: "Quick Summary",
        openApp: "Open App",
        termsShort: "Terms",
        privacyShort: "Privacy",
      },
      terms: {
        title: "Terms of Service",
        intro:
          "These terms describe the rules for using Cove as a non-custodial, privacy-preserving settlement interface on Solana.",
        ctaPrivacy: "View Privacy Policy",
        takeaways: [
          "Cove is non-custodial. You sign your own transactions and retain control of your wallet and claim links.",
          "Cove relies on the Solana network, the Cloak SDK, and beta infrastructure that can fail, degrade, or change unexpectedly.",
          "Use of the interface is only permitted for lawful activity, and protocol interactions remain your responsibility.",
        ],
        sections: [
          {
            title: "1. Acceptance of Terms & Eligibility",
            points: [
              "By accessing or using Cove, you agree to these Terms of Service and represent that you are legally able to enter into a binding agreement.",
              "You are responsible for ensuring that use of a privacy-preserving settlement interface is lawful in your jurisdiction.",
              "If you do not agree to these terms, you should not use the Cove interface or interact with Cove-generated claim links.",
            ],
          },
          {
            title: "2. Use of Cove & The Solana Protocol",
            points: [
              "Cove is an application interface built for private settlement flows on Solana. It is not the Solana blockchain, a validator, or a wallet provider.",
              "Transactions depend on Solana consensus, RPC infrastructure, relay availability, browser compatibility, and smart-contract execution that Cove does not control.",
              "A transaction may fail, be delayed, or become more expensive if the underlying network is congested or if third-party infrastructure is degraded.",
            ],
          },
          {
            title: "3. Accounts & Authentication",
            points: [
              "Cove does not create custodial user accounts for normal product use. Access is mediated through cryptographic wallet authentication.",
              "Your wallet, device security, recovery phrase, and private signing environment remain your responsibility at all times.",
              "Anyone who obtains a valid private claim link may be able to redeem the underlying funds, so secure handling of links is essential.",
            ],
          },
          {
            title: "4. Payments, Escrow, & The Cloak SDK (Cove is Non-Custodial)",
            points: [
              "Cove is a non-custodial private settlement layer on Solana powered by the Cloak SDK. We do not hold customer balances, operate a bank account, or maintain off-chain custody over user funds.",
              "Private settlement is facilitated through smart-contract logic and zero-knowledge transaction flows. SOL and supported stablecoins remain subject to the rules of the deployed contracts and the Solana network.",
              "Network fees, validator behavior, token-account requirements, and on-chain execution conditions are outside Cove's control, even when the interface helps prepare the transaction.",
            ],
          },
          {
            title: "5. Prohibited Activities",
            points: [
              "You may not use Cove for unlawful conduct, sanctions evasion, fraud, market manipulation, money laundering, or abusive attempts to conceal criminal proceeds.",
              "You may not interfere with the interface, bypass rate limits, attack the product, scrape private infrastructure, or exploit vulnerabilities against Cove, Cloak, or other users.",
              "You may not impersonate another person, misrepresent affiliation, or use Cove in a way that harms the protocol, its operators, or the broader Solana ecosystem.",
            ],
          },
          {
            title: "6. Intellectual Property",
            points: [
              "The Cove brand, interface presentation, and original written materials are owned by Cove or its licensors unless otherwise noted.",
              "Open-source dependencies, including blockchain and wallet libraries, remain governed by their own licenses and terms.",
              "You may not reproduce Cove branding or proprietary interface elements in a misleading way without permission.",
            ],
          },
          {
            title: "7. Disclaimers & Assumption of Beta Risk",
            points: [
              "Cove is beta software. Features, transaction flows, supported assets, and privacy infrastructure may change without notice.",
              "You accept the risk of software bugs, proof-generation failures, relay outages, RPC inconsistencies, token-account issues, and other technical defects.",
              "No guarantee is made that the interface will be uninterrupted, error-free, or suitable for any specific use case.",
            ],
          },
          {
            title: "8. Limitation of Liability",
            points: [
              "To the maximum extent permitted by law, Cove is provided on an 'as is' and 'as available' basis without warranties of merchantability, fitness for a particular purpose, or uninterrupted availability.",
              "Cove and its contributors are not liable for wallet compromise, link leakage, smart-contract bugs, failed claims, token depegs, network delays, or other blockchain-specific losses.",
              "You are responsible for evaluating risk before using Cove with meaningful value or production payment flows.",
            ],
          },
          {
            title: "9. Termination & Governing Law",
            points: [
              "We may restrict or discontinue access to the interface for abuse, security incidents, legal compliance, or operational reasons.",
              "These terms apply to your use of the interface even if network-level transactions remain permanently recorded on-chain after access ends.",
              "Governing law and dispute treatment will apply to the maximum extent enforceable under the circumstances of use.",
            ],
          },
          {
            title: "10. Changes to Terms & Contact",
            points: [
              "We may update these terms as Cove evolves, including changes to supported assets, infrastructure, or legal requirements.",
              "Your continued use of Cove after changes become effective constitutes acceptance of the revised terms.",
              "For questions about these terms, users should reach out through Cove's official public channels or project documentation.",
            ],
          },
        ],
      },
      privacy: {
        title: "Privacy Policy",
        intro:
          "This policy explains how Cove approaches privacy, what standard web infrastructure may still observe, and how the product handles data around private settlement flows.",
        ctaTerms: "View Terms of Service",
        takeaways: [
          "Cove is built to shield payment details on-chain through zero-knowledge transaction flows rather than expose them publicly on Solana.",
          "Standard web infrastructure may still log operational metadata such as IP address, browser information, or request timing.",
          "We do not track, store, or sell the underlying financial data associated with private settlement activity.",
        ],
        sections: [
          {
            title: "1. Our Commitment to Privacy & Zero-Knowledge Architecture",
            points: [
              "Cove is designed around privacy-preserving settlement on Solana. Our product goal is to reduce public linkage between sender, recipient, and payment flow where the underlying protocol allows it.",
              "Privacy here refers primarily to on-chain settlement mechanics, not to the total elimination of all internet or hosting metadata generated when you use a website.",
              "Cove is non-custodial and built to avoid creating a conventional user database of balances, profiles, or financial histories.",
            ],
          },
          {
            title: "2. Information We Collect",
            points: [
              "The interface may process wallet public keys, token selections, transaction payloads, and claim-link data needed to prepare, recover, or complete a transaction flow.",
              "Local browser storage may be used to preserve in-progress deposit or claim state so a user can recover from a refresh or interruption.",
              "We do not require traditional account registration for normal use of the app interface.",
            ],
          },
          {
            title: "3. ZK-Proof Mechanics (How We Shield Your Data)",
            points: [
              "Cove uses the Cloak SDK and zero-knowledge proof mechanics to support private settlement on Solana.",
              "On-chain amounts, sender-recipient linkage, and claim execution details are designed to be shielded through ZK-proof flows rather than publicly exposed as plain transfers.",
              "We do not track, store, or sell the underlying financial data associated with those shielded transactions outside the transient technical handling required to submit or recover them.",
            ],
          },
          {
            title: "4. Data Handling by Third Parties (Vercel)",
            points: [
              "Cove uses standard web infrastructure and hosting, including Vercel. Like many hosts, such providers may log basic connection data such as IP addresses, browser details, request metadata, and error logs.",
              "Wallet providers, RPC endpoints, and relay infrastructure may also process operational information needed to deliver the product experience.",
              "Those third parties operate under their own terms and privacy policies, which users should review independently.",
            ],
          },
          {
            title: "5. Data Security & Retention",
            points: [
              "Cove aims to minimize retention and avoid unnecessary collection. Some data may live only in browser storage, network logs, or ephemeral request handling.",
              "Because Cove is non-custodial, many core transaction artifacts exist only in the user's wallet, device state, or on-chain execution path rather than in a centralized Cove account system.",
              "Users should treat claim links and wallet environments as sensitive because unauthorized access can compromise funds even if the app itself is privacy-focused.",
            ],
          },
          {
            title: "6. Data Rights & International Transfers",
            points: [
              "Users may have local legal rights relating to personal data depending on jurisdiction, including rights to request information or object to certain processing.",
              "Because third-party infrastructure may operate across regions, some limited operational metadata could be processed internationally.",
              "Requests relating to Cove-controlled data will be evaluated in light of the non-custodial architecture and the limited categories of data we intentionally retain.",
            ],
          },
          {
            title: "7. Contact",
            points: [
              "Questions about this Privacy Policy or Cove's data-handling model should be directed through Cove's official public channels or documentation.",
              "Users should also review the privacy policies of wallets, RPC providers, and hosting vendors that participate in the experience.",
              "Continued use of the interface after policy changes constitutes acceptance of the updated policy.",
            ],
          },
        ],
      },
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
      heroTitle: "Envoyez du SOL et des stablecoins en privé. Aucune adresse wallet requise.",
      heroBody:
        "Déposez du SOL, de l'USDC ou de l'USDT. Générez un lien chiffré. Envoyez-le en DM. Arrêtez de demander des clés publiques et réglez instantanément.",
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
      footerCopyright: "© 2026 Cove. Tous droits réservés.",
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
      alreadyClaimed: "Déjà réclamé",
      alreadyClaimedBody: "Ce lien de réclamation a déjà été utilisé et ne peut plus être encaissé.",
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
    legal: {
      common: {
        eyebrow: "Mentions légales",
        atAGlance: "À retenir",
        quickSummary: "Résumé rapide",
        openApp: "Ouvrir l'app",
        termsShort: "Conditions",
        privacyShort: "Confidentialité",
      },
      terms: {
        title: "Conditions d'utilisation",
        intro:
          "Ces conditions décrivent les règles d'utilisation de Cove en tant qu'interface de règlement non dépositaire et respectueuse de la vie privée sur Solana.",
        ctaPrivacy: "Voir la politique de confidentialité",
        takeaways: [
          "Cove est non dépositaire. Vous signez vos propres transactions et gardez le contrôle de votre wallet et de vos liens de réclamation.",
          "Cove dépend du réseau Solana, du SDK Cloak et d'une infrastructure bêta susceptible d'échouer, de se dégrader ou d'évoluer de manière imprévisible.",
          "L'utilisation de l'interface n'est autorisée que pour des activités licites, et les interactions avec le protocole restent sous votre responsabilité.",
        ],
        sections: [
          {
            title: "1. Acceptation des conditions et éligibilité",
            points: [
              "En accédant à Cove ou en l'utilisant, vous acceptez ces Conditions d'utilisation et déclarez être légalement en mesure de conclure un accord contraignant.",
              "Vous êtes responsable de vérifier que l'usage d'une interface de règlement préservant la vie privée est légal dans votre juridiction.",
              "Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser l'interface Cove ni interagir avec les liens de réclamation générés par Cove.",
            ],
          },
          {
            title: "2. Utilisation de Cove et du protocole Solana",
            points: [
              "Cove est une interface d'application conçue pour des flux de règlement privés sur Solana. Ce n'est ni la blockchain Solana, ni un validateur, ni un fournisseur de wallet.",
              "Les transactions dépendent du consensus Solana, de l'infrastructure RPC, de la disponibilité du relais, de la compatibilité navigateur et de l'exécution des smart contracts, autant d'éléments que Cove ne contrôle pas.",
              "Une transaction peut échouer, être retardée ou devenir plus coûteuse si le réseau sous-jacent est congestionné ou si une infrastructure tierce se dégrade.",
            ],
          },
          {
            title: "3. Comptes et authentification",
            points: [
              "Cove ne crée pas de comptes utilisateurs dépositaires pour un usage produit normal. L'accès est assuré par l'authentification cryptographique du wallet.",
              "Votre wallet, la sécurité de votre appareil, votre phrase de récupération et votre environnement de signature privé restent sous votre responsabilité à tout moment.",
              "Toute personne obtenant un lien de réclamation privé valide peut être en mesure d'encaisser les fonds sous-jacents ; il est donc essentiel de sécuriser ces liens.",
            ],
          },
          {
            title: "4. Paiements, séquestre et SDK Cloak (Cove est non dépositaire)",
            points: [
              "Cove est une couche de règlement privé non dépositaire sur Solana, propulsée par le SDK Cloak. Nous ne détenons pas les soldes des clients, n'exploitons pas de compte bancaire et n'assurons aucune garde hors chaîne des fonds des utilisateurs.",
              "Le règlement privé est facilité par une logique de smart contract et des flux transactionnels en zero-knowledge. Le SOL et les stablecoins pris en charge restent soumis aux règles des contrats déployés et du réseau Solana.",
              "Les frais réseau, le comportement des validateurs, les exigences liées aux comptes de tokens et les conditions d'exécution on-chain échappent au contrôle de Cove, même lorsque l'interface aide à préparer la transaction.",
            ],
          },
          {
            title: "5. Activités interdites",
            points: [
              "Vous ne pouvez pas utiliser Cove pour des activités illégales, le contournement de sanctions, la fraude, la manipulation de marché, le blanchiment ou des tentatives abusives de dissimuler des produits criminels.",
              "Vous ne pouvez pas perturber l'interface, contourner les limites de débit, attaquer le produit, aspirer une infrastructure privée ou exploiter des vulnérabilités contre Cove, Cloak ou d'autres utilisateurs.",
              "Vous ne pouvez pas usurper l'identité d'une autre personne, déformer une affiliation ou utiliser Cove d'une manière nuisible au protocole, à ses opérateurs ou à l'écosystème Solana au sens large.",
            ],
          },
          {
            title: "6. Propriété intellectuelle",
            points: [
              "La marque Cove, la présentation de l'interface et les contenus écrits originaux appartiennent à Cove ou à ses concédants, sauf indication contraire.",
              "Les dépendances open source, y compris les bibliothèques blockchain et wallet, restent régies par leurs propres licences et conditions.",
              "Vous ne pouvez pas reproduire la marque Cove ou des éléments d'interface propriétaires d'une manière trompeuse sans autorisation.",
            ],
          },
          {
            title: "7. Avertissements et acceptation du risque bêta",
            points: [
              "Cove est un logiciel bêta. Les fonctionnalités, flux de transaction, actifs pris en charge et infrastructure de confidentialité peuvent évoluer sans préavis.",
              "Vous acceptez le risque de bugs logiciels, d'échecs de génération de preuves, de pannes de relais, d'incohérences RPC, de problèmes de comptes de tokens et d'autres défauts techniques.",
              "Aucune garantie n'est donnée quant au caractère ininterrompu, exempt d'erreurs ou adapté à un cas d'usage spécifique de l'interface.",
            ],
          },
          {
            title: "8. Limitation de responsabilité",
            points: [
              "Dans la mesure maximale permise par la loi, Cove est fourni 'tel quel' et 'selon disponibilité', sans garantie de qualité marchande, d'adaptation à un usage particulier ou de disponibilité ininterrompue.",
              "Cove et ses contributeurs ne sont pas responsables des compromissions de wallet, fuites de liens, bugs de smart contracts, réclamations échouées, dépeg de tokens, retards réseau ou autres pertes spécifiques à la blockchain.",
              "Il vous incombe d'évaluer le risque avant d'utiliser Cove avec des montants significatifs ou dans des flux de paiement en production.",
            ],
          },
          {
            title: "9. Résiliation et droit applicable",
            points: [
              "Nous pouvons restreindre ou interrompre l'accès à l'interface pour cause d'abus, d'incidents de sécurité, de conformité légale ou pour des raisons opérationnelles.",
              "Ces conditions s'appliquent à votre utilisation de l'interface même si les transactions au niveau réseau restent enregistrées de manière permanente on-chain après la fin de l'accès.",
              "Le droit applicable et le traitement des litiges s'appliqueront dans la mesure maximale exécutoire compte tenu des circonstances d'utilisation.",
            ],
          },
          {
            title: "10. Modifications des conditions et contact",
            points: [
              "Nous pouvons mettre à jour ces conditions à mesure que Cove évolue, notamment en cas de changement d'actifs pris en charge, d'infrastructure ou d'exigences légales.",
              "Votre utilisation continue de Cove après l'entrée en vigueur des modifications vaut acceptation des conditions révisées.",
              "Pour toute question relative à ces conditions, les utilisateurs doivent contacter Cove via ses canaux publics officiels ou sa documentation projet.",
            ],
          },
        ],
      },
      privacy: {
        title: "Politique de confidentialité",
        intro:
          "Cette politique explique l'approche de Cove en matière de confidentialité, ce que l'infrastructure web standard peut encore observer et la manière dont le produit traite les données liées aux flux de règlement privés.",
        ctaTerms: "Voir les conditions d'utilisation",
        takeaways: [
          "Cove est conçu pour protéger les détails de paiement on-chain grâce à des flux zero-knowledge au lieu de les exposer publiquement sur Solana.",
          "L'infrastructure web standard peut tout de même journaliser des métadonnées opérationnelles telles que l'adresse IP, les informations navigateur ou le timing des requêtes.",
          "Nous ne suivons pas, ne stockons pas et ne vendons pas les données financières sous-jacentes associées à l'activité de règlement privé.",
        ],
        sections: [
          {
            title: "1. Notre engagement pour la confidentialité et l'architecture zero-knowledge",
            points: [
              "Cove est conçu autour d'un règlement préservant la vie privée sur Solana. Notre objectif produit est de réduire le lien public entre l'expéditeur, le destinataire et le flux de paiement lorsque le protocole sous-jacent le permet.",
              "Ici, la confidentialité concerne principalement les mécanismes de règlement on-chain, et non l'élimination totale de toutes les métadonnées internet ou d'hébergement générées lors de l'utilisation d'un site web.",
              "Cove est non dépositaire et conçu pour éviter la création d'une base de données utilisateur classique contenant soldes, profils ou historiques financiers.",
            ],
          },
          {
            title: "2. Informations que nous collectons",
            points: [
              "L'interface peut traiter les clés publiques de wallet, les sélections de tokens, les charges utiles transactionnelles et les données de liens de réclamation nécessaires pour préparer, récupérer ou finaliser un flux de transaction.",
              "Le stockage local du navigateur peut être utilisé pour préserver l'état d'un dépôt ou d'une réclamation en cours afin qu'un utilisateur puisse se remettre d'un rafraîchissement ou d'une interruption.",
              "Nous n'exigeons pas de création de compte traditionnelle pour l'utilisation normale de l'interface.",
            ],
          },
          {
            title: "3. Mécanique des preuves ZK (comment nous protégeons vos données)",
            points: [
              "Cove utilise le SDK Cloak et des mécanismes de preuve zero-knowledge pour prendre en charge le règlement privé sur Solana.",
              "Les montants on-chain, le lien expéditeur-destinataire et les détails d'exécution de la réclamation sont conçus pour être protégés par des flux ZK plutôt que publiquement exposés comme des transferts simples.",
              "Nous ne suivons pas, ne stockons pas et ne vendons pas les données financières sous-jacentes associées à ces transactions protégées, en dehors du traitement technique transitoire requis pour les soumettre ou les récupérer.",
            ],
          },
          {
            title: "4. Traitement des données par des tiers (Vercel)",
            points: [
              "Cove utilise une infrastructure web standard et un hébergement incluant Vercel. Comme beaucoup d'hébergeurs, ces fournisseurs peuvent journaliser des données de connexion de base telles que les adresses IP, les détails navigateur, les métadonnées de requête et les journaux d'erreurs.",
              "Les fournisseurs de wallets, points RPC et infrastructure de relais peuvent également traiter les informations opérationnelles nécessaires pour fournir l'expérience produit.",
              "Ces tiers opèrent selon leurs propres conditions et politiques de confidentialité, que les utilisateurs doivent consulter indépendamment.",
            ],
          },
          {
            title: "5. Sécurité et conservation des données",
            points: [
              "Cove cherche à minimiser la conservation et à éviter la collecte inutile. Certaines données peuvent n'exister que dans le stockage navigateur, les journaux réseau ou le traitement éphémère des requêtes.",
              "Parce que Cove est non dépositaire, de nombreux artefacts transactionnels essentiels n'existent que dans le wallet de l'utilisateur, l'état de son appareil ou le parcours d'exécution on-chain plutôt que dans un système de compte Cove centralisé.",
              "Les utilisateurs doivent traiter les liens de réclamation et les environnements de wallet comme sensibles, car un accès non autorisé peut compromettre les fonds même si l'application elle-même est orientée confidentialité.",
            ],
          },
          {
            title: "6. Droits sur les données et transferts internationaux",
            points: [
              "Les utilisateurs peuvent disposer de droits légaux locaux relatifs aux données personnelles selon leur juridiction, y compris des droits de demander des informations ou de s'opposer à certains traitements.",
              "Comme l'infrastructure tierce peut opérer dans plusieurs régions, certaines métadonnées opérationnelles limitées peuvent être traitées à l'international.",
              "Les demandes portant sur des données contrôlées par Cove seront évaluées à la lumière de l'architecture non dépositaire et des catégories limitées de données que nous conservons intentionnellement.",
            ],
          },
          {
            title: "7. Contact",
            points: [
              "Les questions relatives à cette Politique de confidentialité ou au modèle de traitement des données de Cove doivent être adressées via les canaux publics officiels ou la documentation de Cove.",
              "Les utilisateurs doivent également consulter les politiques de confidentialité des wallets, fournisseurs RPC et hébergeurs participant à l'expérience.",
              "L'utilisation continue de l'interface après modification de la politique vaut acceptation de la politique mise à jour.",
            ],
          },
        ],
      },
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
