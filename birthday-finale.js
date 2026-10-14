(()=>{
 const role=document.currentScript.dataset.role;
 if(role==='admin'){
  const box=document.createElement('div');box.style.cssText='display:none;padding:16px;border:1px solid #cba768;border-radius:14px;margin-top:16px';
  box.innerHTML='<b>Sinh nhật tháng 10</b><p>Đọc thiệp xong → Bắt đầu bất ngờ. Giọng AI kết thúc → tự bật hình và nhạc sinh nhật.</p><button class="btn btn-purple" data-stage="intro">Bắt đầu bất ngờ · Tự chuyển sinh nhật</button> <button class="btn btn-cyan" data-stage="celebrate">Bật sinh nhật ngay (dự phòng)</button> <button class="btn" data-stage="silent">Dừng nhạc</button> <button class="btn" data-stage="off">Kết thúc · Về mở quà</button><p data-status></p>';
  document.getElementById('btn-awards-music').parentElement.append(box);
  let busy=false;
  box.addEventListener('click',async e=>{const stage=e.target.dataset.stage;if(!stage||busy||!roomCode)return;const code=roomCode;busy=true;try{await db.ref('rooms/'+code+'/game').transaction(g=>{if(!g||g.status!=='ended'||!g.giftRevealed)return;if(stage==='celebrate'&&!['intro','silent','celebrate'].includes(g.birthdayStage))return;if(stage==='silent'&&g.birthdayStage!=='celebrate')return;g.birthdayStage=stage;g.birthdayAt=firebase.database.ServerValue.TIMESTAMP;return g;});}catch(e){toast('Chưa chuyển được phần sinh nhật. Hãy thử lại.');}finally{busy=false;}});
  setInterval(()=>{const g=gameCache;box.style.display=g?.status==='ended'&&g.giftRevealed?'':'none';box.querySelector('[data-status]').textContent=({intro:'Đang phát lời AI; đọc xong sẽ tự bật hình và nhạc.',celebrate:'Đang chúc mừng sinh nhật',silent:'Đã dừng nhạc',off:'Đã về mở quà'})[g?.birthdayStage]||'Chưa bắt đầu';box.querySelectorAll('button').forEach(b=>b.disabled=busy||(b.dataset.stage==='celebrate'&&!['intro','silent','celebrate'].includes(g?.birthdayStage))||(b.dataset.stage==='silent'&&g?.birthdayStage!=='celebrate'));},250);
  return;
 }
 const host=document.createElement('div');host.id='screen-birthday';host.className='screen';host.style.cssText='position:fixed;inset:0;width:100vw;height:100vh;max-width:none;max-height:none;margin:0;gap:0;overflow:hidden;transform:none;animation:none;background:#000;z-index:2147483000;padding:0';
 host.innerHTML='<div class="birthday-stage" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:max(100vw,177.7778vh);aspect-ratio:16/9;background:url(assets/backgrounds/birthday-october.png) center/100% 100%"><canvas width="640" height="640" style="position:absolute;width:43%;left:57%;bottom:5%"></canvas></div><button class="birthday-unlock" style="display:none;position:absolute;bottom:15px;left:15px">Bấm để bật âm thanh sinh nhật</button>';
 document.body.append(host);
 const fill=document.createElement('div');fill.className='birthday-fill';fill.style.cssText='position:absolute;inset:0;background:url(assets/backgrounds/birthday-october.png) center/cover;filter:blur(18px);transform:scale(1.06);pointer-events:none';host.prepend(fill);
 const voice=new Audio('assets/audio/birthday/loi-dan-ai-v2.mp3'),music=new Audio('assets/audio/birthday/nhac-sinh-nhat-v2.mp3');music.loop=true;voice.preload=music.preload='auto';
 const im=new Image();im.src='assets/backgrounds/birthday-trio-v6.png';const ctx=host.querySelector('canvas').getContext('2d'),unlock=host.querySelector('button');let key='',stage='',raf=0,start=0,active=null,epoch=0;
 async function play(){const token=epoch;if(!active||active.ended||!displaySfxEnabled)return;try{await active.play();if(token!==epoch)return;unlock.style.display='none';}catch{if(token===epoch)unlock.style.display='block';}}
 unlock.onclick=()=>{displaySfxEnabled=true;play();};
 document.addEventListener('click',()=>{if(active?.paused&&!active.ended)play();});
 document.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='m')setTimeout(()=>{if(active){active.muted=!displaySfxEnabled;play();}},0);});
 function bindVoiceEnd(code,introAt){
  voice.onended=async()=>{
   if(stage!=='intro'||myRoom!==code||active!==voice)return;
   try{await db.ref('rooms/'+code+'/game').transaction(g=>{
    if(!g||g.status!=='ended'||!g.giftRevealed||g.birthdayStage!=='intro'||g.birthdayAt!==introAt)return;
    return {...g,birthdayStage:'celebrate',birthdayAt:firebase.database.ServerValue.TIMESTAMP};
   });}catch(e){console.error('Birthday auto transition failed',e);unlock.textContent='Bấm để chuyển sang sinh nhật';unlock.style.display='block';unlock.onclick=()=>voice.onended();}
  };
 }
 function draw(t){if(!['celebrate','silent'].includes(stage))return;let time=(t-start)%10400,i=0;const durations=[2800,2600,2000,3000];while(time>=durations[i])time-=durations[i++];if(im.complete&&im.naturalWidth){ctx.clearRect(0,0,640,640);const w=im.naturalWidth/2,h=im.naturalHeight/2;ctx.drawImage(im,(i%2)*w,Math.floor(i/2)*h,w,h,0,0,640,640);}raf=requestAnimationFrame(draw);}
 window.BirthdayFinale={render(g){const next=g?.status==='ended'&&g.giftRevealed?g.birthdayStage:'';const nextKey=myRoom+':'+next+':'+g?.birthdayAt;if(nextKey!==key){key=nextKey;epoch++;voice.pause();music.pause();active=null;cancelAnimationFrame(raf);unlock.style.display='none';stage=next;if(['intro','celebrate','silent'].includes(stage)){clearEndedConfetti();clearFinalPodiumSequence();setDisplayMusic('none');showScreen('birthday');host.querySelector('.birthday-stage').style.display=stage==='intro'?'none':'';fill.style.display=stage==='intro'?'none':'';if(stage==='intro'){voice.currentTime=0;active=voice;bindVoiceEnd(myRoom,g.birthdayAt);}if(stage==='celebrate'){music.currentTime=0;active=music;}if(active){active.muted=!displaySfxEnabled;play();}if(stage!=='intro'){start=performance.now();raf=requestAnimationFrame(draw);}}else host.classList.remove('active');}return ['intro','celebrate','silent'].includes(stage);}};
})();






