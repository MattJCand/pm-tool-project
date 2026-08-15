const test = require('node:test');
const assert = require('node:assert/strict');
const { recommendDiscoveryArtifact } = require('../js/logic/discovery-advisor.js');

test('réponses invalides ou manquantes renvoient une recommandation nulle explicite', () => {
  const result = recommendDiscoveryArtifact({});
  assert.equal(result.recommendation, null);
  assert.ok(result.rationale);
});

test('depth manquant -> recommandation nulle explicite (5e dimension obligatoire)', () => {
  const result = recommendDiscoveryArtifact({ goal: 'explore_solutions', clarity: 'good', audience: 'team', horizon: 'product' });
  assert.equal(result.recommendation, null);
});

test('goal plan_delivery -> Story Mapping', () => {
  const result = recommendDiscoveryArtifact({ goal: 'plan_delivery', clarity: 'good', audience: 'team', horizon: 'feature', depth: 'quick' });
  assert.equal(result.recommendation, 'Story Mapping');
});

test('goal plan_delivery mais problème jamais compris -> contradiction détectée, HMW recommandé', () => {
  const result = recommendDiscoveryArtifact({ goal: 'plan_delivery', clarity: 'none', audience: 'team', horizon: 'feature', depth: 'quick' });
  assert.equal(result.recommendation, 'How Might We + Problem Statement');
  assert.match(result.rationale, /contradiction|planifier/i);
});

test('clarity solution_known -> Story Mapping (même si le goal diffère)', () => {
  const result = recommendDiscoveryArtifact({ goal: 'understand_problem', clarity: 'solution_known', audience: 'solo', horizon: 'feature', depth: 'quick' });
  assert.equal(result.recommendation, 'Story Mapping');
});

test('aligner des stakeholders business -> Impact Mapping', () => {
  const result = recommendDiscoveryArtifact({ goal: 'align_team', clarity: 'good', audience: 'stakeholders', horizon: 'feature', depth: 'quick' });
  assert.equal(result.recommendation, 'Impact Mapping');
});

test('clarity none -> How Might We + Problem Statement, quel que soit le budget disponible (depth quick)', () => {
  const result = recommendDiscoveryArtifact({ goal: 'explore_solutions', clarity: 'none', audience: 'solo', horizon: 'feature', depth: 'quick' });
  assert.equal(result.recommendation, 'How Might We + Problem Statement');
});

test('clarity none -> How Might We + Problem Statement, même avec un budget élevé (depth deep)', () => {
  const result = recommendDiscoveryArtifact({ goal: 'explore_solutions', clarity: 'none', audience: 'solo', horizon: 'feature', depth: 'deep' });
  assert.equal(result.recommendation, 'How Might We + Problem Statement');
});

test('comprendre le problème + clarté partielle + peu de temps -> Job Story (artefact léger)', () => {
  const result = recommendDiscoveryArtifact({ goal: 'understand_problem', clarity: 'partial', audience: 'team', horizon: 'product', depth: 'quick' });
  assert.equal(result.recommendation, 'Jobs To Be Done : Job Story');
});

test('comprendre le problème + clarté partielle + budget confortable -> OST (artefact plus complet)', () => {
  const result = recommendDiscoveryArtifact({ goal: 'understand_problem', clarity: 'partial', audience: 'team', horizon: 'product', depth: 'deep' });
  assert.equal(result.recommendation, 'Opportunity Solution Tree');
});

test('explorer des solutions avec problème bien compris -> Opportunity Solution Tree', () => {
  const result = recommendDiscoveryArtifact({ goal: 'explore_solutions', clarity: 'good', audience: 'team', horizon: 'product', depth: 'quick' });
  assert.equal(result.recommendation, 'Opportunity Solution Tree');
});

test('explorer des solutions avec clarté partielle + peu de temps -> Assumption Mapping (léger)', () => {
  const result = recommendDiscoveryArtifact({ goal: 'explore_solutions', clarity: 'partial', audience: 'solo', horizon: 'feature', depth: 'quick' });
  assert.equal(result.recommendation, 'Assumption Mapping');
});

