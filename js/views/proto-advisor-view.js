(function (global) {
  const { recommendPrototype } = global.PMTool.logic.protoAdvisor;
  const { getState, setState, clearState } = global.PMTool.core.state;
  const { getLang, loadLocale } = global.PMTool.core.i18n;
  const { renderProgressDots, renderButton, renderOptionButton, renderTextStep, renderResultScreen } = global.PMTool.core.ui;

  const TOOL = 'proto-advisor';
  const STEP_KEYS = ['risk', 'need'];

  function renderProtoAdvisorView(root) {
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
    const t = dict.protoAdvisor;
    const totalSteps = STEP_KEYS.length + 1;
    root.innerHTML = '';

    if (stepIndex >= totalSteps) {
      root.appendChild(renderProgressDots(totalSteps - 1, totalSteps, dict.common.step));
      const result = recommendPrototype(answers);
      let content = null;
      if (result.key) {
        const [risk, need] = result.key.split('.');
        const entry = t.matrix[risk][need];
        content = {
          recommendation: entry.name,
          tag: entry.tag,
          author: t.framework.author,
          reference: t.framework.reference,
          rationale: entry.rationale,
          nextSteps: entry.nextSteps,
        };
      }
      if (answers.hypothesis) {
        const hypothesisRecap = document.createElement('div');
        hypothesisRecap.className = 'hypothesis-recap';
        hypothesisRecap.innerHTML = `<span class="hypothesis-recap-label">${t.hypothesisRecapLabel}</span><p>${answers.hypothesis}</p>`;
        root.appendChild(hypothesisRecap);
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

    root.appendChild(renderProgressDots(stepIndex, totalSteps, dict.common.step));

    const card = document.createElement('div');
    card.className = 'card fade-in';

    if (stepIndex === 0) {
      card.innerHTML = `
        <div class="step-label">${dict.common.step} 1 / ${totalSteps}</div>
        <div class="question">${t.hypothesisStep.question}</div>
        <div class="privacy-note">${t.hypothesisStep.privacyNote}</div>
      `;
      const nextBtn = renderButton(dict.common.continue, () => {
        const nextAnswers = { ...answers, hypothesis: textarea.value };
        setState(TOOL, nextAnswers);
        renderStep(root, dict, nextAnswers, stepIndex + 1);
      }, { disabled: true });
      const textarea = renderTextStep({
        placeholder: t.hypothesisStep.placeholder,
        hintReady: dict.common.charHintReady,
        hintCountTemplate: dict.common.charHintCount,
        onValidChange: (valid) => {
          nextBtn.disabled = !valid;
        },
      });
      if (answers.hypothesis) textarea.value = answers.hypothesis;
      card.appendChild(textarea);
      appendNav(root, dict, card, nextBtn, stepIndex, () => answers);
      root.appendChild(card);
      return;
    }

    const stepKey = STEP_KEYS[stepIndex - 1];
    const step = t.steps[stepKey];
    card.innerHTML = `
      <div class="step-label">${dict.common.step} ${stepIndex + 1} / ${totalSteps}</div>
      <div class="question">${step.question}</div>
    `;

    const optionsWrap = document.createElement('div');
    optionsWrap.className = 'options grid';
    optionsWrap.setAttribute('role', 'group');
    optionsWrap.setAttribute('aria-label', step.question);

    const nextBtn = renderButton(
      stepIndex === totalSteps - 1 ? dict.common.seeResult : dict.common.continue,
      () => {
        renderStep(root, dict, answers, stepIndex + 1);
      },
      { disabled: !answers[stepKey] }
    );

    const options = step.optionsByRisk ? step.optionsByRisk[answers.risk] : step.options;

    options.forEach((option) => {
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
  global.PMTool.views.protoAdvisor = renderProtoAdvisorView;
})(window);
