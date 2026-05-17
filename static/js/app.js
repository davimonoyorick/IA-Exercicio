/* ═══════════════════════════════════════════════
   TEMA CLARO / ESCURO
═══════════════════════════════════════════════ */
const html      = document.documentElement;
const themeBtn  = document.getElementById('theme-btn');
const themeIcon = document.getElementById('theme-icon');

function applyTheme(dark) {
  html.setAttribute('data-theme', dark ? 'dark' : 'light');
  themeIcon.textContent = dark ? '☀️' : '🌙';
  localStorage.setItem('ailab-theme', dark ? 'dark' : 'light');
}

// Carrega preferência salva ou do sistema
const saved = localStorage.getItem('ailab-theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
applyTheme(saved ? saved === 'dark' : prefersDark);

themeBtn.addEventListener('click', () => {
  applyTheme(html.getAttribute('data-theme') !== 'dark');
});

/* ═══════════════════════════════════════════════
   TABS
═══════════════════════════════════════════════ */
document.querySelectorAll('.htab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.htab, .panel').forEach(el => el.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
  });
});

/* ═══════════════════════════════════════════════
   MÓDULO 1 — DESFOQUE FACIAL
═══════════════════════════════════════════════ */
let faceFile = null;

// Drop zone
(function setupDrop() {
  const dz    = document.getElementById('face-dz');
  const input = document.getElementById('face-file');
  const ph    = document.getElementById('face-ph');
  const thumb = document.getElementById('face-thumb');
  const prev  = document.getElementById('face-prev');
  const fn    = document.getElementById('face-fn');
  const btn   = document.getElementById('face-btn');
  const resCard = document.getElementById('face-res-card');
  const errEl = document.getElementById('face-err');
  const empty = document.getElementById('face-empty');

  function loadFile(f) {
    faceFile = f;
    prev.src = URL.createObjectURL(f);
    fn.textContent = f.name.length > 28 ? f.name.slice(0, 25) + '…' : f.name;
    ph.style.display   = 'none';
    thumb.classList.add('on');
    btn.disabled = false;
    errEl.classList.remove('on');
    // Oculta resultado anterior
    document.getElementById('face-result-img').classList.remove('on');
    document.getElementById('face-meta').classList.remove('on');
    document.getElementById('face-dl').classList.remove('on');
    empty.style.display = 'flex';
  }

  dz.addEventListener('dragover',  e => { e.preventDefault(); dz.classList.add('over'); });
  dz.addEventListener('dragleave', e => { if (!dz.contains(e.relatedTarget)) dz.classList.remove('over'); });
  dz.addEventListener('drop', e => {
    e.preventDefault(); dz.classList.remove('over');
    if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]);
  });
  input.addEventListener('change', () => { if (input.files[0]) loadFile(input.files[0]); });
})();

// Slider de blur
const blurEl = document.getElementById('face-blur');
const blurVl = document.getElementById('face-bv');
blurEl.addEventListener('input', () => blurVl.textContent = blurEl.value);

// Processar
document.getElementById('face-btn').addEventListener('click', async () => {
  if (!faceFile) return;

  const btn   = document.getElementById('face-btn');
  const st    = document.getElementById('face-st');
  const err   = document.getElementById('face-err');
  const empty = document.getElementById('face-empty');

  btn.disabled = true;
  st.classList.add('on');
  err.classList.remove('on');

  const fd = new FormData();
  fd.append('imagem', faceFile);
  fd.append('intensidade', blurEl.value);

  try {
    const r = await fetch('/api/desfoque', { method: 'POST', body: fd });
    const d = await r.json();
    if (d.erro) throw new Error(d.erro);

    const src = `/resultados/${d.arquivo}`;
    const img = document.getElementById('face-result-img');
    img.src = src;
    img.classList.add('on');
    empty.style.display = 'none';

    document.getElementById('face-dl').href = src;
    document.getElementById('face-dl').classList.add('on');

    document.getElementById('fm-r').textContent   = d.rostos_detectados;
    document.getElementById('fm-res').textContent = d.resolucao;
    document.getElementById('fm-b').textContent   = blurEl.value;
    document.getElementById('face-meta').classList.add('on');

  } catch (e) {
    document.getElementById('face-em').textContent = e.message || 'Erro inesperado.';
    err.classList.add('on');
  } finally {
    st.classList.remove('on');
    btn.disabled = false;
  }
});

