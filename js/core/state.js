(function (global) {
  const memoryState = new Map();

  function storageKey(tool) {
    return `pm-tool-project:${tool}`;
  }

  function getState(tool) {
    if (memoryState.has(tool)) {
      return memoryState.get(tool);
    }
    try {
      const raw = global.localStorage.getItem(storageKey(tool));
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  function setState(tool, answers) {
    memoryState.set(tool, answers);
    try {
      global.localStorage.setItem(storageKey(tool), JSON.stringify(answers));
    } catch {
      // localStorage indisponible (mode privé, etc.) : l'état reste en mémoire.
    }
  }

  function clearState(tool) {
    memoryState.delete(tool);
    try {
      global.localStorage.removeItem(storageKey(tool));
    } catch {
      // localStorage indisponible : rien à faire de plus.
    }
  }

  global.PMTool = global.PMTool || {};
  global.PMTool.core = global.PMTool.core || {};
  global.PMTool.core.state = { getState, setState, clearState };
})(window);
