'use strict';
/* วิชาชีวิต · page logic. The scroll mechanism is scrollcraft.js (untouched);
   this file renders data, runs the lesson UI, and drives the one bespoke
   device: the red pen in chapter 1, read off the act's --sc-p. */
const {cats, lessons, paths = [], hotlines = []} = window.WICHA_DATA;
const icon = window.icon;
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const catOf = id => cats.find(c => c[0] === id);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const KEY = 'wicha-chiwit-v1';

let state = {saved: [], done: [], checks: {}}, view = 'all', category = 'all', pathId = null, current = null, returnFocus = null, toastTimer;
try {
  const s = JSON.parse(localStorage.getItem(KEY));
  if (s) {
    const ok = id => lessons.some(l => l.id === id);
    state.saved = Array.isArray(s.saved) ? s.saved.filter(ok) : [];
    state.done = Array.isArray(s.done) ? s.done.filter(ok) : [];
    state.checks = s.checks && typeof s.checks === 'object' && !Array.isArray(s.checks) ? s.checks : {};
  }
} catch {}
function persist() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { toast('เบราว์เซอร์นี้บันทึกไม่ได้ ความคืบหน้าจะอยู่เฉพาะครั้งนี้'); } }
function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 3000); }
function toggle(key, id) { state[key] = state[key].includes(id) ? state[key].filter(x => x !== id) : [...state[key], id]; persist(); render(); }

/* ---------------- static chapters ---------------- */
const PEAK = [
  ['ว่าต้องยื่นภาษีแบบไหน เมื่อมีรายได้เสริม', 'side-income'],
  ['ว่าบัตรประชาชนหายต้องไปที่ไหน', 'id-card'],
  ['ว่าเงินสำรองฉุกเฉินควรมีเท่าไร', 'emergency-fund'],
  ['ว่าเจออุบัติเหตุต้องโทรเบอร์อะไร', 'hotline'],
  ['ว่าก่อนเซ็นสัญญาเช่าต้องดูอะไร', 'rent'],
];
function buildStatic() {
  $('#lesson-total').textContent = lessons.length;
  $('#peak-list').innerHTML = PEAK.map(([rest, id], i) => {
    const l = lessons.find(x => x.id === id);
    return '<li data-i="' + i + '"><span class="nk"><span class="nk__word">ไม่รู้</span><svg viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M1 6 C 22 3, 48 8, 70 4 S 94 6, 99 3"/></svg><span class="nk__fix" aria-hidden="true">รู้แล้ว</span></span><span>' + esc(rest) + '</span>'
      + (l ? '<a class="peak__go" href="#library" data-open="' + l.id + '" tabindex="-1">อ่านบท ' + esc(l.title) + '</a>' : '') + '</li>';
  }).join('');
  $('#areas-rail').insertAdjacentHTML('beforeend', cats.map((c, i) => {
    const ls = lessons.filter(l => l.cat === c[0]);
    return '<button type="button" class="area" style="--i:' + i + '" data-cat-jump="' + c[0] + '">' + icon(c[1]) + '<h3>' + esc(c[2]) + '</h3><span class="area__count">' + ls.length + ' บทเรียน</span><ul>' + ls.slice(0, 2).map(l => '<li>' + esc(l.title) + '</li>').join('') + '</ul></button>';
  }).join('') + '<p class="areas__end">เริ่มจากเรื่องที่ใช้วันนี้ก็พอ</p>');
  $('#hotline-rows').innerHTML = hotlines.map((h, i) => '<tr class="' + (i < 3 ? 'urgent' : '') + '"><th scope="row"><a href="tel:' + h[0] + '">' + h[0] + '</a></th><td>' + esc(h[1]) + '</td></tr>').join('');
}

