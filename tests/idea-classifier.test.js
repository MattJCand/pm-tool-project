const test = require('node:test');
const assert = require('node:assert/strict');
const { classifyIdea } = require('../js/logic/idea-classifier.js');

test('réponses invalides ou manquantes renvoient une recommandation nulle explicite', () => {
  const result = classifyIdea({});
  assert.equal(result.recommendation, null);
  assert.ok(result.rationale);
});

test('pas de lien business -> reformuler d\'abord', () => {
  const result = classifyIdea({ business: 'none', signals: 'strong', problem: 'clear', solution: 'clear_small' });
  assert.equal(result.recommendation, "Reformuler d'abord");
});

test('lien business vague + aucun signal -> reformuler d\'abord (le champ vague a un effet réel)', () => {
  const result = classifyIdea({ business: 'vague', signals: 'none', problem: 'clear', solution: 'clear_small' });
  assert.equal(result.recommendation, "Reformuler d'abord");
  assert.match(result.tag, /clarifier/i);
});

test('lien business vague + signal présent -> le process continue normalement (pas bloqué)', () => {
  const result = classifyIdea({ business: 'vague', signals: 'strong', problem: 'clear', solution: 'clear_small' });
  assert.equal(result.recommendation, 'Ticket Backlog');
});

test('aucun signal + problème flou -> double discovery', () => {
  const result = classifyIdea({ business: 'clear', signals: 'none', problem: 'unclear', solution: 'none' });
  assert.equal(result.recommendation, 'Double Discovery');
});

test('aucun signal + problème partiel -> double discovery', () => {
  const result = classifyIdea({ business: 'clear', signals: 'none', problem: 'partial', solution: 'vague' });
  assert.equal(result.recommendation, 'Double Discovery');
});

test('signaux présents mais problème pas encore clair -> discovery solution', () => {
  const result = classifyIdea({ business: 'clear', signals: 'weak', problem: 'partial', solution: 'vague' });
  assert.equal(result.recommendation, 'Discovery Solution');
});

test('signaux forts mais problème encore flou -> discovery solution', () => {
  const result = classifyIdea({ business: 'clear', signals: 'strong', problem: 'unclear', solution: 'none' });
  assert.equal(result.recommendation, 'Discovery Solution');
});

test('problème clair + solution claire avec gros effort + signal -> initiative', () => {
  const result = classifyIdea({ business: 'clear', signals: 'strong', problem: 'clear', solution: 'clear_big' });
  assert.equal(result.recommendation, 'Initiative');
});

test('problème clair + solution claire avec gros effort mais AUCUN signal -> pas d\'initiative sans validation', () => {
  const result = classifyIdea({ business: 'clear', signals: 'none', problem: 'clear', solution: 'clear_big' });
  assert.equal(result.recommendation, 'Discovery Solution');
  assert.notEqual(result.recommendation, 'Initiative');
});

test('solution claire avec petit effort + signal -> ticket backlog', () => {
  const result = classifyIdea({ business: 'clear', signals: 'strong', problem: 'clear', solution: 'clear_small' });
  assert.equal(result.recommendation, 'Ticket Backlog');
});

test('solution claire avec petit effort mais AUCUN signal -> vérification rapide requise avant backlog', () => {
  const result = classifyIdea({ business: 'clear', signals: 'none', problem: 'clear', solution: 'clear_small' });
  assert.equal(result.recommendation, 'Ticket Backlog (vérification rapide)');
});

test('problème clair + signaux forts + solution vague -> discovery solution', () => {
  const result = classifyIdea({ business: 'clear', signals: 'strong', problem: 'clear', solution: 'vague' });
  assert.equal(result.recommendation, 'Discovery Solution');
});

test('problème clair + signaux forts + aucune solution -> discovery solution', () => {
  const result = classifyIdea({ business: 'clear', signals: 'strong', problem: 'clear', solution: 'none' });
  assert.equal(result.recommendation, 'Discovery Solution');
});

test('problème clair déclaré mais signaux faibles + solution vague -> discovery solution avec rappel de valider le problème', () => {
  const result = classifyIdea({ business: 'clear', signals: 'weak', problem: 'clear', solution: 'vague' });
  assert.equal(result.recommendation, 'Discovery Solution');
  assert.match(result.rationale, /clair/i);
});

test('problème clair déclaré mais aucun signal + aucune solution -> discovery solution avec rappel de valider le problème', () => {
  const result = classifyIdea({ business: 'clear', signals: 'none', problem: 'clear', solution: 'none' });
  assert.equal(result.recommendation, 'Discovery Solution');
});
