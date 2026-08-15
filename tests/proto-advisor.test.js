const test = require('node:test');
const assert = require('node:assert/strict');
const { recommendPrototype } = require('../js/logic/proto-advisor.js');
const fr = require('../locales/fr.json');

test('réponses invalides ou manquantes renvoient une clé nulle explicite', () => {
  const result = recommendPrototype({});
  assert.equal(result.key, null);
});

const RISKS = ['desirability', 'feasibility', 'viability', 'usability'];
const NEEDS = ['behavior', 'qualitative', 'technical', 'intent'];

for (const risk of RISKS) {
  for (const need of NEEDS) {
    test(`risk=${risk} + need=${need} -> clé déterministe et distincte`, () => {
      const result = recommendPrototype({ risk, need });
      assert.equal(result.key, `${risk}.${need}`);
      assert.ok(fr.protoAdvisor.matrix[risk][need], `entrée locale manquante pour ${risk}.${need}`);
    });
  }
}

test('unknown risk value -> clé nulle explicite', () => {
  const result = recommendPrototype({ risk: 'unknown', need: 'behavior' });
  assert.equal(result.key, null);
});

test('unknown need value -> clé nulle explicite', () => {
  const result = recommendPrototype({ risk: 'desirability', need: 'unknown' });
  assert.equal(result.key, null);
});

test('le cadre désirabilité/faisabilité/viabilité/utilisabilité est attribué explicitement à Marty Cagan / SVPG dans les locales', () => {
  assert.match(fr.protoAdvisor.framework.author, /Cagan/);
  assert.match(fr.protoAdvisor.framework.reference, /SVPG|Silicon Valley Product Group/);
});

test('Concierge MVP (viability.behavior) ne se prétend plus être un Wizard of Oz', () => {
  const entry = fr.protoAdvisor.matrix.viability.behavior;
  assert.equal(entry.name, 'Concierge MVP');
  assert.doesNotMatch(entry.rationale, /^Wizard of Oz/);
});
