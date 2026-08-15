(function (global) {
  const { recommendPrototype } = global.PMTool.logic.protoAdvisor;
  const { getState, setState, clearState } = global.PMTool.core.state;
  const { renderProgressDots, renderButton, renderOptionButton, renderTextStep, renderResultScreen } = global.PMTool.core.ui;

  const TOOL = 'proto-advisor';

  const CHOICE_STEPS = [
    {
      key: 'risk',
      label: 'Quel est le risque principal de cette hypothèse ?',
      grid: true,
      options: [
        { value: 'desirability', icon: '💡', label: 'Désirabilité', hint: 'Les gens en veulent-ils vraiment ?' },
        { value: 'feasibility', icon: '⚙️', label: 'Faisabilité', hint: 'Peut-on le construire ?' },
        { value: 'viability', icon: '📊', label: 'Viabilité', hint: 'Est-ce rentable business ?' },
        { value: 'usability', icon: '🎯', label: 'Utilisabilité', hint: 'Sauront-ils s\'en servir ?' },
      ],
    },
    {
      key: 'need',
      label: 'De quoi as-tu besoin pour valider ?',
      grid: true,
      // Les options sont adaptées au risque choisi à l'étape précédente : la question
      // "de quoi as-tu besoin ?" n'a pas le même sens pour la désirabilité que pour la
      // faisabilité ou la viabilité : un même libellé générique pour les 4 risques
      // produisait des recommandations dont l'intitulé ne correspondait pas à la question.
      optionsByRisk: {
        desirability: [
          { value: 'behavior', icon: '🖱️', label: 'Un signal comportemental réel', hint: 'Clic, inscription, usage...' },
          { value: 'qualitative', icon: '💬', label: 'Un retour qualitatif direct', hint: "Avis, ressenti, récit d'usage..." },
          { value: 'technical', icon: '🎭', label: 'Une réaction sans construire le vrai système', hint: 'Simuler pour observer la réaction réelle' },
          { value: 'intent', icon: '👆', label: "Un signal d'intention (pas encore d'achat)", hint: "Clic sur une fonctionnalité qui n'existe pas encore" },
        ],
        feasibility: [
          { value: 'behavior', icon: '🔧', label: 'Voir le système fonctionner réellement', hint: 'Même minimal, en conditions réelles' },
          { value: 'qualitative', icon: '🗣️', label: "Un avis d'expert avant de coder", hint: 'Devs, architectes, experts du domaine' },
          { value: 'technical', icon: '🧪', label: 'Une preuve technique construite', hint: 'Un POC qui répond à la question' },
          { value: 'intent', icon: '🧮', label: 'Une estimation avant de t\'engager', hint: 'Coût de build vs valeur attendue' },
        ],
        viability: [
          { value: 'behavior', icon: '💳', label: 'Un engagement réel (même manuel)', hint: 'Paiement, réservation, contrat...' },
          { value: 'qualitative', icon: '🏢', label: 'Un avis côté décideur business', hint: "Budget, ROI, process d'achat" },
          { value: 'technical', icon: '📈', label: 'Un modèle chiffré', hint: 'Revenus, coûts, seuil de rentabilité' },
          { value: 'intent', icon: '💰', label: 'Un signal de willingness to pay', hint: "Prix affiché, CTA d'achat" },
        ],
        usability: [
          { value: 'behavior', icon: '👀', label: 'Observer un vrai usage', hint: 'Tâches, clics, hésitations' },
          { value: 'qualitative', icon: '⏱️', label: 'Une première impression', hint: 'Compréhension immédiate ou confusion' },
          { value: 'technical', icon: '🖥️', label: 'Une interaction réelle testable', hint: 'Prototype cliquable ou no-code' },
          { value: 'intent', icon: '🗂️', label: 'Leur modèle mental', hint: 'Comment ils organisent l\'information' },
        ],
      },
    },
  ];

  const TOTAL_STEPS = CHOICE_STEPS.length + 1;

  function renderProtoAdvisorView(root) {
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

    if (stepIndex >= TOTAL_STEPS) {
      root.appendChild(renderProgressDots(TOTAL_STEPS - 1, TOTAL_STEPS));
      const result = recommendPrototype(answers);
      if (answers.hypothesis) {
        const hypothesisRecap = document.createElement('div');
        hypothesisRecap.className = 'hypothesis-recap';
        hypothesisRecap.innerHTML = `<span class="hypothesis-recap-label">Ton hypothèse</span><p>${answers.hypothesis}</p>`;
        root.appendChild(hypothesisRecap);
      }
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

    root.appendChild(renderProgressDots(stepIndex, TOTAL_STEPS));

    const card = document.createElement('div');
    card.className = 'card fade-in';

    if (stepIndex === 0) {
      card.innerHTML = `
        <div class="step-label">Étape 1 / ${TOTAL_STEPS}</div>
        <div class="question">Quelle est ton hypothèse à valider ?</div>
        <div class="privacy-note">🔒 Rien n'est envoyé sur un serveur : ton texte reste local à ce navigateur et sera rappelé dans ta recommandation.</div>
      `;
      const nextBtn = renderButton('Continuer →', () => {
        const nextAnswers = { ...answers, hypothesis: textarea.value };
        setState(TOOL, nextAnswers);
        renderStep(root, nextAnswers, stepIndex + 1);
      }, { disabled: true });
      const textarea = renderTextStep({
        placeholder:
          'Ex: Les managers paieraient pour un dashboard de suivi en temps réel de leurs techniciens...',
        onValidChange: (valid) => {
          nextBtn.disabled = !valid;
        },
      });
      if (answers.hypothesis) textarea.value = answers.hypothesis;
      card.appendChild(textarea);
      appendNav(root, card, nextBtn, stepIndex, () => answers);
      root.appendChild(card);
      return;
    }

    const step = CHOICE_STEPS[stepIndex - 1];
    card.innerHTML = `
      <div class="step-label">Étape ${stepIndex + 1} / ${TOTAL_STEPS}</div>
      <div class="question">${step.label}</div>
    `;

    const optionsWrap = document.createElement('div');
    optionsWrap.className = 'options' + (step.grid ? ' grid' : '');
    optionsWrap.setAttribute('role', 'group');
    optionsWrap.setAttribute('aria-label', step.label);

    const nextBtn = renderButton(
      stepIndex === TOTAL_STEPS - 1 ? 'Voir ma recommandation →' : 'Continuer →',
      () => {
        renderStep(root, answers, stepIndex + 1);
      },
      { disabled: !answers[step.key] }
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
  global.PMTool.views.protoAdvisor = renderProtoAdvisorView;
})(window);
