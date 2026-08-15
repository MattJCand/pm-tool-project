const test = require('node:test');
const assert = require('node:assert/strict');
const { classifyIdea } = require('../js/logic/idea-classifier.js');

test('réponses invalides ou manquantes renvoient une clé nulle explicite', () => {
  const result = classifyIdea({});
  assert.equal(result.key, null);
});

test('pas de lien business -> no_business_link', () => {
  const result = classifyIdea({ business: 'none', signals: 'strong', problem: 'clear', solution: 'clear_small' });
  assert.equal(result.key, 'no_business_link');
});

test('lien business vague + aucun signal -> business_vague_no_signals', () => {
  const result = classifyIdea({ business: 'vague', signals: 'none', problem: 'clear', solution: 'clear_small' });
  assert.equal(result.key, 'business_vague_no_signals');
});

test('lien business vague + signal présent mais problème encore partiel -> le process continue normalement (pas bloqué)', () => {
  const result = classifyIdea({ business: 'vague', signals: 'strong', problem: 'partial', solution: 'vague' });
  assert.equal(result.key, 'discovery_solution_from_problem');
});

test('lien business vague + problème clair + solution quick win -> business_vague_advanced (ne pas committer sur un lien flou)', () => {
  const result = classifyIdea({ business: 'vague', signals: 'strong', problem: 'clear', solution: 'clear_small' });
  assert.equal(result.key, 'business_vague_advanced');
});

test('lien business vague + problème clair + grosse initiative -> business_vague_advanced (ne pas committer sur un lien flou)', () => {
  const result = classifyIdea({ business: 'vague', signals: 'strong', problem: 'clear', solution: 'clear_big' });
  assert.equal(result.key, 'business_vague_advanced');
});

test('aucun signal + problème flou -> double_discovery', () => {
  const result = classifyIdea({ business: 'clear', signals: 'none', problem: 'unclear', solution: 'none' });
  assert.equal(result.key, 'double_discovery');
});

test('aucun signal + problème partiel -> double_discovery', () => {
  const result = classifyIdea({ business: 'clear', signals: 'none', problem: 'partial', solution: 'vague' });
  assert.equal(result.key, 'double_discovery');
});

test('signaux présents mais problème pas encore clair -> discovery_solution_from_problem', () => {
  const result = classifyIdea({ business: 'clear', signals: 'weak', problem: 'partial', solution: 'vague' });
  assert.equal(result.key, 'discovery_solution_from_problem');
});

test('signaux forts mais problème encore flou -> discovery_solution_from_problem', () => {
  const result = classifyIdea({ business: 'clear', signals: 'strong', problem: 'unclear', solution: 'none' });
  assert.equal(result.key, 'discovery_solution_from_problem');
});

test('problème clair + solution claire avec gros effort + signal -> initiative', () => {
  const result = classifyIdea({ business: 'clear', signals: 'strong', problem: 'clear', solution: 'clear_big' });
  assert.equal(result.key, 'initiative');
});

test('problème clair + solution claire avec gros effort mais AUCUN signal -> initiative_unvalidated', () => {
  const result = classifyIdea({ business: 'clear', signals: 'none', problem: 'clear', solution: 'clear_big' });
  assert.equal(result.key, 'initiative_unvalidated');
});

test('solution claire avec petit effort + signal -> backlog', () => {
  const result = classifyIdea({ business: 'clear', signals: 'strong', problem: 'clear', solution: 'clear_small' });
  assert.equal(result.key, 'backlog');
});

test('solution claire avec petit effort mais AUCUN signal -> backlog_quick_check', () => {
  const result = classifyIdea({ business: 'clear', signals: 'none', problem: 'clear', solution: 'clear_small' });
  assert.equal(result.key, 'backlog_quick_check');
});

test('problème clair + signaux forts + solution vague -> discovery_solution_clear_problem', () => {
  const result = classifyIdea({ business: 'clear', signals: 'strong', problem: 'clear', solution: 'vague' });
  assert.equal(result.key, 'discovery_solution_clear_problem');
});

test('problème clair + signaux forts + aucune solution -> discovery_solution_clear_problem', () => {
  const result = classifyIdea({ business: 'clear', signals: 'strong', problem: 'clear', solution: 'none' });
  assert.equal(result.key, 'discovery_solution_clear_problem');
});

test('problème clair déclaré mais signaux faibles + solution vague -> discovery_solution_weak_signals', () => {
  const result = classifyIdea({ business: 'clear', signals: 'weak', problem: 'clear', solution: 'vague' });
  assert.equal(result.key, 'discovery_solution_weak_signals');
});

test('problème clair déclaré mais aucun signal + aucune solution -> discovery_solution_weak_signals', () => {
  const result = classifyIdea({ business: 'clear', signals: 'none', problem: 'clear', solution: 'none' });
  assert.equal(result.key, 'discovery_solution_weak_signals');
});
