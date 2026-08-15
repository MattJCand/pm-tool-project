const test = require('node:test');
const assert = require('node:assert/strict');
const fr = require('../locales/fr.json');
const en = require('../locales/en.json');

const IDEA_RESULT_KEYS = [
  'no_business_link',
  'business_vague_no_signals',
  'business_vague_advanced',
  'double_discovery',
  'discovery_solution_from_problem',
  'initiative',
  'initiative_unvalidated',
  'backlog',
  'backlog_quick_check',
  'discovery_solution_clear_problem',
  'discovery_solution_weak_signals',
];

const DISCOVERY_ARTEFACT_KEYS = ['ost', 'story_map', 'impact_map', 'hmw', 'jtbd', 'assumption_map'];
const DISCOVERY_OVERRIDE_KEYS = ['plan_delivery_contradiction', 'align_team_solo_contradiction'];

test('locales/fr.json et locales/en.json sont du JSON valide', () => {
  assert.ok(fr && typeof fr === 'object');
  assert.ok(en && typeof en === 'object');
});

for (const key of IDEA_RESULT_KEYS) {
  test(`ideaClassifier.results.${key} existe en FR et EN`, () => {
    assert.ok(fr.ideaClassifier.results[key], `manquant en FR : ${key}`);
    assert.ok(en.ideaClassifier.results[key], `manquant en EN : ${key}`);
  });
}

for (const key of DISCOVERY_ARTEFACT_KEYS) {
  test(`discoveryAdvisor.artefacts.${key} existe en FR et EN`, () => {
    assert.ok(fr.discoveryAdvisor.artefacts[key], `manquant en FR : ${key}`);
    assert.ok(en.discoveryAdvisor.artefacts[key], `manquant en EN : ${key}`);
  });
}

for (const key of DISCOVERY_OVERRIDE_KEYS) {
  test(`discoveryAdvisor.overrides.${key} existe en FR et EN`, () => {
    assert.ok(fr.discoveryAdvisor.overrides[key], `manquant en FR : ${key}`);
    assert.ok(en.discoveryAdvisor.overrides[key], `manquant en EN : ${key}`);
  });
}

function collectKeyPaths(node, prefix) {
  let paths = [];
  if (Array.isArray(node)) {
    node.forEach((item, i) => {
      paths = paths.concat(collectKeyPaths(item, `${prefix}[${i}]`));
    });
  } else if (node && typeof node === 'object') {
    for (const k of Object.keys(node)) {
      paths = paths.concat(collectKeyPaths(node[k], prefix ? `${prefix}.${k}` : k));
    }
  } else {
    paths.push(prefix);
  }
  return paths;
}

test('FR et EN couvrent exactement les mêmes chemins de clés (aucune parité rompue)', () => {
  const frPaths = collectKeyPaths(fr, '').sort();
  const enPaths = collectKeyPaths(en, '').sort();
  assert.deepEqual(frPaths, enPaths);
});
