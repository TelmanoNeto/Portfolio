import { projects } from '../data/projects.js';

const ICONS = {
  github: `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>`,
  external: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
  close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="20" height="20"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
};

function createCard(project) {
  const card = document.createElement('article');
  card.className = 'project-card';
  card.dataset.id = project.id;

  card.innerHTML = `
    <div class="project-card__cover" style="background: ${project.gradient}">
      <span class="project-card__icon">${project.icon}</span>
      <div class="project-card__overlay">
        <span>Ver detalhes</span>
      </div>
    </div>
    <div class="project-card__body">
      <h3 class="project-card__title">${project.title}</h3>
      <ul class="project-card__tags">
        ${project.tags.map(t => `<li>${t}</li>`).join('')}
      </ul>
    </div>
  `;

  card.addEventListener('click', () => openModal(project));
  return card;
}

function openModal(project) {
  const modal = document.getElementById('modal');
  const cover = document.getElementById('modal-cover');
  const desc  = document.getElementById('modal-desc');
  const tags  = document.getElementById('modal-tags');
  const links = document.getElementById('modal-links');

  cover.style.background = project.gradient;
  cover.innerHTML = `<span class="modal__icon">${project.icon}</span><h2 class="modal__cover-title" id="modal-cover-title">${project.title}</h2>`;
  desc.textContent = project.description;
  tags.innerHTML   = project.tags.map(t => `<li>${t}</li>`).join('');

  const linkItems = [];
  if (project.site) {
    linkItems.push(`<a href="${project.site}" target="_blank" rel="noopener" class="btn btn--primary">${ICONS.external} Acessar projeto</a>`);
  }
  if (project.repo) {
    linkItems.push(`<a href="${project.repo}" target="_blank" rel="noopener" class="btn btn--ghost">${ICONS.github} Ver repositório</a>`);
  }
  links.innerHTML = linkItems.join('');

  modal.showModal();
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal').close();
  document.body.style.overflow = '';
}

export default function initProjects() {
  const featuredEl = document.getElementById('featured-projects');
  const allEl      = document.getElementById('all-projects');

  projects.forEach(p => {
    const card = createCard(p);
    (p.featured ? featuredEl : allEl).appendChild(card);
  });

  const modal = document.getElementById('modal');

  document.getElementById('modal-close').addEventListener('click', closeModal);

  // Fechar ao clicar fora do modal (no backdrop)
  modal.addEventListener('click', e => {
    const rect = modal.getBoundingClientRect();
    if (
      e.clientX < rect.left || e.clientX > rect.right ||
      e.clientY < rect.top  || e.clientY > rect.bottom
    ) closeModal();
  });

  // Escape já é tratado nativamente pelo <dialog>, mas sync o overflow
  modal.addEventListener('close', () => {
    document.body.style.overflow = '';
  });
}
