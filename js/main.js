// VELORA — hero 3D carousel + scroll story. three.js r160 (vendored, no build step).
import * as THREE from './vendor/three.module.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';

/* ------------------------------------------------------------------ data */
const MODELS = { noir: 'assets/models/velora-eau-de-parfum.glb', blue: 'assets/models/velora-blue-elegance.glb' };
const PRODUCTS = [
  { name: ['NOIR', 'ÉCLAT'],    model: 'noir', c1: '#c9973f', c2: '#3a2608', text: 'Our signature eau de parfum. Smoked amber, black vanilla and warm oud wrapped in a midnight glass flacon with gold accents.' },
  { name: ['BLUE', 'ELEGANCE'], model: 'blue', c1: '#2f63ff', c2: '#0a1a55', text: 'A fresh, luminous fragrance. Sea salt, bergamot and white musk — the calm confidence of a deep blue evening.' },
  { name: ['AMBRE', 'NUIT'],    model: 'noir', c1: '#ff7a2c', c2: '#4a1604', text: 'Golden amber, saffron and tonka bean. A warm, magnetic trail that lingers long after the night has ended.' },
  { name: ['AZUR', 'SILK'],     model: 'blue', c1: '#22c4ff', c2: '#03354d', text: 'Iris, cool lavender and soft cashmere woods. Silky, airy and clean — elegance you can wear every day.' },
  { name: ['ROSE', 'OBSCURE'],  model: 'noir', c1: '#e8417f', c2: '#4d0a24', text: 'Dark Turkish rose, patchouli and black pepper. A bold floral with a mysterious, velvet-dark heart.' },
  { name: ['ROYAL', 'MARINE'],  model: 'blue', c1: '#7b54ff', c2: '#1d0d58', text: 'Violet leaf, marine accord and vetiver. A regal, modern aquatic for those who make waves.' },
  { name: ['OR', 'SAUVAGE'],    model: 'noir', c1: '#e3c25a', c2: '#3d3208', text: 'Wild fig, gold leather and cedar. Raw, radiant and untamed — luxury with an edge.' },
  { name: ['OCÉAN', 'PRIVÉ'],   model: 'blue', c1: '#19d3b5', c2: '#033f36', text: 'Mint, green tea and driftwood. A private escape to turquoise waters, bottled.' },
];
const FEATURES = [
  { tag: 'TOP NOTES',     title: ['BRIGHT', 'FIRST IMPRESSION'], text: 'Sparkling citrus and spice open the fragrance — the first seconds that make people turn around.', icon: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>' },
  { tag: 'HEART NOTES',   title: ['A RICH', 'FLORAL HEART'],     text: 'Hand-picked flowers and precious woods reveal the true character of the scent after a few minutes.', icon: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>' },
  { tag: 'BASE NOTES',    title: ['DEEP &', 'LONG LASTING'],      text: 'Amber, musk and resins anchor the composition for up to 12 hours of soft, elegant trail.', icon: '<path d="M12 3l3 6 6 .9-4.5 4.3 1 6.3L12 17.6 6.5 20.5l1-6.3L3 9.9 9 9z"/>' },
  { tag: 'CRAFTSMANSHIP', title: ['MADE IN', 'SMALL BATCHES'],    text: 'Each bottle is filled, sealed and finished by hand in our atelier, with 20% pure perfume oils.', icon: '<path d="M9 3h6M10 3v4l-4 5v8h12v-8l-4-5V3"/>' },
];
const FAQ = [
  ['How long does a Velora perfume last on the skin?', 'Our eaux de parfum contain 18–20% perfume oils and last 8–12 hours on skin, even longer on clothes.'],
  ['Are Velora fragrances vegan and cruelty free?', 'Yes. We never test on animals and all our formulas are free from animal-derived ingredients.'],
  ['What size are the bottles?', 'Every fragrance comes in a 100 ml refillable glass flacon. A 10 ml travel spray is available too.'],
  ['How should I store my perfume?', 'Keep it away from direct sunlight and heat, ideally in its box at room temperature.'],
  ['Do you ship internationally?', 'We ship to more than 40 countries. Delivery takes 2–7 working days depending on destination.'],
  ['Can I return a fragrance?', 'Unopened bottles can be returned within 30 days. Opened bottles can be exchanged once.'],
];

/* ------------------------------------------------------------------ helpers */
const $ = (s) => document.querySelector(s);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const range = (v, a, b) => clamp((v - a) / (b - a));
const N = PRODUCTS.length;
const wrap = (o) => { o = ((o % N) + N) % N; return o > N / 2 ? o - N : o; };
const isTouch = matchMedia('(pointer:coarse)').matches;
if (isTouch) document.body.classList.add('touch');

/* ------------------------------------------------------------------ renderer */
const canvas = $('#gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.setClearColor(0x000000, 0);

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(26, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 0.25, 11);

// lights: the hanging ring lamp = top spot, plus coloured rims
scene.add(new THREE.AmbientLight(0xffffff, 0.15));
const spot = new THREE.SpotLight(0xffffff, 140, 20, 0.36, 0.7, 1.6);
spot.position.set(0, 6.5, 1.2); spot.target.position.set(0, 0, 0);
scene.add(spot, spot.target);
const key = new THREE.DirectionalLight(0xffffff, 0.9); key.position.set(2, 2, 6); scene.add(key);
const rimL = new THREE.PointLight(0xffffff, 18, 12, 1.5); rimL.position.set(-3.2, 1.2, -1); scene.add(rimL);
const rimR = new THREE.PointLight(0xffffff, 18, 12, 1.5); rimR.position.set(3.2, -0.6, -1); scene.add(rimR);
const under = new THREE.PointLight(0xffffff, 10, 8, 1.5); under.position.set(0, -2.6, 2.4); scene.add(under);

/* ------------------------------------------------------------------ build carousel */
const items = []; // {pivot, tilt, spin, mats[]}
const BASE_ROT_Y = 0; // TODO(agent): adjust if model front faces wrong way
function prepModel(gltf) {
  const root = gltf.scene;
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
  root.position.sub(c);
  const g = new THREE.Group(); g.add(root);
  g.scale.setScalar(1.55 / size.y);
  return g;
}
function buildItems(templates) {
  PRODUCTS.forEach((p, i) => {
    const model = templates[p.model].clone(true);
    const mats = [];
    model.traverse((o) => {
      if (o.isMesh) {
        o.material = o.material.clone();
        o.material.envMapIntensity = 1;
        mats.push(o.material);
      }
    });
    const pivot = new THREE.Group(), tilt = new THREE.Group(), spin = new THREE.Group();
    spin.rotation.y = BASE_ROT_Y; spin.add(model); tilt.add(spin); pivot.add(tilt); scene.add(pivot);
    items.push({ pivot, tilt, spin, mats, seed: i * 1.7 });
  });
}

/* ------------------------------------------------------------------ state */
let pos = 0, target = 0, vel = 0;   // carousel position in item units
let active = 0;
let dragging = false, lastX = 0, dragMoved = 0;
const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
let scrollS = 0, smoothS = 0;       // scroll in viewport heights

const root = document.documentElement;
const colA = new THREE.Color(), colB = new THREE.Color();
function setAccent(i) {
  const p = PRODUCTS[i];
  root.style.setProperty('--accent', p.c1);
  root.style.setProperty('--accent2', p.c2);
  const set = (el) => { el.innerHTML = `<span>${p.name[0]}</span><span>${p.name[1]}</span>`; };
  const pn = $('#pname'); set(pn); pn.classList.remove('swap'); void pn.offsetWidth; pn.classList.add('swap');
  set($('#dtitle'));
  $('#dtext').textContent = p.text;
  colA.set(p.c1);
  rimL.color.set(p.c1); rimR.color.set(p.c1); under.color.set(p.c1);
}

/* ------------------------------------------------------------------ UI build */
$('#feats').innerHTML = FEATURES.map((f, i) => `<div class="feat" data-i="${i}"><span class="tag"><b></b>${f.tag}</span><h3>${f.title.join('<br>')}</h3><p>${f.text}</p></div>`).join('');
$('#icons').innerHTML = FEATURES.map((f, i) => `<li data-i="${i}" aria-label="${f.tag}"><svg viewBox="0 0 24 24">${f.icon}</svg></li>`).join('');
$('#faqList').innerHTML = FAQ.map(([q, a]) => `<div class="qa"><button>${q}</button><div class="ans"><div><p>${a}</p></div></div></div>`).join('');
document.querySelectorAll('.qa button').forEach((b) => b.addEventListener('click', () => b.parentElement.classList.toggle('open')));
document.querySelectorAll('#icons li').forEach((li) => li.addEventListener('click', () => {
  scrollTo({ top: (2 + +li.dataset.i + 0.5) * innerHeight, behavior: 'smooth' });
}));

/* ------------------------------------------------------------------ input */
const cursor = $('#cursor');
const inHero = () => scrollS < 0.25;
addEventListener('pointermove', (e) => {
  mouse.x = (e.clientX / innerWidth) * 2 - 1; mouse.y = (e.clientY / innerHeight) * 2 - 1;
  cursor.style.left = e.clientX + 'px'; cursor.style.top = e.clientY + 'px';
  const overUI = e.target.closest('button,a,.qa,#icons');
  cursor.classList.toggle('drag', inHero() && !overUI && e.clientY > innerHeight * .18 && e.clientY < innerHeight * .8);
  if (dragging) {
    const dx = e.clientX - lastX; lastX = e.clientX; dragMoved += Math.abs(dx);
    const d = -dx / (innerWidth * 0.14);
    target += d; vel = d;
  }
});
canvas.addEventListener('pointerdown', (e) => {
  if (!inHero()) return;
  dragging = true; lastX = e.clientX; dragMoved = 0; vel = 0; cursor.classList.add('down');
  canvas.setPointerCapture?.(e.pointerId);
});
const endDrag = () => {
  if (!dragging) return;
  dragging = false; cursor.classList.remove('down');
  target = Math.round(target + vel * 6); // inertia then snap
};
addEventListener('pointerup', endDrag); addEventListener('pointercancel', endDrag);
canvas.style.touchAction = 'pan-y';
// horizontal wheel / trackpad swipe rotates carousel
addEventListener('wheel', (e) => {
  if (!inHero() || Math.abs(e.deltaX) < Math.abs(e.deltaY)) return;
  target += e.deltaX / 400; clearTimeout(endDrag.t); endDrag.t = setTimeout(() => (target = Math.round(target)), 140);
}, { passive: true });
$('#prev').addEventListener('click', () => (target = Math.round(target) - 1));
$('#next').addEventListener('click', () => (target = Math.round(target) + 1));
addEventListener('keydown', (e) => {
  if (!inHero()) return;
  if (e.key === 'ArrowLeft') target = Math.round(target) - 1;
  if (e.key === 'ArrowRight') target = Math.round(target) + 1;
});
// click on a side product -> go to it
canvas.addEventListener('click', (e) => {
  if (!inHero() || dragMoved > 6) return;
  const ray = new THREE.Raycaster();
  ray.setFromCamera(new THREE.Vector2((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1), camera);
  const hit = ray.intersectObjects(items.map((it) => it.pivot), true)[0];
  if (!hit) return;
  const idx = items.findIndex((it) => { let o = hit.object; while (o) { if (o === it.pivot) return true; o = o.parent; } return false; });
  if (idx >= 0) target = Math.round(target) + wrap(idx - Math.round(target));
});
addEventListener('scroll', () => { scrollS = scrollY / innerHeight; }, { passive: true });

// sound toggle (soft ambient pad generated with WebAudio — no audio file needed)
let actx, gain, soundOn = true;
function startAudio() {
  if (actx) return;
  actx = new (window.AudioContext || window.webkitAudioContext)();
  gain = actx.createGain(); gain.gain.value = 0; gain.connect(actx.destination);
  const lp = actx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700; lp.connect(gain);
  [110, 164.8, 220, 277.2].forEach((f, i) => {
    const o = actx.createOscillator(); o.type = i % 2 ? 'sine' : 'triangle'; o.frequency.value = f; o.detune.value = i * 4;
    const g = actx.createGain(); g.gain.value = 0.05; o.connect(g); g.connect(lp); o.start();
  });
  if (soundOn) gain.gain.linearRampToValueAtTime(0.35, actx.currentTime + 2);
}
addEventListener('pointerdown', startAudio, { once: true });
$('#sound').addEventListener('click', () => {
  soundOn = !soundOn;
  $('#sound').classList.toggle('off', !soundOn);
  $('.sound-label').textContent = soundOn ? 'ON' : 'OFF';
  if (gain) gain.gain.linearRampToValueAtTime(soundOn ? 0.35 : 0, actx.currentTime + 0.6);
});

/* ------------------------------------------------------------------ layout per frame */
const heroUI = $('#heroUI'), detailUI = $('#detailUI'), ring = $('#ring'), intro = $('#intro');
const bgColor = $('.bg-color'), bgFlash = $('.bg-flash'), statement = $('#statement'), dline = $('#dline');
const feats = [...document.querySelectorAll('.feat')], icons = [...document.querySelectorAll('#icons li')];
let featOn = -1;
const tmpDark = new THREE.Color(0x0b0b0d), white = new THREE.Color(1, 1, 1);

function layout(t, dt) {
  const s = smoothS;
  const p1 = ease(range(s, 0, 1));          // hero -> detail
  const pF = range(s, 1.6, 6);               // features progress
  const pS = range(s, 5.6, 7);               // statement
  const p3 = ease(range(s, 6.6, 7.8));       // detail -> dark (faq)
  const wide = innerWidth / innerHeight;
  const narrow = wide < 1;

  // carousel item placement
  items.forEach((it, i) => {
    const o = wrap(i - pos);
    const ao = Math.abs(o);
    const sp = narrow ? 0.95 : 1.28;
    // centre item sits higher (under the ring light), side items spread evenly across the width
    let x = Math.sign(o) * (Math.min(ao, 1) * (sp + 0.12) + Math.max(0, ao - 1) * sp);
    let y = lerp(0.32, -0.12 + Math.sin(it.seed * 2.3) * 0.12, clamp(ao)) + Math.sin(t * 0.9 + it.seed) * 0.04;
    let z = -Math.pow(ao, 1.1) * 0.55;
    let sc = lerp(1.22, 0.86, clamp(ao));
    let tiltZ = -0.24 + (ao > 0.5 ? Math.sin(it.seed * 3.1) * 0.12 : 0);
    let rotY = -o * 0.32 + Math.sin(t * 0.5 + it.seed) * 0.08;
    // mouse parallax on active
    if (ao < 0.5) { rotY += mouse.sx * 0.25; tiltZ += -mouse.sx * 0.05; }

    const isActive = i === active;
    if (isActive) {
      // detail pose
      const dx = narrow ? 0.0 : lerp(0.75, 0.15, ease(pF));
      x = lerp(x, dx, p1);
      y = lerp(y, narrow ? 0.5 : -0.1, p1);
      z = lerp(z, 3.6, p1);
      sc = lerp(sc, 1.55, p1);
      tiltZ = lerp(tiltZ, -0.42 + pF * 0.42, p1);
      rotY = lerp(rotY, Math.sin(pF * Math.PI * 3) * 0.55 + mouse.sx * 0.15, p1); // keep label facing camera (full spin showed blank back)
      // back to dark: product floats right, behind FAQ title
      x = lerp(x, narrow ? 0 : 0.55, p3); y = lerp(y, 0.35, p3); z = lerp(z, 1.2, p3);
      sc = lerp(sc, 1.1, p3); tiltZ = lerp(tiltZ, -0.12, p3); rotY = lerp(rotY, 0.3, p3);
    } else {
      y -= p1 * (2.6 + ao * 0.4); z -= p1 * 2; sc *= 1 - p1 * 0.3;
    }
    it.pivot.position.set(x, y, z);
    it.pivot.scale.setScalar(sc);
    it.pivot.visible = isActive || p1 < 0.99;
    it.tilt.rotation.z = tiltZ;
    it.spin.rotation.y = BASE_ROT_Y + rotY;
    // darken side products (silhouettes like the reference)
    const lit = isActive ? 1 : clamp(1 - ao * 1.25);
    it.mats.forEach((m) => { m.color.copy(tmpDark).lerp(white, lit * 0.9 + 0.1 * (1 - ao > 0 ? 1 : 0) * 0); m.envMapIntensity = 0.25 + lit * 0.9; });
  });

  camera.position.x = lerp(mouse.sx * 0.25, 0, p1);
  camera.position.y = 0.25 + lerp(-mouse.sy * 0.12, 0, p1);
  camera.lookAt(0, 0.05, 0);
  spot.intensity = lerp(140, 60, p1);
  rimL.intensity = rimR.intensity = lerp(18, 30, p1);

  // overlays
  heroUI.style.opacity = 1 - range(s, 0, .35);
  heroUI.style.visibility = s > .4 ? 'hidden' : 'visible';
  ring.style.opacity = 1 - range(s, 0, .5);
  bgColor.style.opacity = range(s, 0.2, 1) * (1 - p3);
  const dOp = range(s, .6, 1) * (1 - range(s, 6.6, 7.1));
  detailUI.style.opacity = dOp; detailUI.style.pointerEvents = dOp > .5 ? 'auto' : 'none';
  intro.style.opacity = 1 - range(s, 1.5, 1.9);
  intro.style.transform = `translateY(calc(-50% - ${range(s, 1.5, 1.9) * 30}px))`;
  const fi = s < 1.9 ? -1 : Math.min(3, Math.floor((s - 1.9) / 1.0));
  if (fi !== featOn) { featOn = fi; feats.forEach((f, i) => f.classList.toggle('on', i === fi)); icons.forEach((f, i) => f.classList.toggle('on', i === fi)); }
  dline.style.setProperty('--p', pF.toFixed(3));
  const flash = Math.sin(Math.PI * pS);
  bgFlash.style.opacity = flash * 0.85;
  statement.style.opacity = flash;
  statement.style.transform = `scale(${lerp(1.15, 0.95, pS)})`;
  statement.style.filter = `blur(${lerp(14, 3, flash)}px)`;
  feats.forEach((f) => (f.style.visibility = pS > .35 ? 'hidden' : 'visible'));
}

/* ------------------------------------------------------------------ loop */
const clock = new THREE.Clock();
function frame() {
  const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
  if (!dragging) vel *= 0.9;
  pos += (target - pos) * (dragging ? 0.35 : 0.085);
  const a = ((Math.round(pos) % N) + N) % N;
  if (a !== active && smoothS < 0.3) { active = a; setAccent(active); }
  mouse.sx += (mouse.x - mouse.sx) * 0.06; mouse.sy += (mouse.y - mouse.sy) * 0.06;
  smoothS += (scrollS - smoothS) * 0.12;
  // slider dot: position within collection
  const prog = ((pos % N) + N) % N / (N - 1);
  $('#sliderDot').style.left = (clamp(prog) * 100) + '%';
  layout(t, dt);
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
function resize() {
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight;
  camera.fov = camera.aspect < 1 ? 42 : 26;
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize); resize();

/* ------------------------------------------------------------------ load */
const manager = new THREE.LoadingManager();
manager.onProgress = (u, l, tot) => ($('#loadBar').style.width = (l / tot) * 100 + '%');
const loader = new GLTFLoader(manager);
const load = (url) => new Promise((res, rej) => loader.load(url, res, (e) => {
  if (e.total) $('#loadBar').style.width = Math.round((e.loaded / e.total) * 100) + '%';
}, rej));
Promise.all([load(MODELS.noir), load(MODELS.blue)]).then(([a, b]) => {
  buildItems({ noir: prepModel(a), blue: prepModel(b) });
  setAccent(0);
  $('#loader').classList.add('done');
  window.__ready = true;
  frame();
}).catch((e) => { console.error(e); $('#loader').innerHTML = '<span style="font-size:12px">Could not load 3D models — serve the folder over http (see README).</span>'; });
