const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const source=fs.readFileSync('wheel-demo.js','utf8');const fn=source.slice(source.indexOf('function wheelLayout('),source.indexOf('function paint('));const c={};vm.createContext(c);vm.runInContext(fn,c);
for(let count=16;count>=1;count--){const names=Array.from({length:count},(_,i)=>'P'+i);for(const winner of names){const pool=names.filter(n=>n!==winner);const layout=c.wheelLayout(pool,winner,1,names,false);const center=layout.rotation+(layout.people.indexOf(winner)+.5)*2*Math.PI/layout.people.length;assert(Math.abs(center+Math.PI/2)<1e-10);assert.equal(new Set(layout.people).size,count);}}
console.log('PASS: every selected avatar is centered under pointer for 1–16 remaining players.');
