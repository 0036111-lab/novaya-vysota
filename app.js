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