/* ---------------- library ---------------- */
function visible() {
  const q = $('#search').value.trim().toLocaleLowerCase('th');
  const p = paths.find(p => p.id === pathId);
  const base = p ? p.lessons.map(id => lessons.find(l => l.id === id)).filter(Boolean) : lessons;
  return base.filter(l => (category === 'all' || l.cat === category) && (view === 'all' || state[view].includes(l.id))
    && (!q || [l.title, l.summary, catOf(l.cat)[2], ...l.steps].join(' ').toLocaleLowerCase('th').includes(q)));
}
function render() {
  const n = state.done.length, t = lessons.length;
  $('#progress-label').textContent = 'เรียนแล้ว ' + n + '/' + t;
  $$('[data-view]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === view && !pathId)));
  $('#paths').innerHTML = paths.map(p => {
    const ls = p.lessons.filter(id => lessons.some(l => l.id === id)), d = ls.filter(id => state.done.includes(id)).length;
    return '<li><button type="button" data-path="' + p.id + '" aria-pressed="' + (pathId === p.id) + '">' + icon(p.icon) + '<span>' + esc(p.title) + '</span><small>' + d + '/' + ls.length + '</small></button></li>';
  }).join('');
  $('#categories').innerHTML = [['all', '', 'ทุกหมวด'], ...cats].map(c => '<button type="button" data-cat="' + c[0] + '" aria-pressed="' + (category === c[0]) + '">' + esc(c[2]) + '</button>').join('');
  const p = paths.find(p => p.id === pathId), list = visible();
  $('#list-title').textContent = p ? p.title : view === 'saved' ? 'บทที่บันทึกไว้' : view === 'done' ? 'บทที่เรียนจบแล้ว' : 'ห้องสมุดบทเรียน';
  $('#status').innerHTML = '<span>' + list.length + ' บทเรียน' + (p ? ' · ' + esc(p.desc) + ' เรียงตามลำดับแนะนำ' : '') + '</span>'
    + (p || category !== 'all' || view !== 'all' || $('#search').value ? '<button type="button" data-clear>ดูทั้งหมด</button>' : '');
  $('#rows').innerHTML = list.length ? list.map(l => {
    const c = catOf(l.cat), saved = state.saved.includes(l.id), done = state.done.includes(l.id);
    return '<li class="row' + (done ? ' is-done' : '') + '"><span class="row__icon">' + icon(c[1]) + '</span><div><button type="button" class="row__open" data-open="' + l.id + '"><span class="row__title">' + esc(l.title) + '</span></button><p class="row__sum">' + esc(l.summary) + '</p><p class="row__meta">' + esc(c[2]) + ' · ' + l.minutes + ' นาที' + (done ? ' · <span class="row__done">เรียนจบแล้ว</span>' : '') + '</p></div>'
      + '<button type="button" class="row__save" data-save="' + l.id + '" aria-pressed="' + saved + '" aria-label="' + (saved ? 'เลิกบันทึก ' : 'บันทึก ') + esc(l.title) + '">' + icon('heart') + '</button></li>';
  }).join('') : '<li class="empty"><b>ยังไม่มีบทเรียนที่ตรงกัน</b><p>ลองเปลี่ยนคำค้นหรือเลือกหมวดอื่น</p><button type="button" class="btn btn--line" data-clear>ดูบทเรียนทั้งหมด</button></li>';
}
function goLibrary() { document.getElementById('library').scrollIntoView({behavior: reduce ? 'auto' : 'smooth'}); }
function resetFilters() { view = 'all'; category = 'all'; pathId = null; $('#search').value = ''; }

/* ---------------- lesson dialog ---------------- */
function nextLesson() {
  const list = visible(), i = list.findIndex(l => l.id === current.id);
  if (i > -1 && i < list.length - 1) return list[i + 1];
  const pool = lessons.filter(l => l.id !== current.id && !state.done.includes(l.id));
  return pool.find(l => l.cat === current.cat) || pool[0] || null;
}
function lessonHTML(l) {
  const nx = nextLesson();
  return '<h2 id="lesson-title">' + esc(l.title) + '</h2><p class="intro">' + esc(l.summary) + '</p>'
    + '<h3>ทีละขั้น ทำตามได้</h3><ol class="steps">' + l.steps.map(s => '<li>' + esc(s) + '</li>').join('') + '</ol>'
    + '<h3>เช็กลิสต์ของฉัน</h3>' + l.check.map((s, i) => '<label class="check"><input type="checkbox" data-check="' + i + '" ' + (state.checks[l.id + ':' + i] ? 'checked' : '') + '><span>' + esc(s) + '</span></label>').join('')
    + '<h3>ลองทบทวนสักข้อ</h3><p class="quiz-q">' + esc(l.question) + '</p>' + l.options.map((s, i) => '<button type="button" class="quiz-option" data-answer="' + i + '" aria-pressed="false">' + esc(s) + '</button>').join('') + '<p id="feedback" role="status"></p>'
    + (l.source ? '<div class="source">แหล่งอ่านเพิ่มเติม: <a href="' + esc(l.source) + '" target="_blank" rel="noopener noreferrer">เว็บไซต์หน่วยงานทางการ</a><br>เงื่อนไขอาจเปลี่ยนตามกรณีและช่วงเวลา ตรวจข้อมูลล่าสุดก่อนใช้' + (l.id === 'vote' ? '<br>แหล่งอ้างอิงเป็นตัวอย่างประกาศเดิม ไม่ใช่กำหนดการเลือกตั้งครั้งถัดไป' : '') + '</div>'
      : '<div class="source">บทเรียนแนวทางทั่วไป ปรับใช้ตามสถานการณ์จริง' + (['credit', 'contract'].includes(l.id) ? '<br>ตรวจเงื่อนไขปัจจุบันกับผู้ให้บริการหรือหน่วยงานที่รับผิดชอบก่อนตัดสินใจ' : '') + '</div>')
    + (l.cat === 'money' ? '<div class="source">เนื้อหาการเงินเป็นความรู้ทั่วไป ไม่ใช่คำแนะนำการลงทุนเฉพาะบุคคล การลงทุนมีความเสี่ยง</div>' : '')
    + '<div class="lesson-actions"><button type="button" id="complete" class="btn btn--solid">' + (state.done.includes(l.id) ? 'ยกเลิกสถานะเรียนจบ' : 'ฉันเรียนบทนี้จบแล้ว') + '</button><button type="button" id="save-lesson" class="btn btn--line">' + (state.saved.includes(l.id) ? 'บันทึกไว้แล้ว' : 'บันทึกไว้เรียน') + '</button></div>'
    + (nx ? '<button type="button" class="next" data-open="' + nx.id + '">' + icon(catOf(nx.cat)[1]) + '<span><small>บทถัดไป</small><b>' + esc(nx.title) + '</b></span>' + icon('arrow-right') + '</button>' : '');
}
function openLesson(id) {
  const l = lessons.find(x => x.id === id); if (!l) return;
  const d = $('#lesson');
  if (!d.open) returnFocus = document.activeElement;
  current = l; const c = catOf(l.cat);
  $('#lesson-cat').innerHTML = icon(c[1]) + '<span>' + esc(c[2]) + ' · ' + l.minutes + ' นาที</span>';
  $('#lesson-content').innerHTML = lessonHTML(l);
  d.setAttribute('aria-labelledby', 'lesson-title');
  if (!d.open) d.showModal();
  d.scrollTop = 0; readBar();
}
function readBar() { const d = $('#lesson'), m = d.scrollHeight - d.clientHeight; $('#read-bar').style.transform = 'scaleX(' + (m > 0 ? d.scrollTop / m : 1) + ')'; }
$('#lesson').addEventListener('scroll', readBar, {passive: true});
$('#close').addEventListener('click', () => $('#lesson').close());
$('#lesson').addEventListener('close', () => { if (returnFocus && returnFocus.isConnected) returnFocus.focus({preventScroll: true}); });
$('#lesson').addEventListener('click', e => { if (e.target === $('#lesson')) { const r = e.target.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) e.target.close(); } });
$('#lesson-content').addEventListener('change', e => { if (e.target.dataset.check !== undefined && current) { state.checks[current.id + ':' + e.target.dataset.check] = e.target.checked; persist(); } });

