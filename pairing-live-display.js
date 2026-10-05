(()=>{
 const frame=document.createElement('iframe');frame.src='wheel-demo.html?live=1';frame.title='Vòng quay chia cặp';frame.allow='autoplay; fullscreen';frame.style.cssText='position:fixed;inset:0;width:100%;height:100%;border:0;z-index:8500;display:none';document.body.append(frame);
 let code='',ref,state=null,shown=false;
 setInterval(()=>{
  if(code!==myRoom){if(ref)ref.off();code=myRoom;state=null;if(code){ref=db.ref('rooms/'+code+'/pairing');ref.on('value',s=>state=s.val());}}
  const visible=!!state&&(!gameCache||gameCache.status==='waiting');
  frame.style.display=visible?'block':'none';
  if(visible){setCommentatorVisible(false);setDisplayMusic(state.status==='complete'?'lobby':'none');frame.contentWindow.postMessage({kind:'pairing-live',state,now:serverNow(),sound:displaySfxEnabled},location.origin);}
  else if(shown){frame.contentWindow.postMessage({kind:'pairing-stop'},location.origin);if(!gameCache||gameCache.status==='waiting'){showScreen('waiting');setDisplayMusic('lobby');}}
  shown=visible;
 },150);
 window.addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==frame.contentWindow)return;if(event.data?.kind==='pairing-mute')toggleDisplaySound();if(event.data?.kind==='pairing-fullscreen')toggleDisplayFullscreen();});
})();
