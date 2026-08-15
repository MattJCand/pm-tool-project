(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.PMTool = root.PMTool || {};
    root.PMTool.logic = root.PMTool.logic || {};
    root.PMTool.logic.ideaClassifier = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
const VALID_BUSINESS = ['clear', 'vague', 'none'];
const VALID_SIGNALS = ['strong', 'weak', 'none'];
const VALID_PROBLEM = ['clear', 'partial', 'unclear'];
const VALID_SOLUTION = ['clear_small', 'clear_big', 'vague', 'none'];

function classifyIdea(answers = {}) {
  const { business, signals, problem, solution } = answers;

  if (
    !VALID_BUSINESS.includes(business) ||
    !VALID_SIGNALS.includes(signals) ||
    !VALID_PROBLEM.includes(problem) ||
    !VALID_SOLUTION.includes(solution)
  ) {
    return {
      recommendation: null,
      rationale: 'Réponses manquantes ou invalides.',
      nextSteps: [],
    };
  }

  if (business === 'none') {
    return {
      recommendation: "Reformuler d'abord",
      tag: '⚠️ Hors process',
      tagClass: 'tag-reformuler',
      rationale:
        "Cette idée n'est pas encore liée à un objectif business identifié. Sans cet ancrage, elle ne peut pas entrer dans le process produit : elle risque de générer du build sans valeur mesurable.",
      reference:
        "Inspiré de Teresa Torres (Continuous Discovery Habits) : une opportunité sans lien avec un outcome business n'a pas sa place dans l'Opportunity Solution Tree.",
      nextSteps: [
        "Identifie l'objectif business de ton équipe pour ce trimestre",
        "Reformule l'idée comme un problème utilisateur lié à cet objectif",
        "Si le lien est introuvable, mets l'idée en parking lot",
        'Reviens dessus lors du prochain cycle de planification',
      ],
      diamond: [],
    };
  }

  if (business === 'vague' && signals === 'none') {
    return {
      recommendation: "Reformuler d'abord",
      tag: '⚠️ Lien business à clarifier',
      tagClass: 'tag-reformuler',
      rationale:
        "Le lien avec un objectif business n'est qu'une intuition, et aucun signal utilisateur ne vient la renforcer. C'est la combinaison la plus risquée : ni la valeur business ni le besoin utilisateur ne sont établis. Clarifie l'un des deux avant d'investir du temps de discovery.",
      reference:
        "Inspiré de Melissa Perri (Escaping the Build Trap) : sans lien business explicite ni signal utilisateur, une idée reste une hypothèse non ancrée, pas un sujet à traiter.",
      nextSteps: [
        "Reformule le lien business : à quel objectif d'équipe ça sert précisément ?",
        "À défaut, cherche un premier signal utilisateur (interview rapide, ticket support, donnée d'usage)",
        "Si ni l'un ni l'autre n'émerge, mets l'idée en parking lot",
        'Reviens dessus quand un des deux points est éclairci',
      ],
      diamond: [],
    };
  }

  if (business === 'vague' && problem === 'clear') {
    return {
      recommendation: "Reformuler d'abord",
      tag: '⚠️ Lien business à clarifier',
      tagClass: 'tag-reformuler',
      rationale:
        "Le problème est déjà bien compris et tu es sur le point d'avancer vers une solution concrète (voire un quick win), mais le lien avec un objectif business reste une intuition, pas un lien explicite. Committer maintenant risque de livrer quelque chose qui ne sert aucun outcome mesurable, même si le problème lui-même est réel.",
      reference:
        "Inspiré de Teresa Torres (Continuous Discovery Habits) : l'outcome business est la racine de l'Opportunity Solution Tree. Un lien vague doit être rendu explicite avant d'avancer, pas seulement un lien totalement absent.",
      nextSteps: [
        "Reformule en une phrase l'objectif business précis que cette idée sert",
        'Vérifie ce lien avec un stakeholder ou ton manager avant de continuer',
        'Si le lien se confirme, reprends la classification avec un lien business clair',
        'Si le lien ne tient pas, remets l\'idée en discovery ou en parking lot',
      ],
      diamond: [],
    };
  }

  if (signals === 'none' && (problem === 'unclear' || problem === 'partial')) {
    return {
      recommendation: 'Double Discovery',
      tag: '🔷 Discovery Problème + Solution',
      tagClass: 'tag-double',
      rationale:
        "Le problème n'est pas encore validé et la solution reste floue. Il faut d'abord explorer l'espace du problème avant de chercher des solutions : c'est le double diamant complet.",
      reference:
        "Inspiré de Melissa Perri : les équipes qui sautent à la solution sans valider le problème tombent dans le build trap. Inspiré de Teresa Torres : commence par cartographier les opportunités avant d'explorer les solutions.",
      nextSteps: [
        'Phase 1 (Discovery problème) : mène 5 interviews exploratoires sur le problème',
        'Cartographie les opportunités avec un Opportunity Solution Tree',
        'Valide que le problème mérite d\'être résolu (fréquence, impact, alternatives actuelles)',
        'Phase 2 (Discovery solution) : génère et teste plusieurs pistes de solutions',
        'Prototype et valide avant de passer en développement',
      ],
      diamond: ['Discovery Problème', '→', 'Discovery Solution', '→', 'Initiative'],
    };
  }

  if ((signals === 'weak' || signals === 'strong') && (problem === 'partial' || problem === 'unclear')) {
    return {
      recommendation: 'Discovery Solution',
      tag: '🔵 Discovery Solution uniquement',
      tagClass: 'tag-solution',
      rationale:
        'Le problème est suffisamment compris pour avancer, mais la solution reste à explorer. Tu peux entrer directement dans la phase de discovery solution sans repasser par la discovery problème.',
      reference:
        "Inspiré de Teresa Torres : quand l'opportunité est bien définie, l'équipe peut passer directement à l'exploration des solutions dans l'OST.",
      nextSteps: [
        'Formalise l\'opportunité : problème, utilisateurs impactés, contexte',
        'Génère plusieurs pistes de solutions (pas une seule)',
        'Prototype la ou les solutions les plus prometteuses',
        'Teste avec de vrais utilisateurs avant de développer',
      ],
      diamond: ['Discovery Solution', '→', 'Initiative'],
    };
  }

  // À partir d'ici, problem === 'clear' pour toutes les combinaisons restantes.

  if (solution === 'clear_big') {
    if (signals !== 'none') {
      return {
        recommendation: 'Initiative',
        tag: '🟣 Initiative',
        tagClass: 'tag-initiative',
        rationale:
          "Le problème est bien compris, confirmé par au moins un signal utilisateur, et la solution est claire. C'est le bon moment pour passer en mode exécution : définir le scope, aligner l'équipe, et planifier le développement.",
        reference:
          "Inspiré de Melissa Perri : une initiative naît quand on a suffisamment de clarté sur le problème ET une direction solution validée.",
        nextSteps: [
          'Rédige un problem statement clair partagé avec l\'équipe',
          'Définis les critères de succès (metrics)',
          'Découpe en étapes livrables (milestones)',
          'Planifie les sprints et aligne les parties prenantes',
        ],
        diamond: ['Initiative', '→', 'Backlog'],
      };
    }

    return {
      recommendation: 'Discovery Solution',
      tag: '🔵 Valider avant de lancer',
      tagClass: 'tag-solution',
      rationale:
        "Le problème te paraît clair et tu envisages déjà une solution de grande ampleur, mais aucun signal utilisateur ne confirme ce problème pour l'instant. Un chantier de cette taille ne doit jamais démarrer sur une simple intuition interne : valide vite avant de committer l'équipe.",
      reference:
        "Inspiré de Teresa Torres : ne construis jamais une initiative sans preuve que l'opportunité est réelle, même si elle te paraît évidente.",
      nextSteps: [
        "Mène 3 à 5 interviews rapides pour confirmer que le problème est vécu tel que tu l'imagines",
        "Vérifie les données d'usage ou de support disponibles",
        "Si le problème est confirmé, repasse par cette étape avec un signal renseigné pour lancer l'Initiative",
        "Si le problème n'est pas confirmé, réexplore les solutions avant de t'engager",
      ],
      diamond: ['Discovery Solution', '→', 'Initiative'],
    };
  }

  if (solution === 'clear_small') {
    if (signals !== 'none') {
      return {
        recommendation: 'Ticket Backlog',
        tag: '🟡 Direct en Backlog',
        tagClass: 'tag-backlog',
        rationale:
          "La solution est claire, l'effort est minimal, et un signal utilisateur confirme que ça vaut le coup. Pas besoin de passer par une phase de discovery complète : c'est un quick win à planifier directement dans le backlog.",
        reference:
          "Inspiré de Melissa Perri : les quick wins avec une solution évidente, un faible risque et un signal de validation n'ont pas besoin de discovery. L'over-process tue la vélocité.",
        nextSteps: [
          "Rédige le ticket avec contexte, critères d'acceptation et effort estimé",
          'Priorise-le dans le backlog selon l\'impact / effort',
          'Assigne-le au prochain sprint disponible',
          'Mesure l\'impact après livraison',
        ],
        diamond: ['Backlog'],
      };
    }

    return {
      recommendation: 'Ticket Backlog (vérification rapide)',
      tag: '🟡 Backlog après vérification',
      tagClass: 'tag-backlog',
      rationale:
        "L'effort est minimal et la solution te semble évidente, mais aucun signal ne confirme encore que ce problème est vécu par tes utilisateurs. Même pour un quick win, engager du temps de développement sans le moindre signal reste un pari. Une vérification légère (pas une discovery complète) suffit avant de committer.",
      reference:
        "Inspiré de Melissa Perri : un quick win reste un pari tant qu'aucun signal, même faible, ne confirme le problème qu'il résout.",
      nextSteps: [
        "Vérifie rapidement les données disponibles : tickets support, analytics, retours commerciaux",
        "Si possible, confirme avec 1 ou 2 utilisateurs en quelques minutes",
        'Si un signal apparaît, rédige le ticket et priorise-le dans le backlog',
        "Si aucun signal n'apparaît, reconsidère la priorité de cette idée",
      ],
      diamond: ['Vérification rapide', '→', 'Backlog'],
    };
  }

  // problem === 'clear' && solution ∈ {'vague', 'none'}

  if (signals === 'strong') {
    return {
      recommendation: 'Discovery Solution',
      tag: '🔵 Discovery Solution uniquement',
      tagClass: 'tag-solution',
      rationale:
        "Le problème est bien documenté et validé par les utilisateurs. Il ne reste qu'à trouver la bonne solution : entre directement en discovery solution sans repasser par la case problème.",
      reference:
        "Inspiré de Teresa Torres : ne retourne pas en discovery problème si l'opportunité est déjà bien définie. Concentre-toi sur l'exploration des solutions.",
      nextSteps: [
        'Liste les contraintes et critères de la solution idéale',
        'Génère au minimum 3 pistes de solutions différentes',
        'Prototype la plus prometteuse rapidement',
        'Teste et itère avant de committer en développement',
      ],
      diamond: ['Discovery Solution', '→', 'Initiative'],
    };
  }

  // problem === 'clear', solution ∈ {'vague', 'none'}, signals ∈ {'weak', 'none'}
  return {
    recommendation: 'Discovery Solution',
    tag: '🔵 Discovery Solution (renforcer les signaux)',
    tagClass: 'tag-solution',
    rationale:
      "Le problème te semble déjà clair, mais les signaux utilisateurs qui le confirment sont faibles ou absents, contrairement à un problème réellement validé. Explore les solutions, mais fais-le en parallèle d'une collecte de signaux plus solides : ne fige rien tant que le problème n'est pas confirmé de l'extérieur.",
    reference:
      "Inspiré de Teresa Torres : une opportunité qui paraît claire en interne doit toujours être recoupée avec des signaux utilisateurs externes avant qu'on investisse dans ses solutions.",
    nextSteps: [
      'Génère 2 à 3 pistes de solutions sans t\'y engager encore',
      "En parallèle, mène quelques interviews ou vérifie les données pour confirmer le problème",
      "Priorise la piste la plus prometteuse une fois le problème confirmé",
      "Prototype et teste avant de développer",
    ],
    diamond: ['Discovery Solution', '→', 'Initiative'],
  };
}

  return { classifyIdea };
});
