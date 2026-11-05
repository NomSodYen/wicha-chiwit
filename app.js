'use strict';
const {cats,lessons,paths=[],hotlines=[]}=window.WICHA_DATA;
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const KEY='wicha-chiwit-v1';
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const CAT_COLOR={social:'#f3dc97',travel:'#cfe3e8',docs:'#e6dcf2',money:'#c8d98f',work:'#f2d2b6',rights:'#d9e2f5',home:'#efc9b8',health:'#d3ecd9',emergency:'#f6c3b4',digital:'#d4dbe8',relations:'#f5d6e2',consumer:'#e8e3c8'};
const catOf=id=>cats.find(c=>c[0]===id);

let state={saved:[],done:[],checks:{}},view='all',category='all',pathId=null,current=null,returnFocus=null,timer;
try{const s=JSON.parse(localStorage.getItem(KEY));if(s){const ok=id=>lessons.some(l=>l.id===id);state.saved=Array.isArray(s.saved)?s.saved.filter(ok):[];state.done=Array.isArray(s.done)?s.done.filter(ok):[];state.checks=s.checks&&typeof s.checks==='object'&&!Array.isArray(s.checks)?s.checks:{};}}catch{}

function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(timer);timer=setTimeout(()=>t.classList.remove('show'),3200);}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch{toast('เบราว์เซอร์นี้บันทึกไม่ได้ ความคืบหน้าจะอยู่เฉพาะครั้งนี้');}}
function toggle(key,id){state[key]=state[key].includes(id)?state[key].filter(x=>x!==id):[...state[key],id];persist();render();}

/* ---------- static sections ---------- */
function buildStatic(){
  $('#hero-count').textContent=lessons.length;
  const titles=lessons.map(l=>'<span>'+escape(l.title)+'</span>').join('');
  $('#marquee').innerHTML=titles+titles;
  $('#cats-track').innerHTML=cats.map((c,i)=>{const n=lessons.filter(l=>l.cat===c[0]).length;return '<button class="cat-tile" data-cat-jump="'+c[0]+'" style="--c:'+(CAT_COLOR[c[0]]||'#dfe7d2')+'"><span class="no">'+String(i+1).padStart(2,'0')+'</span><span class="emo" aria-hidden="true">'+c[1]+'</span><h3>'+escape(c[2])+'</h3><p>'+n+' บทเรียน</p><span class="go">ดูบทเรียนในหมวดนี้ <span aria-hidden="true">→</span></span></button>';}).join('');
  $('#hot-grid').innerHTML=hotlines.map((h,i)=>'<a class="hot reveal'+(i<3?' urgent':'')+'" style="--d:'+(i%4)+'" href="tel:'+h[0]+'"><b>'+h[0]+'</b><span>'+escape(h[1])+'</span></a>').join('');
}
function renderPaths(){
  $('#path-list').innerHTML=paths.map((p,i)=>{const ls=p.lessons.filter(id=>lessons.some(l=>l.id===id));const d=ls.filter(id=>state.done.includes(id)).length;return '<div class="path reveal" style="--d:'+(i%3)+'"><span class="emo" aria-hidden="true">'+p.emoji+'</span><h3>'+escape(p.title)+'</h3><p>'+escape(p.desc)+'</p><div class="path-dots" aria-hidden="true">'+ls.map(id=>'<span class="'+(state.done.includes(id)?'done':'')+'"></span>').join('')+'</div><small>เรียนแล้ว '+d+' จาก '+ls.length+' บท</small><button class="btn '+(d?'primary':'ghost')+'" data-path="'+p.id+'">'+(d===ls.length?'ทบทวนเส้นทางนี้':d?'เรียนต่อ':'เริ่มเส้นทางนี้')+' <span aria-hidden="true">→</span></button></div>';}).join('');
  observe($$('#path-list .reveal'));
}

