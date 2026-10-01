(()=>{
 const make=document.getElementById('btn-make-teams');
 const panel=document.createElement('div');panel.style.cssText='display:none;gap:10px;flex-wrap:wrap;margin:14px 0';
 panel.innerHTML='<button class="btn btn-purple" id="pairing-start">Bắt đầu chia cặp</button><button class="btn btn-cyan" id="pairing-skip">Công bố ngay</button><span id="pairing-status"></span>';make.parentElement.after(panel);
 let ref=null,code='',state=null,busy=false;
 async function update(action){if(busy||!roomCode||!state)return;busy=true;const id=state.id;
 try{await GameLogic.transactRoom(db.ref('rooms/'+roomCode),room=>{
  const p=room?.pairing;if(!p||p.id!==id||p.status==='complete'||['starting','playing','ended'].includes(room.game?.status))return;
  if(action==='start'){if(p.status!=='ready')return;return {...room,pairing:{...p,status:'running',startedAt:serverNow(),endsAt:serverNow()+21800}};}
  if(action==='finish' && (p.status!=='running'||serverNow()<p.endsAt))return;
  const names=new Set(Object.values(room.players||{}).map(p=>p.name));
  if(!Object.values(p.teams).every(t=>names.has(t.player1)&&names.has(t.player2)))return {...room,pairing:null,pairingCount:Math.max(0,Number(room.pairingCount||1)-1)};
  return {...room,teams:p.teams,pairing:{...p,status:'complete'}};
 });}catch(e){toast('Chưa công bố được. Kiểm tra kết nối và thử lại.');}finally{busy=false;}}
 document.getElementById('pairing-start').onclick=()=>update('start');document.getElementById('pairing-skip').onclick=()=>update('skip');
 setInterval(()=>{
  if(code!==roomCode){if(ref)ref.off();code=roomCode;state=null;if(code){ref=db.ref('rooms/'+code+'/pairing');ref.on('value',s=>{state=s.val();if(!state||state.status==='complete')renderTeamStartWarning();});}}
  const pending=state&&state.status!=='complete';panel.style.display=pending?'flex':'none';
  if(pending){make.disabled=true;document.getElementById('btn-start-game').disabled=true;document.getElementById('pairing-start').disabled=busy||state.status!=='ready';document.getElementById('pairing-skip').disabled=busy;document.getElementById('pairing-status').textContent=state.status==='ready'?'Display đang chờ bắt đầu':'Đang công bố các cặp…';if(state.status==='running'&&serverNow()>=state.endsAt)update('finish');}
  else if(!pairingPending){make.disabled=false;}
 },250);
})();

