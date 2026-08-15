(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.PMTool = root.PMTool || {};
    root.PMTool.logic = root.PMTool.logic || {};
    root.PMTool.logic.protoAdvisor = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
const MATRIX = {
  desirability: {
    behavior: {
      proto: 'Landing Page',
      tag: 'Désirabilité · Comportement',
      rationale:
        'Tu veux savoir si les gens cliquent, s\'inscrivent, agissent. Une landing page avec un CTA clair te donnera des données réelles en 24-48h sans construire quoi que ce soit.',
      nextSteps: [
        'Rédige une promesse claire en une ligne',
        'Crée la landing avec un CTA (bouton, formulaire)',
        'Drive du trafic dessus (5-10 personnes de ta cible)',
        'Mesure le taux de clic / signup',
      ],
    },
    qualitative: {
      proto: "Script d'interview",
      tag: 'Désirabilité · Qualitatif',
      rationale:
        "Avant de construire quoi que ce soit, parle à 5 personnes. Un bon script d'interview te révélera si le problème est réel et si ta solution résonne, sans écrire une ligne de code.",
      nextSteps: [
        'Prépare 5-7 questions ouvertes sur le problème (pas la solution)',
        'Recrute 5 personnes de ta cible exacte',
        'Conduis les interviews en 30 min chacune',
        'Cherche les patterns récurrents dans les réponses',
      ],
    },
    technical: {
      proto: 'Wizard of Oz',
      tag: 'Désirabilité · Preuve tech',
      rationale:
        "Simule le système manuellement derrière une interface simple. L'utilisateur pense que c'est automatisé, toi tu fais tout à la main. Tu valides la désirabilité avant d'investir en dev.",
      nextSteps: [
        'Construis une interface minimaliste (Figma, no-code)',
        'Effectue les actions \'automatiques\' manuellement en coulisses',
        'Observe comment les utilisateurs interagissent',
        'Décide si ça vaut la peine d\'automatiser',
      ],
    },
    intent: {
      proto: 'Fake Door',
      tag: 'Désirabilité · Intention',
      rationale:
        "Ajoute un bouton ou une option qui n'existe pas encore dans ton produit. Mesure combien de gens cliquent dessus. C'est le signal d'intent le plus honnête qui soit.",
      nextSteps: [
        'Identifie où placer le \'fake door\' dans ton produit actuel',
        'Ajoute le bouton / lien avec un message \'Bientôt disponible\'',
        'Mesure le taux de clic sur 1-2 semaines',
        'Analyse qui clique (segment, usage...)',
      ],
    },
  },
  feasibility: {
    behavior: {
      proto: 'Spike technique',
      tag: 'Faisabilité · Comportement',
      rationale:
        'Code un prototype jetable focalisé sur la partie la plus risquée techniquement. Pas besoin de UI, pas besoin d\'être propre, juste prouver que ça marche.',
      nextSteps: [
        'Identifie le risque technique le plus critique',
        'Code le minimum pour tester ce point précis',
        'Fixe un timebox strict (1-3 jours max)',
        'Documente ce que tu as appris, pas ce que tu as construit',
      ],
    },
    qualitative: {
      proto: 'Discussion technique',
      tag: 'Faisabilité · Qualitatif',
      rationale:
        'Avant de coder, parle aux ingénieurs ou experts du domaine. Une conversation de 30 minutes peut t\'éviter des semaines de développement dans le mauvais sens.',
      nextSteps: [
        'Prépare tes questions techniques précises',
        'Implique 1-2 devs ou experts dès maintenant',
        'Cartographie les dépendances et blockers potentiels',
        'Décide d\'un go / no-go avant de commencer',
      ],
    },
    technical: {
      proto: 'POC (Proof of Concept)',
      tag: 'Faisabilité · Preuve tech',
      rationale:
        'Un POC ciblé sur le point le plus incertain techniquement. L\'objectif n\'est pas d\'avoir quelque chose de beau, c\'est de répondre à \'est-ce qu\'on peut le faire ?\'',
      nextSteps: [
        'Définis la question technique exacte à répondre',
        'Construis le POC le plus minimal possible',
        'Teste en conditions proches du réel',
        'Documente les limites et les risques restants',
      ],
    },
    intent: {
      proto: 'Chiffrage rapide',
      tag: 'Faisabilité · Intention',
      rationale:
        'Estime le coût de construction avant de valider la demande. Parfois le vrai risque c\'est que le coût de build dépasse ce que les clients paieraient.',
      nextSteps: [
        'Fais une estimation rough du coût de dev (T-shirt sizing)',
        'Compare avec le revenu potentiel réaliste',
        'Identifie les hypothèses critiques dans ton calcul',
        'Valide les hypothèses les plus incertaines en premier',
      ],
    },
  },
  viability: {
    behavior: {
      proto: 'Concierge MVP',
      tag: 'Viabilité · Comportement',
      rationale:
        "Livre le service manuellement, à la main, en te présentant ouvertement comme un service non automatisé (à la différence d'un Wizard of Oz, l'utilisateur sait que c'est manuel). Teste le modèle économique avant de construire l'infrastructure : si les gens paient pour un service manuel assumé, ils paieront pour la version automatisée.",
      nextSteps: [
        'Définis ton pricing hypothesis',
        'Livre l\'offre à la main, à ce prix, en étant transparent sur le côté manuel',
        'Trouve 3-5 clients potentiels et propose-leur',
        'Mesure la willingness to pay réelle',
      ],
    },
    qualitative: {
      proto: 'Entretien économique',
      tag: 'Viabilité · Qualitatif',
      rationale:
        'Parle aux décideurs, pas aux utilisateurs. Les questions business (budget, process d\'achat, alternatives actuelles) révèlent si ton modèle tient la route.',
      nextSteps: [
        'Identifie qui contrôle le budget chez ta cible',
        'Prépare des questions sur les coûts actuels et le ROI attendu',
        'Explore le processus de décision d\'achat',
        'Valide ton pricing et ton canal de distribution',
      ],
    },
    technical: {
      proto: 'Business case chiffré',
      tag: 'Viabilité · Preuve tech',
      rationale:
        'Construis un modèle financier simple avec tes hypothèses les plus incertaines. L\'objectif est d\'identifier les leviers qui font ou cassent la viabilité.',
      nextSteps: [
        'Modélise tes hypothèses de revenus et coûts',
        'Identifie les 2-3 hypothèses les plus sensibles',
        'Teste ces hypothèses en priorité',
        'Définis ton seuil de viabilité minimum',
      ],
    },
    intent: {
      proto: 'Landing Page + Pricing',
      tag: 'Viabilité · Intention',
      rationale:
        'Une landing page avec un vrai prix affiché et un bouton \'Acheter\' ou \'Réserver\' te donnera le signal le plus honnête sur la willingness to pay.',
      nextSteps: [
        'Crée une landing avec ta proposition de valeur claire',
        'Affiche ton prix réel (pas \'contactez-nous\')',
        'Ajoute un CTA d\'achat ou de réservation',
        'Mesure le taux de conversion sur ta cible',
      ],
    },
  },
  usability: {
    behavior: {
      proto: 'Test utilisateur sur prototype Figma',
      tag: 'Utilisabilité · Comportement',
      rationale:
        'Crée un prototype cliquable dans Figma et observe des utilisateurs réels naviguer dedans. Tu identifieras les points de friction avant d\'écrire une ligne de code.',
      nextSteps: [
        'Crée un prototype Figma des écrans principaux',
        'Définis 2-3 tâches à faire accomplir',
        'Observe 5 utilisateurs en silence (ne les aide pas)',
        'Note où ils bloquent, hésitent, ou se trompent',
      ],
    },
    qualitative: {
      proto: 'Test de 5 secondes',
      tag: 'Utilisabilité · Qualitatif',
      rationale:
        'Montre ton interface 5 secondes à quelqu\'un. Demande-lui ce qu\'il a retenu et ce qu\'il ferait. Tu sauras immédiatement si ton UX est clair ou confus.',
      nextSteps: [
        'Prépare une capture de ton interface principale',
        'Montre-la 5 secondes à 5-10 personnes',
        'Demande : \'C\'est quoi ce produit ? Que feriez-vous ?\'',
        'Identifie les incompréhensions récurrentes',
      ],
    },
    technical: {
      proto: 'Prototype interactif no-code',
      tag: 'Utilisabilité · Preuve tech',
      rationale:
        'Construis une version fonctionnelle légère avec des outils no-code. Ça te permettra de tester des interactions réelles sans coût de dev.',
      nextSteps: [
        'Choisis ton outil no-code adapté (Bubble, Webflow, Glide...)',
        'Construis les 2-3 flows critiques uniquement',
        'Teste avec des utilisateurs réels de ta cible',
        'Itère rapidement sur les points de friction',
      ],
    },
    intent: {
      proto: 'Test de tri de cartes',
      tag: 'Utilisabilité · Intention',
      rationale:
        'Fais trier des cartes représentant tes features par des utilisateurs. Tu découvriras leur modèle mental, essentiel avant de décider de l\'architecture de ton produit.',
      nextSteps: [
        'Liste tes features / contenus sur des cartes',
        'Demande à 5 utilisateurs de les regrouper comme ils le sentent',
        'Compare leurs groupements avec ta logique actuelle',
        'Restructure ton IA selon leurs modèles mentaux',
      ],
    },
  },
};

const VALID_RISK = Object.keys(MATRIX);
const VALID_NEED = ['behavior', 'qualitative', 'technical', 'intent'];

const FRAMEWORK_AUTHOR = 'Marty Cagan, SVPG (cadre désirabilité / faisabilité / viabilité / utilisabilité)';
const FRAMEWORK_REFERENCE =
  "Inspiré de Marty Cagan (Silicon Valley Product Group) : un prototype ne sert jamais qu'à valider une seule chose à la fois (désirabilité, faisabilité, viabilité ou utilisabilité). Ce sont les mêmes quatre risques que ceux évalués dans DiscoveryAdvisor et IdeaClassifier, vus ici sous l'angle de la validation plutôt que de l'exploration.";

function recommendPrototype(answers = {}) {
  const { risk, need } = answers;

  if (!VALID_RISK.includes(risk) || !VALID_NEED.includes(need)) {
    return {
      recommendation: null,
      rationale: 'Réponses manquantes ou invalides.',
      nextSteps: [],
    };
  }

  const entry = MATRIX[risk][need];

  return {
    recommendation: entry.proto,
    tag: entry.tag,
    author: FRAMEWORK_AUTHOR,
    reference: FRAMEWORK_REFERENCE,
    rationale: entry.rationale,
    nextSteps: entry.nextSteps,
  };
}

  return { recommendPrototype };
});
