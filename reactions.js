(()=>{
 'use strict';
 const role=document.currentScript.dataset.role,emojis=['❤️','😂','👍','😡','😢'];
 const names=['Thả tim','Haha','Thích','Phẫn nộ','Khóc'];
 const active=g=>!!g&&g.status==='ended'&&!g.giftRevealed;
 let code='',enabled=true,connected=false,pending=false,next=0,settingsRef=null,eventsRef=null,since=0;
 const seen=new Map(),timers=new Set();
 const layer=document.createElement('div');layer.className='reaction-effects';layer.setAttribute('aria-hidden','true');
 const bar=document.createElement('div');bar.className='reaction-bar';
 const label=document.createElement('div');label.className='reaction-status';label.setAttribute('role','status');
 const buttons=emojis.map((emoji,i)=>{const b=document.createElement('button');b.type='button';b.textContent=emoji;b.setAttribute('aria-label',names[i]);b.onclick=()=>send(emoji);bar.append(b);return b});
 const panel=document.createElement('div');panel.className='reaction-panel';panel.append(bar,label);
 const toggle=document.createElement('button');toggle.type='button';toggle.className='btn btn-purple';
 if(role==='player')document.querySelector('.final-wait-card').append(panel);
 if(role==='display')document.body.append(layer);
 if(role==='admin')document.getElementById('btn-awards-music').after(toggle);
 const game=()=>role==='player'?(typeof activeGame==='undefined'?null:activeGame):(typeof gameCache==='undefined'?null:gameCache);
 const room=()=>role==='admin'?(typeof roomCode==='undefined'?'':roomCode):(typeof myRoom==='undefined'?'':myRoom);
 function clear(){layer.replaceChildren();timers.forEach(clearTimeout);timers.clear();}
 function receive(snap){const d=snap.val(),now=serverNow();if(!d||!emojis.includes(d.emoji)||!Number.isFinite(d.at)||d.at<since||now-d.at>4000||d.at>now+1000||!active(game())||!enabled||!connected||document.hidden)return;
  if((seen.get(snap.key)||0)>=d.at)return;seen.set(snap.key,d.at);if(seen.size>64)seen.delete(seen.keys().next().value);
  if(layer.children.length>=20)return;const e=document.createElement('span');e.className='reaction-emoji';e.textContent=d.emoji;e.style[Math.random()<.5?'left':'right']=(2+Math.random()*9)+'%';e.style.setProperty('--drift',(Math.random()*40-20)+'px');layer.append(e);const t=setTimeout(()=>{e.remove();timers.delete(t)},3100);timers.add(t);
 }
 function stopEvents(){if(eventsRef){eventsRef.off();eventsRef=null;}clear();seen.clear();}
 function tick(){const current=room();if(current!==code){if(settingsRef)settingsRef.off();stopEvents();code=current;enabled=true;next=0;if(code){settingsRef=db.ref('rooms/'+code+'/reactions/enabled');settingsRef.on('value',s=>{enabled=s.val()!==false;tick()});}}
  const on=!!code&&active(game());panel.hidden=!on;toggle.hidden=!on;toggle.disabled=!connected||pending;toggle.textContent='Cảm xúc: '+(enabled?'Bật':'Tắt');toggle.setAttribute('aria-pressed',String(enabled));
  buttons.forEach(b=>b.disabled=!on||!enabled||!connected||pending||serverNow()<next);
  if(!connected)label.textContent='Đang kết nối…';else if(!enabled)label.textContent='BTC đang tạm tắt cảm xúc';else if(serverNow()>=next)label.textContent='Thả cảm xúc lên màn hình lớn';
  if(role==='display'){if(on&&enabled&&connected&&!document.hidden){if(!eventsRef){since=serverNow();eventsRef=db.ref('rooms/'+code+'/reactions/latest');eventsRef.on('child_added',receive);eventsRef.on('child_changed',receive);}}else stopEvents();}
 }
 async function send(emoji){if(pending||!connected||!enabled||!active(game())||serverNow()<next||!code||typeof myName==='undefined'||!myName)return;
  const target=code,key=Array.from(myName,c=>c.codePointAt(0).toString(16)).join('_'),at=serverNow();pending=true;next=at+1000;tick();
  try{const result=await db.ref('rooms/'+target+'/reactions/latest/'+key).transaction(old=>{
   if(!connected||code!==target||!enabled||!active(game())||serverNow()-at>3000||old&&at-Number(old.at)<1000)return;
   return {emoji,at};
  },undefined,false);if(code===target)label.textContent=result.committed?'Đã gửi '+emoji:'Chờ một chút rồi thử lại nhé';}
  catch{if(code===target)label.textContent='Chưa gửi được, hãy thử lại'}finally{pending=false;tick()}
 }
 toggle.onclick=async()=>{if(!code||pending||!connected||!active(game()))return;pending=true;tick();try{await db.ref('rooms/'+code+'/reactions/enabled').set(!enabled)}catch{if(typeof toast==='function')toast('Chưa đổi được trạng thái cảm xúc')}finally{pending=false;tick()}};
 db.ref('.info/connected').on('value',s=>{connected=s.val()===true;tick()});
 document.addEventListener('visibilitychange',tick);tick();setInterval(tick,250);
})();
