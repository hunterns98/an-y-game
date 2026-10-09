const vm=require('vm'),fs=require('fs'),assert=require('node:assert/strict');
let tick,listener,write;const button={style:{}};
const c={document:{createElement:()=>button,getElementById:()=>({before(){}})},roomCode:'DEMO',setInterval:f=>tick=f,toast(){},db:{ref:path=>({on:(_,cb)=>listener=cb,off(){},set:async value=>{write={path,value};listener({val:()=>value});}})}};
vm.createContext(c);vm.runInContext(fs.readFileSync('program-opening-admin.js','utf8'),c);
(async()=>{tick();listener({val:()=>true});assert.equal(button.style.display,'');await button.onclick();assert.equal(write.path,'rooms/DEMO/game/programIntro');assert.equal(write.value,false);assert.equal(button.style.display,'none');c.roomCode='OTHER';tick();assert.equal(button.style.display,'none');
const context={window:{}};vm.createContext(context);vm.runInContext(fs.readFileSync('demo-team-names.js','utf8'),context);for(let i=0;i<30;i++){const names=context.window.demoTeamNames();assert.equal(names.length,8);assert.equal(new Set(names).size,8);}
const admin=fs.readFileSync('admin.html','utf8');assert(admin.includes('if(original.isDemo){const labels=demoTeamNames();'));assert(admin.includes('team.teamName=labels[i]'));console.log('PASS: opening next button per room, persistent lobby flag, eight unique demo team names.');})().catch(e=>{console.error(e);process.exitCode=1});
