const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
let tick,receive;const frame={style:{},contentWindow:{postMessage(){}}};
const context={document:{createElement:()=>frame,body:{append(){}}},myRoom:'TEST',gameCache:null,displaySfxEnabled:false,serverNow:()=>0,location:{origin:'http://test'},window:{addEventListener(){}},setInterval:f=>tick=f,setCommentatorVisible(){},setDisplayMusic(){},showScreen(){},db:{ref:()=>({off(){},on:(_,f)=>receive=f})}};
vm.runInNewContext(fs.readFileSync('pairing-live-display.js','utf8'),context);
tick();receive({val:()=>({status:'complete'})});tick();assert.equal(frame.style.display,'block','Completed teams stay visible');
context.gameCache={status:'starting'};tick();assert.equal(frame.style.display,'none','Countdown is not covered');
context.gameCache={status:'ended'};tick();assert.equal(frame.style.display,'none','Finale is not covered');
context.gameCache={status:'waiting'};receive({val:()=>null});tick();assert.equal(frame.style.display,'none','Reset clears pairing screen');
console.log('PASS: completed pairing stays visible; start, finale and reset clear overlay.');