test('explorer des solutions avec clarté partielle + budget confortable -> OST (plus complet)', () => {
  const result = recommendDiscoveryArtifact({ goal: 'explore_solutions', clarity: 'partial', audience: 'solo', horizon: 'feature', depth: 'deep' });
  assert.equal(result.recommendation, 'Opportunity Solution Tree');
});

test('aligner l\'équipe produit -> Opportunity Solution Tree', () => {
  const result = recommendDiscoveryArtifact({ goal: 'align_team', clarity: 'good', audience: 'team', horizon: 'feature', depth: 'quick' });
  assert.equal(result.recommendation, 'Opportunity Solution Tree');
});

test('horizon vision + audience non-solo -> Impact Mapping (artefact collectif)', () => {
  const result = recommendDiscoveryArtifact({ goal: 'understand_problem', clarity: 'good', audience: 'team', horizon: 'vision', depth: 'quick' });
  assert.equal(result.recommendation, 'Impact Mapping');
});

test('horizon vision + audience solo -> Job Story, pas Impact Mapping (artefact collectif inadapté au solo)', () => {
  const result = recommendDiscoveryArtifact({ goal: 'understand_problem', clarity: 'good', audience: 'solo', horizon: 'vision', depth: 'quick' });
  assert.equal(result.recommendation, 'Jobs To Be Done : Job Story');
});

test('horizon produit + problème bien compris -> Opportunity Solution Tree', () => {
  const result = recommendDiscoveryArtifact({ goal: 'understand_problem', clarity: 'good', audience: 'solo', horizon: 'product', depth: 'quick' });
  assert.equal(result.recommendation, 'Opportunity Solution Tree');
});

test('aligner l\'équipe mais travailler seul -> contradiction détectée, Job Story recommandé', () => {
  const result = recommendDiscoveryArtifact({ goal: 'align_team', clarity: 'partial', audience: 'solo', horizon: 'feature', depth: 'quick' });
  assert.equal(result.recommendation, 'Jobs To Be Done : Job Story');
  assert.match(result.rationale, /contradiction|seul/i);
});

test('cas non prévu explicitement -> fallback Opportunity Solution Tree', () => {
  const result = recommendDiscoveryArtifact({ goal: 'understand_problem', clarity: 'good', audience: 'stakeholders', horizon: 'feature', depth: 'quick' });
  assert.equal(result.recommendation, 'Opportunity Solution Tree');
});

test('attribution honnête du Job Story : Christensen (théorie) distingué de Klement (format) et Ulwick (Job Map) n\'est jamais confondu', () => {
  const result = recommendDiscoveryArtifact({ goal: 'understand_problem', clarity: 'partial', audience: 'team', horizon: 'product', depth: 'quick' });
  assert.match(result.author, /Klement/);
  assert.match(result.reference, /Ulwick/);
});

test('chaque artefact fait le pont vers ProtoAdvisor dans son champ "also"', () => {
  const scenarios = [
    { goal: 'plan_delivery', clarity: 'good', audience: 'team', horizon: 'feature', depth: 'quick' }, // story_map
    { goal: 'align_team', clarity: 'good', audience: 'stakeholders', horizon: 'feature', depth: 'quick' }, // impact_map
    { goal: 'explore_solutions', clarity: 'none', audience: 'solo', horizon: 'feature', depth: 'quick' }, // hmw
    { goal: 'understand_problem', clarity: 'partial', audience: 'team', horizon: 'product', depth: 'quick' }, // jtbd
    { goal: 'explore_solutions', clarity: 'partial', audience: 'solo', horizon: 'feature', depth: 'quick' }, // assumption_map
    { goal: 'explore_solutions', clarity: 'good', audience: 'team', horizon: 'product', depth: 'quick' }, // ost
  ];
  for (const answers of scenarios) {
    const result = recommendDiscoveryArtifact(answers);
    assert.ok(
      result.also.some((item) => item.includes('ProtoAdvisor')),
      `attendu un pont vers ProtoAdvisor pour ${result.recommendation}`
    );
  }
});
