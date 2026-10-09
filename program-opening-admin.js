(()=>{
 const button=document.createElement('button');button.className='btn btn-purple btn-full';button.textContent='Tiếp tục → Mở QR lobby';button.style.display='none';
 document.getElementById('btn-make-teams').before(button);
 let ref=null,code='',busy=false;
 button.onclick=async()=>{if(!roomCode||busy)return;busy=true;button.disabled=true;try{await db.ref('rooms/'+roomCode+'/game/programIntro').set(false);}catch(e){toast('Chưa mở được lobby. Hãy thử lại.');}finally{busy=false;button.disabled=false;}};
 setInterval(()=>{if(code===roomCode)return;if(ref)ref.off();code=roomCode;button.style.display='none';if(code){ref=db.ref('rooms/'+code+'/game/programIntro');ref.on('value',s=>{button.style.display=s.val()===true?'':'none';});}},250);
})();
