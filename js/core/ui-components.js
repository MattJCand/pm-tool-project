(function (global) {

function renderProgressDots(current, total, stepWord) {
  const wrap = document.createElement('div');
  wrap.className = 'progress-wrap';

  const meta = document.createElement('div');
  meta.className = 'progress-meta';
  const stepNum = Math.min(current + 1, total);
  meta.innerHTML = `<span><span class="current">${stepWord} ${stepNum}</span> / ${total}</span>`;
  wrap.appendChild(meta);

  const track = document.createElement('div');
  track.className = 'progress-track';
  track.setAttribute('role', 'progressbar');
  track.setAttribute('aria-valuemin', '0');
  track.setAttribute('aria-valuemax', String(total));
  track.setAttribute('aria-valuenow', String(stepNum));

  const fill = document.createElement('div');
  fill.className = 'progress-fill';
  const pct = total > 0 ? Math.round((stepNum / total) * 100) : 0;
  fill.style.width = pct + '%';
  track.appendChild(fill);
  wrap.appendChild(track);

  return wrap;
}

function renderButton(label, onClick, { variant = 'primary', disabled = false } = {}) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `btn btn-${variant}`;
  button.textContent = label;
  button.disabled = disabled;
  button.addEventListener('click', onClick);
  return button;
}

function renderOptionButton({ icon, label, hint, onClick }) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'option-btn';
  button.innerHTML = `
    <span class="option-row">
      ${icon ? `<span class="option-icon" aria-hidden="true">${icon}</span>` : ''}
      <span>${label}</span>
      <span class="option-check" aria-hidden="true"></span>
    </span>
    ${hint ? `<span class="option-hint">${hint}</span>` : ''}
  `;
  button.setAttribute('aria-pressed', 'false');
  button.addEventListener('click', () => onClick(button));
  return button;
}

function renderTextStep({ placeholder, minLength = 10, onValidChange, hintReady, hintCountTemplate }) {
  const wrap = document.createElement('div');

  const textarea = document.createElement('textarea');
  textarea.placeholder = placeholder;
  textarea.setAttribute('aria-label', placeholder);

  const hint = document.createElement('div');
  hint.className = 'char-hint';

  function updateHint(value) {
    const len = value.trim().length;
    const ready = len >= minLength;
    hint.textContent = ready
      ? hintReady
      : hintCountTemplate.replace('{count}', String(len)).replace('{min}', String(minLength));
    hint.classList.toggle('ready', ready);
    return ready;
  }

  textarea.addEventListener('input', () => {
    const valid = updateHint(textarea.value);
    onValidChange(valid, textarea.value);
  });

  updateHint('');

  wrap.appendChild(textarea);
  wrap.appendChild(hint);

  // Expose the textarea itself so callers can read/set .value directly,
  // matching the previous API where renderTextStep returned the <textarea>.
  wrap.valueOf = () => textarea.value;
  Object.defineProperty(wrap, 'value', {
    get() { return textarea.value; },
    set(v) { textarea.value = v; updateHint(v); },
  });
  wrap.focus = () => textarea.focus();

  return wrap;
}

function renderDiamond(diamondKeys, phaseLabels) {
  if (!diamondKeys || diamondKeys.length === 0) {
    return null;
  }
  const wrap = document.createElement('div');
  wrap.className = 'diamond-visual';
  wrap.innerHTML = diamondKeys
    .map((key, i) => {
      const phase = `<div class="diamond-phase">${phaseLabels[key]}</div>`;
      return i > 0 ? `<div class="diamond-arrow">→</div>${phase}` : phase;
    })
    .join('');
  return wrap;
}

function emptyStateIcon() {
  return `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg>`;
}

function renderResultScreen(content, common, phaseLabels, { onRestart, onBack } = {}) {
  const container = document.createElement('div');
  container.className = 'result-card fade-in';
  container.setAttribute('role', 'region');
  container.setAttribute('aria-label', common.resultAriaLabel);

  const eyebrow = document.createElement('div');
  eyebrow.className = 'result-eyebrow';
  eyebrow.textContent = common.recommendationLabel;
  container.appendChild(eyebrow);

  if (!content) {
    const icon = document.createElement('div');
    icon.className = 'result-empty-icon';
    icon.innerHTML = emptyStateIcon();
    container.appendChild(icon);

    const title = document.createElement('h2');
    title.className = 'result-title';
    title.textContent = common.noRecommendationTitle;
    container.appendChild(title);

    const rationale = document.createElement('p');
    rationale.className = 'result-rationale';
    rationale.textContent = common.missingAnswers;
    container.appendChild(rationale);
  } else {
    const diamond = renderDiamond(content.diamond, phaseLabels);
    if (diamond) container.appendChild(diamond);

    const title = document.createElement('h2');
    title.className = 'result-title';
    title.textContent = content.recommendation || content.name;
    container.appendChild(title);

    if (content.author) {
      const author = document.createElement('div');
      author.className = 'result-author';
      author.textContent = content.author;
      container.appendChild(author);
    }

    if (content.tag) {
      const tag = document.createElement('div');
      tag.className = 'result-tag' + (content.tagClass ? ' ' + content.tagClass : '');
      tag.textContent = content.tag;
      container.appendChild(tag);
    }

    const whyBlock = document.createElement('div');
    whyBlock.className = 'result-why';

    const whyLabel = document.createElement('div');
    whyLabel.className = 'result-section-label';
    whyLabel.textContent = common.whyLabel;
    whyBlock.appendChild(whyLabel);

    const rationale = document.createElement('p');
    rationale.className = 'result-rationale';
    rationale.textContent = content.rationale;
    whyBlock.appendChild(rationale);

    if (content.reference) {
      const reference = document.createElement('p');
      reference.className = 'result-reference';
      reference.textContent = content.reference;
      whyBlock.appendChild(reference);
    }

    container.appendChild(whyBlock);

    if (content.also && content.also.length > 0) {
      const also = document.createElement('div');
      also.className = 'result-also';
      also.innerHTML = `
        <div class="result-also-label">${common.alsoLabel}</div>
        ${content.also.map((item) => `<div class="also-item"><span>→</span><span>${item}</span></div>`).join('')}
      `;
      container.appendChild(also);
    }

    if (content.nextSteps && content.nextSteps.length > 0) {
      const steps = document.createElement('div');
      steps.className = 'result-steps';
      steps.innerHTML = `
        <div class="result-steps-label">${common.nextStepsLabel}</div>
        ${content.nextSteps
          .map(
            (step, i) => `
          <div class="step-item">
            <span class="step-num">${String(i + 1).padStart(2, '0')}</span>
            <span>${step}</span>
          </div>`
          )
          .join('')}
      `;
      container.appendChild(steps);
    }
  }

  const footer = document.createElement('div');
  footer.className = 'result-footer';
  if (onRestart) {
    footer.appendChild(renderButton(common.restart, onRestart, { variant: 'secondary' }));
  }
  if (onBack) {
    footer.appendChild(renderButton(common.backToTools, onBack, { variant: 'secondary' }));
  }
  if (footer.childNodes.length > 0) {
    container.appendChild(footer);
  }

  return container;
}

  global.PMTool = global.PMTool || {};
  global.PMTool.core = global.PMTool.core || {};
  global.PMTool.core.ui = { renderProgressDots, renderButton, renderOptionButton, renderTextStep, renderResultScreen };
})(window);
