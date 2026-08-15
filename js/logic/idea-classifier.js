(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.PMTool = root.PMTool || {};
    root.PMTool.logic = root.PMTool.logic || {};
    root.PMTool.logic.ideaClassifier = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
const VALID_BUSINESS = ['clear', 'vague', 'none'];
const VALID_SIGNALS = ['strong', 'weak', 'none'];
const VALID_PROBLEM = ['clear', 'partial', 'unclear'];
const VALID_SOLUTION = ['clear_small', 'clear_big', 'vague', 'none'];

function classifyIdea(answers = {}) {
  const { business, signals, problem, solution } = answers;

  if (
    !VALID_BUSINESS.includes(business) ||
    !VALID_SIGNALS.includes(signals) ||
    !VALID_PROBLEM.includes(problem) ||
    !VALID_SOLUTION.includes(solution)
  ) {
    return { key: null };
  }

  if (business === 'none') {
    return { key: 'no_business_link' };
  }

  if (business === 'vague' && signals === 'none') {
    return { key: 'business_vague_no_signals' };
  }

  if (business === 'vague' && problem === 'clear') {
    return { key: 'business_vague_advanced' };
  }

  if (signals === 'none' && (problem === 'unclear' || problem === 'partial')) {
    return { key: 'double_discovery' };
  }

  if ((signals === 'weak' || signals === 'strong') && (problem === 'partial' || problem === 'unclear')) {
    return { key: 'discovery_solution_from_problem' };
  }

  // À partir d'ici, problem === 'clear' pour toutes les combinaisons restantes.

  if (solution === 'clear_big') {
    return { key: signals !== 'none' ? 'initiative' : 'initiative_unvalidated' };
  }

  if (solution === 'clear_small') {
    return { key: signals !== 'none' ? 'backlog' : 'backlog_quick_check' };
  }

  // problem === 'clear' && solution ∈ {'vague', 'none'}

  if (signals === 'strong') {
    return { key: 'discovery_solution_clear_problem' };
  }

  // problem === 'clear', solution ∈ {'vague', 'none'}, signals ∈ {'weak', 'none'}
  return { key: 'discovery_solution_weak_signals' };
}

  return { classifyIdea };
});
