// Local/display gift animation: decode only while the gift screen is visible.
(()=>{
 const host=document.getElementById('screen-gift-reveal');if(!host)return;
 const box=document.createElement('div');box.className='gift-kittens';
 box.innerHTML='<canvas aria-label="Meme vui ngẫu nhiên"></canvas><video playsinline preload="auto" hidden></video>';
 host.append(box);
 let video=box.querySelector('video');const canvas=box.querySelector('canvas');
 const files=['3 kittens dancing','Cat Hit Another Cat','Chinese Cat','Fat Cat Dancing','Goat Huh Cat','Hitler Cat','Kung Fu Cat','Laughing Cat','Smile Dog','Talking cat and sad cat','UIA Cat'];
 let bag=[],previous='',nextVideo=null;
 function pick(){if(!bag.length){bag=files.slice();for(let i=bag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}if(bag[bag.length-1]===previous)[bag[0],bag[bag.length-1]]=[bag[bag.length-1],bag[0]];}previous=bag.pop();return 'assets/'+previous+'.mp4';}
 function prepare(){nextVideo=document.createElement('video');nextVideo.playsInline=true;nextVideo.preload='auto';nextVideo.src=pick();nextVideo.load();}
 function advance(){if(!running)return;video.pause();video=nextVideo;video.onended=advance;prepare();play();}
 video.src=pick();video.onended=advance;prepare();
 const ctx=canvas.getContext('2d',{willReadFrequently:true});let running=false,frame=0,last=0,attempt=0;
 let demoSound=true;
 // Fit the animation to the space below the card, including display/demo chrome.
 function fit(){
  if(!host.classList.contains('active'))return;
  const parent=host.parentElement;
  const style=getComputedStyle(parent);
  const top=parent.getBoundingClientRect().top+window.scrollY+(parseFloat(style.paddingTop)||0);
  const available=Math.max(0,window.innerHeight-top-Math.max(host.closest('#demo-stage')?64:40,parseFloat(style.paddingBottom)||0));
  host.style.height=available+'px';
  const card=host.querySelector('.display-gift-card');
  const gap=parseFloat(getComputedStyle(host).gap)||12;
  const width=Math.max(0,Math.min(640,host.clientWidth*.94,(available-card.offsetHeight-gap)/.85));
  box.style.width=width+'px';box.style.height=(width*.85)+'px';
 }
 const layoutObserver=new ResizeObserver(fit);
 layoutObserver.observe(host.parentElement);
 layoutObserver.observe(host.querySelector('.display-gift-card'));
 window.addEventListener('resize',fit);
 document.fonts?.ready.then(fit);
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
  if(video.ended){advance();return;}
  video.muted=!(typeof displaySfxEnabled!=='undefined'?displaySfxEnabled:demoSound);
  try{await video.play();}
  catch{if(token!==attempt || !running)return;video.muted=true;try{await video.play();}catch{}}
  if(!running)video.pause();
 }
 function sync(){
  const active=host.classList.contains('active')&&!document.hidden;
  if(active===running)return;
  running=active;
  if(active){fit();play();frame=requestAnimationFrame(draw);}
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


