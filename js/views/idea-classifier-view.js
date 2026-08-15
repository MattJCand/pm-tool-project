(function (global) {
  const { classifyIdea } = global.PMTool.logic.ideaClassifier;
  const { getState, setState, clearState } = global.PMTool.core.state;
  const { renderProgressDots, renderButton, renderOptionButton, renderTextStep, renderResultScreen } = global.PMTool.core.ui;

  const TOOL = 'idea-classifier';

  const CHOICE_STEPS = [
    {
      key: 'business',
      label: 'Cette idée est-elle liée à un objectif business identifié ?',
      hint: "Teresa Torres : une opportunité sans lien avec un outcome business ne mérite pas d'entrer dans le process.",
      options: [
        { value: 'clear', icon: '🎯', label: 'Oui, le lien est clair', hint: 'Je sais quel objectif ça sert' },
        { value: 'vague', icon: '🌫️', label: 'Vaguement', hint: "J'ai une intuition mais pas de lien explicite" },
        { value: 'none', icon: '❓', label: 'Pas encore', hint: 'Je ne sais pas quel objectif ça sert' },
      ],
    },
    {
      key: 'signals',
      label: 'Tu as des signaux utilisateurs qui confirment un problème réel ?',
      hint: 'Melissa Perri : le problème doit être validé avant d\'explorer des solutions. Un signal = retour direct, donnée usage, interview, NPS...',
      options: [
        { value: 'strong', icon: '📣', label: 'Oui, plusieurs signaux clairs', hint: 'Des users ont exprimé ce problème explicitement' },
        { value: 'weak', icon: '📡', label: 'Quelques signaux faibles', hint: 'Des indices mais pas de confirmation directe' },
        { value: 'none', icon: '🔇', label: 'Aucun signal pour l\'instant', hint: 'C\'est une intuition interne' },
      ],
    },
    {
      key: 'problem',
      label: 'Le problème est-il bien compris et documenté ?',
      hint: 'Teresa Torres : avant de passer aux solutions, l\'espace du problème doit être cartographié. Qui est impacté ? Dans quel contexte ? Avec quelle fréquence ?',
      options: [
        { value: 'clear', icon: '✅', label: 'Oui, on comprend bien le problème', hint: 'Contexte, impact, fréquence sont documentés' },
        { value: 'partial', icon: '🔍', label: 'Partiellement', hint: 'On a des éléments mais des zones floues restent' },
        { value: 'unclear', icon: '🌀', label: 'Non, c\'est encore flou', hint: 'On ne sait pas encore bien ce qui se passe' },
      ],
    },
    {
      key: 'solution',
      label: 'Tu as une solution claire en tête ? Et quel est l\'effort estimé ?',
      hint: 'Melissa Perri : quand le problème ET la solution sont clairs, on passe en mode exécution. Si c\'est un quick win, pas besoin de discovery.',
      grid: true,
      options: [
        { value: 'clear_small', icon: '⚡', label: 'Solution claire + petit effort', hint: "Quick win, moins d'1 sprint" },
        { value: 'clear_big', icon: '🏗️', label: 'Solution claire + gros effort', hint: 'On sait quoi faire, c\'est un chantier' },
        { value: 'vague', icon: '💭', label: 'Solution vague', hint: 'Une direction mais pas de solution précise' },
        { value: 'none', icon: '🔭', label: 'Aucune solution en tête', hint: 'On ne sait pas encore comment résoudre' },
      ],
    },
  ];

  const TOTAL_STEPS = CHOICE_STEPS.length + 1;

  function renderIdeaClassifierView(root, opts = {}) {
    const saved = getState(TOOL);
    renderStep(root, { ...saved }, 0, opts);
  }

  function appendNav(root, card, nextBtn, stepIndex, getAnswers, opts) {
    if (stepIndex > 0) {
      const actions = document.createElement('div');
      actions.className = 'step-actions';
      actions.appendChild(
        renderButton('← Précédent', () => renderStep(root, getAnswers(), stepIndex - 1, opts), { variant: 'secondary' })
      );
      actions.appendChild(nextBtn);
      card.appendChild(actions);
    } else {
      card.appendChild(nextBtn);
    }
  }

  function renderStep(root, answers, stepIndex, opts = {}) {
    root.innerHTML = '';
    if (typeof opts.onStepChange === 'function') {
      opts.onStepChange(Math.min(stepIndex, TOTAL_STEPS - 1));
    }

    if (stepIndex >= TOTAL_STEPS) {
      root.appendChild(renderProgressDots(TOTAL_STEPS - 1, TOTAL_STEPS));
      const result = classifyIdea(answers);
      if (answers.idea) {
        const ideaRecap = document.createElement('div');
        ideaRecap.className = 'hypothesis-recap';
        ideaRecap.innerHTML = `<span class="hypothesis-recap-label">Ton idée</span><p>${answers.idea}</p>`;
        root.appendChild(ideaRecap);
      }
      root.appendChild(
        renderResultScreen(result, {
          onRestart: () => {
            clearState(TOOL);
            renderStep(root, {}, 0, opts);
          },
          onBack: () => {
            window.location.href = 'index.html';
          },
        })
      );
      return;
    }

    root.appendChild(renderProgressDots(stepIndex, TOTAL_STEPS));

    const card = document.createElement('div');
    card.className = 'card fade-in';

    if (stepIndex === 0) {
      card.innerHTML = `
        <div class="step-label">Étape 1 / ${TOTAL_STEPS}</div>
        <div class="question">Décris ton idée en une ou deux phrases.</div>
        <div class="question-hint">Pas besoin d'être précis, une intuition suffit pour commencer.</div>
        <div class="privacy-note">🔒 Ça reste entre toi et ce navigateur : rien n'est envoyé ni stocké sur un serveur. Ton texte est juste gardé en local (localStorage) pour que tu ne perdes pas ta progression, et rappelé dans ta recommandation à la fin.</div>
      `;
      const nextBtn = renderButton('Continuer →', () => {
        const nextAnswers = { ...answers, idea: textarea.value };
        setState(TOOL, nextAnswers);
        renderStep(root, nextAnswers, stepIndex + 1, opts);
      }, { disabled: true });
      const textarea = renderTextStep({
        placeholder:
          'Ex: Permettre aux managers de voir en temps réel où en sont leurs techniciens sur le terrain...',
        onValidChange: (valid) => {
          nextBtn.disabled = !valid;
        },
      });
      if (answers.idea) textarea.value = answers.idea;
      card.appendChild(textarea);
      appendNav(root, card, nextBtn, stepIndex, () => answers, opts);
      root.appendChild(card);
      return;
    }

    const step = CHOICE_STEPS[stepIndex - 1];
    card.innerHTML = `
      <div class="step-label">Étape ${stepIndex + 1} / ${TOTAL_STEPS}</div>
      <div class="question">${step.label}</div>
      <div class="question-hint">${step.hint}</div>
    `;

    const optionsWrap = document.createElement('div');
    optionsWrap.className = 'options' + (step.grid ? ' grid' : '');
    optionsWrap.setAttribute('role', 'group');
    optionsWrap.setAttribute('aria-label', step.label);

    const nextBtn = renderButton('Continuer →', () => {
      renderStep(root, answers, stepIndex + 1, opts);
    }, { disabled: !answers[step.key] });

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
    appendNav(root, card, nextBtn, stepIndex, () => answers, opts);
    root.appendChild(card);
  }

  global.PMTool = global.PMTool || {};
  global.PMTool.views = global.PMTool.views || {};
  global.PMTool.views.ideaClassifier = renderIdeaClassifierView;
})(window);
