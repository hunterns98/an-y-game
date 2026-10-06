// Local/display gift animation: decode only while the gift screen is visible.
(()=>{
 const host=document.getElementById('screen-gift-reveal');if(!host)return;
 const box=document.createElement('div');box.className='gift-kittens';
 box.innerHTML='<canvas aria-label="Ba bé mèo nhảy"></canvas><video loop playsinline preload="none" hidden></video>';
 const scene=document.createElement('div');scene.className='gift-celebration';
 const photo=side=>{const figure=document.createElement('figure');figure.className='gift-cheer '+side;figure.innerHTML='<img src="assets/hoan-hi.png" alt="Cùng hoan hỉ chúc mừng" loading="lazy"><figcaption>all money<br>back my home</figcaption>';return figure;};
 scene.append(photo('left'),box,photo('right'));host.append(scene);
 const video=box.querySelector('video'),canvas=box.querySelector('canvas');
 const ctx=canvas.getContext('2d',{willReadFrequently:true});let running=false,frame=0,last=0,attempt=0;
 let demoSound=true;
 function draw(now){
  if(!running)return;
  if(video.readyState>=2 && now-last>=40){
   last=now;
   const width=Math.min(360,video.videoWidth),height=Math.round(width*video.videoHeight/video.videoWidth);
   if(canvas.width!==width || canvas.height!==height){canvas.width=width;canvas.height=height;}
   ctx.drawImage(video,0,0,width,height);
   const image=ctx.getImageData(0,0,width,height),d=image.data;
   for(let i=0;i<d.length;i+=4){
    const r=d[i],g=d[i+1],b=d[i+2],excess=g-Math.max(r,b);
    if(g>70 && excess>20){d[i+3]=Math.round(255*(1-Math.min(1,(excess-20)/65)));d[i+1]=Math.min(g,Math.max(r,b)+20);}
   }
   ctx.putImageData(image,0,0);
  }
  frame=requestAnimationFrame(draw);
 }
 async function play(){
  const token=++attempt;
  if(!video.src)video.src='assets/3 kittens dancing.mp4';
  video.muted=!(typeof displaySfxEnabled!=='undefined'?displaySfxEnabled:demoSound);
  try{await video.play();}
  catch{if(token!==attempt || !running)return;video.muted=true;try{await video.play();}catch{}}
  if(!running)video.pause();
 }
 function sync(){
  const active=host.classList.contains('active')&&!document.hidden;
  if(active===running)return;
  running=active;
  if(active){play();frame=requestAnimationFrame(draw);}
  else{attempt++;video.pause();cancelAnimationFrame(frame);}
 }
 document.addEventListener('keydown',event=>{
  if(event.ctrlKey||event.altKey||event.metaKey||event.repeat||event.key.toLowerCase()!=='m')return;
  if(document.activeElement?.matches('input,textarea,[contenteditable="true"]'))return;
  if(typeof displaySfxEnabled==='undefined')demoSound=video.muted;
  if(running)play();
 });
 new MutationObserver(sync).observe(host,{attributes:true,attributeFilter:['class']});
 document.addEventListener('visibilitychange',sync);sync();
})();
