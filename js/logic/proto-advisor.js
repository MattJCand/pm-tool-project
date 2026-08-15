(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.PMTool = root.PMTool || {};
    root.PMTool.logic = root.PMTool.logic || {};
    root.PMTool.logic.protoAdvisor = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
const VALID_RISK = ['desirability', 'feasibility', 'viability', 'usability'];
const VALID_NEED = ['behavior', 'qualitative', 'technical', 'intent'];

function recommendPrototype(answers = {}) {
  const { risk, need } = answers;

  if (!VALID_RISK.includes(risk) || !VALID_NEED.includes(need)) {
    return { key: null };
  }

  return { key: risk + '.' + need };
}

  return { recommendPrototype };
});
