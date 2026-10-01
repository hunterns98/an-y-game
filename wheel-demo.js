(()=>{
const $=id=>document.getElementById(id),pairs=[['Nhung','Thoan'],['Hạnh','Liên'],['An','Hằng'],['Trúc','Lệ'],['Phượng','Mai Anh'],['Trang','Hoa'],['Ánh','Giang'],['Linh','Thủy']],order=pairs.flat(),colors=['#883dba','#ca427a','#3c5b9c','#92532c','#475a85','#a64795'];
let revealed=new Set(),lastName=null,activeTeam=-1,firstSlots=[],pool=[],angle=0,index=0,running=false,token=0,raf=0,fx=0,muted=false,ac;
const ctx=$('wheel').getContext('2d'),tau=Math.PI*2;
function tone(freq,duration=.08,volume=.04,delay=0){if(muted||!ac)return;const o=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime+delay;o.frequency.value=freq;o.type='sine';g.gain.setValueAtTime(volume,t);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g).connect(ac.destination);o.start(t);o.stop(t+duration);}
function chime(done){[523,659,784,...(done?[1046]:[])].forEach((f,i)=>tone(f,.35,.07,i*.09));}
function paint(){ctx.clearRect(0,0,1000,1000);const n=pool.length;if(!n){ctx.fillStyle='#51245d';ctx.beginPath();ctx.arc(500,500,490,0,tau);ctx.fill();return;}const step=tau/n;pool.forEach((name,i)=>{const a=angle+i*step;ctx.beginPath();ctx.moveTo(500,500);ctx.arc(500,500,490,a,a+step);ctx.closePath();ctx.fillStyle=colors[i%colors.length];ctx.fill();ctx.strokeStyle='#ffffff28';ctx.lineWidth=2;ctx.stroke();ctx.save();ctx.translate(500,500);ctx.rotate(a+step/2);ctx.textAlign='right';ctx.fillStyle='#fff8ff';ctx.font='bold '+(n>12?26:32)+'px system-ui';ctx.fillText(name,445,10);ctx.restore();});}
function renderTeams(){ $('teams').replaceChildren();pairs.forEach((pair,i)=>{const card=document.createElement('div');card.className='team'+(i===activeTeam&&running?' active':'')+(pair.every(n=>revealed.has(n))?' done':'');card.innerHTML='<div class="team-label">ĐỘI '+(i+1)+'</div><div class="pair"></div>';pair.forEach((name,j)=>{const person=document.createElement('div');person.className='person';if(revealed.has(name)){if(name===lastName)person.classList.add('filled');const img=document.createElement('img');img.src=PlayerAvatars.srcFor(name);img.style.objectPosition=PlayerAvatars.positionFor(name);person.append(img,document.createTextNode(name));}else{person.classList.add('empty');person.textContent='Đang chờ…';}card.lastElementChild.append(person);});$('teams').append(card);});$('count').textContent=pairs.filter(p=>p.every(n=>revealed.has(n))).length+' / 8 đội';$('remaining').textContent=pool.length;$('progress').style.width=index/16*100+'%';}
function flyToTeam(name){
 const target=document.querySelector('.person.filled');if(!target)return;
 const origin=$('wheel').getBoundingClientRect(),end=target.getBoundingClientRect();
 const badge=document.createElement('div');badge.className='flying-name';badge.textContent=name;document.body.append(badge);
 const animation=badge.animate([{left:(origin.left+origin.width/2)+'px',top:(origin.top+origin.height/2)+'px',opacity:1,transform:'translate(-50%,-50%) scale(1.2)'},{left:(end.left+end.width/2)+'px',top:(end.top+end.height/2)+'px',opacity:0,transform:'translate(-50%,-50%) scale(.7)'}],{duration:550,easing:'ease-in-out'});
 animation.onfinish=()=>badge.remove();
}
function burst(big){cancelAnimationFrame(fx);const c=$('confetti'),x=c.getContext('2d');c.width=innerWidth;c.height=innerHeight;const particles=Array.from({length:big?100:36},()=>({x:c.width*.4,y:c.height*.42,vx:(Math.random()-.5)*16,vy:-Math.random()*12-2,color:['#ffd778','#ff6aa8','#86f2d4'][Math.floor(Math.random()*3)],rot:Math.random()*6}));const start=performance.now();function tick(now){x.clearRect(0,0,c.width,c.height);particles.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.22;x.save();x.translate(p.x,p.y);x.rotate(p.rot+=.08);x.fillStyle=p.color;x.globalAlpha=Math.max(0,1-(now-start)/1600);x.fillRect(-3,-3,6,9);x.restore();});if(now-start<1600)fx=requestAnimationFrame(tick);else x.clearRect(0,0,c.width,c.height);}fx=requestAnimationFrame(tick);}
function wait(ms,id){return new Promise(resolve=>setTimeout(()=>resolve(id===token),ms));}
function spin(name,id){return new Promise(resolve=>{const step=tau/pool.length,position=pool.indexOf(name),target=-Math.PI/2-(position+.5)*step;const delta=((target-angle)%tau+tau)%tau+tau*4,from=angle,start=performance.now(),duration=$('fast').checked?650:2700;let lastSector=-1;function tick(now){if(id!==token){resolve(false);return;}const t=Math.min(1,(now-start)/duration);angle=from+delta*(1-Math.pow(1-t,4));paint();const sector=Math.floor(angle/step);if(sector!==lastSector){tone(260+Math.min(t,1)*250,.035,.03);lastSector=sector;}if(t<1)raf=requestAnimationFrame(tick);else resolve(true);}raf=requestAnimationFrame(tick);});}
function finish(){running=false;$('hub-unit').textContent='đội';$('hub-label').textContent='ĐỦ ĐỘI';$('remaining').textContent='8';$('announcement').textContent='Chuẩn bị chan nhau nào!';$('subtitle').textContent='';$('player-preview').textContent='Chào Nhung! Đồng đội của bạn là Thoan. Bây giờ mới hiện đồng đội và quyền đặt tên.';$('start').disabled=true;$('skip').disabled=true;$('fast').disabled=false;renderTeams();$('remaining').textContent='8';}
function shuffledTeams(){const ids=pairs.map((_,i)=>i);for(let i=ids.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]];}return ids;}
async function start(){
 if(running||index===16)return;running=true;const id=++token;
 ac=ac||new (window.AudioContext||window.webkitAudioContext)();ac.resume().catch(()=>{});
 $('start').disabled=true;$('fast').disabled=true;
 for(let round=0;round<2;round++){
  const teams=shuffledTeams(),batch=teams.map(i=>({team:i,name:pairs[i][round===0?firstSlots[i]:1-firstSlots[i]]}));
  lastName=null;activeTeam=-1;$('hub-label').textContent='LƯỢT '+(round+1)+' / 2';
  $('subtitle').textContent=round===0?'Lượt 1 · Chọn 8 người cho 8 đội':'Lượt 2 · Tìm đồng đội cho 8 người vừa chọn';
  $('announcement').textContent=round===0?'*Insert nhạc xổ số* ~Tăng tăng tắng tắng tăng~':'8 mảnh ghép còn lại sẽ về đội nào?';
  renderTeams();if(!await spin(batch[0].name,id))return;
  for(const pick of batch){
   if(id!==token)return;
   index++;revealed.add(pick.name);lastName=pick.name;activeTeam=pick.team;
   pool=pool.filter(n=>n!==pick.name);paint();renderTeams();
   $('announcement').textContent=pick.name+' → Đội '+(pick.team+1)+(round===1?' · Đủ cặp!':'');
   tone(round===0?660:880,.2,.06);if(round===1)burst(false);flyToTeam(pick.name);
   if(!await wait($('fast').checked?180:850,id))return;
  }
  chime(true);burst(true);
  if(round===0){$('announcement').textContent='Đã có 8 thí sinh đầu tiên. Nửa còn lại gọi tên';if(!await wait($('fast').checked?350:1800,id))return;}
 }
 if(id===token)finish();
}
function reset(){token++;cancelAnimationFrame(raf);cancelAnimationFrame(fx);const c=$('confetti');c.getContext('2d').clearRect(0,0,c.width,c.height);running=false;revealed=new Set();lastName=null;activeTeam=-1;firstSlots=pairs.map(()=>0);document.querySelectorAll('.flying-name').forEach(el=>el.remove());$('hub-unit').textContent='chị đẹp';index=0;angle=0;pool=[...order];for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}$('start').disabled=false;$('skip').disabled=false;$('fast').disabled=false;$('hub-label').textContent='SẴN SÀNG';$('announcement').textContent='Một tương lai tươi sáng đang chờ đợi chúng ta';$('subtitle').textContent='';$('player-preview').textContent='BTC đang tìm người phù hợp cho bạn. Hãy cầu nguyện đi, đồng đội của bạn sắp xuất hiện rồi!';renderTeams();paint();}
$('start').onclick=start;$('reset').onclick=reset;$('skip').onclick=()=>{token++;cancelAnimationFrame(raf);revealed=new Set(order);lastName=null;index=16;pool=[];paint();finish();chime(true);burst(true);};$('sound').onclick=()=>{muted=!muted;$('sound').textContent='Âm thanh: '+(muted?'Tắt':'Bật');};$('full').onclick=()=>{(document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen()).catch(()=>{});};document.addEventListener('keydown',e=>{if(e.repeat||e.ctrlKey||e.metaKey||e.altKey||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;if(e.key.toLowerCase()==='m')$('sound').click();if(e.key.toLowerCase()==='f')$('full').click();});reset();
})();
