// Fit the complete final board (including awards) inside the display viewport.
(()=>{
 const screen=document.getElementById('screen-ended'),content=screen?.querySelector('.ended-content');if(!content)return;
 let scheduled=false;
 function fit(){scheduled=false;const active=screen.classList.contains('active');document.body.classList.toggle('podium-fitted',active);if(!active)return;
  const width=content.offsetWidth,height=content.scrollHeight;
  const scale=Math.min(1,(innerWidth-32)/Math.max(1,width),(innerHeight-36)/Math.max(1,height));
  content.style.transform=`scale(${scale})`;
 }
 function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(fit);}}
 new ResizeObserver(schedule).observe(content);
 new MutationObserver(schedule).observe(screen,{attributes:true,attributeFilter:['class'],childList:true,subtree:true});
 window.addEventListener('resize',schedule);document.fonts?.ready.then(schedule);schedule();
})();
