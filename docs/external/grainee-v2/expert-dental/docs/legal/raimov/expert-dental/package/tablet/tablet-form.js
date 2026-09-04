(() => {
  const root = document.querySelector('[data-ed-tablet-form]');
  if (!root) return;

  const sections = [...root.querySelectorAll('[data-ed-substantive-section]')];
  const checks = [...root.querySelectorAll('[data-ed-ack]')];
  const progressBar = root.querySelector('[data-ed-progress]');
  const progressText = root.querySelector('[data-ed-progress-text]');
  const statusText = root.querySelector('[data-ed-action-status]');
  const signButton = root.querySelector('[data-ed-sign]');
  const backButton = root.querySelector('[data-ed-back]');
  const canvas = root.querySelector('[data-ed-signature-canvas]');
  const clearButton = root.querySelector('[data-ed-clear-signature]');
  const form = root.querySelector('[data-ed-sign-form]');
  const copyDelivery = form?.elements.namedItem('copy_delivery');
  const copyRecipient = form?.elements.namedItem('copy_recipient');
  const blocking = root.dataset.clearanceBlocked === 'true';

  const viewed = new Set();
  let points = [];
  let drawing = false;
  let context;

  const copyDeliveryReady = () => {
    const channel = String(copyDelivery?.value || '').trim();
    if (!channel) return false;
    if (channel === 'paper') return true;
    return String(copyRecipient?.value || '').trim().length >= 5;
  };

  const updateProgress = () => {
    const total = Math.max(1, sections.length);
    const complete = viewed.size;
    const value = Math.round((complete / total) * 100);
    if (progressBar) progressBar.style.setProperty('--ed-progress', `${value}%`);
    if (progressText) progressText.textContent = `${complete} из ${total} разделов показано`;
    updateReady();
  };

  const updateReady = () => {
    const sectionsReady = viewed.size === sections.length;
    const checksReady = checks.every((input) => input.checked);
    const signatureReady = points.filter((point) => !point.break).length >= 6;
    const deliveryReady = copyDeliveryReady();
    const ready = sectionsReady && checksReady && signatureReady && deliveryReady && !blocking;
    if (signButton) signButton.disabled = !ready;

    if (!statusText) return;
    if (blocking) statusText.textContent = 'Подписание заблокировано: не закрыт обязательный медицинский или лицензионный gate.';
    else if (!sectionsReady) statusText.textContent = 'Просмотрите все разделы документа.';
    else if (!checksReady) statusText.textContent = 'Подтвердите обязательные пункты.';
    else if (!signatureReady) statusText.textContent = 'Поставьте подпись электронным пером.';
    else if (!deliveryReady) statusText.textContent = 'Укажите получателя электронной копии либо выберите бумажную копию.';
    else statusText.textContent = 'Документ готов к финальному подтверждению.';
  };

  // Mark a section as presented when its end marker reaches the reading viewport.
  // This works for both short and very long cards; observing the whole card by ratio does not.
  const sentinels = sections.map((section, index) => {
    section.dataset.edSectionId ||= String(index + 1);
    const sentinel = document.createElement('span');
    sentinel.dataset.edSectionEnd = section.dataset.edSectionId;
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'display:block;width:1px;height:1px;pointer-events:none;';
    section.append(sentinel);
    return sentinel;
  });

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) viewed.add(entry.target.dataset.edSectionEnd);
    }
    updateProgress();
  }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });

  sentinels.forEach((sentinel) => observer.observe(sentinel));
  checks.forEach((input) => input.addEventListener('change', updateReady));
  copyDelivery?.addEventListener('change', updateReady);
  copyRecipient?.addEventListener('input', updateReady);

  if (canvas) {
    context = canvas.getContext('2d');

    const redraw = () => {
      const rect = canvas.getBoundingClientRect();
      context.clearRect(0, 0, rect.width, rect.height);
      if (!points.length) return;
      let penDown = false;
      context.beginPath();
      for (const point of points) {
        if (point.break) {
          penDown = false;
          continue;
        }
        if (!penDown) {
          context.moveTo(point.x, point.y);
          penDown = true;
        } else {
          context.lineTo(point.x, point.y);
        }
      }
      context.stroke();
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(rect.width * ratio));
      canvas.height = Math.max(1, Math.round(rect.height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.lineWidth = 2.4;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.strokeStyle = '#142c27';
      redraw();
    };

    const pointFromEvent = (event) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        t: Date.now(),
        pointerType: event.pointerType || 'unknown',
        pressure: Number.isFinite(event.pressure) ? event.pressure : null
      };
    };

    canvas.addEventListener('pointerdown', (event) => {
      drawing = true;
      canvas.setPointerCapture(event.pointerId);
      const point = pointFromEvent(event);
      points.push({ break: true }, point);
      context.beginPath();
      context.moveTo(point.x, point.y);
      event.preventDefault();
    });

    canvas.addEventListener('pointermove', (event) => {
      if (!drawing) return;
      const point = pointFromEvent(event);
      points.push(point);
      context.lineTo(point.x, point.y);
      context.stroke();
      updateReady();
      event.preventDefault();
    });

    const endStroke = (event) => {
      drawing = false;
      try { canvas.releasePointerCapture(event.pointerId); } catch {}
      updateReady();
    };

    canvas.addEventListener('pointerup', endStroke);
    canvas.addEventListener('pointercancel', endStroke);
    window.addEventListener('resize', resize);
    resize();

    clearButton?.addEventListener('click', () => {
      points = [];
      redraw();
      updateReady();
    });
  }

  backButton?.addEventListener('click', () => {
    const firstUnviewed = sections.find((section) => !viewed.has(section.dataset.edSectionId));
    const target = firstUnviewed || sections.at(-1);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (signButton?.disabled) return;

    const detail = {
      docId: root.dataset.docId,
      version: root.dataset.version,
      sourceVersion: root.dataset.sourceVersion,
      sourceSha256: root.dataset.sourceSha256,
      acknowledgements: Object.fromEntries(checks.map((input) => [input.name || input.dataset.edAck, input.checked])),
      copyDelivery: {
        channel: String(copyDelivery?.value || ''),
        recipient: String(copyRecipient?.value || '').trim()
      },
      signature: {
        pngDataUrl: canvas?.toDataURL('image/png') || null,
        points
      }
    };

    const request = new CustomEvent('expert-form-sign-request', {
      bubbles: true,
      cancelable: true,
      detail
    });

    const handled = !root.dispatchEvent(request);
    if (!handled) {
      window.alert('Это tablet-preview. Подписание должно быть завершено через защищённый Expert Signing service.');
    }
  });

  updateProgress();
})();
