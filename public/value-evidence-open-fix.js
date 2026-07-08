(() => {
  let intervalId;

  function keepValueEvidenceOpen() {
    const source = document.getElementById('value-evidence');
    const promoted = document.getElementById('value-evidence-promoted');

    if (source) {
      const sourceButton = source.querySelector('.detail-accordion-header');
      if (sourceButton && sourceButton.getAttribute('aria-expanded') !== 'true') {
        sourceButton.click();
      }
      source.classList.add('value-evidence-source-hidden');
    }

    if (!promoted) return;

    promoted.classList.add('value-evidence-promoted-open');
    const promotedButton = promoted.querySelector('.detail-accordion-header');
    const promotedLabel = promotedButton?.querySelector('strong');
    promotedButton?.setAttribute('aria-expanded', 'true');
    if (promotedLabel) promotedLabel.textContent = 'Shown';

    const sourceBody = source?.querySelector('.detail-accordion-body');
    const promotedBody = promoted.querySelector('.detail-accordion-body');
    if (sourceBody && promotedBody && sourceBody.innerHTML.trim() && promotedBody.innerHTML !== sourceBody.innerHTML) {
      promotedBody.innerHTML = sourceBody.innerHTML;
    }
  }

  function scheduleKeepOpen() {
    keepValueEvidenceOpen();
    window.setTimeout(keepValueEvidenceOpen, 0);
    window.setTimeout(keepValueEvidenceOpen, 80);
    window.setTimeout(keepValueEvidenceOpen, 250);
  }

  const observer = new MutationObserver(scheduleKeepOpen);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener('hashchange', scheduleKeepOpen);
  window.addEventListener('load', scheduleKeepOpen);
  document.addEventListener('DOMContentLoaded', scheduleKeepOpen);

  intervalId = window.setInterval(keepValueEvidenceOpen, 350);
  window.setTimeout(() => window.clearInterval(intervalId), 6000);
  scheduleKeepOpen();
})();