/* ---------- library ---------- */
function visible(){
  const q=$('#search').value.trim().toLocaleLowerCase('th');
  const p=paths.find(p=>p.id===pathId);
  let list=p?p.lessons.map(id=>lessons.find(l=>l.id===id)).filter(Boolean):lessons;
  return list.filter(l=>(category==='all'||l.cat===category)&&(view==='all'||state[view].includes(l.id))&&(!q||[l.title,l.summary,catOf(l.cat)[2],...l.steps].join(' ').toLocaleLowerCase('th').includes(q)));
}
function render(){
  const n=state.done.length,t=lessons.length;
  $('#progress-label').textContent=n+'/'+t;
  $('#ring').style.strokeDashoffset=String(97.4*(1-n/t));
  const p=paths.find(p=>p.id===pathId);
  $('#list-title').textContent=p?p.emoji+' '+p.title:view==='saved'?'บทเรียนที่บันทึกไว้':view==='done'?'บทเรียนที่เรียนจบแล้ว':'วันนี้อยากเรียนเรื่องอะไร?';
  $$('[data-view]').forEach(b=>{b.classList.toggle('active',b.dataset.view===view);b.setAttribute('aria-pressed',String(b.dataset.view===view));});
  $('#categories').innerHTML=[['all','✦','ทุกหมวด'],...cats].map(c=>'<button data-cat="'+c[0]+'" class="'+(category===c[0]?'active':'')+'" aria-pressed="'+(category===c[0])+'">'+c[1]+' '+escape(c[2])+'</button>').join('');
  const pf=$('#path-filter');pf.hidden=!p;if(p)pf.innerHTML='<span>กำลังดูเส้นทาง <b>'+escape(p.title)+'</b> เรียงตามลำดับแนะนำ</span><button data-clear-path>ดูทั้งหมด</button>';
  const list=visible();
  $('#count').textContent=list.length+' บทเรียน';
  $('#cards').innerHTML=list.length?list.map((l,i)=>{const c=catOf(l.cat),saved=state.saved.includes(l.id),done=state.done.includes(l.id);
    return '<section class="card'+(done?' is-done':'')+'" style="--c:'+(CAT_COLOR[l.cat]||'')+';transition-delay:'+(Math.min(i%3,2)*70)+'ms">'+(done?'<span class="done-badge">✓ เรียนจบแล้ว</span>':'')+'<div class="card-top"><span class="icon" aria-hidden="true">'+c[1]+'</span><button class="bookmark" data-save="'+l.id+'" aria-label="'+(saved?'เลิกบันทึก ':'บันทึก ')+escape(l.title)+'" aria-pressed="'+saved+'">'+(saved?'♥':'♡')+'</button></div><small>'+(p?'บทที่ '+(p.lessons.indexOf(l.id)+1)+' · ':'')+escape(c[2])+' · '+l.minutes+' นาที</small><h3>'+escape(l.title)+'</h3><p>'+escape(l.summary)+'</p><button class="card-open" data-open="'+l.id+'"><span>'+(done?'อ่านอีกครั้ง':'เปิดบทเรียน')+'</span><span aria-hidden="true">→</span></button></section>';}).join('')
    :'<div class="empty"><h3>ยังไม่มีบทเรียนที่ตรงกัน</h3><p>ลองเลือกหมวดอื่น เปลี่ยนคำค้น หรือบันทึกบทเรียนที่สนใจไว้</p><button id="show-all" class="btn ghost">ดูบทเรียนทั้งหมด</button></div>';
  observe($$('#cards .card'));
  renderPaths();
}
function goLibrary(){document.getElementById('library').scrollIntoView({behavior:reduce?'auto':'smooth'});}