/* ---------------- events ---------------- */
document.addEventListener('click', e => {
  const b = e.target.closest('button, a[data-open]'); if (!b) return;
  const ds = b.dataset;
  if (ds.open) { e.preventDefault(); openLesson(ds.open); return; }
  if (b.hasAttribute('data-start')) { openLesson((lessons.find(l => !state.done.includes(l.id)) || lessons[0]).id); return; }
  if (ds.view) { resetFilters(); view = ds.view; render(); }
  if (ds.cat) { category = ds.cat; render(); }
  if (ds.catJump) { resetFilters(); category = ds.catJump; render(); goLibrary(); }
  if (ds.path) { const same = pathId === ds.path; resetFilters(); pathId = same ? null : ds.path; render(); }
  if (b.hasAttribute('data-clear')) { resetFilters(); render(); }
  if (ds.save) { toggle('saved', ds.save); toast(state.saved.includes(ds.save) ? 'บันทึกบทเรียนแล้ว' : 'นำออกจากรายการบันทึกแล้ว'); }
  if (ds.answer !== undefined && current) {
    const right = Number(ds.answer) === current.answer, opts = $$('[data-answer]');
    opts.forEach(x => { x.setAttribute('aria-pressed', String(x === b)); x.classList.remove('right', 'wrong'); });
    b.classList.add(right ? 'right' : 'wrong'); opts[current.answer].classList.add('right');
    $('#feedback').textContent = right ? 'ถูกต้อง เยี่ยมมาก' : 'ยังไม่ใช่ คำตอบที่ถูกคือ “' + current.options[current.answer] + '”';
  }
  if (b.id === 'complete') { const was = state.done.includes(current.id); toggle('done', current.id); b.textContent = was ? 'ฉันเรียนบทนี้จบแล้ว' : 'ยกเลิกสถานะเรียนจบ'; toast(was ? 'ยกเลิกสถานะเรียนจบแล้ว' : 'เก่งขึ้นอีกหนึ่งเรื่องแล้ว'); }
  if (b.id === 'save-lesson') { toggle('saved', current.id); b.textContent = state.saved.includes(current.id) ? 'บันทึกไว้แล้ว' : 'บันทึกไว้เรียน'; }
  if (b.id === 'progress-pill') { resetFilters(); view = 'done'; render(); goLibrary(); }
  if (b.id === 'reset' && confirm('ล้างบทเรียนที่บันทึก เช็กลิสต์ และความคืบหน้าทั้งหมดในเบราว์เซอร์นี้?')) { state = {saved: [], done: [], checks: {}}; persist(); render(); toast('ล้างข้อมูลแล้ว'); }
});
$('#search').addEventListener('input', render);