/* ═══════════════════════════════════════════════
   MÓDULO 2 — TOKEN QUEST
═══════════════════════════════════════════════ */
const CORES = {
  stopword:  { bg: 'rgba(107,122,255,.13)', border: '#6b7aff', label: 'Stopword'  },
  numero:    { bg: 'rgba(212,144,10,.13)',  border: '#d4900a', label: 'Número'    },
  pontuacao: { bg: 'rgba(214,59,59,.13)',   border: '#d63b3b', label: 'Pontuação' },
  maiuscula: { bg: 'rgba(26,158,92,.13)',   border: '#1a9e5c', label: 'Maiúscula' },
  palavra:   { bg: 'rgba(0,153,204,.13)',   border: '#0099cc', label: 'Palavra'   },
};

// Dark mode: cores mais vibrantes nos tokens
const CORES_DARK = {
  stopword:  { bg: 'rgba(107,122,255,.18)', border: '#8892ff', label: 'Stopword'  },
  numero:    { bg: 'rgba(249,199,79,.15)',  border: '#f9c74f', label: 'Número'    },
  pontuacao: { bg: 'rgba(255,107,107,.15)', border: '#ff6b6b', label: 'Pontuação' },
  maiuscula: { bg: 'rgba(67,233,123,.15)',  border: '#43e97b', label: 'Maiúscula' },
  palavra:   { bg: 'rgba(0,212,184,.15)',   border: '#00d4b8', label: 'Palavra'   },
};

function getCores() {
  return html.getAttribute('data-theme') === 'dark' ? CORES_DARK : CORES;
}

let xpTotal = 0;
const XP_LVL = 100;

// Textarea counter
const tqText = document.getElementById('tq-text');
const tqCC   = document.getElementById('tq-cc');
tqText.addEventListener('input', () => tqCC.textContent = tqText.value.length);

// Exemplos
window.setEx = function(t) {
  tqText.value = t;
  tqCC.textContent = t.length;
  tqText.focus();
};

// Tokenizar
document.getElementById('tq-btn').addEventListener('click', async () => {
  const texto = tqText.value.trim();
  if (!texto) return;

  const btn = document.getElementById('tq-btn');
  const st  = document.getElementById('tq-st');
  const err = document.getElementById('tq-err');

  btn.disabled = true;
  st.classList.add('on');
  err.classList.remove('on');

  try {
    const r = await fetch('/api/tokenizar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texto }),
    });
    const d = await r.json();
    if (d.erro) throw new Error(d.erro);

    renderTokens(d);
    atualizarXP(d.total);
    document.getElementById('tq-res').style.display = 'block';
    document.getElementById('tq-res').scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  } catch (e) {
    document.getElementById('tq-em').textContent = e.message || 'Erro inesperado.';
    err.classList.add('on');
  } finally {
    st.classList.remove('on');
    btn.disabled = false;
  }
});

function renderTokens(d) {
  const stage  = document.getElementById('stage');
  const legend = document.getElementById('legend');
  stage.innerHTML  = '';
  legend.innerHTML = '';
  stage.classList.remove('empty');

  const cores = getCores();
  const seenCats = new Set();

  d.tokens.forEach((t, i) => {
    const c = cores[t.categoria] || { bg: 'rgba(160,160,160,.12)', border: '#aaa' };
    seenCats.add(t.categoria);

    const chip = document.createElement('span');
    chip.className = 'tok';
    chip.style.cssText = [
      `background:${c.bg}`,
      `border-color:${c.border}`,
      `color:${c.border}`,
      `animation-delay:${Math.min(i * 22, 500)}ms`,
    ].join(';');
    chip.title = `#${t.id} · ${t.categoria}`;
    chip.textContent = t.token;
    stage.appendChild(chip);
  });

  if (d.tokens.length === 0) stage.classList.add('empty');

  // Legenda apenas das categorias presentes
  const orderedCats = ['palavra', 'maiuscula', 'stopword', 'numero', 'pontuacao'];
  orderedCats.forEach(cat => {
    if (!seenCats.has(cat)) return;
    const c = cores[cat];
    const el = document.createElement('div');
    el.className = 'leg';
    el.innerHTML = `<div class="leg-dot" style="background:${c.border}"></div>${c.label}`;
    legend.appendChild(el);
  });

  // Métricas
  const ratio = d.total > 0 ? (d.chars / d.total).toFixed(1) : '—';
  document.getElementById('tm-tot').textContent = d.total;
  document.getElementById('tm-ch').textContent  = d.chars;
  document.getElementById('tm-rt').textContent  = ratio;
}

function atualizarXP(tokens) {
  xpTotal += tokens;
  const lv  = Math.floor(xpTotal / XP_LVL) + 1;
  const pct = (xpTotal % XP_LVL) / XP_LVL * 100;
  document.getElementById('xp-lv').innerHTML = lv + '<small>nível</small>';
  document.getElementById('xp-pts').textContent = xpTotal + ' XP';
  document.getElementById('xp-fill').style.width = pct + '%';
}
