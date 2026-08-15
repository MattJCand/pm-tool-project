const test = require('node:test');
const assert = require('node:assert/strict');
const { recommendDiscoveryArtifact } = require('../js/logic/discovery-advisor.js');

test('réponses invalides ou manquantes renvoient une clé nulle explicite', () => {
  const result = recommendDiscoveryArtifact({});
  assert.equal(result.key, null);
});

test('depth manquant -> clé nulle explicite (5e dimension obligatoire)', () => {
  const result = recommendDiscoveryArtifact({ goal: 'explore_solutions', clarity: 'good', audience: 'team', horizon: 'product' });
  assert.equal(result.key, null);
});

test('goal plan_delivery -> story_map', () => {
  const result = recommendDiscoveryArtifact({ goal: 'plan_delivery', clarity: 'good', audience: 'team', horizon: 'feature', depth: 'quick' });
  assert.equal(result.key, 'story_map');
});

test('goal plan_delivery mais problème jamais compris -> contradiction détectée, hmw recommandé', () => {
  const result = recommendDiscoveryArtifact({ goal: 'plan_delivery', clarity: 'none', audience: 'team', horizon: 'feature', depth: 'quick' });
  assert.equal(result.key, 'hmw');
  assert.equal(result.overrideKey, 'plan_delivery_contradiction');
});

test('clarity solution_known -> story_map (même si le goal diffère)', () => {
  const result = recommendDiscoveryArtifact({ goal: 'understand_problem', clarity: 'solution_known', audience: 'solo', horizon: 'feature', depth: 'quick' });
  assert.equal(result.key, 'story_map');
});

test('aligner des stakeholders business -> impact_map', () => {
  const result = recommendDiscoveryArtifact({ goal: 'align_team', clarity: 'good', audience: 'stakeholders', horizon: 'feature', depth: 'quick' });
  assert.equal(result.key, 'impact_map');
});

test('clarity none -> hmw, quel que soit le budget disponible (depth quick)', () => {
  const result = recommendDiscoveryArtifact({ goal: 'explore_solutions', clarity: 'none', audience: 'solo', horizon: 'feature', depth: 'quick' });
  assert.equal(result.key, 'hmw');
});

test('clarity none -> hmw, même avec un budget élevé (depth deep)', () => {
  const result = recommendDiscoveryArtifact({ goal: 'explore_solutions', clarity: 'none', audience: 'solo', horizon: 'feature', depth: 'deep' });
  assert.equal(result.key, 'hmw');
});

test('comprendre le problème + clarté partielle + peu de temps -> jtbd (artefact léger)', () => {
  const result = recommendDiscoveryArtifact({ goal: 'understand_problem', clarity: 'partial', audience: 'team', horizon: 'product', depth: 'quick' });
  assert.equal(result.key, 'jtbd');
});

test('comprendre le problème + clarté partielle + budget confortable -> ost (artefact plus complet)', () => {
  const result = recommendDiscoveryArtifact({ goal: 'understand_problem', clarity: 'partial', audience: 'team', horizon: 'product', depth: 'deep' });
  assert.equal(result.key, 'ost');
});

test('explorer des solutions avec problème bien compris -> ost', () => {
  const result = recommendDiscoveryArtifact({ goal: 'explore_solutions', clarity: 'good', audience: 'team', horizon: 'product', depth: 'quick' });
  assert.equal(result.key, 'ost');
});

test('explorer des solutions avec clarté partielle + peu de temps -> assumption_map (léger)', () => {
  const result = recommendDiscoveryArtifact({ goal: 'explore_solutions', clarity: 'partial', audience: 'solo', horizon: 'feature', depth: 'quick' });
  assert.equal(result.key, 'assumption_map');
});

test('explorer des solutions avec clarté partielle + budget confortable -> ost (plus complet)', () => {
  const result = recommendDiscoveryArtifact({ goal: 'explore_solutions', clarity: 'partial', audience: 'solo', horizon: 'feature', depth: 'deep' });
  assert.equal(result.key, 'ost');
});

test('aligner l\'équipe produit -> ost', () => {
  const result = recommendDiscoveryArtifact({ goal: 'align_team', clarity: 'good', audience: 'team', horizon: 'feature', depth: 'quick' });
  assert.equal(result.key, 'ost');
});

test('horizon vision + audience non-solo -> impact_map (artefact collectif)', () => {
  const result = recommendDiscoveryArtifact({ goal: 'understand_problem', clarity: 'good', audience: 'team', horizon: 'vision', depth: 'quick' });
  assert.equal(result.key, 'impact_map');
});

test('horizon vision + audience solo -> jtbd, pas impact_map (artefact collectif inadapté au solo)', () => {
  const result = recommendDiscoveryArtifact({ goal: 'understand_problem', clarity: 'good', audience: 'solo', horizon: 'vision', depth: 'quick' });
  assert.equal(result.key, 'jtbd');
});

test('horizon produit + problème bien compris -> ost', () => {
  const result = recommendDiscoveryArtifact({ goal: 'understand_problem', clarity: 'good', audience: 'solo', horizon: 'product', depth: 'quick' });
  assert.equal(result.key, 'ost');
});

test('aligner l\'équipe mais travailler seul -> contradiction détectée, jtbd recommandé', () => {
  const result = recommendDiscoveryArtifact({ goal: 'align_team', clarity: 'partial', audience: 'solo', horizon: 'feature', depth: 'quick' });
  assert.equal(result.key, 'jtbd');
  assert.equal(result.overrideKey, 'align_team_solo_contradiction');
});

test('cas non prévu explicitement -> fallback ost', () => {
  const result = recommendDiscoveryArtifact({ goal: 'understand_problem', clarity: 'good', audience: 'stakeholders', horizon: 'feature', depth: 'quick' });
  assert.equal(result.key, 'ost');
});