/* ---------------- the red pen (signature move) ---------------- */
const peak = $('#peak'), peakStage = $('#peak-stage');
let peakItems = [], lastSig = '';
const clamp01 = x => x < 0 ? 0 : x > 1 ? 1 : x;
function drawPen(p) {
  // Five strokes across p 0.06..0.82, each: strike 0..0.55, correction 0.45..0.8, link 0.75..1.
  const n = peakItems.length, a = 0.06, b = 0.82, seg = (b - a) / n;
  let sig = '';
  peakItems.forEach((it, i) => {
    const t = reduce ? 1 : clamp01((p - a - i * seg) / seg);
    const s = clamp01(t / 0.55), f = clamp01((t - 0.45) / 0.35), g = clamp01((t - 0.75) / 0.25);
    it.style.setProperty('--t', s.toFixed(3)); it.style.setProperty('--f', f.toFixed(3)); it.style.setProperty('--g', g.toFixed(3));
    it.querySelector('.nk').classList.toggle('is-struck', s > 0.98);
    const link = it.querySelector('.peak__go'); if (link) link.tabIndex = g > 0.9 ? 0 : -1;
    sig += Math.round(s * 10) + '' + Math.round(f * 10) + Math.round(g * 10) + '.';
  });
  const c = reduce ? 1 : clamp01((p - 0.84) / 0.1);
  $('#peak-coda').style.setProperty('--c', c.toFixed(3));
  sig += Math.round(c * 10);
  if (sig !== lastSig) { peakStage.setAttribute('data-sc-verify-state', sig); lastSig = sig; }
}

/* ---------------- folio ---------------- */
const chapters = $$('[data-chapter]'), folio = $('#folio'), folioChapter = $('#folio-chapter');
let lastChapter = '';
function updateFolio() {
  const y = 32; let cur = chapters[0];
  for (const s of chapters) { if (s.getBoundingClientRect().top <= y) cur = s; }
  if (cur.dataset.chapter !== lastChapter) { lastChapter = cur.dataset.chapter; folioChapter.textContent = lastChapter; }
  folio.classList.toggle('on-dark', cur.dataset.ground === 'dark');
}

let ticking = false;
function frame() {
  ticking = false;
  const r = peak.getBoundingClientRect(), travel = Math.max(1, peak.offsetHeight - innerHeight);
  drawPen(clamp01(-r.top / travel));
  updateFolio();
}
function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }

buildStatic();
render();
peakItems = $$('#peak-list li');
window.ScrollCraft.mount(document.body);
frame();
addEventListener('scroll', onScroll, {passive: true});
addEventListener('resize', onScroll);
