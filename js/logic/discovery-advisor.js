(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.PMTool = root.PMTool || {};
    root.PMTool.logic = root.PMTool.logic || {};
    root.PMTool.logic.discoveryAdvisor = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
const VALID_GOAL = ['understand_problem', 'explore_solutions', 'align_team', 'plan_delivery'];
const VALID_CLARITY = ['none', 'partial', 'good', 'solution_known'];
const VALID_AUDIENCE = ['solo', 'team', 'stakeholders', 'all'];
const VALID_HORIZON = ['feature', 'product', 'vision'];
const VALID_DEPTH = ['quick', 'deep'];

const PROTO_BRIDGE =
  'ProtoAdvisor (une fois une piste priorisée, choisis comment la valider avant de construire)';

const ARTEFACTS = {
  ost: {
    name: 'Opportunity Solution Tree',
    author: 'Teresa Torres — Continuous Discovery Habits',
    rationale:
      "L'OST est l'artefact central de la discovery. Il structure la relation entre ton outcome business, les opportunités utilisateurs, les solutions possibles et les expériences à mener. Il t'évite de sauter à la solution avant d'avoir cartographié l'espace du problème.",
    reference:
      "Inspiré de Teresa Torres : l'OST force à rester connecté à l'outcome business tout en explorant l'espace des opportunités de façon systématique. C'est une carte vivante, pas un livrable figé.",
    nextSteps: [
      "Pose ton outcome business en haut de l'arbre",
      'Liste toutes les opportunités (besoins, douleurs, désirs) sans juger',
      "Regroupe et priorise les opportunités par impact",
      'Pour chaque opportunité prioritaire, génère plusieurs solutions',
      'Identifie les hypothèses à tester en premier',
    ],
    also: [
      'Story Mapping (si tu passes en delivery)',
      'Assumption Mapping (pour tester tes hypothèses)',
      PROTO_BRIDGE,
    ],
  },
  story_map: {
    name: 'Story Mapping',
    author: 'Jeff Patton — User Story Mapping',
    rationale:
      "Le Story Map permet de visualiser le parcours utilisateur complet et de séquencer les features à développer. C'est l'outil idéal quand le problème est compris et qu'on doit planifier ce qu'on va construire — et dans quel ordre.",
    reference:
      "Inspiré de Jeff Patton : une story map replace chaque user story dans son contexte d'usage. Elle montre le grand tableau que les backlogs à plat font disparaître.",
    nextSteps: [
      'Identifie les grandes activités utilisateur (axe horizontal)',
      'Décompose chaque activité en tâches détaillées',
      'Priorise verticalement : ce qui est essentiel vs ce qui peut attendre',
      'Trace une ligne horizontale pour définir ton MVP',
      'Aligne l\'équipe sur la slice minimale à livrer en premier',
    ],
    also: [
      "OST (si des zones d'incertitude remontent)",
      'Impact Mapping (pour valider les priorités business)',
      'ProtoAdvisor (pour valider chaque slice avant de la construire pour de bon)',
    ],
  },
  impact_map: {
    name: 'Impact Mapping',
    author: 'Gojko Adzic — Impact Mapping',
    rationale:
      "L'Impact Map aligne les features sur les objectifs business en posant quatre questions : Pourquoi ? (objectif) Qui ? (acteurs) Comment ? (impacts) Quoi ? (livrables). C'est l'artefact parfait pour aligner stakeholders business et équipe produit sur les priorités.",
    reference:
      "Inspiré de Gojko Adzic : l'Impact Map évite de builder des features déconnectées des objectifs. Elle force la conversation sur l'impact attendu avant de parler de solution.",
    nextSteps: [
      'Définis l\'objectif business mesurable au centre',
      "Identifie les acteurs qui peuvent t'aider à l'atteindre",
      'Pour chaque acteur, décris l\'impact comportemental attendu',
      'Liste les livrables qui pourraient créer cet impact',
      'Priorise les branches avec le plus fort levier sur l\'objectif',
    ],
    also: [
      'OST (pour approfondir les opportunités une fois les livrables identifiés)',
      'Story Mapping (pour planifier le delivery)',
      PROTO_BRIDGE,
    ],
  },
  hmw: {
    name: 'How Might We + Problem Statement',
    author: 'IDEO — Design Thinking',
    rationale:
      "Le HMW reformule un problème comme une invitation à l'exploration. C'est l'artefact de départ quand on part de zéro — il ouvre l'espace des possibles sans contraindre vers une solution. Un bon Problem Statement cadre ce qu'on cherche à résoudre sans dicter comment.",
    reference:
      "Inspiré d'IDEO : la qualité de ta solution dépend directement de la qualité de ta question. Un HMW bien formulé génère plus d'idées pertinentes qu'un brief technique.",
    nextSteps: [
      'Collecte les observations brutes sur le problème (interviews, data)',
      "Reformule chaque problème en 'Comment pourrions-nous... ?'",
      'Génère plusieurs formulations du même problème (plus large, plus étroit)',
      'Choisis la formulation qui ouvre sans contraindre',
      "Utilise-le comme point de départ pour l'OST ou l'Impact Map",
    ],
    also: [
      'OST (étape suivante naturelle une fois le problème mieux cadré)',
      'Assumption Mapping (pour tester tes hypothèses de problème)',
      PROTO_BRIDGE,
    ],
  },
  jtbd: {
    name: 'Jobs To Be Done — Job Story',
    author: "Clayton Christensen (théorie du Job To Be Done) — format Job Story d'Alan Klement",
    rationale:
      "Le JTBD identifie ce que l'utilisateur cherche vraiment à accomplir — indépendamment de la solution. Il révèle les motivations profondes là où les user stories restent en surface. C'est l'artefact idéal pour comprendre pourquoi les gens utilisent (ou n'utilisent pas) ton produit.",
    reference:
      "Inspiré de Clayton Christensen : les clients n'achètent pas des produits, ils les 'engagent' pour accomplir un job — comprendre le job, c'est comprendre la vraie concurrence. Le format de rédaction utilisé ici ('Quand je... je veux... pour que...') est le Job Story d'Alan Klement, une reformulation légère de la théorie JTBD — à ne pas confondre avec la Job Map en 8 étapes (define/locate/prepare/confirm/execute/monitor/modify/conclude) de Tony Ulwick.",
    nextSteps: [
      "Rédige le job principal au format Job Story : 'Quand je... je veux... pour que...'",
      'Cartographie les jobs fonctionnels, émotionnels et sociaux',
      'Identifie les frictions actuelles (pain points) dans l\'accomplissement du job',
      'Cherche les solutions de contournement existantes — elles révèlent les vrais besoins',
      'Priorise les jobs sous-servis avec le plus fort potentiel',
    ],
    also: [
      'HMW (pour reformuler en opportunités)',
      "OST (pour explorer les solutions une fois le job clarifié)",
      PROTO_BRIDGE,
    ],
  },
  assumption_map: {
    name: 'Assumption Mapping',
    author: 'David Bland & Alex Osterwalder — Testing Business Ideas',
    rationale:
      "L'Assumption Map identifie et priorise les hypothèses critiques de ton idée selon deux dimensions : importance pour le succès et niveau de certitude actuel. Il te dit quoi tester en premier — avant d'investir en développement.",
    reference:
      "Inspiré de David Bland & Alex Osterwalder : toute idée produit repose sur des hypothèses. Les équipes qui échouent sont celles qui buildent sans avoir identifié et testé leurs hypothèses les plus risquées.",
    nextSteps: [
      'Liste toutes les hypothèses de ton idée (désirabilité, faisabilité, viabilité)',
      "Place chaque hypothèse sur la matrice : importance × certitude",
      "Identifie le quadrant 'important + incertain' — ce sont tes priorités de test",
      'Définis une expérience pour tester chaque hypothèse critique',
      'Commence par l\'hypothèse la plus risquée, pas la plus facile',
    ],
    also: ['OST (pour intégrer les résultats une fois les hypothèses testées)', PROTO_BRIDGE],
  },
};

function recommendDiscoveryArtifact(answers = {}) {
  const { goal, clarity, audience, horizon, depth } = answers;

  if (
    !VALID_GOAL.includes(goal) ||
    !VALID_CLARITY.includes(clarity) ||
    !VALID_AUDIENCE.includes(audience) ||
    !VALID_HORIZON.includes(horizon) ||
    !VALID_DEPTH.includes(depth)
  ) {
    return {
      recommendation: null,
      rationale: 'Réponses manquantes ou invalides.',
      nextSteps: [],
    };
  }

  let key;
  let overrideNote = null;

  if (goal === 'plan_delivery' && clarity === 'none') {
    // Contradiction assumée : on ne planifie pas un delivery sur un problème jamais compris.
    key = 'hmw';
    overrideNote =
      "Tu veux planifier un delivery, mais le problème n'est pour l'instant pas du tout compris — planifier maintenant reviendrait à séquencer du travail sur une base incertaine. Commence par cadrer le problème avec un HMW / Problem Statement, puis reviens planifier une fois la clarté acquise.";
  } else if (goal === 'plan_delivery' || clarity === 'solution_known') {
    key = 'story_map';
  } else if (goal === 'align_team' && (audience === 'stakeholders' || audience === 'all')) {
    key = 'impact_map';
  } else if (clarity === 'none') {
    key = 'hmw';
  } else if (goal === 'understand_problem' && clarity === 'partial') {
    key = depth === 'deep' ? 'ost' : 'jtbd';
  } else if (goal === 'explore_solutions' && clarity === 'good') {
    key = 'ost';
  } else if (clarity === 'partial' && goal === 'explore_solutions') {
    key = depth === 'deep' ? 'ost' : 'assumption_map';
  } else if (goal === 'align_team' && audience === 'team') {
    key = 'ost';
  } else if (horizon === 'vision') {
    key = 'impact_map';
  } else if (horizon === 'product' && clarity === 'good') {
    key = 'ost';
  } else {
    key = 'ost';
  }

  const artefact = ARTEFACTS[key];

  return {
    recommendation: artefact.name,
    author: artefact.author,
    rationale: overrideNote ? `${overrideNote} ${artefact.rationale}` : artefact.rationale,
    reference: artefact.reference,
    also: artefact.also,
    nextSteps: artefact.nextSteps,
  };
}

  return { recommendDiscoveryArtifact };
});