/* ---------- lesson dialog ---------- */
function nextLesson(){
  const list=visible();let i=list.findIndex(l=>l.id===current.id);
  if(i>-1&&i<list.length-1)return list[i+1];
  const pool=lessons.filter(l=>l.id!==current.id&&!state.done.includes(l.id));
  return pool.find(l=>l.cat===current.cat)||pool[0]||null;
}
function lessonHTML(l){
  const c=catOf(l.cat),nx=nextLesson();
  return '<h2 id="lesson-title">'+escape(l.title)+'</h2><p class="intro">'+escape(l.summary)+'</p>'
  +'<h3>ทีละขั้น ทำตามได้</h3><ol class="steps">'+l.steps.map(s=>'<li>'+escape(s)+'</li>').join('')+'</ol>'
  +'<h3>เช็กลิสต์ของฉัน</h3>'+l.check.map((s,i)=>'<label class="check"><input type="checkbox" data-check="'+i+'" '+(state.checks[l.id+':'+i]?'checked':'')+'><span>'+escape(s)+'</span></label>').join('')
  +'<h3>ลองทบทวนสักข้อ</h3><p class="quiz-q">'+escape(l.question)+'</p>'+l.options.map((s,i)=>'<button class="quiz-option" data-answer="'+i+'" aria-pressed="false">'+escape(s)+'</button>').join('')+'<p id="feedback" role="status"></p>'
  +(l.source?'<div class="source">แหล่งอ่านเพิ่มเติม: <a href="'+escape(l.source)+'" target="_blank" rel="noopener noreferrer">เว็บไซต์หน่วยงานทางการ ↗</a><br>เงื่อนไขอาจเปลี่ยนตามกรณีและช่วงเวลา ตรวจข้อมูลล่าสุดก่อนใช้'+(l.id==='vote'?'<br>แหล่งอ้างอิงเป็นตัวอย่างประกาศเดิม ไม่ใช่กำหนดการเลือกตั้งครั้งถัดไป':'')+'</div>'
    :'<div class="source">บทเรียนแนวทางทั่วไป · ปรับใช้ตามสถานการณ์จริง'+(['credit','contract'].includes(l.id)?'<br>ตรวจเงื่อนไขปัจจุบันกับผู้ให้บริการหรือหน่วยงานที่รับผิดชอบก่อนตัดสินใจ':'')+'</div>')
  +(c[0]==='money'?'<div class="source">เนื้อหาการเงินเป็นความรู้ทั่วไป ไม่ใช่คำแนะนำการลงทุนเฉพาะบุคคล การลงทุนมีความเสี่ยง</div>':'')
  +'<div class="lesson-actions"><button id="complete" class="btn primary">'+(state.done.includes(l.id)?'ยกเลิกสถานะเรียนจบ':'✓ ฉันเรียนบทนี้จบแล้ว')+'</button><button id="save-lesson" class="btn soft">'+(state.saved.includes(l.id)?'♥ บันทึกไว้แล้ว':'♡ บันทึกไว้เรียน')+'</button></div>'
  +(nx?'<button class="next" data-open="'+nx.id+'"><span aria-hidden="true" style="font-size:28px">'+catOf(nx.cat)[1]+'</span><span><small>บทถัดไป</small><b>'+escape(nx.title)+'</b></span><i aria-hidden="true">→</i></button>':'');
}
function openLesson(id){
  const l=lessons.find(l=>l.id===id);if(!l)return;
  if(!$('#lesson').open)returnFocus=document.activeElement;
  current=l;const c=catOf(l.cat);
  $('#lesson-cat').textContent=c[1]+' '+c[2]+' · '+l.minutes+' นาที';
  $('#lesson-content').innerHTML=lessonHTML(l);
  $('#lesson').setAttribute('aria-labelledby','lesson-title');
  if(!$('#lesson').open)$('#lesson').showModal();
  $('#lesson').scrollTop=0;updateReadBar();
}
function updateReadBar(){const d=$('#lesson');const max=d.scrollHeight-d.clientHeight;$('#read-bar').style.transform='scaleX('+(max>0?d.scrollTop/max:1)+')';}
$('#lesson').addEventListener('scroll',updateReadBar,{passive:true});
$('#close').onclick=()=>$('#lesson').close();
$('#lesson').addEventListener('close',()=>{if(returnFocus&&returnFocus.isConnected)returnFocus.focus({preventScroll:true});});
$('#lesson').addEventListener('click',e=>{if(e.target===$('#lesson')){const r=$('#lesson').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('#lesson').close();}});
$('#lesson-content').addEventListener('change',e=>{if(e.target.dataset.check!==undefined&&current){state.checks[current.id+':'+e.target.dataset.check]=e.target.checked;persist();}});

/* ---------- events ---------- */
document.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.view){view=b.dataset.view;category='all';pathId=null;$('#search').value='';render();}
  if(b.dataset.cat){category=b.dataset.cat;render();}
  if(b.dataset.catJump){category=b.dataset.catJump;view='all';pathId=null;$('#search').value='';render();goLibrary();}
  if(b.dataset.path){pathId=b.dataset.path;category='all';view='all';$('#search').value='';render();goLibrary();}
  if(b.hasAttribute('data-clear-path')||b.id==='show-all'){pathId=null;view='all';category='all';$('#search').value='';render();}
  if(b.dataset.open)openLesson(b.dataset.open);
  if(b.dataset.save){toggle('saved',b.dataset.save);toast(state.saved.includes(b.dataset.save)?'บันทึกบทเรียนแล้ว':'นำออกจากรายการบันทึกแล้ว');}
  if(b.dataset.answer!==undefined&&current){const right=Number(b.dataset.answer)===current.answer;$$('[data-answer]').forEach(x=>{x.setAttribute('aria-pressed',String(x===b));x.classList.remove('right','wrong');});b.classList.add(right?'right':'wrong');if(!right)$$('[data-answer]')[current.answer].classList.add('right');$('#feedback').textContent=right?'✓ ถูกต้อง เยี่ยมมาก':'ยังไม่ใช่ คำตอบที่ถูกคือ “'+current.options[current.answer]+'”';}
  if(b.id==='complete'){const was=state.done.includes(current.id);toggle('done',current.id);b.textContent=was?'✓ ฉันเรียนบทนี้จบแล้ว':'ยกเลิกสถานะเรียนจบ';toast(was?'ยกเลิกสถานะเรียนจบแล้ว':'เก่งขึ้นอีกหนึ่งเรื่องแล้ว 🌱');}
  if(b.id==='save-lesson'){toggle('saved',current.id);b.textContent=state.saved.includes(current.id)?'♥ บันทึกไว้แล้ว':'♡ บันทึกไว้เรียน';}
});
$('#search').addEventListener('input',render);
$('#start').onclick=()=>openLesson((lessons.find(l=>!state.done.includes(l.id))||lessons[0]).id);
$('#progress-pill').onclick=()=>{view='done';category='all';pathId=null;$('#search').value='';render();goLibrary();};
$('#reset').onclick=()=>{if(confirm('ล้างบทเรียนที่บันทึก เช็กลิสต์ และความคืบหน้าทั้งหมดในเบราว์เซอร์นี้?')){state={saved:[],done:[],checks:{}};persist();render();toast('ล้างข้อมูลแล้ว');}};

