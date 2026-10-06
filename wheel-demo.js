(()=>{
const $=id=>document.getElementById(id),pairs=[['Nhung','Thoan'],['Hạnh','Liên'],['An','Hằng'],['Trúc','Lệ'],['Phượng','Mai Anh'],['Trang','Hoa'],['Ánh','Giang'],['Linh','Thủy']],order=pairs.flat(),colors=['#883dba','#ca427a','#3c5b9c','#92532c','#475a85','#a64795'];
let revealed=new Set(),lastName=null,activeTeam=-1,firstSlots=[],pool=[],angle=0,index=0,running=false,token=0,raf=0,fx=0,muted=false,ac;
const ctx=$('wheel').getContext('2d'),tau=Math.PI*2;
function tone(freq,duration=.08,volume=.04,delay=0){if(muted||!ac)return;const o=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime+delay;o.frequency.value=freq;o.type='sine';g.gain.setValueAtTime(volume,t);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g).connect(ac.destination);o.start(t);o.stop(t+duration);}
// Short synthesized slot-machine sounds: no additional media download.
let nextReelTick=0,reelNote=0;
function jackpotTick(progress,now){
 if(now<nextReelTick)return;
 nextReelTick=now+55+260*Math.pow(progress,3);
 const notes=[784,988,1175,1568];
 tone(notes[reelNote++%notes.length],.055,.035);
 tone(110,.025,.025);
}
function chime(done){
 const notes=done?[523,659,784,1047,1319,1568,2093]:[784,988,1319];
 notes.forEach((f,i)=>{tone(f,.24,.045,i*.065);tone(f*2,.13,.012,i*.065);});
 if(done)[523,659,784,1047].forEach(f=>tone(f,.65,.025,.48));
}
// Cache cropped portraits once; spinning only draws the small cached canvases.
const portraits=new Map();
function portraitFor(name){
 if(portraits.has(name))return portraits.get(name);
 const tile=document.createElement('canvas');tile.width=tile.height=160;
 portraits.set(name,tile);const c=tile.getContext('2d');
 c.fillStyle='#51245d';c.fillRect(0,0,160,160);
 c.fillStyle='#fff';c.font='bold 50px system-ui';c.textAlign='center';c.fillText(name.charAt(0),80,98);
 const img=new Image();let fallback=false;
 img.onload=()=>{
  const zoom=PlayerAvatars.zoomFor(name),scale=Math.max(160/img.naturalWidth,160/img.naturalHeight)*zoom;
  const [px,py]=PlayerAvatars.positionFor(name).split(' ').map(v=>parseFloat(v)/100);
  const w=img.naturalWidth*scale,h=img.naturalHeight*scale;
  c.clearRect(0,0,160,160);c.drawImage(img,(160-w)*px,(160-h)*py,w,h);paint();
 };
 img.onerror=()=>{if(!fallback){fallback=true;img.src=PlayerAvatars.fallbackSrc(PlayerAvatars.numberFor(name));}};
 img.src=PlayerAvatars.srcFor(name);return tile;
}
function wheelLayout(remaining,selected,rotation,all,complete){
 const people=complete?all:selected?[selected,...remaining.filter(name=>name!==selected)]:remaining;
 return {people,rotation:selected?-Math.PI/2-(people.indexOf(selected)+.5)*2*Math.PI/people.length:rotation};
}
function paint(){
 ctx.clearRect(0,0,1000,1000);const layout=wheelLayout(pool,lastName,angle,order,index===16),wheelPeople=layout.people,n=wheelPeople.length;
 if(!n){ctx.fillStyle='#51245d';ctx.beginPath();ctx.arc(500,500,490,0,tau);ctx.fill();return;}
 const step=tau/n,radius=Math.min(77,390*Math.sin(Math.PI/Math.max(n,2))*.88);
 wheelPeople.forEach((name,i)=>{
  const a=layout.rotation+i*step,mid=a+step/2;
  ctx.beginPath();ctx.moveTo(500,500);ctx.arc(500,500,490,a,a+step);ctx.closePath();
  ctx.fillStyle=colors[i%colors.length];ctx.fill();ctx.strokeStyle='#ffffff28';ctx.lineWidth=2;ctx.stroke();
  const x=500+390*Math.cos(mid),y=500+390*Math.sin(mid);
  ctx.save();ctx.beginPath();ctx.arc(x,y,radius,0,tau);ctx.clip();
  ctx.drawImage(portraitFor(name),x-radius,y-radius,radius*2,radius*2);ctx.restore();
  ctx.beginPath();ctx.arc(x,y,radius,0,tau);ctx.strokeStyle='#ffe5ad';ctx.lineWidth=4;ctx.stroke();
 });
}
function renderTeams(){ $('teams').replaceChildren();pairs.forEach((pair,i)=>{const card=document.createElement('div');card.className='team'+(i===activeTeam&&running?' active':'')+(pair.every(n=>revealed.has(n))?' done':'');card.innerHTML='<div class="team-label">ĐỘI '+(i+1)+'</div><div class="pair"></div>';pair.forEach((name,j)=>{const person=document.createElement('div');person.className='person';if(revealed.has(name)){if(name===lastName)person.classList.add('filled');const img=document.createElement('img');img.src=PlayerAvatars.srcFor(name);img.style.objectPosition=PlayerAvatars.positionFor(name);person.append(img,document.createTextNode(name));}else{person.classList.add('empty');person.textContent='Đang chờ…';}card.lastElementChild.append(person);});$('teams').append(card);});$('count').textContent=pairs.filter(p=>p.every(n=>revealed.has(n))).length+' / 8 đội';$('remaining').textContent=pool.length;$('progress').style.width=index/16*100+'%';}
function flyToTeam(name){
 const target=document.querySelector('.person.filled');if(!target)return;
 const origin=$('wheel').getBoundingClientRect(),end=target.getBoundingClientRect();
 const badge=document.createElement('div');badge.className='flying-name';badge.textContent=name;document.body.append(badge);
 const animation=badge.animate([{left:(origin.left+origin.width/2)+'px',top:(origin.top+origin.height*.11)+'px',opacity:1,transform:'translate(-50%,-50%) scale(1.2)'},{left:(end.left+end.width/2)+'px',top:(end.top+end.height/2)+'px',opacity:0,transform:'translate(-50%,-50%) scale(.7)'}],{duration:550,easing:'ease-in-out'});
 animation.onfinish=()=>badge.remove();
}
function burst(big){cancelAnimationFrame(fx);const c=$('confetti'),x=c.getContext('2d');c.width=innerWidth;c.height=innerHeight;const particles=Array.from({length:big?100:36},()=>({x:c.width*.4,y:c.height*.42,vx:(Math.random()-.5)*16,vy:-Math.random()*12-2,color:['#ffd778','#ff6aa8','#86f2d4'][Math.floor(Math.random()*3)],rot:Math.random()*6}));const start=performance.now();function tick(now){x.clearRect(0,0,c.width,c.height);particles.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.22;x.save();x.translate(p.x,p.y);x.rotate(p.rot+=.08);x.fillStyle=p.color;x.globalAlpha=Math.max(0,1-(now-start)/1600);x.fillRect(-3,-3,6,9);x.restore();});if(now-start<1600)fx=requestAnimationFrame(tick);else x.clearRect(0,0,c.width,c.height);}fx=requestAnimationFrame(tick);}
function wait(ms,id){return new Promise(resolve=>setTimeout(()=>resolve(id===token),ms));}
function spin(name,id,round=0){return new Promise(resolve=>{const step=tau/pool.length,position=pool.indexOf(name),target=-Math.PI/2-(position+.5)*step;const delta=((target-angle)%tau+tau)%tau+tau*4,from=angle,start=performance.now(),duration=$('fast').checked?650:(round===0?3000:4500);nextReelTick=0;function tick(now){if(id!==token){resolve(false);return;}const t=Math.min(1,(now-start)/duration);angle=from+delta*(1-Math.pow(1-t,4));paint();jackpotTick(t,now);if(t<1)raf=requestAnimationFrame(tick);else resolve(true);}raf=requestAnimationFrame(tick);});}
function finish(){running=false;$('hub-unit').textContent='đội';$('hub-label').textContent='ĐỦ';$('remaining').textContent='8';$('announcement').textContent='Chuẩn bị chan nhau nào!';$('subtitle').textContent='';$('player-preview').textContent='Chào Nhung! Đồng đội của bạn là Thoan. Bây giờ mới hiện đồng đội và quyền đặt tên.';$('start').disabled=true;$('skip').disabled=true;$('fast').disabled=false;renderTeams();$('remaining').textContent='8';}
function shuffledTeams(){const ids=pairs.map((_,i)=>i);for(let i=ids.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]];}return ids;}
async function start(){
 if(running||index===16)return;running=true;const id=++token;
 ac=ac||new (window.AudioContext||window.webkitAudioContext)();ac.resume().catch(()=>{});
 $('start').disabled=true;$('fast').disabled=true;
 for(let round=0;round<2;round++){
  const teams=shuffledTeams(),batch=teams.map(i=>({team:i,name:pairs[i][round===0?firstSlots[i]:1-firstSlots[i]]}));
  lastName=null;activeTeam=-1;$('hub-label').textContent='LƯỢT '+(round+1)+' / 2';
  $('subtitle').textContent=round===0?'Lượt 1 · Chọn 8 người cho 8 đội':'Lượt 2 · Tìm đồng đội cho 8 người vừa chọn';
  $('announcement').textContent=round===0?'*Insert nhạc xổ số* ~Tăng tăng tắng tắng tăng~':'Và đó là...';
  renderTeams();if(!await spin(batch[0].name,id,round))return;
  for(const pick of batch){
   if(id!==token)return;
   lastName=pick.name;activeTeam=-1;paint();
   $('announcement').textContent=pick.name+'…';
   if(!await wait($('fast').checked?250:(round===0?800:2000),id))return;
   index++;revealed.add(pick.name);activeTeam=pick.team;
   pool=pool.filter(n=>n!==pick.name);paint();renderTeams();
   $('announcement').textContent=pick.name+' → Đội '+(pick.team+1)+(round===1?' · Đủ cặp!':'');
   chime(round===1);if(round===1)burst(false);flyToTeam(pick.name);
   if(!await wait($('fast').checked?180:(round===0?700:1500),id))return;
  }
  chime(true);burst(true);
  if(round===0){$('announcement').textContent='Đã có 8 thí sinh đầu tiên. Nửa còn lại gọi tên';if(!await wait($('fast').checked?350:3000,id))return;}
 }
 if(id===token)finish();
}
function reset(){token++;cancelAnimationFrame(raf);cancelAnimationFrame(fx);const c=$('confetti');c.getContext('2d').clearRect(0,0,c.width,c.height);running=false;revealed=new Set();lastName=null;activeTeam=-1;firstSlots=pairs.map(()=>0);document.querySelectorAll('.flying-name').forEach(el=>el.remove());$('hub-unit').textContent='ngoan xinh yêu';index=0;angle=0;pool=[...order];for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}$('start').disabled=false;$('skip').disabled=false;$('fast').disabled=false;$('hub-label').textContent='SẴN SÀNG';$('announcement').textContent='Một tương lai tươi sáng đang chờ đợi chúng ta';$('subtitle').textContent='';$('player-preview').textContent='BTC đang tìm người phù hợp cho bạn. Hãy cầu nguyện đi, đồng đội của bạn sắp xuất hiện rồi!';renderTeams();paint();}
$('start').onclick=start;$('reset').onclick=reset;$('skip').onclick=()=>{token++;cancelAnimationFrame(raf);revealed=new Set(order);lastName=null;index=16;pool=[];paint();finish();chime(true);burst(true);};$('sound').onclick=()=>{muted=!muted;$('sound').textContent='Âm thanh: '+(muted?'Tắt':'Bật');};$('full').onclick=()=>{(document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen()).catch(()=>{});};document.addEventListener('keydown',e=>{if(e.repeat||e.ctrlKey||e.metaKey||e.altKey||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;if(e.key.toLowerCase()==='m')$('sound').click();if(e.key.toLowerCase()==='f')$('full').click();});reset();

if(new URLSearchParams(location.search).has('live')){
 document.querySelector('nav').hidden=true;document.querySelector('footer').hidden=true;
 document.querySelector('nav').style.display='none';document.querySelector('footer').style.display='none';
 let liveId=null,previous=-1,liveData=null,receivedAt=0,liveFrame=0;
 document.addEventListener('keydown',e=>{if(e.repeat)return;const key=e.key.toLowerCase();if(key==='m'||key==='f'){e.preventDefault();e.stopImmediatePropagation();ac=ac||new (window.AudioContext||window.webkitAudioContext)();ac.resume().catch(()=>{});parent.postMessage({kind:key==='m'?'pairing-mute':'pairing-fullscreen'},location.origin);}},true);
 window.addEventListener('message',event=>{
  if(event.origin!==location.origin||event.source!==parent)return;
  if(event.data?.kind==='pairing-stop'){muted=true;running=false;liveData=null;cancelAnimationFrame(liveFrame);return;}
  if(event.data?.kind!=='pairing-live')return;
  liveData=event.data;receivedAt=performance.now();
  ac=ac||new (window.AudioContext||window.webkitAudioContext)();if(soundAllowed())ac.resume().catch(()=>{});
  cancelAnimationFrame(liveFrame);liveFrame=requestAnimationFrame(liveRender);
 });
 function soundAllowed(){return liveData?.sound;}
 function liveRender(){
  if(!liveData)return;
  const {state,sound}=liveData,now=liveData.now+performance.now()-receivedAt;muted=!sound;
  if(liveId!==state.id){liveId=state.id;previous=-1;pairs.splice(0,pairs.length,...Object.values(state.teams).map(t=>[t.player1,t.player2]));order.splice(0,order.length,...pairs.flat());}
  const elapsed=state.status==='complete'?53000:state.status==='running'?Math.max(0,now-state.startedAt):-1;
  const sequence=[];state.orders.forEach((keys,round)=>keys.forEach((key,j)=>sequence.push({name:state.teams[key][round?'player2':'player1'],at:(round?18000:0)+(round?4500:3000)+j*(round?3500:1500),hold:round?2000:800,team:Object.keys(state.teams).indexOf(key)})));
  const visible=sequence.filter(x=>elapsed>=x.at+x.hold);
  const pending=sequence.find(x=>elapsed>=x.at&&elapsed<x.at+x.hold);index=visible.length;revealed=new Set(visible.map(x=>x.name));pool=order.filter(n=>!revealed.has(n));
  const latest=visible.at(-1);lastName=pending?.name||latest?.name||null;activeTeam=pending?-1:latest?.team??-1;running=state.status==='running';
  const round=elapsed>=18000?1:0,within=elapsed-(round?18000:0),spinDuration=round?4500:3000,spinning=elapsed>=0&&within<spinDuration;
  if(spinning){
   lastName=null;
   const winner=state.teams[state.orders[round][0]][round?'player2':'player1'];
   const target=-Math.PI/2-(pool.indexOf(winner)+.5)*tau/pool.length;
   const turn=((target%tau)+tau)%tau+tau*4;
   angle=turn*(1-Math.pow(1-within/spinDuration,4));
  }else angle=0;
  paint();if(index!==previous)renderTeams();$('hub-label').textContent=index===16?'ĐỦ':elapsed<0?'SẴN SÀNG':'LƯỢT '+(round+1)+' / 2';$('hub-unit').textContent=index===16?'đội':'ngoan xinh yêu';$('remaining').textContent=index===16?'8':pool.length;
  $('announcement').textContent=elapsed<0?'Một tương lai tươi sáng đang chờ đợi chúng ta':spinning?(round===0?'*Insert nhạc xổ số* ~Tăng tăng tắng tắng tăng~':'Và đó là...'):pending?pending.name+'…':index===16?'Chuẩn bị chan nhau nào!':index===8?'Đã có 8 thí sinh đầu tiên. Nửa còn lại gọi tên':latest?latest.name+' → Đội '+(latest.team+1):'';
  if(index!==previous){if(previous>=0&&index>previous&&latest){flyToTeam(latest.name);chime(round===1);burst(round===1);}previous=index;}
  if(spinning)jackpotTick(within/spinDuration,performance.now());
  liveFrame=requestAnimationFrame(liveRender);
 }
}
})();
