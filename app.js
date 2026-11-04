'use strict';
const {cats,lessons}=window.WICHA_DATA;
const $=s=>document.querySelector(s);
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const KEY='wicha-chiwit-v1';
let state={saved:[],done:[],checks:{}},view='all',category='all',current=null,returnFocus=null,timer;
try{const s=JSON.parse(localStorage.getItem(KEY));if(s){state.saved=Array.isArray(s.saved)?s.saved.filter(id=>lessons.some(l=>l.id===id)):[];state.done=Array.isArray(s.done)?s.done.filter(id=>lessons.some(l=>l.id===id)):[];state.checks=s.checks&&typeof s.checks==='object'&&!Array.isArray(s.checks)?s.checks:{};}}catch{}
function toast(message){$('#toast').textContent=message;$('#toast').style.display='block';clearTimeout(timer);timer=setTimeout(()=>$('#toast').style.display='none',3500);}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch{toast('เบราว์เซอร์นี้บันทึกไม่ได้ ความคืบหน้าจะอยู่เฉพาะครั้งนี้');}}
function toggle(key,id){state[key]=state[key].includes(id)?state[key].filter(x=>x!==id):[...state[key],id];persist();render();}
function render(){
$('#progress-label').textContent=state.done.length+' / '+lessons.length+' บท';$('#progress').value=state.done.length;
$('#list-title').textContent=view==='saved'?'บทเรียนที่บันทึกไว้':view==='done'?'บทเรียนที่เรียนจบแล้ว':'วันนี้อยากเรียนรู้เรื่องอะไร?';
document.querySelectorAll('[data-view]').forEach(b=>{b.classList.toggle('active',b.dataset.view===view);b.setAttribute('aria-pressed',String(b.dataset.view===view));});
$('#categories').innerHTML=[['all','✦','ทั้งหมด'],...cats].map(c=>'<button data-cat="'+c[0]+'" class="'+(category===c[0]?'active':'')+'" aria-pressed="'+(category===c[0])+'">'+c[1]+' '+c[2]+'</button>').join('');
const q=$('#search').value.trim().toLocaleLowerCase('th');
const filtered=lessons.filter(l=>(category==='all'||l.cat===category)&&(view==='all'||state[view].includes(l.id))&&[l.title,l.summary,cats.find(c=>c[0]===l.cat)[2],...l.steps].join(' ').toLocaleLowerCase('th').includes(q));
$('#count').textContent=filtered.length+' บทเรียน';
$('#cards').innerHTML=filtered.length?filtered.map(l=>{const c=cats.find(c=>c[0]===l.cat);const saved=state.saved.includes(l.id);return '<section class="card"><div class="card-top"><span class="icon" aria-hidden="true">'+c[1]+'</span><button class="bookmark" data-save="'+l.id+'" aria-label="'+(saved?'เลิกบันทึก ':'บันทึก ')+escape(l.title)+'" aria-pressed="'+saved+'">'+(saved?'♥':'♡')+'</button></div><small>'+c[2]+' · '+l.minutes+' นาที</small><h3>'+escape(l.title)+'</h3><p>'+escape(l.summary)+'</p><button class="card-open" data-open="'+l.id+'"><span>'+(state.done.includes(l.id)?'✓ เรียนจบแล้ว · อ่านอีกครั้ง':'เปิดบทเรียน')+'</span><span aria-hidden="true">↗</span></button></section>';}).join(''):'<div class="empty"><h3>'+(category!=='all'&&!lessons.some(l=>l.cat===category)?'หมวดนี้กำลังเตรียมบทเรียน':'ยังไม่มีบทเรียนที่ตรงกัน')+'</h3><p>ลองเลือกหมวดอื่น เปลี่ยนคำค้น หรือบันทึกบทเรียนที่สนใจไว้</p><button id="show-all" class="secondary">ดูบทเรียนทั้งหมด</button></div>';
}
function openLesson(id){
current=lessons.find(l=>l.id===id);if(!current)return;returnFocus=document.activeElement;
const l=current,c=cats.find(c=>c[0]===l.cat);
$('#lesson-cat').textContent=c[1]+' '+c[2]+' · '+l.minutes+' นาที';
$('#lesson-content').innerHTML='<h2 id="lesson-title">'+escape(l.title)+'</h2><p class="intro">'+escape(l.summary)+'</p><h3>ทีละขั้น ทำตามได้</h3><ol>'+l.steps.map(s=>'<li>'+escape(s)+'</li>').join('')+'</ol><h3>เช็กลิสต์ของฉัน</h3>'+l.check.map((s,i)=>'<label class="check"><input type="checkbox" data-check="'+i+'" '+(state.checks[l.id+':'+i]?'checked':'')+'><span>'+escape(s)+'</span></label>').join('')+'<h3>ลองทบทวนสักข้อ</h3><p>'+escape(l.question)+'</p>'+l.options.map((s,i)=>'<button class="quiz-option" data-answer="'+i+'" aria-pressed="false">'+escape(s)+'</button>').join('')+'<p id="feedback" role="status"></p>'+(l.source?'<div class="source">แหล่งอ่านเพิ่มเติม: <a href="'+escape(l.source)+'" target="_blank" rel="noopener noreferrer">หน่วยงานทางการ ↗</a><br>ตรวจแหล่งข้อมูล 4 พ.ย. 2569 · เงื่อนไขอาจเปลี่ยนตามกรณี'+(l.id==='vote'?'<br>แหล่งอ้างอิงเป็นตัวอย่างประกาศเดิม ไม่ใช่กำหนดการเลือกตั้งครั้งถัดไป':'')+'</div>':'<div class="source">บทเรียนแนวทางทั่วไป · ปรับใช้ตามสถานการณ์จริง'+(['credit','contract'].includes(l.id)?'<br>ตรวจเงื่อนไขปัจจุบันกับผู้ให้บริการหรือหน่วยงานที่รับผิดชอบก่อนตัดสินใจ':'')+'</div>')+'<div class="lesson-actions"><button id="complete" class="primary">'+(state.done.includes(l.id)?'ยกเลิกสถานะเรียนจบ':'✓ ฉันเรียนบทนี้จบแล้ว')+'</button><button id="save-lesson" class="secondary">'+(state.saved.includes(l.id)?'♥ บันทึกไว้แล้ว':'♡ บันทึกไว้เรียน')+'</button></div>';
$('#lesson').setAttribute('aria-labelledby','lesson-title');if(!$('#lesson').open)$('#lesson').showModal();$('#lesson').scrollTop=0;
}
$('#close').onclick=()=>$('#lesson').close();
$('#lesson').addEventListener('close',()=>{if(returnFocus&&returnFocus.isConnected)returnFocus.focus();else $('#search').focus();});
$('#lesson').addEventListener('click',e=>{if(e.target===$('#lesson')){const r=$('#lesson').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('#lesson').close();}});
document.addEventListener('click',e=>{
const b=e.target.closest('button');if(!b)return;
if(b.dataset.view){view=b.dataset.view;category='all';$('#search').value='';render();}
if(b.dataset.cat){category=b.dataset.cat;render();}
if(b.dataset.open)openLesson(b.dataset.open);
if(b.dataset.save){toggle('saved',b.dataset.save);toast(state.saved.includes(b.dataset.save)?'บันทึกบทเรียนแล้ว':'นำออกจากรายการบันทึกแล้ว');}
if(b.id==='show-all'){view='all';category='all';$('#search').value='';render();}
if(b.dataset.answer!==undefined&&current){document.querySelectorAll('[data-answer]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$('#feedback').textContent=Number(b.dataset.answer)===current.answer?'✓ ถูกต้อง — '+current.options[current.answer]:'ลองอีกครั้ง: '+current.options[current.answer];}
if(b.id==='complete'){toggle('done',current.id);b.textContent=state.done.includes(current.id)?'ยกเลิกสถานะเรียนจบ':'✓ ฉันเรียนบทนี้จบแล้ว';toast(state.done.includes(current.id)?'เก่งขึ้นอีกหนึ่งเรื่องแล้ว 🌱':'ยกเลิกสถานะเรียนจบแล้ว');}
if(b.id==='save-lesson'){toggle('saved',current.id);b.textContent=state.saved.includes(current.id)?'♥ บันทึกไว้แล้ว':'♡ บันทึกไว้เรียน';}
});
$('#lesson-content').addEventListener('change',e=>{if(e.target.dataset.check!==undefined&&current){state.checks[current.id+':'+e.target.dataset.check]=e.target.checked;persist();}});
$('#search').addEventListener('input',render);
$('#start').onclick=()=>openLesson((lessons.find(l=>!state.done.includes(l.id))||lessons[0]).id);
$('#reset').onclick=()=>{if(confirm('ล้างบทเรียนที่บันทึก เช็กลิสต์ และความคืบหน้าทั้งหมดในเบราว์เซอร์นี้?')){state={saved:[],done:[],checks:{}};persist();render();toast('ล้างข้อมูลแล้ว');}};
render();