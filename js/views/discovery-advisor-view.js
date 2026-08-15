(function (global) {
  const { recommendDiscoveryArtifact } = global.PMTool.logic.discoveryAdvisor;
  const { getState, setState, clearState } = global.PMTool.core.state;
  const { getLang, loadLocale } = global.PMTool.core.i18n;
  const { renderProgressDots, renderButton, renderOptionButton, renderResultScreen } = global.PMTool.core.ui;

  const TOOL = 'discovery-advisor';
  const STEP_KEYS = ['goal', 'clarity', 'audience', 'horizon', 'depth'];
  const GRID_STEPS = ['audience'];

  function renderDiscoveryAdvisorView(root) {
    const saved = getState(TOOL);
    loadLocale(getLang()).then((dict) => {
      renderStep(root, dict, { ...saved }, 0);
    });
  }

  function appendNav(root, dict, card, nextBtn, stepIndex, getAnswers) {
    if (stepIndex > 0) {
      const actions = document.createElement('div');
      actions.className = 'step-actions';
      actions.appendChild(
        renderButton(dict.common.previous, () => renderStep(root, dict, getAnswers(), stepIndex - 1), { variant: 'secondary' })
      );
      actions.appendChild(nextBtn);
      card.appendChild(actions);
    } else {
      card.appendChild(nextBtn);
    }
  }

  function renderStep(root, dict, answers, stepIndex) {
    const t = dict.discoveryAdvisor;
    root.innerHTML = '';

    if (stepIndex >= STEP_KEYS.length) {
      root.appendChild(renderProgressDots(STEP_KEYS.length - 1, STEP_KEYS.length, dict.common.step));
      const result = recommendDiscoveryArtifact(answers);
      let content = null;
      if (result.key) {
        const artefact = t.artefacts[result.key];
        content = {
          ...artefact,
          rationale: result.overrideKey
            ? `${t.overrides[result.overrideKey]} ${artefact.rationale}`
            : artefact.rationale,
        };
      }
      root.appendChild(
        renderResultScreen(content, dict.common, dict.diamondPhases, {
          onRestart: () => {
            clearState(TOOL);
            renderStep(root, dict, {}, 0);
          },
          onBack: () => {
            window.location.href = 'index.html';
          },
        })
      );
      return;
    }

    root.appendChild(renderProgressDots(stepIndex, STEP_KEYS.length, dict.common.step));

    const stepKey = STEP_KEYS[stepIndex];
    const step = t.steps[stepKey];
    const card = document.createElement('div');
    card.className = 'card fade-in';
    card.innerHTML = `
      <div class="step-label">${dict.common.step} ${stepIndex + 1} / ${STEP_KEYS.length}</div>
      <div class="question">${step.question}</div>
      <div class="question-hint">${step.hint}</div>
    `;

    const optionsWrap = document.createElement('div');
    optionsWrap.className = 'options' + (GRID_STEPS.includes(stepKey) ? ' grid' : '');
    optionsWrap.setAttribute('role', 'group');
    optionsWrap.setAttribute('aria-label', step.question);

    const nextBtn = renderButton(
      stepIndex === STEP_KEYS.length - 1 ? dict.common.seeResult : dict.common.continue,
      () => {
        renderStep(root, dict, answers, stepIndex + 1);
      },
      { disabled: !answers[stepKey] }
    );

    step.options.forEach((option) => {
      const btn = renderOptionButton({
        icon: option.icon,
        label: option.label,
        hint: option.hint,
        onClick: (clickedBtn) => {
          optionsWrap.querySelectorAll('.option-btn').forEach((b) => b.classList.remove('selected'));
          clickedBtn.classList.add('selected');
          const nextAnswers = { ...answers, [stepKey]: option.value };
          setState(TOOL, nextAnswers);
          answers = nextAnswers;
          nextBtn.disabled = false;
        },
      });
      if (answers[stepKey] === option.value) btn.classList.add('selected');
      optionsWrap.appendChild(btn);
    });

    card.appendChild(optionsWrap);
    appendNav(root, dict, card, nextBtn, stepIndex, () => answers);
    root.appendChild(card);
  }

  global.PMTool = global.PMTool || {};
  global.PMTool.views = global.PMTool.views || {};
  global.PMTool.views.discoveryAdvisor = renderDiscoveryAdvisorView;
})(window);
