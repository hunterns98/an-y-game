(()=>{
 const host=document.getElementById('screen-gift-reveal'),box=host?.querySelector('.gift-kittens'),video=box?.querySelector('video');if(!video||!window.PodiumCharacters)return;
 const label=document.createElement('div');label.className='gift-team-label';host.append(label);
 const canvases=[0,1].map(()=>{const c=document.createElement('canvas');c.width=380;c.height=724;c.className='gift-team-person';host.append(c);return c;});
 let teams=[],key='',index=0,frame=0,lastTime=0,timer=null,images=[],generation=0;
 function fit(){const r=box.getBoundingClientRect(),h=host.getBoundingClientRect();const space=Math.max(0,(h.width-r.width)/2);const height=Math.min(r.height*.86,420,space*1.8);canvases.forEach((c,i)=>{c.style.width=space+'px';c.style.height=height+'px';c.style.left=(i?r.right-h.left:0)+'px';c.style.top=(r.top-h.top+(r.height-height)/2)+'px';});}
 function draw(){images.forEach((im,i)=>{const c=canvases[i],ctx=c.getContext('2d');ctx.clearRect(0,0,380,724);if(!im?.naturalWidth)return;const entry=PodiumCharacters.roster[PodiumCharacters.normalize(teams[index]?.[i?'player2':'player1'])];if(entry)ctx.drawImage(im,entry[1][(frame+i*2)%4],0,380,724,0,0,380,724);});}
 function select(){const token=++generation;images=[];canvases.forEach(c=>{c.classList.remove('loaded');c.getContext('2d').clearRect(0,0,380,724);});const team=teams[index];label.textContent=team?`${team.teamName||'Đội '+(index+1)} · ${team.player1||''} & ${team.player2||''}`:'';if(!team)return;[team.player1,team.player2].forEach((name,i)=>{const e=PodiumCharacters.roster[PodiumCharacters.normalize(name)];if(!e)return;const im=new Image();images[i]=im;canvases[i].setAttribute('aria-label',name+' vẫy tay');im.onload=()=>{if(token!==generation)return;draw();canvases[i].classList.add('loaded');};im.src='assets/podium/'+e[0];});fit();}
 function setTeams(value){const sorted=value.slice().sort((a,b)=>(b.score||0)-(a.score||0));const next=JSON.stringify(sorted.map(t=>[t.player1,t.player2,t.teamName,t.score]));if(next===key)return;key=next;teams=sorted;index=0;lastTime=video.currentTime;select();}
 // Follow the real video wrap, so each team gets exactly one kitten dance loop.
 video.addEventListener('timeupdate',()=>{const t=video.currentTime;if(host.classList.contains('active')&&teams.length&&t+.5<lastTime){index=(index+1)%teams.length;select();}lastTime=t;});
 function sync(){clearInterval(timer);timer=null;if(!host.classList.contains('active')||document.hidden)return;fit();if(!matchMedia('(prefers-reduced-motion: reduce)').matches)timer=setInterval(()=>{frame=(frame+1)%4;draw();},300);}
 new MutationObserver(sync).observe(host,{attributes:true,attributeFilter:['class']});new ResizeObserver(fit).observe(box);window.addEventListener('resize',fit);document.addEventListener('visibilitychange',sync);
 window.GiftTeamWaves={setTeams};sync();
})();
