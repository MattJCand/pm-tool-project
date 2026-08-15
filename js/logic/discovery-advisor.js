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

function recommendDiscoveryArtifact(answers = {}) {
  const { goal, clarity, audience, horizon, depth } = answers;

  if (
    !VALID_GOAL.includes(goal) ||
    !VALID_CLARITY.includes(clarity) ||
    !VALID_AUDIENCE.includes(audience) ||
    !VALID_HORIZON.includes(horizon) ||
    !VALID_DEPTH.includes(depth)
  ) {
    return { key: null };
  }

  let key;
  let overrideKey = null;

  if (goal === 'plan_delivery' && clarity === 'none') {
    // Contradiction assumée : on ne planifie pas un delivery sur un problème jamais compris.
    key = 'hmw';
    overrideKey = 'plan_delivery_contradiction';
  } else if (goal === 'plan_delivery' || clarity === 'solution_known') {
    key = 'story_map';
  } else if (goal === 'align_team' && audience === 'solo') {
    // Contradiction assumée : un artefact d'alignement suppose un public à convaincre.
    key = 'jtbd';
    overrideKey = 'align_team_solo_contradiction';
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
  } else if (horizon === 'vision' && audience !== 'solo') {
    key = 'impact_map';
  } else if (horizon === 'vision' && audience === 'solo') {
    // L'Impact Map est structurellement un artefact collectif (Adzic) : une vision travaillée
    // seul·e a besoin d'un artefact de clarification individuelle, pas d'alignement d'équipe.
    key = 'jtbd';
  } else if (horizon === 'product' && clarity === 'good') {
    key = 'ost';
  } else {
    key = 'ost';
  }

  return { key, overrideKey };
}

  return { recommendDiscoveryArtifact };
});
