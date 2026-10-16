(()=>{
 'use strict';
 let connected=false,current='',record=null,busy=false;
 const stamp=()=>firebase.database.ServerValue.TIMESTAMP;
 function identity(){const session=typeof myRoom!=='undefined'&&myRoom?loadLocalSession(myRoom):null;return session&&typeof myName!=='undefined'&&session.name===myName?{room:myRoom,name:myName,sessionId:session.sessionId}:null;}
 async function sync(){const id=identity(),key=id?JSON.stringify(id):'';if(!connected||busy)return;if(key===current&&record)return;busy=true;try{
  if(record){await record.update({online:false,at:stamp()});await record.onDisconnect().cancel();record=null;}current='';
  if(!id)return;const r=db.ref('rooms/'+id.room+'/presence/'+Array.from(id.name,c=>c.codePointAt(0).toString(16)).join('_')).push();
  await r.onDisconnect().set({online:false,at:stamp(),sessionId:id.sessionId});
  if(!connected||JSON.stringify(identity())!==key){await r.onDisconnect().cancel();return;}
  await r.set({online:true,at:stamp(),sessionId:id.sessionId});record=r;current=key;
 }catch(e){console.warn('Presence update unavailable',e.code||'');}finally{busy=false;}}
 db.ref('.info/connected').on('value',s=>{connected=s.val()===true;if(!connected){record=null;current='';}else sync();});
 setInterval(sync,2000);setInterval(()=>{if(connected&&record)record.update({at:stamp()}).catch(()=>{});},20000);
})();
