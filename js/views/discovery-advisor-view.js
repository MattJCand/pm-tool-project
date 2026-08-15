(function (global) {
  const { recommendDiscoveryArtifact } = global.PMTool.logic.discoveryAdvisor;
  const { getState, setState, clearState } = global.PMTool.core.state;
  const { renderProgressDots, renderButton, renderOptionButton, renderResultScreen } = global.PMTool.core.ui;

  const TOOL = 'discovery-advisor';

  const STEPS = [
    {
      key: 'goal',
      label: 'Quel est ton objectif principal en ce moment ?',
      hint: 'Chaque artefact a une fonction précise. Choisir le mauvais outil pour le bon moment reste un mauvais choix.',
      options: [
        { value: 'understand_problem', icon: '🔍', label: 'Comprendre le problème', hint: 'Explorer les besoins, douleurs et contexte utilisateur' },
        { value: 'explore_solutions', icon: '💡', label: 'Explorer des solutions', hint: 'Générer et prioriser des pistes de solutions' },
        { value: 'align_team', icon: '🤝', label: "Aligner l'équipe ou les stakeholders", hint: 'Créer une vision partagée du problème ou du produit' },
        { value: 'plan_delivery', icon: '🗺️', label: 'Planifier le delivery d\'une solution connue', hint: 'Découper et séquencer ce qu\'on va construire' },
      ],
    },
    {
      key: 'clarity',
      label: 'Où en es-tu dans ta compréhension du problème ?',
      hint: 'Teresa Torres : avant d\'explorer des solutions, l\'espace des opportunités doit être suffisamment cartographié.',
      options: [
        { value: 'none', icon: '🌫️', label: 'Je pars de zéro', hint: 'Pas encore de clarté sur le problème ni les utilisateurs' },
        { value: 'partial', icon: '🔭', label: 'J\'ai des hypothèses', hint: 'Je crois comprendre le problème mais c\'est à valider' },
        { value: 'good', icon: '✅', label: 'Le problème est bien compris', hint: 'Validé par des signaux utilisateurs clairs' },
        { value: 'solution_known', icon: '🎯', label: 'Problème ET solution sont clairs', hint: 'Je sais ce qu\'on va construire, il faut planifier' },
      ],
    },
    {
      key: 'audience',
      label: 'Pour qui travailles-tu cet artefact ?',
      hint: 'Un artefact solo sert à structurer ta pensée. Un artefact collectif sert à aligner. Les deux ont des formats très différents.',
      grid: true,
      options: [
        { value: 'solo', icon: '🧠', label: 'Pour moi seul', hint: 'Structurer ma réflexion' },
        { value: 'team', icon: '👥', label: 'Équipe produit', hint: 'Dev, design, PM' },
        { value: 'stakeholders', icon: '🏢', label: 'Stakeholders business', hint: 'Direction, métier, clients' },
        { value: 'all', icon: '🌐', label: 'Tout le monde', hint: 'Alignement global' },
      ],
    },
    {
      key: 'horizon',
      label: 'Sur quel horizon travailles-tu ?',
      hint: 'L\'horizon détermine le niveau d\'abstraction de l\'artefact — du ticket au vision produit.',
      options: [
        { value: 'feature', icon: '⚡', label: 'Court terme — une feature ou un sprint', hint: 'Quelques semaines' },
        { value: 'product', icon: '📦', label: 'Moyen terme — un produit ou une version', hint: 'Quelques mois' },
        { value: 'vision', icon: '🔭', label: 'Long terme — vision ou stratégie', hint: '6 mois à plusieurs années' },
      ],
    },
    {
      key: 'depth',
      label: 'Combien de temps peux-tu consacrer à cette discovery ?',
      hint: 'Le budget disponible change la nature de l\'artefact : un format léger si tu dois avancer vite, un format complet si tu as la bande passante pour cartographier en profondeur.',
      options: [
        { value: 'quick', icon: '⏱️', label: 'Peu de temps', hint: 'Quelques heures à une journée — je dois avancer vite' },
        { value: 'deep', icon: '🗂️', label: 'Du temps devant moi', hint: 'Plusieurs jours — je peux cartographier en profondeur' },
      ],
    },
  ];

  function renderDiscoveryAdvisorView(root) {
    const saved = getState(TOOL);
    renderStep(root, { ...saved }, 0);
  }

  function appendNav(root, card, nextBtn, stepIndex, getAnswers) {
    if (stepIndex > 0) {
      const actions = document.createElement('div');
      actions.className = 'step-actions';
      actions.appendChild(
        renderButton('← Précédent', () => renderStep(root, getAnswers(), stepIndex - 1), { variant: 'secondary' })
      );
      actions.appendChild(nextBtn);
      card.appendChild(actions);
    } else {
      card.appendChild(nextBtn);
    }
  }

  function renderStep(root, answers, stepIndex) {
    root.innerHTML = '';

    if (stepIndex >= STEPS.length) {
      root.appendChild(renderProgressDots(STEPS.length - 1, STEPS.length));
      const result = recommendDiscoveryArtifact(answers);
      root.appendChild(
        renderResultScreen(result, {
          onRestart: () => {
            clearState(TOOL);
            renderStep(root, {}, 0);
          },
          onBack: () => {
            window.location.href = 'index.html';
          },
        })
      );
      return;
    }

    root.appendChild(renderProgressDots(stepIndex, STEPS.length));

    const step = STEPS[stepIndex];
    const card = document.createElement('div');
    card.className = 'card fade-in';
    card.innerHTML = `
      <div class="step-label">Étape ${stepIndex + 1} / ${STEPS.length}</div>
      <div class="question">${step.label}</div>
      <div class="question-hint">${step.hint}</div>
    `;

    const optionsWrap = document.createElement('div');
    optionsWrap.className = 'options' + (step.grid ? ' grid' : '');
    optionsWrap.setAttribute('role', 'group');
    optionsWrap.setAttribute('aria-label', step.label);

    const nextBtn = renderButton(
      stepIndex === STEPS.length - 1 ? 'Voir ma recommandation →' : 'Continuer →',
      () => {
        renderStep(root, answers, stepIndex + 1);
      },
      { disabled: !answers[step.key] }
    );

    step.options.forEach((option) => {
      const btn = renderOptionButton({
        icon: option.icon,
        label: option.label,
        hint: option.hint,
        onClick: (clickedBtn) => {
          optionsWrap.querySelectorAll('.option-btn').forEach((b) => b.classList.remove('selected'));
          clickedBtn.classList.add('selected');
          const nextAnswers = { ...answers, [step.key]: option.value };
          setState(TOOL, nextAnswers);
          answers = nextAnswers;
          nextBtn.disabled = false;
        },
      });
      if (answers[step.key] === option.value) btn.classList.add('selected');
      optionsWrap.appendChild(btn);
    });

    card.appendChild(optionsWrap);
    appendNav(root, card, nextBtn, stepIndex, () => answers);
    root.appendChild(card);
  }

  global.PMTool = global.PMTool || {};
  global.PMTool.views = global.PMTool.views || {};
  global.PMTool.views.discoveryAdvisor = renderDiscoveryAdvisorView;
})(window);