/* ---------- scroll craft ---------- */
let io;
function observe(els){
  if(reduce||!('IntersectionObserver' in window)){els.forEach(el=>el.classList.add('in'));return;}
  els.forEach(el=>io.observe(el));
}
if(!reduce&&'IntersectionObserver' in window){
  io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);if(e.target.querySelector('[data-count]'))countUp(e.target.querySelector('[data-count]'));}}),{rootMargin:'0px 0px -8% 0px',threshold:.08});
}
const COUNTS={lessons:lessons.length,cats:cats.length,paths:paths.length,hotlines:hotlines.length};
function countUp(el){const to=COUNTS[el.dataset.count];if(reduce){el.textContent=to;return;}const t0=performance.now();const step=t=>{const k=Math.min(1,(t-t0)/1200);el.textContent=Math.round(to*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(step);};requestAnimationFrame(step);}
if(reduce)$$('[data-count]').forEach(countUp);

// "how" sticky story: activate step closest to viewport centre
const steps=$$('.how-step'),parts=$$('.mock-part');
function setStep(i){steps.forEach((s,k)=>s.classList.toggle('on',k===i));parts.forEach((p,k)=>p.classList.toggle('on',k===i));}
setStep(0);

// section links highlight
const links=$$('.toplinks a'),secs=links.map(a=>document.querySelector(a.getAttribute('href')));

// pinned horizontal category scroll
const catsSec=$('#cats'),track=$('#cats-track');
const wide=matchMedia('(min-width:721px)');
function sizeCats(){
  if(!wide.matches||reduce){catsSec.style.height='';track.style.transform='';return;}
  const extra=Math.max(0,track.scrollWidth-innerWidth);
  catsSec.style.height=(innerHeight+extra)+'px';
}
let ticking=false;
function onScroll(){
  if(ticking)return;ticking=true;
  requestAnimationFrame(()=>{
    ticking=false;const y=scrollY,vh=innerHeight;
    const doc=document.documentElement;
    doc.style.setProperty('--page',String(y/Math.max(1,doc.scrollHeight-vh)));
    $('.topbar').classList.toggle('scrolled',y>10);
    if(!reduce&&y<vh*1.2)doc.style.setProperty('--sy',String(y));
    // how steps
    let best=0,bd=Infinity;steps.forEach((s,i)=>{const r=s.getBoundingClientRect();const d=Math.abs(r.top+r.height/2-vh/2);if(d<bd){bd=d;best=i;}});setStep(best);
    // cats pin
    if(wide.matches&&!reduce){const r=catsSec.getBoundingClientRect();const extra=catsSec.offsetHeight-vh;const p=Math.min(1,Math.max(0,-r.top/Math.max(1,extra)));track.style.transform='translate3d('+(-p*Math.max(0,track.scrollWidth-innerWidth))+'px,0,0)';}
    // nav highlight
    let on=-1;secs.forEach((s,i)=>{if(s&&s.getBoundingClientRect().top<vh*.4)on=i;});links.forEach((a,i)=>a.classList.toggle('on',i===on));
  });
}

buildStatic();
render();
observe($$('.reveal'));
sizeCats();onScroll();
addEventListener('scroll',onScroll,{passive:true});
addEventListener('resize',()=>{sizeCats();onScroll();});
if(document.fonts)document.fonts.ready.then(()=>{sizeCats();onScroll();});
