const test = require('node:test');
const assert = require('node:assert/strict');
const { recommendPrototype } = require('../js/logic/proto-advisor.js');

test('réponses invalides ou manquantes renvoient une recommandation nulle explicite', () => {
  const result = recommendPrototype({});
  assert.equal(result.recommendation, null);
  assert.ok(result.rationale);
});

const EXPECTED = {
  desirability: {
    behavior: 'Landing Page',
    qualitative: "Script d'interview",
    technical: 'Wizard of Oz',
    intent: 'Fake Door',
  },
  feasibility: {
    behavior: 'Spike technique',
    qualitative: 'Discussion technique',
    technical: 'POC (Proof of Concept)',
    intent: 'Chiffrage rapide',
  },
  viability: {
    behavior: 'Concierge MVP',
    qualitative: 'Entretien économique',
    technical: 'Business case chiffré',
    intent: 'Landing Page + Pricing',
  },
  usability: {
    behavior: 'Test utilisateur sur prototype Figma',
    qualitative: 'Test de 5 secondes',
    technical: 'Prototype interactif no-code',
    intent: 'Test de tri de cartes',
  },
};

for (const [risk, needs] of Object.entries(EXPECTED)) {
  for (const [need, expectedProto] of Object.entries(needs)) {
    test(`risk=${risk} + need=${need} -> ${expectedProto}`, () => {
      const result = recommendPrototype({ risk, need });
      assert.equal(result.recommendation, expectedProto);
    });
  }
}

test('la recommandation attribue explicitement le cadre désirabilité/faisabilité/viabilité/utilisabilité à Marty Cagan / SVPG', () => {
  const result = recommendPrototype({ risk: 'desirability', need: 'behavior' });
  assert.match(result.author, /Cagan/);
  assert.match(result.reference, /SVPG|Silicon Valley Product Group/);
});

test('Concierge MVP (viability.behavior) ne se prétend plus être un Wizard of Oz', () => {
  const result = recommendPrototype({ risk: 'viability', need: 'behavior' });
  assert.equal(result.recommendation, 'Concierge MVP');
  assert.doesNotMatch(result.rationale, /^Wizard of Oz/);
});
