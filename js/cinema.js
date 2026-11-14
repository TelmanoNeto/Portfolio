// Camada cinematográfica do site de clientes. Sem dependências.
// Só escreve variáveis CSS e classes; a coreografia mora em css/cinema.css.
(() => {
  window.__cine = true;
  const root = document.documentElement;
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  // Um único laço de quadros, acordado pela rolagem, pelo cursor ou pelo redimensionamento
  const tarefas = [];
  let raf = 0;
  const acordar = () => { if (!raf) raf = requestAnimationFrame(quadro); };
  function quadro() {
    raf = 0;
    let continuar = false;
    for (const t of tarefas) if (t()) continuar = true;
    if (continuar) acordar();
  }
  addEventListener('scroll', acordar, { passive: true });
  addEventListener('resize', acordar);

  // Cabeçalho: linha de progresso e divisória depois que a página anda
  const topo = document.querySelector('.top');
  if (topo) tarefas.push(() => {
    const max = root.scrollHeight - innerHeight;
    topo.style.setProperty('--sp', (max > 0 ? clamp(scrollY / max) : 0).toFixed(4));
    topo.classList.toggle('is-scrolled', scrollY > 8);
    return false;
  });

  const movimento = matchMedia('(prefers-reduced-motion: no-preference)').matches;
  if (!movimento) {
    root.classList.remove('cine');
    acordar();
    return;
  }

  const cursorFino = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const desktop = matchMedia('(min-width: 981px)');

  // Títulos: cada palavra numa máscara. O leitor de tela recebe o texto inteiro.
  document.querySelectorAll('[data-split]').forEach((el) => {
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    let i = 0;
    const percorrer = (no) => {
      for (const n of [...no.childNodes]) {
        if (n.nodeType === Node.ELEMENT_NODE) { percorrer(n); continue; }
        if (n.nodeType !== Node.TEXT_NODE) continue;
        const frag = document.createDocumentFragment();
        for (const parte of n.textContent.split(/(\s+)/)) {
          if (!parte) continue;
          if (/^\s+$/.test(parte)) { frag.append(' '); continue; }
          const w = document.createElement('span');
          w.className = 'w';
          w.setAttribute('aria-hidden', 'true');
          const s = document.createElement('span');
          s.textContent = parte;
          s.style.setProperty('--i', i++);
          w.append(s);
          frag.append(w);
        }
        n.replaceWith(frag);
      }
    };
    percorrer(el);
  });

  // Listas entram em sequência
  document.querySelectorAll('[data-stagger]').forEach((el) => {
    [...el.children].forEach((filho, i) => filho.style.setProperty('--i', i));
  });

  // Revelar ao entrar na tela (uma vez só)
  const io = new IntersectionObserver((entradas) => {
    for (const e of entradas) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    }
  }, { rootMargin: '0px 0px -10% 0px' });
  document.querySelectorAll('.reveal, [data-split], [data-stagger], [data-in]').forEach((el) => {
    if (!el.closest('.hero')) io.observe(el);
  });

  // Abertura: o título do hero entra logo depois do primeiro quadro pintado
  const h1 = document.querySelector('.hero h1');
  if (h1) requestAnimationFrame(() => requestAnimationFrame(() => h1.classList.add('is-in')));

  // Hero: profundidade com o cursor e saída em camadas com a rolagem
  const hero = document.querySelector('.hero');
  if (hero) {
    const repouso = { x: 0.35, y: -0.3 };
    let mx = repouso.x, my = repouso.y, tx = repouso.x, ty = repouso.y;
    if (cursorFino) {
      hero.addEventListener('pointermove', (e) => {
        const r = hero.getBoundingClientRect();
        tx = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
        ty = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
        acordar();
      });
      hero.addEventListener('pointerleave', () => { tx = repouso.x; ty = repouso.y; acordar(); });
    }
    tarefas.push(() => {
      const r = hero.getBoundingClientRect();
      if (r.bottom > -200) hero.style.setProperty('--out', clamp(-r.top / (r.height * 0.9)).toFixed(4));
      mx = lerp(mx, tx, 0.07);
      my = lerp(my, ty, 0.07);
      hero.style.setProperty('--mx', mx.toFixed(4));
      hero.style.setProperty('--my', my.toFixed(4));
      return Math.abs(mx - tx) > 0.001 || Math.abs(my - ty) > 0.001;
    });
  }

  // Trabalhos: o print do celular rola conforme a leitura do caso; o celular inclina com o cursor
  const caso = document.querySelector('.case');
  const palco = caso && caso.querySelector('.case-stage');
  if (palco) {
    let shot = 0, rx = 0, ry = 0, trx = 0, tryy = 0;
    if (cursorFino) {
      palco.addEventListener('pointermove', (e) => {
        const r = palco.getBoundingClientRect();
        trx = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
        tryy = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
        acordar();
      });
      palco.addEventListener('pointerleave', () => { trx = tryy = 0; acordar(); });
    }
    tarefas.push(() => {
      const vh = innerHeight;
      let p;
      if (desktop.matches) {
        const r = caso.getBoundingClientRect();
        p = clamp((vh * 0.6 - r.top) / Math.max(1, r.height - vh * 0.35));
      } else {
        const r = palco.getBoundingClientRect();
        p = clamp((vh - r.top) / (vh + r.height));
      }
      shot = lerp(shot, p, 0.12);
      rx = lerp(rx, trx, 0.08);
      ry = lerp(ry, tryy, 0.08);
      palco.style.setProperty('--shot', shot.toFixed(4));
      palco.style.setProperty('--tx', rx.toFixed(4));
      palco.style.setProperty('--ty', ry.toFixed(4));
      return Math.abs(shot - p) > 0.0005 || Math.abs(rx - trx) > 0.001 || Math.abs(ry - tryy) > 0.001;
    });
  }

  // Cenas: --v (-1 abaixo da tela … 1 acima) para parallax e --c (0 … 1) para a cortina
  const cenas = [...document.querySelectorAll('[data-scroll]')];
  tarefas.push(() => {
    const vh = innerHeight;
    for (const el of cenas) {
      const r = el.getBoundingClientRect();
      if (r.bottom < -vh || r.top > vh * 2) continue;
      const v = clamp((vh / 2 - (r.top + r.height / 2)) / (vh / 2 + r.height / 2), -1, 1);
      el.style.setProperty('--v', v.toFixed(4));
      el.style.setProperty('--c', clamp((vh - r.top) / (vh * 0.6)).toFixed(4));
    }
    return false;
  });

  // Dúvidas: abrir e fechar com altura animada (teclado continua funcionando pelo summary)
  const curva = 'cubic-bezier(.65,0,.35,1)';
  document.querySelectorAll('.faq details').forEach((d) => {
    const s = d.querySelector('summary');
    const corpo = d.querySelector('p');
    s.addEventListener('click', (e) => {
      e.preventDefault();
      if (d._anim) return;
      const de = d.offsetHeight;
      d.style.overflow = 'hidden';
      let ate;
      if (d.open) {
        ate = s.offsetHeight + (d.offsetHeight - d.clientHeight);
        d.classList.add('closing');
      } else {
        d.open = true;
        ate = d.offsetHeight;
        if (corpo) corpo.animate(
          { opacity: [0, 1], transform: ['translateY(-8px)', 'none'] },
          { duration: 450, delay: 90, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' }
        );
      }
      d._anim = d.animate({ height: [de + 'px', ate + 'px'] }, { duration: 420, easing: curva });
      d._anim.onfinish = () => {
        if (d.classList.contains('closing')) { d.open = false; d.classList.remove('closing'); }
        d.style.overflow = '';
        d._anim = null;
      };
    });
  });

  // Botões magnéticos: seguem o cursor alguns pixels
  if (cursorFino) document.querySelectorAll('.btn-solid, .btn-line').forEach((b) => {
    b.addEventListener('pointermove', (e) => {
      const r = b.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      b.style.translate = `${(x * 10).toFixed(1)}px ${(y * 8).toFixed(1)}px`;
    });
    b.addEventListener('pointerleave', () => { b.style.translate = ''; });
  });

  acordar();
})();
