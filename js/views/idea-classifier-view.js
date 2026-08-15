(function (global) {
  const { classifyIdea } = global.PMTool.logic.ideaClassifier;
  const { getState, setState, clearState } = global.PMTool.core.state;
  const { getLang, loadLocale } = global.PMTool.core.i18n;
  const { renderProgressDots, renderButton, renderOptionButton, renderTextStep, renderResultScreen } = global.PMTool.core.ui;

  const TOOL = 'idea-classifier';
  const STEP_KEYS = ['business', 'signals', 'problem', 'solution'];

  function renderIdeaClassifierView(root, opts = {}) {
    const saved = getState(TOOL);
    loadLocale(getLang()).then((dict) => {
      renderStep(root, dict, { ...saved }, 0, opts);
    });
  }

  function appendNav(root, dict, card, nextBtn, stepIndex, getAnswers, opts) {
    if (stepIndex > 0) {
      const actions = document.createElement('div');
      actions.className = 'step-actions';
      actions.appendChild(
        renderButton(dict.common.previous, () => renderStep(root, dict, getAnswers(), stepIndex - 1, opts), { variant: 'secondary' })
      );
      actions.appendChild(nextBtn);
      card.appendChild(actions);
    } else {
      card.appendChild(nextBtn);
    }
  }

  function renderStep(root, dict, answers, stepIndex, opts = {}) {
    const t = dict.ideaClassifier;
    const totalSteps = STEP_KEYS.length + 1;
    root.innerHTML = '';
    if (typeof opts.onStepChange === 'function') {
      opts.onStepChange(Math.min(stepIndex, totalSteps - 1));
    }

    if (stepIndex >= totalSteps) {
      root.appendChild(renderProgressDots(totalSteps - 1, totalSteps, dict.common.step));
      const result = classifyIdea(answers);
      const content = result.key ? t.results[result.key] : null;
      if (answers.idea) {
        const ideaRecap = document.createElement('div');
        ideaRecap.className = 'hypothesis-recap';
        ideaRecap.innerHTML = `<span class="hypothesis-recap-label">${t.hypothesisRecapLabel}</span><p>${answers.idea}</p>`;
        root.appendChild(ideaRecap);
      }
      root.appendChild(
        renderResultScreen(content, dict.common, dict.diamondPhases, {
          onRestart: () => {
            clearState(TOOL);
            renderStep(root, dict, {}, 0, opts);
          },
          onBack: () => {
            window.location.href = 'index.html';
          },
        })
      );
      return;
    }

    root.appendChild(renderProgressDots(stepIndex, totalSteps, dict.common.step));

    const card = document.createElement('div');
    card.className = 'card fade-in';

    if (stepIndex === 0) {
      card.innerHTML = `
        <div class="step-label">${dict.common.step} 1 / ${totalSteps}</div>
        <div class="question">${t.ideaStep.question}</div>
        <div class="question-hint">${t.ideaStep.hint}</div>
        <div class="privacy-note">${t.ideaStep.privacyNote}</div>
      `;
      const nextBtn = renderButton(dict.common.continue, () => {
        const nextAnswers = { ...answers, idea: textarea.value };
        setState(TOOL, nextAnswers);
        renderStep(root, dict, nextAnswers, stepIndex + 1, opts);
      }, { disabled: true });
      const textarea = renderTextStep({
        placeholder: t.ideaStep.placeholder,
        hintReady: dict.common.charHintReady,
        hintCountTemplate: dict.common.charHintCount,
        onValidChange: (valid) => {
          nextBtn.disabled = !valid;
        },
      });
      if (answers.idea) textarea.value = answers.idea;
      card.appendChild(textarea);
      appendNav(root, dict, card, nextBtn, stepIndex, () => answers, opts);
      root.appendChild(card);
      return;
    }

    const stepKey = STEP_KEYS[stepIndex - 1];
    const step = t.steps[stepKey];
    card.innerHTML = `
      <div class="step-label">${dict.common.step} ${stepIndex + 1} / ${totalSteps}</div>
      <div class="question">${step.question}</div>
      <div class="question-hint">${step.hint}</div>
    `;

    const optionsWrap = document.createElement('div');
    optionsWrap.className = 'options' + (stepKey === 'solution' ? ' grid' : '');
    optionsWrap.setAttribute('role', 'group');
    optionsWrap.setAttribute('aria-label', step.question);

    const nextBtn = renderButton(dict.common.continue, () => {
      renderStep(root, dict, answers, stepIndex + 1, opts);
    }, { disabled: !answers[stepKey] });

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
    appendNav(root, dict, card, nextBtn, stepIndex, () => answers, opts);
    root.appendChild(card);
  }

  global.PMTool = global.PMTool || {};
  global.PMTool.views = global.PMTool.views || {};
  global.PMTool.views.ideaClassifier = renderIdeaClassifierView;
})(window);
