# PM Tool Project

[![CI](https://github.com/MattJCand/pm-tool-project/actions/workflows/ci.yml/badge.svg)](https://github.com/MattJCand/pm-tool-project/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Zero dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)

Trois outils gratuits et open source pour t'aider à prendre de meilleures décisions produit, de l'idée au prototype.

**→ [Essayer en ligne](https://mattjcand.github.io/pm-tool-project/)**

## Les 3 outils

### 💡 [IdeaClassifier](https://mattjcand.github.io/pm-tool-project/idea-classifier.html)
Cette idée mérite-t-elle une phase de discovery, ou peut-elle aller direct en backlog ?

### 🔎 [DiscoveryAdvisor](https://mattjcand.github.io/pm-tool-project/discovery-advisor.html)
Quel artefact utiliser pour explorer un problème ou une solution (Opportunity Solution Tree, Story Map, JTBD...) ?

### 🧪 [ProtoAdvisor](https://mattjcand.github.io/pm-tool-project/proto-advisor.html)
Quel type de prototype construire pour valider une hypothèse, sans perdre de temps ?

Chaque recommandation s'appuie sur des frameworks reconnus de product discovery (Teresa Torres, Melissa Perri, Jeff Patton, Gojko Adzic, Marty Cagan...), avec le raisonnement expliqué à chaque fois.

## Comment l'utiliser

Aucune installation, aucune inscription : ouvre le [site](https://mattjcand.github.io/pm-tool-project/), ou télécharge le dépôt et ouvre `index.html` dans ton navigateur.

Tes réponses restent dans ton navigateur (stockage local) — rien n'est envoyé ni conservé sur un serveur.

## Open source

Ce projet est open source sous licence [MIT](LICENSE) — libre à toi de l'utiliser, le modifier ou le redistribuer.

**Stack** : HTML / CSS / JS vanilla, zéro dépendance, zéro backend, zéro étape de build. Chaque outil est une page HTML autonome ; la logique de décision est testée (`node:test`) et intégrée en continu (voir le badge CI ci-dessus).

**Contribuer** : les issues et pull requests sont bienvenues. Avant de proposer un changement sur la logique de décision d'un outil, jette un œil aux tests dans `tests/` pour comprendre le comportement attendu — toute modification d'un arbre de décision doit s'accompagner d'un test à jour.

```bash
npm test
```

## Licence

[MIT](LICENSE) © Mathieu Candiotti
