// Chargement des dictionnaires de traduction (locales/<lang>.json) et langue active.
// Nécessite d'être servi via http(s) : fetch() d'un fichier local échoue en file://.
(function (global) {
  const STORAGE_KEY = 'pm-tool-project:lang';
  const DEFAULT_LANG = 'fr';
  const cache = {};

  function getLang() {
    try {
      return global.localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
    } catch {
      return DEFAULT_LANG;
    }
  }

  function setLang(lang) {
    try {
      global.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // localStorage indisponible : la langue reste active pour cette session seulement.
    }
  }

  function loadLocale(lang) {
    if (cache[lang]) return Promise.resolve(cache[lang]);
    return fetch('locales/' + lang + '.json').then((res) => {
      if (!res.ok) throw new Error('Impossible de charger la locale ' + lang);
      return res.json();
    }).then((dict) => {
      cache[lang] = dict;
      return dict;
    });
  }

  function mountLangToggle() {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'lang-toggle-btn';
    btn.setAttribute('aria-label', 'FR / EN');
    const lang = getLang();
    btn.textContent = lang === 'fr' ? 'EN' : 'FR';
    btn.addEventListener('click', () => {
      setLang(lang === 'fr' ? 'en' : 'fr');
      global.location.reload();
    });
    document.body.appendChild(btn);
  }

  global.PMTool = global.PMTool || {};
  global.PMTool.core = global.PMTool.core || {};
  global.PMTool.core.i18n = { getLang, setLang, loadLocale, mountLangToggle };
})(window);
