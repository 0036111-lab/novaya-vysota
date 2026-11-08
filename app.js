const menuButton = document.querySelector('[data-menu-button]');
const nav = document.querySelector('[data-nav]');
const header = document.querySelector('[data-header]');
const progress = document.querySelector('[data-scroll-progress]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
  });
  nav.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  });
}

const updateScroll = () => {
  const top = window.scrollY;
  header?.classList.toggle('scrolled', top > 40);
  const height = document.documentElement.scrollHeight - window.innerHeight;
  if (progress) progress.style.width = `${height > 0 ? (top / height) * 100 : 0}%`;
  if (!reduceMotion) {
    document.querySelectorAll('[data-parallax]').forEach((element) => {
      const rect = element.getBoundingClientRect();
      const amount = Math.max(-80, Math.min(80, (window.innerHeight / 2 - rect.top) * 0.08));
      element.style.setProperty('--parallax', `${amount}px`);
    });
  }
};
window.addEventListener('scroll', updateScroll, { passive: true });
updateScroll();

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('[data-reveal]').forEach((element) => observer.observe(element));

document.querySelectorAll('[data-year]').forEach((element) => {
  element.textContent = new Date().getFullYear();
});

const dialog = document.querySelector('[data-dialog]');
document.querySelectorAll('[data-open-form]').forEach((button) => button.addEventListener('click', () => {
  if (!dialog) return;
  dialog.hidden = false;
  document.body.classList.add('dialog-open');
  dialog.querySelector('input')?.focus();
}));
const closeDialog = () => {
  if (dialog) dialog.hidden = true;
  document.body.classList.remove('dialog-open');
};
document.querySelector('[data-close-form]')?.addEventListener('click', closeDialog);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && dialog && !dialog.hidden) closeDialog();
});

const form = document.querySelector('[data-partner-form]');
const result = document.querySelector('[data-form-result]');
form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  result?.classList.remove('error', 'success');

  if (!form.checkValidity()) {
    form.reportValidity();
    if (result) {
      result.textContent = 'Пожалуйста, заполните обязательные поля.';
      result.classList.add('error');
    }
    return;
  }

  const data = Object.fromEntries(new FormData(form).entries());
  if (!data.phone && !data.telegram) {
    if (result) {
      result.textContent = 'Укажите телефон или Telegram для связи.';
      result.classList.add('error');
    }
    return;
  }

  const endpoint = window.NOVAYA_VYSOTA_CONFIG?.partnerRequestEndpoint;
  if (!endpoint) {
    const message = [
      'Заявка с сайта «Новая высота»',
      `Имя: ${data.name}`,
      `Компания: ${data.company || '—'}`,
      `Телефон: ${data.phone || '—'}`,
      `Telegram: ${data.telegram || '—'}`,
      `Формат участия: ${data.interest}`,
      `Комментарий: ${data.message || '—'}`
    ].join('\n');
    window.open(`https://t.me/seedofsense?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    if (result) {
      result.textContent = 'Telegram открыт с готовой заявкой. Нажмите «Отправить», чтобы передать её команде проекта.';
      result.classList.add('success');
    }
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = 'Отправляем…';
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, source: 'novaya-vysota-site', page: location.href })
    });
    if (!response.ok) throw new Error('request_failed');
    form.reset();
    if (result) {
      result.textContent = 'Спасибо! Заявка отправлена. Мы свяжемся с вами.';
      result.classList.add('success');
    }
  } catch {
    if (result) {
      result.innerHTML = 'Не удалось отправить заявку. Напишите Елене Басковой в <a href="https://t.me/lulenabas" target="_blank" rel="noreferrer">Telegram @lulenabas</a>.';
      result.classList.add('error');
    }
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Получить предложение';
  }
});
